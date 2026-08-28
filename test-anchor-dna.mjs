import assert from 'node:assert/strict';
import { assembleAnchorPrompt } from './src/lib/anchorPrompt.ts';
import { createDNAEntry, applyDNAEntryToBuild } from './src/lib/dnaLibrary.ts';
import { appendHistoryTransition } from './src/lib/historyTransitions.ts';
import { assembleFullPrompt } from './src/lib/promptAssembly.ts';
import { upsertSavedBuild, loadSavedBuild } from './src/lib/savedBuilds.ts';
import { enforceVariantLocks } from './src/lib/variantLocks.ts';
import { createVariant, updateVariantFromBuild, variantToBuild } from './src/lib/variants.ts';
import { normalizeBuildModules } from './src/lib/moduleNormalization.ts';
import { createNewBuild } from './src/types/galazar.ts';

const defaults = createNewBuild();
assert.deepEqual(defaults.modules.anchor.anchorDNA, { anchor: null, customAnchor: '' });
assert.equal(assembleAnchorPrompt(defaults.modules.anchor.anchorDNA), '');

const phrases = new Map([
  ['Eyes', 'eyes as the primary visual anchor'],
  ['Face', 'face as the primary visual anchor'],
  ['Hands', 'hands as the primary visual anchor'],
  ['Gesture', 'gesture as the primary visual anchor'],
  ['Single Flower', 'a single flower as the primary visual anchor'],
  ['Animal Eye', "the animal's eye as the primary visual anchor"],
  ['Silhouette', 'silhouette as the primary visual anchor'],
  ['Distant Horizon', 'the distant horizon as the primary visual anchor'],
  ['Doorway', 'doorway as the primary visual anchor'],
  ['Reflection', 'reflection as the primary visual anchor'],
  ['Light Source', 'the light source as the primary visual anchor'],
  ['Single Object', 'a single object as the primary visual anchor'],
  ['Architectural Feature', 'an architectural feature as the primary visual anchor'],
  ['Foreground Detail', 'a foreground detail as the primary visual anchor'],
]);
for (const [anchor, phrase] of phrases) assert.equal(assembleAnchorPrompt({ anchor, customAnchor: '' }), phrase);
assert.equal(assembleAnchorPrompt({ anchor: 'Custom', customAnchor: '  red thread on the floor  ' }), 'red thread on the floor');

const unordered = { ...defaults.modules };
delete unordered.anchor;
unordered.subject.customText = 'a watchmaker';
unordered.anchor = structuredClone(defaults.modules.anchor);
unordered.anchor.anchorDNA.anchor = 'Hands';
unordered.atmosphere.atmosphereDNA.atmosphere = 'Quiet';
assert.equal(assembleFullPrompt(unordered), 'quiet atmosphere. hands as the primary visual anchor. a watchmaker');

const recognizedLegacy = structuredClone(defaults.modules);
delete recognizedLegacy.anchor.anchorDNA;
recognizedLegacy.anchor.value = 'Distant Horizon';
recognizedLegacy.anchor.customText = 'barely visible beyond the valley';
const recognized = normalizeBuildModules(recognizedLegacy).anchor;
assert.deepEqual(recognized.anchorDNA, { anchor: 'Distant Horizon', customAnchor: 'barely visible beyond the valley' });
assert.equal(recognized.value, null);
assert.equal(recognized.customText, '');

const unknownLegacy = structuredClone(defaults.modules);
delete unknownLegacy.anchor.anchorDNA;
unknownLegacy.anchor.value = 'Central Monument';
unknownLegacy.anchor.customText = 'weathered stone marker';
const unknown = normalizeBuildModules(unknownLegacy).anchor;
assert.deepEqual(unknown.anchorDNA, { anchor: 'Custom', customAnchor: 'Central Monument, weathered stone marker' });

const source = createNewBuild('Anchor Source');
source.modules.anchor.anchorDNA.anchor = 'Eyes';
source.modules.anchor.status = 'active';
source.modules.subject.subjectDNA.subjectType = 'Human';
source.modules.camera.cameraDNA.focusTarget = 'Hands';
source.modules.light.lightDNA.focalLightPriority = 'Face';
source.prompt = assembleFullPrompt(source.modules);
const changed = structuredClone(source);
changed.modules.anchor.anchorDNA.anchor = 'Gesture';
changed.prompt = assembleFullPrompt(changed.modules);
const before = { modules: source.modules, prompt: source.prompt, timestamp: 1 };
const after = { modules: changed.modules, prompt: changed.prompt, timestamp: 2 };
const history = appendHistoryTransition([before], 0, before, after);
assert.equal(history.history[history.historyIndex - 1].modules.anchor.anchorDNA.anchor, 'Eyes');
assert.equal(history.history[history.historyIndex].modules.anchor.anchorDNA.anchor, 'Gesture');

const cleared = createNewBuild();
assert.deepEqual(cleared.modules.anchor.anchorDNA, { anchor: null, customAnchor: '' });
assert.equal(cleared.modules.anchor.status, 'empty');

const locked = structuredClone(source);
locked.modules.anchor.status = 'locked';
const attempted = structuredClone(locked.modules);
attempted.anchor.anchorDNA.anchor = 'Face';
const protectedModules = enforceVariantLocks(locked.modules, attempted, true);
assert.equal(protectedModules.anchor.anchorDNA.anchor, 'Eyes');
assert.strictEqual(protectedModules.anchor, locked.modules.anchor);

const saved = upsertSavedBuild([], source);
assert.equal(loadSavedBuild(saved[0]).modules.anchor.anchorDNA.anchor, 'Eyes');

const firstVariant = createVariant(source, 'Anchor One', 'anchor-v1', '2026-08-12T12:00:00.000Z');
const secondVariant = createVariant(source, 'Anchor Two', 'anchor-v2', '2026-08-12T12:01:00.000Z');
const firstActive = variantToBuild(firstVariant);
firstActive.modules.anchor.anchorDNA.anchor = 'Reflection';
const variants = updateVariantFromBuild([firstVariant, secondVariant], firstVariant.id, firstActive);
assert.equal(variants[0].modules.anchor.anchorDNA.anchor, 'Reflection');
assert.equal(variants[1].modules.anchor.anchorDNA.anchor, 'Eyes');
assert.equal(source.modules.anchor.anchorDNA.anchor, 'Eyes');

const entry = createDNAEntry(source.modules.anchor, 'Eyes Anchor', 'dna-anchor', '2026-08-12T12:02:00.000Z');
const target = createNewBuild();
target.modules.subject.subjectDNA.subjectType = 'Animal';
target.modules.camera.cameraDNA.focusTarget = 'Custom';
target.modules.light.lightDNA.focalLightPriority = 'Hands';
target.modules.atmosphere.atmosphereDNA.atmosphere = 'Serene';
const boundaries = {
  subject: structuredClone(target.modules.subject),
  camera: structuredClone(target.modules.camera),
  light: structuredClone(target.modules.light),
  atmosphere: structuredClone(target.modules.atmosphere),
};
const applied = applyDNAEntryToBuild(target, entry, false, assembleFullPrompt);
assert.equal(applied.build.modules.anchor.anchorDNA.anchor, 'Eyes');
for (const [id, state] of Object.entries(boundaries)) assert.deepEqual(applied.build.modules[id], state);
assert.notStrictEqual(applied.build.modules.anchor, entry.moduleState);

const lockedTarget = structuredClone(target);
lockedTarget.modules.anchor.status = 'locked';
const blocked = applyDNAEntryToBuild(lockedTarget, entry, true, assembleFullPrompt);
assert.equal(blocked.applied, false);
assert.strictEqual(blocked.build, lockedTarget);

console.log('Anchor DNA regression test passed.');
