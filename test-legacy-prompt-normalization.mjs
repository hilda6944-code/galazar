import assert from 'node:assert/strict';
import { deserializeState, prepareActiveBuild } from './src/hooks/useGalazarStorage.ts';
import { assembleFullPrompt } from './src/lib/promptAssembly.ts';
import { loadSavedBuild } from './src/lib/savedBuilds.ts';
import { saveActiveBuildState } from './src/lib/statePersistence.ts';
import { variantToBuild } from './src/lib/variants.ts';
import { createDefaultAppState, createNewBuild } from './src/types/galazar.ts';

function makeLegacyBuild(name, id) {
  const build = createNewBuild(name);
  build.id = id;
  delete build.modules.intent.intentDNA;
  build.modules.intent.value = 'Photorealistic';
  delete build.modules.world.worldDNA;
  build.modules.world.value = 'Fantasy Realm';
  delete build.modules.atmosphere.atmosphereDNA;
  build.modules.atmosphere.value = 'Mysterious';
  delete build.modules.anchor.anchorDNA;
  build.modules.anchor.value = 'Distant Horizon';
  build.modules.subject.customText = 'a lone traveler';
  build.modules.camera.customText = 'camera instruction';
  build.modules.format.formatDNA.format = 'Landscape — 16:9';
  build.modules.light.customText = 'light instruction';
  build.modules.color.customText = 'color instruction';
  build.prompt = 'Intent: Photorealistic. World: Fantasy Realm. Atmosphere: Mysterious. Anchor: Distant Horizon. old ordering';
  return build;
}

const stored = createDefaultAppState();
const legacyCurrent = makeLegacyBuild('Legacy Current', 'current-legacy');
const legacySaved = makeLegacyBuild('Legacy Saved', 'saved-legacy');
const legacyVariantBuild = makeLegacyBuild('Legacy Variant', 'variant-legacy');
const staleSavedPrompt = legacySaved.prompt;
const staleVariantPrompt = legacyVariantBuild.prompt;
const staleOriginPrompt = 'historical origin prompt, byte-for-byte';

stored.currentBuild = legacyCurrent;
stored.savedBuilds = [legacySaved];
stored.projects = [{
  id: 'project-1',
  name: 'Archive',
  description: '',
  createdAt: '2026-08-12T12:00:00.000Z',
  updatedAt: '2026-08-12T12:00:00.000Z',
  buildIds: [legacySaved.id],
}];
stored.variants = [{
  id: legacyVariantBuild.id,
  name: legacyVariantBuild.name,
  parentBuildId: 'origin-1',
  createdAt: '2026-08-12T12:00:00.000Z',
  modules: legacyVariantBuild.modules,
  prompt: staleVariantPrompt,
  originBuild: { ...makeLegacyBuild('Origin', 'origin-1'), prompt: staleOriginPrompt },
}];
stored.dnaLibrary = [{
  id: 'dna-1',
  name: 'Historical DNA',
  category: 'Intent',
  content: 'historical library content',
  createdAt: '2026-08-12T12:00:00.000Z',
}];

const loadedState = deserializeState(JSON.stringify(stored));

assert.equal(loadedState.currentBuild.modules.intent.intentDNA.intent, 'Photorealistic');
assert.equal(loadedState.currentBuild.modules.world.worldDNA.world, 'Fantasy World');
assert.equal(loadedState.currentBuild.modules.atmosphere.atmosphereDNA.atmosphere, 'Mysterious');
assert.equal(loadedState.currentBuild.modules.anchor.anchorDNA.anchor, 'Distant Horizon');
assert.equal(loadedState.currentBuild.prompt, assembleFullPrompt(loadedState.currentBuild.modules));
assert.equal(
  loadedState.currentBuild.prompt,
  'photorealistic image. fantasy environment. mysterious atmosphere. the distant horizon as the primary visual anchor. a lone traveler. camera instruction. landscape composition, 16:9 aspect ratio. light instruction. color instruction'
);

assert.equal(loadedState.savedBuilds[0].prompt, staleSavedPrompt);
const activeSaved = prepareActiveBuild(loadSavedBuild(loadedState.savedBuilds[0]));
assert.equal(activeSaved.prompt, assembleFullPrompt(activeSaved.modules));
assert.notEqual(activeSaved.prompt, staleSavedPrompt);
assert.equal(loadedState.savedBuilds[0].prompt, staleSavedPrompt);

const savedAfterExplicitSave = saveActiveBuildState(loadedState, activeSaved, '2026-08-12T13:00:00.000Z');
assert.equal(savedAfterExplicitSave.savedBuilds.length, 1);
assert.equal(savedAfterExplicitSave.savedBuilds[0].prompt, activeSaved.prompt);

const variantRecordBeforeOpen = structuredClone(loadedState.variants[0]);
const sibling = {
  ...structuredClone(loadedState.variants[0]),
  id: 'variant-sibling',
  name: 'Sibling',
  prompt: 'sibling historical prompt',
};
const variantsBeforeOpen = [variantRecordBeforeOpen, sibling];
const activeVariant = prepareActiveBuild(variantToBuild(variantsBeforeOpen[0]));
assert.equal(activeVariant.prompt, assembleFullPrompt(activeVariant.modules));
assert.notEqual(activeVariant.prompt, staleVariantPrompt);
assert.equal(variantsBeforeOpen[0].prompt, staleVariantPrompt);
assert.equal(variantsBeforeOpen[0].originBuild.prompt, staleOriginPrompt);
assert.equal(variantsBeforeOpen[1].prompt, 'sibling historical prompt');

assert.deepEqual(loadedState.projects, stored.projects);
assert.equal(JSON.stringify(loadedState.dnaLibrary), JSON.stringify(stored.dnaLibrary));

const current = createNewBuild('Current Build');
current.modules.intent.intentDNA.intent = 'Editorial';
current.modules.world.worldDNA.world = 'Studio';
current.prompt = assembleFullPrompt(current.modules);
const preparedCurrent = prepareActiveBuild(current);
assert.equal(preparedCurrent.prompt, current.prompt);
assert.deepEqual(preparedCurrent.modules, current.modules);

console.log('Legacy active-prompt normalization regression test passed.');
