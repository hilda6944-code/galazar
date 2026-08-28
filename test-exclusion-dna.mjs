import assert from 'node:assert/strict';
import { createDNAEntry, applyDNAEntryToBuild } from './src/lib/dnaLibrary.ts';
import { assembleExclusionPrompt } from './src/lib/exclusionPrompt.ts';
import { appendHistoryTransition } from './src/lib/historyTransitions.ts';
import { upsertSavedBuild, loadSavedBuild } from './src/lib/savedBuilds.ts';
import { enforceVariantLocks } from './src/lib/variantLocks.ts';
import { createVariant, updateVariantFromBuild, variantToBuild } from './src/lib/variants.ts';
import { normalizeBuildModules } from './src/lib/moduleNormalization.ts';
import { createNewBuild } from './src/types/galazar.ts';

const empty = createNewBuild();
assert.deepEqual(empty.modules.exclusions.exclusionDNA, { selected: [], customExclusion: '' });
assert.equal(assembleExclusionPrompt(empty.modules.exclusions.exclusionDNA), '');
assert.equal(assembleExclusionPrompt({ selected: ['No malformed hands'], customExclusion: '' }), 'avoid: malformed hands');
assert.equal(
  assembleExclusionPrompt({ selected: ['No unwanted text', 'No malformed hands', 'No unwanted text', 'No duplicated body parts'], customExclusion: '' }),
  'avoid: unwanted text, malformed hands, duplicated body parts'
);
assert.equal(
  assembleExclusionPrompt({ selected: ['No malformed hands'], customExclusion: 'no oversaturated glow' }),
  'avoid: malformed hands, no oversaturated glow'
);

const legacy = createNewBuild();
delete legacy.modules.exclusions.exclusionDNA;
legacy.modules.exclusions.value = 'No Text';
legacy.modules.exclusions.customText = 'no accidental border';
const migrated = normalizeBuildModules(legacy.modules).exclusions;
assert.deepEqual(migrated.exclusionDNA.selected, ['No unwanted text']);
assert.equal(migrated.exclusionDNA.customExclusion, 'no accidental border');
assert.equal(migrated.value, null);
assert.equal(migrated.customText, '');

const source = createNewBuild('Exclusion Source');
source.modules.subject.customText = 'GALAZAR signature deliberately placed in lower corner';
source.modules.exclusions.exclusionDNA.selected = ['No unintended watermark', 'No extra fingers'];
source.modules.exclusions.exclusionDNA.customExclusion = 'no stray frame';
source.modules.exclusions.status = 'active';
source.prompt = `${source.modules.subject.customText}. ${assembleExclusionPrompt(source.modules.exclusions.exclusionDNA)}`;
assert.equal(source.prompt.includes('GALAZAR signature deliberately placed'), true);
assert.equal(assembleExclusionPrompt(source.modules.exclusions.exclusionDNA).includes('signature'), false);

const changed = structuredClone(source);
changed.modules.exclusions.exclusionDNA.selected = ['No lettering'];
changed.prompt = assembleExclusionPrompt(changed.modules.exclusions.exclusionDNA);
const before = { modules: source.modules, prompt: source.prompt, timestamp: 1 };
const after = { modules: changed.modules, prompt: changed.prompt, timestamp: 2 };
const history = appendHistoryTransition([before], 0, before, after);
assert.deepEqual(history.history[history.historyIndex - 1].modules.exclusions.exclusionDNA.selected, ['No unintended watermark', 'No extra fingers']);
assert.deepEqual(history.history[history.historyIndex].modules.exclusions.exclusionDNA.selected, ['No lettering']);

const locked = structuredClone(source);
locked.modules.exclusions.status = 'locked';
const attempted = structuredClone(locked.modules);
attempted.exclusions.exclusionDNA.selected = ['No symbols'];
const protectedModules = enforceVariantLocks(locked.modules, attempted, true);
assert.strictEqual(protectedModules.exclusions, locked.modules.exclusions);
assert.deepEqual(protectedModules.exclusions.exclusionDNA.selected, ['No unintended watermark', 'No extra fingers']);

const cleared = createNewBuild();
assert.deepEqual(cleared.modules.exclusions.exclusionDNA, { selected: [], customExclusion: '' });
assert.equal(cleared.modules.exclusions.status, 'empty');
const clearHistory = appendHistoryTransition([before], 0, before, { modules: cleared.modules, prompt: '', timestamp: 3 });
assert.equal(clearHistory.history[clearHistory.historyIndex - 1].modules.exclusions.status, 'active');
assert.equal(clearHistory.history[clearHistory.historyIndex].modules.exclusions.status, 'empty');

const saved = upsertSavedBuild([], source);
const restored = loadSavedBuild(saved[0]);
assert.deepEqual(restored.modules.exclusions.exclusionDNA, source.modules.exclusions.exclusionDNA);

const firstVariant = createVariant(source, 'Exclude One', 'exclude-v1', '2026-08-12T12:00:00.000Z');
const secondVariant = createVariant(source, 'Exclude Two', 'exclude-v2', '2026-08-12T12:01:00.000Z');
const firstActive = variantToBuild(firstVariant);
firstActive.modules.exclusions.exclusionDNA.selected = ['No symbols'];
const variants = updateVariantFromBuild([firstVariant, secondVariant], firstVariant.id, firstActive);
assert.deepEqual(variants[0].modules.exclusions.exclusionDNA.selected, ['No symbols']);
assert.deepEqual(variants[1].modules.exclusions.exclusionDNA.selected, ['No unintended watermark', 'No extra fingers']);
assert.deepEqual(source.modules.exclusions.exclusionDNA.selected, ['No unintended watermark', 'No extra fingers']);

const entry = createDNAEntry(source.modules.exclusions, 'Clean Exclusions', 'dna-exclusions', '2026-08-12T12:02:00.000Z');
const target = createNewBuild();
target.modules.camera.customText = 'camera remains';
const applied = applyDNAEntryToBuild(target, entry, false, (modules) => assembleExclusionPrompt(modules.exclusions.exclusionDNA));
assert.deepEqual(applied.build.modules.exclusions.exclusionDNA, source.modules.exclusions.exclusionDNA);
assert.equal(applied.build.modules.camera.customText, 'camera remains');
assert.notStrictEqual(applied.build.modules.exclusions, entry.moduleState);

console.log('Exclusion DNA regression test passed.');
