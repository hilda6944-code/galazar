import { type LmStudioJsonClient, requestLmStudioJson } from '@/lib/lmStudioClient';

export interface PromptParts {
  subject: string;
  actionPose: string;
  environment: string;
  lightingMood: string;
  styleMedium: string;
}

export type PromptPartKey = keyof PromptParts;
export type PromptRegenerationTarget = PromptPartKey | 'all';

export class PromptRegeneratorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromptRegeneratorValidationError';
  }
}

const PROMPT_PART_KEYS: PromptPartKey[] = [
  'subject',
  'actionPose',
  'environment',
  'lightingMood',
  'styleMedium',
];

const promptPartsSchema = {
  type: 'object',
  additionalProperties: false,
  required: PROMPT_PART_KEYS,
  properties: {
    subject: { type: 'string', minLength: 1 },
    actionPose: { type: 'string', minLength: 1 },
    environment: { type: 'string', minLength: 1 },
    lightingMood: { type: 'string', minLength: 1 },
    styleMedium: { type: 'string', minLength: 1 },
  },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parsePromptParts(value: unknown): PromptParts {
  if (!isRecord(value)) {
    throw new PromptRegeneratorValidationError('LM Studio returned an invalid prompt-parts object.');
  }

  const actualKeys = Object.keys(value).sort();
  const expectedKeys = [...PROMPT_PART_KEYS].sort();
  if (actualKeys.length !== expectedKeys.length || actualKeys.some((key, index) => key !== expectedKeys[index])) {
    throw new PromptRegeneratorValidationError('LM Studio returned unexpected prompt-part fields.');
  }

  const result = {} as PromptParts;
  for (const key of PROMPT_PART_KEYS) {
    const part = value[key];
    if (typeof part !== 'string' || !part.trim()) {
      throw new PromptRegeneratorValidationError(`LM Studio returned an empty ${key} field.`);
    }
    result[key] = part.trim();
  }
  return result;
}

export function assembleRegeneratedPrompt(parts: PromptParts): string {
  return PROMPT_PART_KEYS.map((key) => parts[key].trim()).join(' + ');
}

export async function regeneratePromptParts(
  sourcePrompt: string,
  currentParts: PromptParts | null,
  target: PromptRegenerationTarget,
  options: { signal?: AbortSignal; client?: LmStudioJsonClient } = {},
): Promise<PromptParts> {
  if (!sourcePrompt.trim() && !currentParts) {
    throw new PromptRegeneratorValidationError('Build a Live Prompt before using the regenerator.');
  }

  const client = options.client ?? requestLmStudioJson;
  const generated = parsePromptParts(await client({
    signal: options.signal,
    schemaName: 'galazar_prompt_regenerator',
    schema: promptPartsSchema,
    temperature: 0.75,
    maxTokens: 3072,
    systemPrompt: [
      'You are Galazar\'s local image-prompt regenerator.',
      'Return exactly five non-empty JSON string fields: subject, actionPose, environment, lightingMood, styleMedium.',
      'The final order is SUBJECT + ACTION/POSE + ENVIRONMENT + LIGHTING/MOOD + STYLE/MEDIUM.',
      'Do not put plus-sign separators inside any field.',
      'Keep the result concrete, visually executable, coherent, and free of commentary.',
      'Preserve every useful constraint from the source by placing it in the closest field.',
      'Subject contains identity, appearance, anatomy, clothing, and defining details.',
      'Action/Pose contains action, expression, gaze, gesture, placement, and composition.',
      'Environment contains location, world, surrounding objects, atmosphere, and environmental anchors.',
      'Lighting/Mood contains lighting, color treatment, weather tone, and emotional temperature.',
      'Style/Medium contains style, medium, camera, format, finish, signature, and exclusions.',
      'When one target is named, invent a fresh compatible version of that target and keep the other fields unchanged.',
      'When ALL is named, create a fresh coherent version of all five fields.',
      'Return only JSON matching the supplied schema.',
    ].join('\n'),
    userPrompt: [
      `Regeneration target: ${target === 'all' ? 'ALL' : target}`,
      `Existing five-part draft: ${currentParts ? JSON.stringify(currentParts) : 'none; organize the source into five fields first'}`,
      `Source Live Prompt: ${sourcePrompt.trim() || assembleRegeneratedPrompt(currentParts as PromptParts)}`,
    ].join('\n\n'),
  }));

  if (target === 'all' || !currentParts) return generated;
  return { ...currentParts, [target]: generated[target] };
}
