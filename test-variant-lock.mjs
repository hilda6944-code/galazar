import assert from 'node:assert/strict';
import { appendHistoryTransition } from './src/lib/historyTransitions.ts';
import { upsertSavedBuild } from './src/lib/savedBuilds.ts';
import { enforceVariantLocks } from './src/lib/variantLocks.ts';
import { createVariant, updateVariantFromBuild, variantToBuild } from './src/lib/variants.ts';
import { createNewBuild } from './src/types/galazar.ts';

const source = createNewBuild('Lock Source');
source.modules.subject.subjectDNA.subjectType = 'Human';
source.modules.subject.subjectDNA.human.appearance = 'original subject';
source.modules.subject.status = 'active';
source.modules.camera.cameraDNA.shotSize = 'Close-Up';
source.modules.camera.status = 'active';
source.prompt = 'populated source prompt';

const variant = createVariant(source, 'Locked Branch', 'variant-lock-1', '2026-08-12T12:00:00.000Z');
let active = variantToBuild(variant);
active.modules.subject.status = 'locked';

const attemptedLockedEdit = structuredClone(active.modules);
attemptedLockedEdit.subject.subjectDNA.human.appearance = 'forbidden change';
const protectedModules = enforceVariantLocks(active.modules, attemptedLockedEdit, true);
assert.strictEqual(protectedModules.subject, active.modules.subject);
assert.equal(protectedModules.subject.subjectDNA.human.appearance, 'original subject');

const unlockedEdit = structuredClone(active.modules);
unlockedEdit.camera.cameraDNA.shotSize = 'Wide Shot';
const editableModules = enforceVariantLocks(active.modules, unlockedEdit, true);
assert.equal(editableModules.camera.cameraDNA.shotSize, 'Wide Shot');
assert.strictEqual(editableModules.subject, active.modules.subject);

const unlockCandidate = { ...active.modules, subject: { ...active.modules.subject, status: 'active' } };
const unlockedModules = enforceVariantLocks(active.modules, unlockCandidate, true, 'subject');
assert.equal(unlockedModules.subject.status, 'active');
const editAfterUnlock = structuredClone(unlockedModules);
editAfterUnlock.subject.subjectDNA.human.appearance = 'allowed change';
assert.equal(enforceVariantLocks(unlockedModules, editAfterUnlock, true).subject.subjectDNA.human.appearance, 'allowed change');

active = { ...active, modules: editableModules };
let variants = updateVariantFromBuild([variant], variant.id, active);
const persisted = JSON.parse(JSON.stringify(variants));
assert.equal(persisted[0].modules.subject.status, 'locked');

const sibling = createVariant(source, 'Sibling Branch', 'variant-lock-2', '2026-08-12T12:01:00.000Z');
assert.equal(sibling.modules.subject.status, 'active');
assert.equal(source.modules.subject.status, 'active');
assert.equal(source.modules.subject.subjectDNA.human.appearance, 'original subject');

const explicitlySaved = upsertSavedBuild([], active);
assert.equal(explicitlySaved[0].modules.subject.status, 'locked');

const cleared = createNewBuild();
const beforeClear = { modules: active.modules, prompt: active.prompt, timestamp: 1 };
const afterClear = { modules: cleared.modules, prompt: cleared.prompt, timestamp: 2 };
const history = appendHistoryTransition([beforeClear], 0, beforeClear, afterClear);
for (const module of Object.values(history.history[history.historyIndex].modules)) {
  assert.equal(module.status, 'empty');
}
assert.equal(history.history[history.historyIndex].prompt, '');
const undone = history.history[history.historyIndex - 1];
assert.equal(undone.modules.subject.status, 'locked');
assert.equal(undone.modules.subject.subjectDNA.human.appearance, 'original subject');
const redone = history.history[history.historyIndex];
assert.equal(redone.modules.subject.status, 'empty');

variants = [sibling, ...variants];
assert.equal(variants[0].modules.subject.status, 'active');
assert.equal(variants[1].modules.subject.status, 'locked');

console.log('Variant Lock regression test passed.');
