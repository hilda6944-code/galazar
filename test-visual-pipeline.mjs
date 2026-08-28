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
  const { result, calls } = await runWithResponses([{ visualEvaluation: 'No correction is needed.', decision: 'PASS' }]);
  assert.equal(calls, 1);
  assert.equal(result.candidateImprovement, null);
  assert.equal(result.finalEditPrompt, null);
}

for (const decision of ['PASS WITH ONE CORRECTION', 'FAIL']) {
  const { result, calls } = await runWithResponses([{ visualEvaluation: 'An edit is required.', decision }, improvement]);
  assert.equal(calls, 2);
  assert.equal(result.decision, decision);
  assert.equal(result.candidateImprovement, improvement.candidateImprovement);
  assert.equal(result.finalEditPrompt, improvement.finalEditPrompt);
}

await assert.rejects(
  runWithResponses([{ visualEvaluation: 'Ambiguous.', decision: 'MAYBE' }]),
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

