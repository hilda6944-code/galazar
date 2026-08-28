import assert from 'node:assert/strict';
import { createDNAEntry, applyDNAEntryToBuild } from './src/lib/dnaLibrary.ts';
import { appendHistoryTransition } from './src/lib/historyTransitions.ts';
import { assembleIntentPrompt } from './src/lib/intentPrompt.ts';
import { assembleFullPrompt } from './src/lib/promptAssembly.ts';
import { upsertSavedBuild, loadSavedBuild } from './src/lib/savedBuilds.ts';
import { enforceVariantLocks } from './src/lib/variantLocks.ts';
import { createVariant, updateVariantFromBuild, variantToBuild } from './src/lib/variants.ts';
import { normalizeBuildModules } from './src/lib/moduleNormalization.ts';
import { createNewBuild } from './src/types/galazar.ts';

const defaults = createNewBuild();
assert.equal(defaults.modules.intent.intentDNA.intent, null);
assert.equal(defaults.modules.intent.intentDNA.customIntent, '');
assert.equal(assembleIntentPrompt(defaults.modules.intent.intentDNA), '');

const phrases = new Map([
  ['Photorealistic', 'photorealistic image'],
  ['Cinematic', 'cinematic image'],
  ['Fine Art', 'fine-art image'],
  ['Editorial', 'editorial image'],
  ['Concept Art', 'concept-art image'],
  ['Illustration', 'illustration'],
  ['Portrait Study', 'portrait study'],
  ['Environmental Portrait', 'environmental portrait'],
  ['Documentary', 'documentary-style image'],
  ['Fashion', 'fashion image'],
  ['Product / Commercial', 'commercial product image'],
  ['Storytelling', 'narrative storytelling image'],
  ['Surreal', 'surreal image'],
  ['Abstract', 'abstract image'],
]);

for (const [intent, phrase] of phrases) {
  assert.equal(assembleIntentPrompt({ intent, customIntent: '' }), phrase);
}
assert.equal(assembleIntentPrompt({ intent: 'Custom', customIntent: '  commemorative visual essay  ' }), 'commemorative visual essay');

const unorderedModules = { ...defaults.modules };
delete unorderedModules.intent;
unorderedModules.intent = structuredClone(defaults.modules.intent);
unorderedModules.intent.intentDNA.intent = 'Cinematic';
unorderedModules.subject.customText = 'a lighthouse keeper';
assert.equal(assembleFullPrompt(unorderedModules), 'cinematic image. a lighthouse keeper');

const legacyRecognized = structuredClone(defaults.modules);
delete legacyRecognized.intent.intentDNA;
legacyRecognized.intent.value = 'Photorealistic';
legacyRecognized.intent.customText = 'for a conservation campaign';
const recognized = normalizeBuildModules(legacyRecognized).intent;
assert.equal(recognized.intentDNA.intent, 'Photorealistic');
assert.equal(recognized.intentDNA.customIntent, 'for a conservation campaign');
assert.equal(recognized.value, null);
assert.equal(recognized.customText, '');
assert.equal(assembleIntentPrompt(recognized.intentDNA), 'photorealistic image, for a conservation campaign');

const legacyUnknown = structuredClone(defaults.modules);
delete legacyUnknown.intent.intentDNA;
legacyUnknown.intent.value = '3D Render';
legacyUnknown.intent.customText = 'museum visualization';
const unknown = normalizeBuildModules(legacyUnknown).intent;
assert.equal(unknown.intentDNA.intent, 'Custom');
assert.equal(unknown.intentDNA.customIntent, '3D Render, museum visualization');

const source = createNewBuild('Intent Source');
source.modules.intent.intentDNA.intent = 'Portrait Study';
source.modules.intent.status = 'active';
source.modules.subject.customText = 'unchanged subject';
source.prompt = assembleFullPrompt(source.modules);
const changed = structuredClone(source);
changed.modules.intent.intentDNA.intent = 'Documentary';
changed.prompt = assembleFullPrompt(changed.modules);
const before = { modules: source.modules, prompt: source.prompt, timestamp: 1 };
const after = { modules: changed.modules, prompt: changed.prompt, timestamp: 2 };
const history = appendHistoryTransition([before], 0, before, after);
assert.equal(history.history[history.historyIndex - 1].modules.intent.intentDNA.intent, 'Portrait Study');
assert.equal(history.history[history.historyIndex].modules.intent.intentDNA.intent, 'Documentary');

const cleared = createNewBuild();
assert.equal(cleared.modules.intent.intentDNA.intent, null);
assert.equal(cleared.modules.intent.intentDNA.customIntent, '');
assert.equal(cleared.modules.intent.status, 'empty');

const locked = structuredClone(source);
locked.modules.intent.status = 'locked';
const attempted = structuredClone(locked.modules);
attempted.intent.intentDNA.intent = 'Fashion';
const protectedModules = enforceVariantLocks(locked.modules, attempted, true);
assert.equal(protectedModules.intent.intentDNA.intent, 'Portrait Study');
assert.strictEqual(protectedModules.intent, locked.modules.intent);

const saved = upsertSavedBuild([], source);
const restored = loadSavedBuild(saved[0]);
assert.equal(restored.modules.intent.intentDNA.intent, 'Portrait Study');

const firstVariant = createVariant(source, 'Intent One', 'intent-v1', '2026-08-12T12:00:00.000Z');
const secondVariant = createVariant(source, 'Intent Two', 'intent-v2', '2026-08-12T12:01:00.000Z');
const firstActive = variantToBuild(firstVariant);
firstActive.modules.intent.intentDNA.intent = 'Surreal';
const variants = updateVariantFromBuild([firstVariant, secondVariant], firstVariant.id, firstActive);
assert.equal(variants[0].modules.intent.intentDNA.intent, 'Surreal');
assert.equal(variants[1].modules.intent.intentDNA.intent, 'Portrait Study');
assert.equal(source.modules.intent.intentDNA.intent, 'Portrait Study');

const entry = createDNAEntry(source.modules.intent, 'Portrait Intent', 'dna-intent', '2026-08-12T12:02:00.000Z');
const libraryTarget = createNewBuild();
libraryTarget.modules.subject.customText = 'unrelated subject';
const applied = applyDNAEntryToBuild(libraryTarget, entry, false, assembleFullPrompt);
assert.equal(applied.build.modules.intent.intentDNA.intent, 'Portrait Study');
assert.equal(applied.build.modules.subject.customText, 'unrelated subject');
assert.notStrictEqual(applied.build.modules.intent, entry.moduleState);

const lockedTarget = structuredClone(libraryTarget);
lockedTarget.modules.intent.status = 'locked';
const blocked = applyDNAEntryToBuild(lockedTarget, entry, true, assembleFullPrompt);
assert.equal(blocked.applied, false);
assert.strictEqual(blocked.build, lockedTarget);

console.log('Intent DNA regression test passed.');
