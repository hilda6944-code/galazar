export interface ComfySystemStats {
  system?: {
    os?: string;
    python_version?: string;
    embedded_python?: boolean;
  };
  devices?: Array<{
    name?: string;
    type?: string;
    vram_total?: number;
    vram_free?: number;
  }>;
}

export interface ComfyConnectionResult {
  connected: boolean;
  message: string;
  device?: string;
}

export async function checkComfyConnection(signal?: AbortSignal): Promise<ComfyConnectionResult> {
  try {
    const response = await fetch('/comfy/system_stats', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!response.ok) {
      return {
        connected: false,
        message: `ComfyUI responded with status ${response.status}.`,
      };
    }

    const stats = (await response.json()) as ComfySystemStats;
    const device = stats.devices?.[0]?.name;

    return {
      connected: true,
      message: device
        ? `Connected to ComfyUI · ${device}`
        : 'Connected to ComfyUI.',
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
