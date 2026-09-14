export interface ComfySystemStats {
  system?: { os?: string; python_version?: string; embedded_python?: boolean };
  devices?: Array<{ name?: string; type?: string; vram_total?: number; vram_free?: number }>;
}

export interface ComfyConnectionResult {
  connected: boolean;
  message: string;
  device?: string;
}

export interface GenerateImageRequest {
  prompt: string;
  width: number;
  height: number;
  seed?: number;
}

interface ComfyHistoryImage {
  filename: string;
  subfolder?: string;
  type?: string;
}

interface ComfyHistoryEntry {
  outputs?: Record<string, { images?: ComfyHistoryImage[] }>;
  status?: { status_str?: string; completed?: boolean; messages?: unknown[] };
}

const MODEL_NAMES = {
  unet: 'flux-2-klein-base-4b.safetensors',
  clip: 'qwen_3_4b.safetensors',
  vae: 'flux2-vae.safetensors',
} as const;

export async function checkComfyConnection(signal?: AbortSignal): Promise<ComfyConnectionResult> {
  try {
    const response = await fetch('/comfy/system_stats', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
    if (!response.ok) return { connected: false, message: `ComfyUI responded with status ${response.status}.` };
    const stats = (await response.json()) as ComfySystemStats;
    const device = stats.devices?.[0]?.name;
    return {
      connected: true,
      message: device ? `Connected to ComfyUI · ${device}` : 'Connected to ComfyUI.',
      device,
    };
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === 'AbortError'
        ? 'Connection check timed out.'
        : 'ComfyUI is not reachable. Open ComfyUI Desktop and try again.';
    return { connected: false, message };
  }
}

function buildFlux2KleinWorkflow(request: GenerateImageRequest) {
  const seed = request.seed ?? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  const ref = (node: string, output = 0) => [node, output];

  return {
    '61': { class_type: 'KSamplerSelect', inputs: { sampler_name: 'euler' } },
    '62': { class_type: 'Flux2Scheduler', inputs: { steps: 20, width: request.width, height: request.height } },
    '63': { class_type: 'CFGGuider', inputs: { model: ref('70'), positive: ref('74'), negative: ref('67'), cfg: 5 } },
    '64': { class_type: 'SamplerCustomAdvanced', inputs: {
      noise: ref('73'), guider: ref('63'), sampler: ref('61'), sigmas: ref('62'), latent_image: ref('66'),
    } },
    '65': { class_type: 'VAEDecode', inputs: { samples: ref('64'), vae: ref('72') } },
    '66': { class_type: 'EmptyFlux2LatentImage', inputs: {
      width: request.width, height: request.height, batch_size: 1,
    } },
    '67': { class_type: 'CLIPTextEncode', inputs: { text: '', clip: ref('71') } },
    '70': { class_type: 'UNETLoader', inputs: { unet_name: MODEL_NAMES.unet, weight_dtype: 'default' } },
    '71': { class_type: 'CLIPLoader', inputs: { clip_name: MODEL_NAMES.clip, type: 'flux2', device: 'default' } },
    '72': { class_type: 'VAELoader', inputs: { vae_name: MODEL_NAMES.vae } },
    '73': { class_type: 'RandomNoise', inputs: { noise_seed: seed } },
    '74': { class_type: 'CLIPTextEncode', inputs: { text: request.prompt, clip: ref('71') } },
    '9': { class_type: 'SaveImage', inputs: { images: ref('65'), filename_prefix: 'Galazar' } },
  };
}

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('Generation cancelled.', 'AbortError'));
    }, { once: true });
  });
}

export async function generateComfyImage(
  request: GenerateImageRequest,
  onStatus?: (status: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  onStatus?.('Sending prompt to ComfyUI…');
  const queueResponse = await fetch('/comfy/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ prompt: buildFlux2KleinWorkflow(request) }),
    signal,
  });

  if (!queueResponse.ok) {
    const detail = await queueResponse.text();
    throw new Error(`ComfyUI rejected the workflow (${queueResponse.status}). ${detail.slice(0, 240)}`);
  }

  const queued = (await queueResponse.json()) as { prompt_id?: string; error?: string };
  if (!queued.prompt_id) throw new Error(queued.error ?? 'ComfyUI did not return a job ID.');

  onStatus?.('Generating on your RTX 4090…');
  for (let attempt = 0; attempt < 360; attempt += 1) {
    await delay(1000, signal);
    const historyResponse = await fetch(`/comfy/history/${encodeURIComponent(queued.prompt_id)}`, { signal });
    if (!historyResponse.ok) continue;
    const history = (await historyResponse.json()) as Record<string, ComfyHistoryEntry>;
    const entry = history[queued.prompt_id];
    if (!entry) continue;

    const image = Object.values(entry.outputs ?? {}).flatMap((output) => output.images ?? [])[0];
    if (image) {
      onStatus?.('Image ready.');
      const params = new URLSearchParams({
        filename: image.filename,
        subfolder: image.subfolder ?? '',
        type: image.type ?? 'output',
      });
      return `/comfy/view?${params.toString()}`;
    }

    if (entry.status?.completed && entry.status.status_str !== 'success') {
      throw new Error('ComfyUI stopped before producing an image. Open its error panel for details.');
    }
  }

  throw new Error('Generation timed out after six minutes.');
}
