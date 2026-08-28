import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MODULE_NAVIGATION_TARGETS } from './src/lib/moduleNavigation.ts';
import { assembleFullPrompt } from './src/lib/promptAssembly.ts';
import { createNewBuild, MODULE_ORDER } from './src/types/galazar.ts';

const expectedOrder = [
  'intent',
  'world',
  'atmosphere',
  'anchor',
  'subject',
  'detail',
  'camera',
  'format',
  'light',
  'color',
  'style',
  'medium',
  'finish',
  'exclusions',
];

assert.deepEqual(MODULE_ORDER, expectedOrder);

const build = createNewBuild('Ordered Build');
assert.deepEqual(Object.keys(build.modules), expectedOrder);

build.modules.intent.intentDNA.intent = 'Cinematic';
build.modules.world.worldDNA.world = 'Interior';
build.modules.atmosphere.atmosphereDNA.atmosphere = 'Quiet';
build.modules.anchor.anchorDNA.anchor = 'Doorway';
build.modules.subject.customText = 'subject segment';
build.modules.detail.customText = 'detail segment';
build.modules.camera.customText = 'camera segment';
build.modules.format.formatDNA.format = 'Square — 1:1';
build.modules.light.customText = 'light segment';
build.modules.color.customText = 'color segment';
build.modules.style.customText = 'style segment';
build.modules.medium.customText = 'medium segment';
build.modules.finish.customText = 'finish segment';
build.modules.exclusions.exclusionDNA.selected = ['No unwanted text'];

const expectedPrompt = [
  'cinematic image',
  'interior setting',
  'quiet atmosphere',
  'doorway as the primary visual anchor',
  'subject segment',
  'detail segment',
  'camera segment',
  'square composition, 1:1 aspect ratio',
  'light segment',
  'color segment',
  'style segment',
  'medium segment',
  'finish segment',
  'avoid: unwanted text',
].join('. ');

const orderedPrompt = assembleFullPrompt(build.modules);
assert.equal(orderedPrompt, expectedPrompt);

const scrambledIds = [...expectedOrder].reverse();
const scrambledModules = Object.fromEntries(scrambledIds.map((id) => [id, build.modules[id]]));
assert.notDeepEqual(Object.keys(scrambledModules), expectedOrder);
assert.equal(assembleFullPrompt(scrambledModules), orderedPrompt);

const positions = Object.fromEntries([
  'cinematic image',
  'interior setting',
  'quiet atmosphere',
  'doorway as the primary visual anchor',
  'camera segment',
  'square composition, 1:1 aspect ratio',
  'light segment',
  'color segment',
  'avoid: unwanted text',
].map((segment) => [segment, orderedPrompt.indexOf(segment)]));
assert.ok(positions['cinematic image'] < positions['interior setting']);
assert.ok(positions['interior setting'] < positions['quiet atmosphere']);
assert.ok(positions['quiet atmosphere'] < positions['doorway as the primary visual anchor']);
assert.ok(positions['camera segment'] < positions['square composition, 1:1 aspect ratio']);
assert.ok(positions['square composition, 1:1 aspect ratio'] < positions['light segment']);
assert.ok(positions['light segment'] < positions['color segment']);
assert.ok(positions['avoid: unwanted text'] > positions['color segment']);

assert.equal(MODULE_NAVIGATION_TARGETS.length, 14);
assert.deepEqual(MODULE_NAVIGATION_TARGETS.map(({ id }) => id), expectedOrder);
assert.equal(MODULE_NAVIGATION_TARGETS.find(({ id }) => id === 'camera').label, 'Camera');
assert.equal(MODULE_NAVIGATION_TARGETS.find(({ id }) => id === 'camera').fullLabel, 'Camera & Composition');

const architectureSource = await readFile(new URL('./src/pages/ArchitecturePage.tsx', import.meta.url), 'utf8');
assert.match(architectureSource, /MODULE_ORDER\.map/);
assert.doesNotMatch(architectureSource, /const\s+MODULE_ORDER/);

console.log('Deterministic module order regression test passed.');
