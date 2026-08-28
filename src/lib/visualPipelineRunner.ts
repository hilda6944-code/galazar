import { type LmStudioJsonClient, requestLmStudioJson } from '@/lib/lmStudioClient';
import { VISUAL_PIPELINE_STAGES } from '@/lib/visualPipeline';

export const VISUAL_PIPELINE_DECISIONS = ['PASS', 'PASS WITH ONE CORRECTION', 'FAIL'] as const;
export type VisualPipelineDecision = typeof VISUAL_PIPELINE_DECISIONS[number];

export interface VisualPipelineResult {
  visualEvaluation: string;
  decision: VisualPipelineDecision;
  candidateImprovement: string | null;
  finalEditPrompt: string | null;
}

export class VisualPipelineValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VisualPipelineValidationError';
  }
}

const evaluationSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['visualEvaluation', 'correctionObjectives', 'imageWideProblem', 'decision'],
  properties: {
    visualEvaluation: { type: 'string', minLength: 1 },
    correctionObjectives: {
      type: 'array',
      items: { type: 'string', minLength: 1 },
      maxItems: 10,
    },
    imageWideProblem: { type: 'boolean' },
    decision: { type: 'string', enum: VISUAL_PIPELINE_DECISIONS },
  },
} as const;

const improvementSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['candidateImprovement', 'finalEditPrompt'],
  properties: {
    candidateImprovement: { type: 'string', minLength: 1 },
    finalEditPrompt: { type: 'string', minLength: 1 },
  },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stagePrompt(stageId: typeof VISUAL_PIPELINE_STAGES[number]['id']): string {
  const stage = VISUAL_PIPELINE_STAGES.find((candidate) => candidate.id === stageId);
  if (!stage) throw new VisualPipelineValidationError(`Missing permanent instructions for ${stageId}.`);
  return `${stage.label}:\n${stage.instructions.map((instruction) => `- ${instruction}`).join('\n')}`;
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new VisualPipelineValidationError(`LM Studio returned an invalid ${field}.`);
  }
  return value.trim();
}

function requireExactKeys(value: Record<string, unknown>, expected: string[], responseName: string): void {
  const actual = Object.keys(value).sort();
  const required = [...expected].sort();
  if (actual.length !== required.length || actual.some((key, index) => key !== required[index])) {
    throw new VisualPipelineValidationError(`LM Studio returned unexpected fields in the ${responseName} response.`);
  }
}

interface ParsedEvaluation extends Pick<VisualPipelineResult, 'visualEvaluation' | 'decision'> {
  correctionObjectives: string[];
  imageWideProblem: boolean;
}

function normalizeDecision(correctionObjectives: string[], imageWideProblem: boolean): VisualPipelineDecision {
  if (imageWideProblem || correctionObjectives.length >= 2) return 'FAIL';
  if (correctionObjectives.length === 1) return 'PASS WITH ONE CORRECTION';
  return 'PASS';
}

function parseEvaluation(value: unknown): ParsedEvaluation {
  if (!isRecord(value)) throw new VisualPipelineValidationError('LM Studio returned an invalid evaluation object.');
  requireExactKeys(value, ['visualEvaluation', 'correctionObjectives', 'imageWideProblem', 'decision'], 'evaluation');
  const visualEvaluation = requireText(value.visualEvaluation, 'Visual Evaluation');
  if (typeof value.decision !== 'string' || !VISUAL_PIPELINE_DECISIONS.includes(value.decision as VisualPipelineDecision)) {
    throw new VisualPipelineValidationError('LM Studio returned an unknown decision. Expected PASS, PASS WITH ONE CORRECTION, or FAIL.');
  }
  if (!Array.isArray(value.correctionObjectives)) {
    throw new VisualPipelineValidationError('LM Studio returned invalid correction objectives.');
  }
  const correctionObjectives = value.correctionObjectives.map((objective, index) =>
    requireText(objective, `Correction Objective ${index + 1}`),
  );
  if (typeof value.imageWideProblem !== 'boolean') {
    throw new VisualPipelineValidationError('LM Studio returned an invalid image-wide problem flag.');
  }

  return {
    visualEvaluation,
    correctionObjectives,
    imageWideProblem: value.imageWideProblem,
    decision: normalizeDecision(correctionObjectives, value.imageWideProblem),
  };
}

function parseImprovement(value: unknown): Pick<VisualPipelineResult, 'candidateImprovement' | 'finalEditPrompt'> {
  if (!isRecord(value)) throw new VisualPipelineValidationError('LM Studio returned an invalid improvement object.');
  requireExactKeys(value, ['candidateImprovement', 'finalEditPrompt'], 'improvement');
  return {
    candidateImprovement: requireText(value.candidateImprovement, 'Candidate Improvement'),
    finalEditPrompt: requireText(value.finalEditPrompt, 'Final Edit Prompt'),
  };
}

export async function runVisualPipeline(
  imageDataUrl: string,
  options: { signal?: AbortSignal; client?: LmStudioJsonClient } = {},
): Promise<VisualPipelineResult> {
  const client = options.client ?? requestLmStudioJson;
  const evaluation = parseEvaluation(await client({
    imageDataUrl,
    signal: options.signal,
    schemaName: 'galazar_visual_evaluation',
    schema: evaluationSchema,
    systemPrompt: [
      'You are Galazar\'s local Visual Pipeline. Follow only the permanent stage instructions below.',
      stagePrompt('visual-evaluator'),
      stagePrompt('decision'),
      'Return only JSON matching the supplied schema. Do not add fields or commentary.',
    ].join('\n\n'),
    userPrompt: 'Evaluate this image and make the required decision.',
  }));

  if (evaluation.decision === 'PASS') {
    return { ...evaluation, candidateImprovement: null, finalEditPrompt: null };
  }

  const improvement = parseImprovement(await client({
    imageDataUrl,
    signal: options.signal,
    schemaName: 'galazar_visual_improvement',
    schema: improvementSchema,
    systemPrompt: [
      'You are Galazar\'s local Visual Pipeline. Follow only the permanent stage instructions below.',
      stagePrompt('candidate-improvement'),
      stagePrompt('final-edit-prompt'),
      'Return only JSON matching the supplied schema. Do not add fields or commentary.',
    ].join('\n\n'),
    userPrompt: [
      `Decision: ${evaluation.decision}`,
      `Visual Evaluation: ${evaluation.visualEvaluation}`,
      `Correction Objectives: ${evaluation.correctionObjectives.length > 0 ? evaluation.correctionObjectives.join(' | ') : 'None'}`,
      `Image-wide Problem: ${evaluation.imageWideProblem ? 'Yes' : 'No'}`,
      'Produce the Candidate Improvement and Final Edit Prompt for this image.',
    ].join('\n\n'),
  }));

  return { ...evaluation, ...improvement };
}
