import assert from 'node:assert/strict';
import { createDNAEntry, applyDNAEntryToBuild } from './src/lib/dnaLibrary.ts';
import { appendHistoryTransition } from './src/lib/historyTransitions.ts';
import { assembleFullPrompt } from './src/lib/promptAssembly.ts';
import { upsertSavedBuild, loadSavedBuild } from './src/lib/savedBuilds.ts';
import { enforceVariantLocks } from './src/lib/variantLocks.ts';
import { createVariant, updateVariantFromBuild, variantToBuild } from './src/lib/variants.ts';
import { assembleWorldPrompt } from './src/lib/worldPrompt.ts';
import { normalizeBuildModules } from './src/lib/moduleNormalization.ts';
import { createNewBuild } from './src/types/galazar.ts';

const defaults = createNewBuild();
assert.equal(defaults.modules.world.worldDNA.world, null);
assert.equal(defaults.modules.world.worldDNA.customWorld, '');
assert.equal(assembleWorldPrompt(defaults.modules.world.worldDNA), '');

const phrases = new Map([
  ['Natural Landscape', 'natural landscape setting'],
  ['Forest / Woodland', 'forest environment'],
  ['Coastal / Ocean', 'coastal ocean environment'],
  ['Mountain / Alpine', 'mountain alpine environment'],
  ['Desert / Arid', 'desert environment'],
  ['Rural / Countryside', 'rural countryside setting'],
  ['Garden / Botanical', 'botanical garden setting'],
  ['Urban Exterior', 'urban exterior setting'],
  ['Street / Alley', 'street or alley setting'],
  ['Interior', 'interior setting'],
  ['Domestic Interior', 'domestic interior'],
  ['Studio', 'studio setting'],
  ['Architectural Space', 'architectural environment'],
  ['Industrial', 'industrial environment'],
  ['Historical Setting', 'historical setting'],
  ['Fantasy World', 'fantasy environment'],
  ['Surreal Environment', 'surreal environment'],
  ['Abstract Space', 'abstract spatial environment'],
  ['Minimal / Undefined Space', 'minimal undefined setting'],
]);
for (const [world, phrase] of phrases) {
  assert.equal(assembleWorldPrompt({ world, customWorld: '' }), phrase);
}
assert.equal(assembleWorldPrompt({ world: 'Custom', customWorld: '  orbital greenhouse habitat  ' }), 'orbital greenhouse habitat');

const unorderedModules = { ...defaults.modules };
delete unorderedModules.intent;
delete unorderedModules.world;
unorderedModules.atmosphere.atmosphereDNA.atmosphere = 'Serene';
unorderedModules.world = structuredClone(defaults.modules.world);
unorderedModules.world.worldDNA.world = 'Forest / Woodland';
unorderedModules.intent = structuredClone(defaults.modules.intent);
unorderedModules.intent.intentDNA.intent = 'Cinematic';
assert.equal(assembleFullPrompt(unorderedModules), 'cinematic image. forest environment. serene atmosphere');

const legacyRecognized = structuredClone(defaults.modules);
delete legacyRecognized.world.worldDNA;
legacyRecognized.world.value = 'Natural Landscape';
legacyRecognized.world.customText = 'near an old stone boundary';
const recognized = normalizeBuildModules(legacyRecognized).world;
assert.equal(recognized.worldDNA.world, 'Natural Landscape');
assert.equal(recognized.worldDNA.customWorld, 'near an old stone boundary');
assert.equal(recognized.value, null);
assert.equal(recognized.customText, '');
assert.equal(assembleWorldPrompt(recognized.worldDNA), 'natural landscape setting, near an old stone boundary');

const legacyAlias = structuredClone(defaults.modules);
delete legacyAlias.world.worldDNA;
legacyAlias.world.value = 'Fantasy Realm';
assert.equal(normalizeBuildModules(legacyAlias).world.worldDNA.world, 'Fantasy World');

const legacyUnknown = structuredClone(defaults.modules);
delete legacyUnknown.world.worldDNA;
legacyUnknown.world.value = 'Cyberpunk City';
legacyUnknown.world.customText = 'beneath elevated rail lines';
const unknown = normalizeBuildModules(legacyUnknown).world;
assert.equal(unknown.worldDNA.world, 'Custom');
assert.equal(unknown.worldDNA.customWorld, 'Cyberpunk City, beneath elevated rail lines');

const source = createNewBuild('World Source');
source.modules.intent.intentDNA.intent = 'Editorial';
source.modules.world.worldDNA.world = 'Urban Exterior';
source.modules.world.status = 'active';
source.modules.subject.customText = 'unchanged subject';
source.prompt = assembleFullPrompt(source.modules);
const changed = structuredClone(source);
changed.modules.world.worldDNA.world = 'Industrial';
changed.prompt = assembleFullPrompt(changed.modules);
const before = { modules: source.modules, prompt: source.prompt, timestamp: 1 };
const after = { modules: changed.modules, prompt: changed.prompt, timestamp: 2 };
const history = appendHistoryTransition([before], 0, before, after);
assert.equal(history.history[history.historyIndex - 1].modules.world.worldDNA.world, 'Urban Exterior');
assert.equal(history.history[history.historyIndex].modules.world.worldDNA.world, 'Industrial');

const cleared = createNewBuild();
assert.equal(cleared.modules.world.worldDNA.world, null);
assert.equal(cleared.modules.world.worldDNA.customWorld, '');
assert.equal(cleared.modules.world.status, 'empty');

const locked = structuredClone(source);
locked.modules.world.status = 'locked';
const attempted = structuredClone(locked.modules);
attempted.world.worldDNA.world = 'Studio';
const protectedModules = enforceVariantLocks(locked.modules, attempted, true);
assert.equal(protectedModules.world.worldDNA.world, 'Urban Exterior');
assert.strictEqual(protectedModules.world, locked.modules.world);

const saved = upsertSavedBuild([], source);
const restored = loadSavedBuild(saved[0]);
assert.equal(restored.modules.world.worldDNA.world, 'Urban Exterior');

const firstVariant = createVariant(source, 'World One', 'world-v1', '2026-08-12T12:00:00.000Z');
const secondVariant = createVariant(source, 'World Two', 'world-v2', '2026-08-12T12:01:00.000Z');
const firstActive = variantToBuild(firstVariant);
firstActive.modules.world.worldDNA.world = 'Coastal / Ocean';
const variants = updateVariantFromBuild([firstVariant, secondVariant], firstVariant.id, firstActive);
assert.equal(variants[0].modules.world.worldDNA.world, 'Coastal / Ocean');
assert.equal(variants[1].modules.world.worldDNA.world, 'Urban Exterior');
assert.equal(source.modules.world.worldDNA.world, 'Urban Exterior');

const entry = createDNAEntry(source.modules.world, 'Urban World', 'dna-world', '2026-08-12T12:02:00.000Z');
const libraryTarget = createNewBuild();
libraryTarget.modules.subject.customText = 'unrelated subject';
const applied = applyDNAEntryToBuild(libraryTarget, entry, false, assembleFullPrompt);
assert.equal(applied.build.modules.world.worldDNA.world, 'Urban Exterior');
assert.equal(applied.build.modules.subject.customText, 'unrelated subject');
assert.notStrictEqual(applied.build.modules.world, entry.moduleState);

const lockedTarget = structuredClone(libraryTarget);
lockedTarget.modules.world.status = 'locked';
const blocked = applyDNAEntryToBuild(lockedTarget, entry, true, assembleFullPrompt);
assert.equal(blocked.applied, false);
assert.strictEqual(blocked.build, lockedTarget);

console.log('World DNA regression test passed.');
