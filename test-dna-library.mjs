import assert from 'node:assert/strict';
import { appendHistoryTransition } from './src/lib/historyTransitions.ts';
import { applyDNAEntryToBuild, createDNAEntry, deleteDNAEntry, filterDNAEntries, renameDNAEntry } from './src/lib/dnaLibrary.ts';
import { createNewBuild } from './src/types/galazar.ts';

const assemble = (modules) => Object.values(modules).map((module) => module.customText || module.value || '').filter(Boolean).join('. ');
const source = createNewBuild('DNA Source');
source.modules.subject.subjectDNA.subjectType = 'Human';
source.modules.subject.subjectDNA.human.appearance = 'saved subject appearance';
source.modules.subject.customText = 'saved subject prompt';
source.modules.subject.status = 'active';
source.modules.camera.customText = 'unchanged camera';

let entries = [createDNAEntry(source.modules.subject, 'Hero Subject', 'dna-subject', '2026-08-12T12:00:00.000Z')];
const changed = structuredClone(source);
changed.modules.subject.subjectDNA.human.appearance = 'different subject';
changed.modules.subject.customText = 'different subject prompt';
changed.modules.camera.customText = 'unchanged camera';
changed.prompt = assemble(changed.modules);

const appliedSubject = applyDNAEntryToBuild(changed, entries[0], false, assemble);
assert.equal(appliedSubject.applied, true);
assert.deepEqual(appliedSubject.build.modules.subject, source.modules.subject);
assert.equal(appliedSubject.build.modules.camera.customText, 'unchanged camera');
assert.equal(appliedSubject.build.prompt, 'saved subject prompt. unchanged camera');
assert.notStrictEqual(appliedSubject.build.modules.subject, entries[0].moduleState);

const moduleIds = ['camera', 'light', 'color', 'style', 'medium', 'finish'];
for (const [index, moduleId] of moduleIds.entries()) {
  source.modules[moduleId].customText = `saved ${moduleId}`;
  source.modules[moduleId].status = 'active';
  const entry = createDNAEntry(source.modules[moduleId], `${moduleId} setup`, `dna-${moduleId}`, `2026-08-12T12:0${index + 1}:00.000Z`);
  entries.push(entry);
  const target = createNewBuild();
  const result = applyDNAEntryToBuild(target, entry, false, assemble);
  assert.equal(result.applied, true);
  assert.deepEqual(result.build.modules[moduleId], source.modules[moduleId]);
}

appliedSubject.build.modules.subject.subjectDNA.human.appearance = 'active-only edit';
assert.equal(entries[0].moduleState.subjectDNA.human.appearance, 'saved subject appearance');

entries = renameDNAEntry(entries, 'dna-subject', 'Renamed Hero');
assert.equal(entries[0].name, 'Renamed Hero');
assert.equal(filterDNAEntries(entries, 'hero').length, 1);
assert.equal(filterDNAEntries(entries, 'camera').length, 1);

const persisted = JSON.parse(JSON.stringify(entries));
assert.equal(persisted.length, 7);
assert.equal(persisted[0].moduleState.subjectDNA.human.appearance, 'saved subject appearance');

const before = { modules: changed.modules, prompt: changed.prompt, timestamp: 1 };
const after = { modules: appliedSubject.build.modules, prompt: appliedSubject.build.prompt, timestamp: 2 };
const history = appendHistoryTransition([before], 0, before, after);
assert.strictEqual(history.history[history.historyIndex - 1].modules, changed.modules);
assert.strictEqual(history.history[history.historyIndex].modules, appliedSubject.build.modules);

const lockedVariant = structuredClone(changed);
lockedVariant.modules.subject.status = 'locked';
const blocked = applyDNAEntryToBuild(lockedVariant, entries[0], true, assemble);
assert.equal(blocked.applied, false);
assert.strictEqual(blocked.build, lockedVariant);
assert.equal(blocked.build.modules.subject.subjectDNA.human.appearance, 'different subject');

entries = deleteDNAEntry(entries, 'dna-camera');
assert.equal(entries.length, 6);
assert.equal(entries.some((entry) => entry.id === 'dna-subject'), true);
assert.equal(entries.some((entry) => entry.id === 'dna-light'), true);

console.log('DNA Library workflow regression test passed.');
