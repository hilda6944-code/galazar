import assert from 'node:assert/strict';
import { LmStudioRequestCancelledError } from './src/lib/lmStudioClient.ts';
import { runVisualPipeline, VisualPipelineValidationError } from './src/lib/visualPipelineRunner.ts';

const imageDataUrl = 'data:image/png;base64,AAAA';
const improvement = { candidateImprovement: 'Correct the identified issue.', finalEditPrompt: 'Correct the issue while preserving everything else.' };

async function runWithResponses(responses, signal) {
  let calls = 0;
  const result = await runVisualPipeline(imageDataUrl, {
    signal,
    client: async () => responses[calls++],
  });
  return { result, calls };
}

{
  const { result, calls } = await runWithResponses([{
    visualEvaluation: 'No correction is needed.',
    correctionObjectives: [],
    imageWideProblem: false,
    decision: 'FAIL',
  }]);
  assert.equal(calls, 1);
  assert.equal(result.decision, 'PASS');
  assert.equal(result.candidateImprovement, null);
  assert.equal(result.finalEditPrompt, null);
}

{
  const { result, calls } = await runWithResponses([{
    visualEvaluation: 'The near sleeve needs one localized repair.',
    correctionObjectives: ['Clarify the near sleeve and arm separation.'],
    imageWideProblem: false,
    decision: 'FAIL',
  }, improvement]);
  assert.equal(calls, 2);
  assert.equal(result.decision, 'PASS WITH ONE CORRECTION');
  assert.equal(result.candidateImprovement, improvement.candidateImprovement);
  assert.equal(result.finalEditPrompt, improvement.finalEditPrompt);
}

{
  const { result } = await runWithResponses([{
    visualEvaluation: 'Two unrelated localized repairs are required.',
    correctionObjectives: ['Repair the hand anatomy.', 'Correct the background horizon.'],
    imageWideProblem: false,
    decision: 'PASS WITH ONE CORRECTION',
  }, improvement]);
  assert.equal(result.decision, 'FAIL');
}

{
  const { result } = await runWithResponses([{
    visualEvaluation: 'The lighting direction is inconsistent across the entire image.',
    correctionObjectives: ['Rebuild the global lighting direction.'],
    imageWideProblem: true,
    decision: 'PASS WITH ONE CORRECTION',
  }, improvement]);
  assert.equal(result.decision, 'FAIL');
}

await assert.rejects(
  runWithResponses([{
    visualEvaluation: 'Ambiguous.',
    correctionObjectives: [],
    imageWideProblem: false,
    decision: 'MAYBE',
  }]),
  (error) => error instanceof VisualPipelineValidationError && /unknown decision/.test(error.message),
);

{
  const controller = new AbortController();
  const pending = runVisualPipeline(imageDataUrl, {
    signal: controller.signal,
    client: ({ signal }) => new Promise((_, reject) => {
      signal?.addEventListener('abort', () => reject(new LmStudioRequestCancelledError()), { once: true });
    }),
  });
  controller.abort();
  await assert.rejects(pending, (error) => error instanceof LmStudioRequestCancelledError);
}

console.log('Visual Pipeline branching and cancellation regression test passed.');
