import assert from 'node:assert/strict';
import { assembleAtmospherePrompt } from './src/lib/atmospherePrompt.ts';
import { createDNAEntry, applyDNAEntryToBuild } from './src/lib/dnaLibrary.ts';
import { appendHistoryTransition } from './src/lib/historyTransitions.ts';
import { assembleFullPrompt } from './src/lib/promptAssembly.ts';
import { upsertSavedBuild, loadSavedBuild } from './src/lib/savedBuilds.ts';
import { enforceVariantLocks } from './src/lib/variantLocks.ts';
import { createVariant, updateVariantFromBuild, variantToBuild } from './src/lib/variants.ts';
import { normalizeBuildModules } from './src/lib/moduleNormalization.ts';
import { createNewBuild } from './src/types/galazar.ts';

const defaults = createNewBuild();
assert.equal(defaults.modules.atmosphere.atmosphereDNA.atmosphere, null);
assert.equal(defaults.modules.atmosphere.atmosphereDNA.customAtmosphere, '');
assert.equal(assembleAtmospherePrompt(defaults.modules.atmosphere.atmosphereDNA), '');

const phrases = new Map([
  ['Calm', 'calm atmosphere'],
  ['Serene', 'serene atmosphere'],
  ['Ethereal', 'ethereal atmosphere'],
  ['Dreamlike', 'dreamlike atmosphere'],
  ['Mysterious', 'mysterious atmosphere'],
  ['Moody', 'moody atmosphere'],
  ['Melancholic', 'melancholic atmosphere'],
  ['Intimate', 'intimate atmosphere'],
  ['Romantic', 'romantic atmosphere'],
  ['Tense', 'tense atmosphere'],
  ['Dramatic', 'dramatic atmosphere'],
  ['Ominous', 'ominous atmosphere'],
  ['Haunting', 'haunting atmosphere'],
  ['Hopeful', 'hopeful atmosphere'],
  ['Joyful', 'joyful atmosphere'],
  ['Quiet', 'quiet atmosphere'],
  ['Contemplative', 'contemplative atmosphere'],
  ['Majestic', 'majestic atmosphere'],
  ['Otherworldly', 'otherworldly atmosphere'],
]);
for (const [atmosphere, phrase] of phrases) {
  assert.equal(assembleAtmospherePrompt({ atmosphere, customAtmosphere: '' }), phrase);
}
assert.equal(assembleAtmospherePrompt({ atmosphere: 'Custom', customAtmosphere: '  expectant stillness  ' }), 'expectant stillness');

const unorderedModules = { ...defaults.modules };
delete unorderedModules.intent;
delete unorderedModules.world;
delete unorderedModules.atmosphere;
unorderedModules.anchor.anchorDNA.anchor = 'Doorway';
unorderedModules.atmosphere = structuredClone(defaults.modules.atmosphere);
unorderedModules.atmosphere.atmosphereDNA.atmosphere = 'Quiet';
unorderedModules.world = structuredClone(defaults.modules.world);
unorderedModules.world.worldDNA.world = 'Interior';
unorderedModules.intent = structuredClone(defaults.modules.intent);
unorderedModules.intent.intentDNA.intent = 'Fine Art';
assert.equal(assembleFullPrompt(unorderedModules), 'fine-art image. interior setting. quiet atmosphere. doorway as the primary visual anchor');

const legacyRecognized = structuredClone(defaults.modules);
delete legacyRecognized.atmosphere.atmosphereDNA;
legacyRecognized.atmosphere.value = 'Mysterious';
legacyRecognized.atmosphere.customText = 'with restrained unease';
const recognized = normalizeBuildModules(legacyRecognized).atmosphere;
assert.equal(recognized.atmosphereDNA.atmosphere, 'Mysterious');
assert.equal(recognized.atmosphereDNA.customAtmosphere, 'with restrained unease');
assert.equal(recognized.value, null);
assert.equal(recognized.customText, '');
assert.equal(assembleAtmospherePrompt(recognized.atmosphereDNA), 'mysterious atmosphere, with restrained unease');

const legacyUnknown = structuredClone(defaults.modules);
delete legacyUnknown.atmosphere.atmosphereDNA;
legacyUnknown.atmosphere.value = 'Uncanny Stillness';
legacyUnknown.atmosphere.customText = 'subtle emotional distance';
const unknown = normalizeBuildModules(legacyUnknown).atmosphere;
assert.equal(unknown.atmosphereDNA.atmosphere, 'Custom');
assert.equal(unknown.atmosphereDNA.customAtmosphere, 'Uncanny Stillness, subtle emotional distance');

const source = createNewBuild('Atmosphere Source');
source.modules.atmosphere.atmosphereDNA.atmosphere = 'Contemplative';
source.modules.atmosphere.status = 'active';
source.modules.light.lightDNA.lightingMode = 'Natural';
source.modules.color.colorDNA.colorDirection = 'Monochrome';
source.modules.finish.finishDNA.finishCharacter = 'Natural';
source.prompt = assembleFullPrompt(source.modules);
const changed = structuredClone(source);
changed.modules.atmosphere.atmosphereDNA.atmosphere = 'Hopeful';
changed.prompt = assembleFullPrompt(changed.modules);
const before = { modules: source.modules, prompt: source.prompt, timestamp: 1 };
const after = { modules: changed.modules, prompt: changed.prompt, timestamp: 2 };
const history = appendHistoryTransition([before], 0, before, after);
assert.equal(history.history[history.historyIndex - 1].modules.atmosphere.atmosphereDNA.atmosphere, 'Contemplative');
assert.equal(history.history[history.historyIndex].modules.atmosphere.atmosphereDNA.atmosphere, 'Hopeful');

const cleared = createNewBuild();
assert.equal(cleared.modules.atmosphere.atmosphereDNA.atmosphere, null);
assert.equal(cleared.modules.atmosphere.atmosphereDNA.customAtmosphere, '');
assert.equal(cleared.modules.atmosphere.status, 'empty');

const locked = structuredClone(source);
locked.modules.atmosphere.status = 'locked';
const attempted = structuredClone(locked.modules);
attempted.atmosphere.atmosphereDNA.atmosphere = 'Dramatic';
const protectedModules = enforceVariantLocks(locked.modules, attempted, true);
assert.equal(protectedModules.atmosphere.atmosphereDNA.atmosphere, 'Contemplative');
assert.strictEqual(protectedModules.atmosphere, locked.modules.atmosphere);

const saved = upsertSavedBuild([], source);
const restored = loadSavedBuild(saved[0]);
assert.equal(restored.modules.atmosphere.atmosphereDNA.atmosphere, 'Contemplative');

const firstVariant = createVariant(source, 'Atmosphere One', 'atmosphere-v1', '2026-08-12T12:00:00.000Z');
const secondVariant = createVariant(source, 'Atmosphere Two', 'atmosphere-v2', '2026-08-12T12:01:00.000Z');
const firstActive = variantToBuild(firstVariant);
firstActive.modules.atmosphere.atmosphereDNA.atmosphere = 'Haunting';
const variants = updateVariantFromBuild([firstVariant, secondVariant], firstVariant.id, firstActive);
assert.equal(variants[0].modules.atmosphere.atmosphereDNA.atmosphere, 'Haunting');
assert.equal(variants[1].modules.atmosphere.atmosphereDNA.atmosphere, 'Contemplative');
assert.equal(source.modules.atmosphere.atmosphereDNA.atmosphere, 'Contemplative');

const entry = createDNAEntry(source.modules.atmosphere, 'Contemplative Atmosphere', 'dna-atmosphere', '2026-08-12T12:02:00.000Z');
const libraryTarget = createNewBuild();
libraryTarget.modules.light.lightDNA.lightingMode = 'Artificial';
libraryTarget.modules.color.colorDNA.colorDirection = 'Vibrant';
libraryTarget.modules.finish.finishDNA.finishCharacter = 'Cinematic';
const unrelatedBefore = {
  light: structuredClone(libraryTarget.modules.light),
  color: structuredClone(libraryTarget.modules.color),
  finish: structuredClone(libraryTarget.modules.finish),
};
const applied = applyDNAEntryToBuild(libraryTarget, entry, false, assembleFullPrompt);
assert.equal(applied.build.modules.atmosphere.atmosphereDNA.atmosphere, 'Contemplative');
assert.deepEqual(applied.build.modules.light, unrelatedBefore.light);
assert.deepEqual(applied.build.modules.color, unrelatedBefore.color);
assert.deepEqual(applied.build.modules.finish, unrelatedBefore.finish);
assert.notStrictEqual(applied.build.modules.atmosphere, entry.moduleState);

const lockedTarget = structuredClone(libraryTarget);
lockedTarget.modules.atmosphere.status = 'locked';
const blocked = applyDNAEntryToBuild(lockedTarget, entry, true, assembleFullPrompt);
assert.equal(blocked.applied, false);
assert.strictEqual(blocked.build, lockedTarget);

console.log('Atmosphere DNA regression test passed.');
