import assert from 'node:assert/strict';
import { createDNAEntry, applyDNAEntryToBuild } from './src/lib/dnaLibrary.ts';
import { appendHistoryTransition } from './src/lib/historyTransitions.ts';
import { upsertSavedBuild, loadSavedBuild } from './src/lib/savedBuilds.ts';
import { enforceVariantLocks } from './src/lib/variantLocks.ts';
import { createVariant, updateVariantFromBuild, variantToBuild } from './src/lib/variants.ts';
import { assembleFormatPrompt } from './src/lib/formatPrompt.ts';
import { createNewBuild } from './src/types/galazar.ts';
import { normalizeBuildModules } from './src/lib/moduleNormalization.ts';

const defaults = createNewBuild();
assert.equal(defaults.modules.format.formatDNA.format, null);
assert.equal(defaults.modules.format.formatDNA.customFormat, '');
assert.equal(assembleFormatPrompt(defaults.modules.format.formatDNA), '');

const phrases = new Map([
  ['Square — 1:1', 'square composition, 1:1 aspect ratio'],
  ['Portrait — 4:5', 'portrait composition, 4:5 aspect ratio'],
  ['Story / Vertical — 9:16', 'vertical story composition, 9:16 aspect ratio'],
  ['Classic Portrait — 3:4', 'classic portrait composition, 3:4 aspect ratio'],
  ['Landscape — 16:9', 'landscape composition, 16:9 aspect ratio'],
  ['Standard Photo — 3:2', 'standard photographic composition, 3:2 aspect ratio'],
  ['Classic Landscape — 4:3', 'classic landscape composition, 4:3 aspect ratio'],
  ['Ultrawide — 21:9', 'ultrawide cinematic composition, 21:9 aspect ratio'],
  ['Banner / Wide', 'wide banner composition'],
]);

for (const [format, phrase] of phrases) {
  assert.equal(assembleFormatPrompt({ format, customFormat: '' }), phrase);
}
assert.equal(assembleFormatPrompt({ format: 'Custom', customFormat: '2:1 panoramic composition' }), '2:1 panoramic composition');

const source = createNewBuild('Format Source');
source.modules.subject.customText = 'subject stays unchanged';
source.modules.format.formatDNA.format = 'Landscape — 16:9';
source.modules.format.status = 'active';
source.prompt = `subject stays unchanged. ${assembleFormatPrompt(source.modules.format.formatDNA)}`;
assert.equal(source.prompt, 'subject stays unchanged. landscape composition, 16:9 aspect ratio');

const changed = structuredClone(source);
changed.modules.format.formatDNA.format = 'Square — 1:1';
changed.prompt = `subject stays unchanged. ${assembleFormatPrompt(changed.modules.format.formatDNA)}`;
const before = { modules: source.modules, prompt: source.prompt, timestamp: 1 };
const after = { modules: changed.modules, prompt: changed.prompt, timestamp: 2 };
const history = appendHistoryTransition([before], 0, before, after);
assert.equal(history.history[history.historyIndex - 1].modules.format.formatDNA.format, 'Landscape — 16:9');
assert.equal(history.history[history.historyIndex].modules.format.formatDNA.format, 'Square — 1:1');

const cleared = createNewBuild();
assert.equal(cleared.modules.format.formatDNA.format, null);
assert.equal(cleared.modules.format.status, 'empty');

const locked = structuredClone(source);
locked.modules.format.status = 'locked';
const attempted = structuredClone(locked.modules);
attempted.format.formatDNA.format = 'Portrait — 4:5';
const protectedModules = enforceVariantLocks(locked.modules, attempted, true);
assert.equal(protectedModules.format.formatDNA.format, 'Landscape — 16:9');
assert.strictEqual(protectedModules.format, locked.modules.format);
assert.equal(cleared.modules.format.status, 'empty');

const saved = upsertSavedBuild([], source);
const restored = loadSavedBuild(saved[0]);
assert.equal(restored.modules.format.formatDNA.format, 'Landscape — 16:9');

const firstVariant = createVariant(source, 'Format One', 'format-v1', '2026-08-12T12:00:00.000Z');
const secondVariant = createVariant(source, 'Format Two', 'format-v2', '2026-08-12T12:01:00.000Z');
const firstActive = variantToBuild(firstVariant);
firstActive.modules.format.formatDNA.format = 'Ultrawide — 21:9';
const variants = updateVariantFromBuild([firstVariant, secondVariant], firstVariant.id, firstActive);
assert.equal(variants[0].modules.format.formatDNA.format, 'Ultrawide — 21:9');
assert.equal(variants[1].modules.format.formatDNA.format, 'Landscape — 16:9');
assert.equal(source.modules.format.formatDNA.format, 'Landscape — 16:9');

const entry = createDNAEntry(source.modules.format, 'Landscape Format', 'dna-format', '2026-08-12T12:02:00.000Z');
const libraryTarget = createNewBuild();
libraryTarget.modules.subject.customText = 'unrelated subject';
const applied = applyDNAEntryToBuild(libraryTarget, entry, false, (modules) => assembleFormatPrompt(modules.format.formatDNA));
assert.equal(applied.build.modules.format.formatDNA.format, 'Landscape — 16:9');
assert.equal(applied.build.modules.subject.customText, 'unrelated subject');
assert.notStrictEqual(applied.build.modules.format, entry.moduleState);

const legacyModules = structuredClone(source.modules);
delete legacyModules.format;
assert.equal(legacyModules.format, undefined);
const normalizedLegacyModules = normalizeBuildModules(legacyModules);
assert.equal(normalizedLegacyModules.format.formatDNA.format, null);
assert.equal(normalizedLegacyModules.format.status, 'empty');

console.log('Format DNA regression test passed.');
