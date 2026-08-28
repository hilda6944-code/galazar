import assert from 'node:assert/strict';
import { appendHistoryTransition } from './src/lib/historyTransitions.ts';
import { createNewBuild } from './src/types/galazar.ts';
import { createVariant, deleteVariant, renameVariant, requiresVariantLoadConfirmation, updateVariantFromBuild, variantToBuild } from './src/lib/variants.ts';

const createdAt = '2026-08-12T12:00:00.000Z';
const source = createNewBuild('Populated Source');
source.modules.subject.status = 'locked';
source.modules.subject.subjectDNA.subjectType = 'Human';
source.modules.subject.subjectDNA.human.appearance = 'source appearance';
source.modules.camera.cameraDNA.shotSize = 'Close-Up';
source.prompt = 'exact source prompt';

const first = createVariant(source, 'First Branch', 'variant-1', createdAt);
assert.deepEqual(first.modules, source.modules);
assert.equal(first.prompt, source.prompt);
assert.deepEqual(first.originBuild, source);
assert.notStrictEqual(first.modules, source.modules);
assert.equal(first.modules.subject.status, 'locked');

let variants = [first];
const firstActive = variantToBuild(first);
firstActive.modules.subject.subjectDNA.human.appearance = 'edited first variant';
firstActive.prompt = 'edited first prompt';
variants = updateVariantFromBuild(variants, first.id, firstActive);
assert.equal(source.modules.subject.subjectDNA.human.appearance, 'source appearance');
assert.equal(source.prompt, 'exact source prompt');
assert.equal(variants[0].originBuild.prompt, 'exact source prompt');

const second = createVariant(source, 'Second Branch', 'variant-2', createdAt);
variants = [second, ...variants];
assert.equal(second.modules.subject.subjectDNA.human.appearance, 'source appearance');
assert.equal(variants[1].modules.subject.subjectDNA.human.appearance, 'edited first variant');

const reloaded = JSON.parse(JSON.stringify(variants));
assert.equal(reloaded.length, 2);
assert.equal(reloaded[1].prompt, 'edited first prompt');

variants = renameVariant(variants, first.id, 'Renamed Branch');
const renamed = variants.find((variant) => variant.id === first.id);
assert.equal(renamed.name, 'Renamed Branch');
const reopened = variantToBuild(renamed);
assert.equal(reopened.prompt, 'edited first prompt');
assert.deepEqual(reopened.modules, renamed.modules);

assert.equal(requiresVariantLoadConfirmation(true), true);
assert.equal(requiresVariantLoadConfirmation(false), false);

const initialHistory = [{ modules: reopened.modules, prompt: reopened.prompt, timestamp: 0 }];
const editedModules = structuredClone(reopened.modules);
editedModules.camera.customText = 'history edit';
const editHistory = appendHistoryTransition(initialHistory, 0, initialHistory[0], { modules: editedModules, prompt: 'history edit prompt', timestamp: 1 });
assert.strictEqual(editHistory.history[editHistory.historyIndex - 1].modules, reopened.modules);
assert.strictEqual(editHistory.history[editHistory.historyIndex].modules, editedModules);

const cleared = createNewBuild();
const clearHistory = appendHistoryTransition(editHistory.history, editHistory.historyIndex, editHistory.history[editHistory.historyIndex], { modules: cleared.modules, prompt: '', timestamp: 2 });
assert.equal(clearHistory.history[clearHistory.historyIndex].prompt, '');
assert.equal(clearHistory.history[clearHistory.historyIndex].modules.subject.status, 'empty');
assert.equal(clearHistory.history[clearHistory.historyIndex - 1].modules.subject.status, 'locked');

variants = deleteVariant(variants, first.id);
assert.equal(variants.length, 1);
assert.equal(variants[0].id, second.id);
assert.equal(source.prompt, 'exact source prompt');

console.log('Variants workflow regression test passed.');
