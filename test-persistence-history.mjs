import assert from 'node:assert/strict';
import { applyDNAEntryToBuild, createDNAEntry } from './src/lib/dnaLibrary.ts';
import { appendHistoryTransition } from './src/lib/historyTransitions.ts';
import { assembleFullPrompt } from './src/lib/promptAssembly.ts';
import { isCurrentPersistenceRevision, saveActiveBuildState } from './src/lib/statePersistence.ts';
import { deserializeState } from './src/hooks/useGalazarStorage.ts';
import { createVariant } from './src/lib/variants.ts';
import { createDefaultAppState, createNewBuild } from './src/types/galazar.ts';

const savedAt = '2026-08-12T18:00:00.000Z';
let state = createDefaultAppState();
const latestVisible = structuredClone(state.currentBuild);
latestVisible.modules.subject.subjectDNA.subjectType = 'Human';
latestVisible.modules.subject.subjectDNA.human.appearance = 'latest rapid edit';
latestVisible.modules.camera.cameraDNA.shotSize = 'Close-Up';
latestVisible.prompt = assembleFullPrompt(latestVisible.modules);

state = saveActiveBuildState(state, latestVisible, savedAt);
assert.deepEqual(state.currentBuild.modules, latestVisible.modules);
assert.equal(state.currentBuild.prompt, latestVisible.prompt);
assert.deepEqual(state.savedBuilds[0].modules, latestVisible.modules);
assert.equal(state.savedBuilds[0].prompt, latestVisible.prompt);
assert.notStrictEqual(state.savedBuilds[0], latestVisible);
assert.notStrictEqual(state.savedBuilds[0].modules, latestVisible.modules);

const newerVisible = structuredClone(latestVisible);
newerVisible.modules.subject.subjectDNA.human.appearance = 'newest of several edits';
newerVisible.prompt = assembleFullPrompt(newerVisible.modules);
state = saveActiveBuildState(state, newerVisible, '2026-08-12T18:00:01.000Z');
assert.equal(state.savedBuilds.length, 1);
assert.equal(state.savedBuilds[0].modules.subject.subjectDNA.human.appearance, 'newest of several edits');

const activeVariant = createVariant(newerVisible, 'Active Variant', 'variant_active', savedAt);
state = { ...state, variants: [activeVariant], activeVariantId: activeVariant.id };
const latestVariantEdit = structuredClone(newerVisible);
latestVariantEdit.modules.color.colorDNA.colorDirection = 'Monochrome';
latestVariantEdit.prompt = assembleFullPrompt(latestVariantEdit.modules);
state = saveActiveBuildState(state, latestVariantEdit, savedAt);
assert.deepEqual(state.variants[0].modules, latestVariantEdit.modules);
assert.equal(state.variants[0].prompt, latestVariantEdit.prompt);

let revision = 1;
const oldAutoSaveRevision = revision;
revision += 1; // loading or explicit saving invalidates the pending callback
assert.equal(isCurrentPersistenceRevision(oldAutoSaveRevision, revision), false);
assert.equal(isCurrentPersistenceRevision(revision, revision), true);

const loaded = createNewBuild('Loaded Saved Build');
loaded.prompt = 'loaded exact prompt';
state = { ...state, currentBuild: loaded };
assert.equal(isCurrentPersistenceRevision(oldAutoSaveRevision, revision), false);
assert.equal(state.currentBuild.prompt, 'loaded exact prompt');

const variant = createNewBuild('Loaded Variant');
variant.prompt = 'variant exact prompt';
revision += 1;
state = { ...state, currentBuild: variant };
assert.equal(isCurrentPersistenceRevision(oldAutoSaveRevision, revision), false);
assert.equal(state.currentBuild.prompt, 'variant exact prompt');

const subjectModule = structuredClone(state.currentBuild.modules.subject);
subjectModule.subjectDNA.subjectType = 'Custom';
subjectModule.subjectDNA.customDescription = 'library subject';
const entry = createDNAEntry(subjectModule, 'Subject DNA', 'dna_test', savedAt);
const applied = applyDNAEntryToBuild(state.currentBuild, entry, false, assembleFullPrompt);
assert.equal(applied.applied, true);
state = saveActiveBuildState({ ...state, currentBuild: applied.build }, applied.build, savedAt);
assert.equal(state.savedBuilds[0].modules.subject.subjectDNA.customDescription, 'library subject');

const populated = structuredClone(state.currentBuild);
populated.modules.format.status = 'locked';
populated.modules.format.formatDNA.format = 'Square — 1:1';
populated.prompt = assembleFullPrompt(populated.modules);
const cleared = createNewBuild('Cleared');
const transition = appendHistoryTransition(
  [{ modules: populated.modules, prompt: populated.prompt, timestamp: 0 }],
  0,
  { modules: populated.modules, prompt: populated.prompt, timestamp: 1 },
  { modules: cleared.modules, prompt: cleared.prompt, timestamp: 2 }
);
const undone = { ...populated, modules: transition.history[transition.historyIndex - 1].modules, prompt: transition.history[transition.historyIndex - 1].prompt };
state = saveActiveBuildState(state, undone, savedAt);
let reloaded = deserializeState(JSON.stringify({ ...state, history: transition.history, historyIndex: transition.historyIndex }));
assert.deepEqual(reloaded.currentBuild.modules, undone.modules);
assert.equal(reloaded.currentBuild.prompt, undone.prompt);
assert.equal('history' in reloaded, false);
assert.equal('historyIndex' in reloaded, false);

const redone = { ...cleared, modules: transition.history[transition.historyIndex].modules, prompt: transition.history[transition.historyIndex].prompt };
state = saveActiveBuildState(state, redone, savedAt);
reloaded = deserializeState(JSON.stringify(state));
assert.equal(reloaded.currentBuild.prompt, '');
assert.deepEqual(reloaded.currentBuild.modules, cleared.modules);

console.log('Persistence and history integrity regression test passed.');
