export const LM_STUDIO_MODEL = 'qwen/qwen3.8-27b';
export const LM_STUDIO_CHAT_ENDPOINT = '/lmstudio/chat/completions';
export const LM_STUDIO_DEFAULT_TIMEOUT_MS = 600_000;

export const SUPPORTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_VISUAL_PIPELINE_IMAGE_BYTES = 10 * 1024 * 1024;

export type SupportedImageMimeType = typeof SUPPORTED_IMAGE_MIME_TYPES[number];

export interface LmStudioJsonRequest {
  systemPrompt: string;
  userPrompt: string;
  imageDataUrl?: string;
  schemaName: string;
  schema: Record<string, unknown>;
  signal?: AbortSignal;
  timeoutMs?: number;
  temperature?: number;
  maxTokens?: number;
}

export type LmStudioJsonClient = (request: LmStudioJsonRequest) => Promise<unknown>;

export class LmStudioClientError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'LmStudioClientError';
  }
}

export class LmStudioTimeoutError extends LmStudioClientError {
  constructor(timeoutMs: number) {
    super(`LM Studio did not respond within ${Math.round(timeoutMs / 1000)} seconds.`);
    this.name = 'LmStudioTimeoutError';
  }
}

export class LmStudioRequestCancelledError extends LmStudioClientError {
  constructor() {
    super('LM Studio request cancelled.');
    this.name = 'LmStudioRequestCancelledError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateImageDataUrl(imageDataUrl: string): void {
  const match = /^data:([^;,]+);base64,[A-Za-z0-9+/=\s]+$/.exec(imageDataUrl);
  if (!match || !SUPPORTED_IMAGE_MIME_TYPES.includes(match[1] as SupportedImageMimeType)) {
    throw new LmStudioClientError('The selected image is not a supported JPEG, PNG, or WebP data URL.');
  }
}

function extractMessageContent(payload: unknown): string {
  if (!isRecord(payload) || !Array.isArray(payload.choices) || payload.choices.length === 0) {
    throw new LmStudioClientError('LM Studio returned a malformed response without choices.');
  }

  const choice = payload.choices[0];
  if (!isRecord(choice) || !isRecord(choice.message) || typeof choice.message.content !== 'string') {
    throw new LmStudioClientError('LM Studio returned a malformed response without message content.');
  }

  return choice.message.content;
}

function parseJsonContent(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new LmStudioClientError('LM Studio returned invalid JSON.', { cause: error });
  }
}

export const requestLmStudioJson: LmStudioJsonClient = async ({
  systemPrompt,
  userPrompt,
  imageDataUrl,
  schemaName,
  schema,
  signal,
  timeoutMs = LM_STUDIO_DEFAULT_TIMEOUT_MS,
  temperature = 0,
  maxTokens = 1536,
}) => {
  if (imageDataUrl) validateImageDataUrl(imageDataUrl);

  if (signal?.aborted) throw new LmStudioRequestCancelledError();

  const requestController = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => requestController.abort();
  signal?.addEventListener('abort', abortFromCaller, { once: true });
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    requestController.abort();
  }, timeoutMs);

  try {
    const userContent = imageDataUrl
      ? [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ]
      : userPrompt;

    const response = await fetch(LM_STUDIO_CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LM_STUDIO_MODEL,
        temperature,
        max_tokens: maxTokens,
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: schemaName, strict: true, schema },
        },
      }),
      signal: requestController.signal,
    });

    if (!response.ok) {
      const detail = (await response.text()).trim();
      const suffix = detail ? ` ${detail.slice(0, 500)}` : '';
      throw new LmStudioClientError(`LM Studio request failed with HTTP ${response.status}.${suffix}`);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      throw new LmStudioClientError('LM Studio returned a non-JSON HTTP response.', { cause: error });
    }

    return parseJsonContent(extractMessageContent(payload));
  } catch (error) {
    if (timedOut) throw new LmStudioTimeoutError(timeoutMs);
    if (signal?.aborted) throw new LmStudioRequestCancelledError();
    if (error instanceof LmStudioClientError) throw error;
    throw new LmStudioClientError('Could not reach the local LM Studio server.', { cause: error });
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
};

export function isLmStudioCancellation(error: unknown): boolean {
  return error instanceof LmStudioRequestCancelledError;
}
