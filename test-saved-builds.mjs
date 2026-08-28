import assert from 'node:assert/strict';
import { appendHistoryTransition } from './src/lib/historyTransitions.ts';
import {
  deleteSavedBuild,
  loadSavedBuild,
  renameSavedBuild,
  upsertSavedBuild,
} from './src/lib/savedBuilds.ts';
import { createNewBuild } from './src/types/galazar.ts';

const populated = createNewBuild('Portrait Study');
populated.modules.subject.subjectDNA.subjectType = 'Human';
populated.modules.subject.subjectDNA.human.appearance = 'distinctive saved appearance';
populated.modules.camera.cameraDNA.shotSize = 'Close-Up';
populated.modules.light.lightDNA.lightingMode = 'Natural';
populated.modules.color.colorDNA.colorDirection = 'Monochrome';
populated.modules.style.styleDNA.styleMode = 'Realistic';
populated.modules.medium.mediumDNA.primaryMedium = 'Oil Painting';
populated.modules.finish.finishDNA.finishCharacter = 'Natural';
populated.prompt = 'exact saved live prompt';

let savedBuilds = upsertSavedBuild([], populated);
assert.equal(savedBuilds.length, 1);
assert.deepEqual(savedBuilds[0].modules, populated.modules);
assert.equal(savedBuilds[0].prompt, populated.prompt);
assert.notStrictEqual(savedBuilds[0], populated);
assert.notStrictEqual(savedBuilds[0].modules, populated.modules);

const changedActive = createNewBuild('Different Active Build');
changedActive.prompt = 'different prompt';
const loaded = loadSavedBuild(savedBuilds[0]);
assert.deepEqual(loaded.modules, savedBuilds[0].modules);
assert.equal(loaded.prompt, savedBuilds[0].prompt);

loaded.modules.subject.subjectDNA.human.appearance = 'edited active appearance';
loaded.prompt = 'edited active prompt';
assert.equal(savedBuilds[0].modules.subject.subjectDNA.human.appearance, 'distinctive saved appearance');
assert.equal(savedBuilds[0].prompt, 'exact saved live prompt');

const loadedInitialHistory = [{ modules: loaded.modules, prompt: loaded.prompt, timestamp: 0 }];
const editedModules = structuredClone(loaded.modules);
editedModules.camera.customText = 'edited after load';
const editTransition = appendHistoryTransition(
  loadedInitialHistory,
  0,
  loadedInitialHistory[0],
  { modules: editedModules, prompt: 'edited after load prompt', timestamp: 1 }
);
assert.strictEqual(editTransition.history[editTransition.historyIndex - 1].modules, loaded.modules);
assert.strictEqual(editTransition.history[editTransition.historyIndex].modules, editedModules);

const cleared = createNewBuild();
const clearTransition = appendHistoryTransition(
  editTransition.history,
  editTransition.historyIndex,
  editTransition.history[editTransition.historyIndex],
  { modules: cleared.modules, prompt: cleared.prompt, timestamp: 2 }
);
assert.equal(clearTransition.history[clearTransition.historyIndex].prompt, '');
assert.strictEqual(clearTransition.history[clearTransition.historyIndex - 1].modules, editedModules);

savedBuilds = upsertSavedBuild(savedBuilds, loaded);
assert.equal(savedBuilds[0].prompt, 'edited active prompt');

savedBuilds = renameSavedBuild(savedBuilds, populated.id, 'Renamed Portrait', '2026-08-12T12:00:00.000Z');
assert.equal(savedBuilds[0].name, 'Renamed Portrait');
const renamedLoaded = loadSavedBuild(savedBuilds[0]);
assert.equal(renamedLoaded.name, 'Renamed Portrait');
assert.equal(renamedLoaded.prompt, 'edited active prompt');

const second = createNewBuild('Keep Me');
savedBuilds = upsertSavedBuild(savedBuilds, second);
savedBuilds = deleteSavedBuild(savedBuilds, populated.id);
assert.equal(savedBuilds.length, 1);
assert.equal(savedBuilds[0].id, second.id);

assert.equal(changedActive.prompt, 'different prompt');
console.log('Saved Builds workflow regression test passed.');
