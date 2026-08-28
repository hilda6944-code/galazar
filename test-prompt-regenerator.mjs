import assert from 'node:assert/strict';
import {
  assembleRegeneratedPrompt,
  regeneratePromptParts,
  PromptRegeneratorValidationError,
} from './src/lib/promptRegenerator.ts';

const original = {
  subject: 'a silver-haired woman with green eyes',
  actionPose: 'turning toward the viewer in a held moment',
  environment: 'a quiet weathered coastal cottage',
  lightingMood: 'soft dawn light with contemplative warmth',
  styleMedium: 'Galazar quiet portrait realism, painterly photography',
};

assert.equal(
  assembleRegeneratedPrompt(original),
  'a silver-haired woman with green eyes + turning toward the viewer in a held moment + a quiet weathered coastal cottage + soft dawn light with contemplative warmth + Galazar quiet portrait realism, painterly photography',
);

{
  let request;
  const generated = {
    subject: 'an orange cat with alert amber eyes',
    actionPose: 'pausing with one paw raised',
    environment: 'a rain-darkened garden fence',
    lightingMood: 'clear morning light with gentle optimism',
    styleMedium: 'fine-art wildlife photography, realistic fur',
  };
  const result = await regeneratePromptParts('source prompt', null, 'subject', {
    client: async (nextRequest) => {
      request = nextRequest;
      return generated;
    },
  });
  assert.deepEqual(result, generated);
  assert.equal(request.imageDataUrl, undefined);
  assert.equal(request.temperature, 0.75);
  assert.equal(request.maxTokens, 3072);
}

{
  const modelResponse = {
    subject: 'a newly regenerated subject',
    actionPose: 'model tried to replace the action',
    environment: 'model tried to replace the environment',
    lightingMood: 'model tried to replace the lighting',
    styleMedium: 'model tried to replace the style',
  };
  const result = await regeneratePromptParts('source prompt', original, 'subject', {
    client: async () => modelResponse,
  });
  assert.equal(result.subject, modelResponse.subject);
  assert.equal(result.actionPose, original.actionPose);
  assert.equal(result.environment, original.environment);
  assert.equal(result.lightingMood, original.lightingMood);
  assert.equal(result.styleMedium, original.styleMedium);
}

{
  const regenerated = {
    subject: 'new subject',
    actionPose: 'new action',
    environment: 'new environment',
    lightingMood: 'new lighting',
    styleMedium: 'new style',
  };
  const result = await regeneratePromptParts('source prompt', original, 'all', {
    client: async () => regenerated,
  });
  assert.deepEqual(result, regenerated);
}

await assert.rejects(
  regeneratePromptParts('source prompt', original, 'environment', {
    client: async () => ({ ...original, environment: '' }),
  }),
  (error) => error instanceof PromptRegeneratorValidationError && /empty environment/.test(error.message),
);

console.log('Prompt Regenerator preservation and validation regression test passed.');
