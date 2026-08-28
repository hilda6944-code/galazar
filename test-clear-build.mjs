import assert from 'node:assert/strict';
import { appendHistoryTransition } from './src/lib/historyTransitions.ts';
import { createDefaultAppState, createNewBuild } from './src/types/galazar.ts';

const appState = createDefaultAppState();
const originalCollections = {
  projects: appState.projects,
  savedBuilds: appState.savedBuilds,
  variants: appState.variants,
  dnaLibrary: appState.dnaLibrary,
};

const populated = createNewBuild('Populated');
populated.modules.subject.status = 'locked';
populated.modules.subject.value = 'locked subject';
populated.modules.subject.customText = 'custom subject';
populated.modules.subject.subjectDNA.subjectType = 'Human';
populated.modules.camera.cameraDNA.cameraMode = 'Photography';
populated.modules.light.lightDNA.lightingMode = 'Natural';
populated.modules.color.colorDNA.colorDirection = 'Monochrome';
populated.modules.style.styleDNA.styleMode = 'Realistic';
populated.modules.medium.mediumDNA.primaryMedium = 'Oil Painting';
populated.modules.finish.finishDNA.finishCharacter = 'Natural';
populated.modules.exclusions.value = 'No Text';
populated.prompt = 'the exact pre-clear prompt';

const cleared = createNewBuild();
const expectedDefaults = createNewBuild();
const before = { modules: populated.modules, prompt: populated.prompt, timestamp: 1 };
const after = { modules: cleared.modules, prompt: cleared.prompt, timestamp: 2 };
const transition = appendHistoryTransition(
  [{ modules: createNewBuild().modules, prompt: '', timestamp: 0 }],
  0,
  before,
  after
);

assert.equal(cleared.prompt, '');
assert.deepEqual(cleared.modules, expectedDefaults.modules);
for (const module of Object.values(cleared.modules)) {
  assert.equal(module.status, 'empty');
  assert.equal(module.skipped, false);
  assert.equal(module.value, null);
  assert.equal(module.customText, '');
}
assert.equal(transition.historyIndex, 2);
assert.strictEqual(transition.history[1].modules, populated.modules);
assert.equal(transition.history[1].prompt, populated.prompt);
assert.strictEqual(transition.history[2].modules, cleared.modules);
assert.equal(transition.history[2].prompt, '');

const undo = transition.history[transition.historyIndex - 1];
assert.strictEqual(undo.modules, populated.modules);
assert.equal(undo.prompt, populated.prompt);
const redo = transition.history[transition.historyIndex];
assert.strictEqual(redo.modules, cleared.modules);
assert.equal(redo.prompt, '');

assert.strictEqual(appState.projects, originalCollections.projects);
assert.strictEqual(appState.savedBuilds, originalCollections.savedBuilds);
assert.strictEqual(appState.variants, originalCollections.variants);
assert.strictEqual(appState.dnaLibrary, originalCollections.dnaLibrary);

console.log('Clear Build history regression test passed.');
