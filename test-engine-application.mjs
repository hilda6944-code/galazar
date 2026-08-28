import assert from 'node:assert/strict';
import React, { StrictMode } from 'react';
import TestRenderer, { act } from 'react-test-renderer';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.React = React;

const { EngineApplyDialog, EngineApplyForm } = await import('./src/components/EngineApplyDialog.tsx');
const { Button } = await import('./src/components/ui/button.tsx');
const { Checkbox } = await import('./src/components/ui/checkbox.tsx');
const { GlobalControls } = await import('./src/components/GlobalControls.tsx');
const { PromptBuilder } = await import('./src/sections/PromptBuilder.tsx');
const { applyEngineToBuild, defaultEngineSelection, previewEngineApplication } = await import('./src/lib/engines.ts');
const { createEngineFromBuildSelection } = await import('./src/lib/engineCreation.ts');
const { updateVariantFromBuild, createVariant } = await import('./src/lib/variants.ts');
const { createDefaultAppState } = await import('./src/types/galazar.ts');
const { describeModuleState, summarizeModuleState } = await import('./src/lib/moduleSummary.ts');

function nodeText(node) {
  if (typeof node === 'string') return node;
  if (!node?.children) return '';
  return node.children.map(nodeText).join('');
}

const base = createDefaultAppState();
const source = structuredClone(base.currentBuild);
source.modules.intent.status = 'active';
source.modules.intent.intentDNA.intent = 'Cinematic';
source.modules.world.status = 'active';
source.modules.world.worldDNA.world = 'Natural Landscape';
source.modules.atmosphere.status = 'active';
source.modules.atmosphere.atmosphereDNA.atmosphere = 'Mysterious';
const engine = createEngineFromBuildSelection({ build: source, id: 'engine', timestamp: '2026-05-01T00:00:00.000Z', name: 'Atmospheric Logic', description: '', category: '', modules: [
  { moduleId: 'intent', importance: 'core', rationale: 'Sets the objective' },
  { moduleId: 'world', importance: 'recommended', rationale: 'Sets the foundation' },
  { moduleId: 'atmosphere', importance: 'optional', rationale: 'Shapes the feeling' },
], constructionSteps: [{ id: 'step', label: 'Foundation', description: 'Read-only explanation', moduleIds: ['world'] }] });

const active = structuredClone(base.currentBuild);
active.id = 'active';
active.modules.intent.status = 'active';
active.modules.intent.intentDNA.intent = 'Editorial';
active.modules.world.status = 'locked';
active.modules.world.worldDNA.world = 'Urban Exterior';
active.modules.atmosphere = structuredClone(engine.modules[2].moduleState);
const before = structuredClone(active);
const engineBefore = structuredClone(engine);
const preview = previewEngineApplication(engine, active, true);
assert.equal(preview[0].changed, true);
assert.equal(preview[1].locked, true);
assert.equal(preview[1].selectable, false);
assert.equal(preview[2].changed, false);
assert.deepEqual(defaultEngineSelection(engine, active, true), ['intent']);
assert.deepEqual(active, before);
assert.deepEqual(engine, engineBefore);

const internalDetail = structuredClone(base.currentBuild.modules.detail);
internalDetail.elements = [{ id: 'hidden-record-id', active: false, locked: true, category: 'Object', objectType: 'glass sphere', typedName: '', flowerType: '', flowerColor: null, flowerCondition: null, flowerPlacement: null, animalType: '', animalBreed: '', animalExpression: null, animalMovement: null, birdType: '', birdFeatherDetail: null, birdFeatherCondition: null, birdFeatherColor: null, birdFeatherBehavior: null, personDescription: '', personPresentation: null, personAge: null, personRole: '', objectMaterial: 'Glass', objectCondition: null, objectPlacement: null, clothingItem: '', clothingMaterial: null, clothingBehavior: null, clothingApplyTo: '', headwearType: '', headwearMaterial: null, headwearStyle: '', accessoryType: '', accessoryMaterial: null, accessoryPlacement: null, envElement: '', envBehavior: '', storyMoment: '', storyIncludePhysical: null, storyVisibleElement: '', customDescription: '', customPlacement: '' }];
assert.ok(describeModuleState(internalDetail).join(' ').includes('glass sphere'));
assert.ok(describeModuleState(internalDetail).join(' ').includes('(inactive)'));
assert.ok(!describeModuleState(internalDetail).join(' ').includes('hidden-record-id'));
assert.ok(!summarizeModuleState(internalDetail).includes('hidden-record-id'));

const submitted = [];
let applyDialog;
await act(async () => { applyDialog = TestRenderer.create(React.createElement(EngineApplyForm, { engine, build: active, isVariant: true, onClose: () => {}, onApply: (...args) => submitted.push(args) })); });
const applyText = nodeText(applyDialog.root);
assert.ok(applyText.includes('Current'));
assert.ok(applyText.includes('Proposed'));
assert.ok(applyText.includes('Blocked by Variant Lock'));
assert.ok(applyText.includes('Already matches'));
let previewCheckboxes = applyDialog.root.findAllByType(Checkbox);
assert.equal(previewCheckboxes[0].props.checked, true);
assert.equal(previewCheckboxes[1].props.disabled, true);
assert.equal(previewCheckboxes[2].props.disabled, true);
await act(async () => previewCheckboxes[0].props.onCheckedChange(false));
let applyButton = applyDialog.root.findAllByType(Button).find((button) => nodeText(button).includes('Apply Selected'));
assert.equal(applyButton.props.disabled, true);
await act(async () => previewCheckboxes[0].props.onCheckedChange(true));
applyButton = applyDialog.root.findAllByType(Button).find((button) => nodeText(button).includes('Apply Selected'));
await act(async () => applyButton.props.onClick());
assert.deepEqual(submitted[0][1], ['intent']);
await act(async () => applyDialog.unmount());

let cancelled = 0;
let cancelApply;
await act(async () => { cancelApply = TestRenderer.create(React.createElement(EngineApplyForm, { engine, build: active, isVariant: true, onClose: () => { cancelled += 1; }, onApply: () => { throw new Error('Cancel must not apply'); } })); });
const cancelApplyButton = cancelApply.root.findAllByType(Button).find((button) => nodeText(button) === 'Cancel');
await act(async () => cancelApplyButton.props.onClick());
assert.equal(cancelled, 1);
await act(async () => cancelApply.unmount());

assert.equal(typeof EngineApplyDialog, 'function');
assert.equal(preview[0].importance, 'core');
assert.equal(preview[0].rationale, 'Sets the objective');
assert.deepEqual(engine.constructionSteps, engineBefore.constructionSteps);
const userDeselected = defaultEngineSelection(engine, active, true).filter((id) => id !== 'intent');
assert.deepEqual(userDeselected, []);
assert.deepEqual(active, before);
assert.deepEqual(engine, engineBefore);

const result = applyEngineToBuild(active, engine, ['intent', 'world', 'atmosphere'], true);
assert.deepEqual(result.appliedModuleIds, ['intent']);
assert.deepEqual(result.blockedModuleIds, ['world']);
assert.deepEqual(result.unchangedModuleIds, ['atmosphere']);
assert.equal(result.build.id, active.id);
assert.equal(result.build.modules.intent.intentDNA.intent, 'Cinematic');
assert.deepEqual(result.build.modules.world, active.modules.world);
assert.strictEqual(result.build.modules.atmosphere === active.modules.atmosphere, false);
assert.deepEqual(result.build.modules.atmosphere, active.modules.atmosphere);
assert.equal(result.build.prompt, 'cinematic image. urban exterior setting. mysterious atmosphere');
assert.deepEqual(active, before);
assert.deepEqual(engine, engineBefore);

const origin = structuredClone(active);
const activeVariant = createVariant(active, 'Active', 'active-variant', '2026-05-01T00:00:00.000Z');
const sibling = createVariant(active, 'Sibling', 'sibling', '2026-05-01T00:00:00.000Z');
const variants = updateVariantFromBuild([activeVariant, sibling], activeVariant.id, result.build);
assert.equal(variants[0].modules.intent.intentDNA.intent, 'Cinematic');
assert.deepEqual(variants[0].modules.world, active.modules.world);
assert.deepEqual(variants[0].originBuild, origin);
assert.deepEqual(variants[1], sibling);
assert.equal(variants.length, 2);

const protectedCollections = structuredClone({ savedBuilds: [active], projects: [{ id: 'p' }], dnaLibrary: [{ id: 'd' }], engine });
assert.deepEqual(protectedCollections.savedBuilds, [before]);
assert.deepEqual(protectedCollections.engine, engineBefore);

const history = [
  { modules: active.modules, prompt: active.prompt, timestamp: 1 },
  { modules: result.build.modules, prompt: result.build.prompt, timestamp: 2 },
];
const updates = [];
let builder;
await act(async () => { builder = TestRenderer.create(React.createElement(StrictMode, null, React.createElement(PromptBuilder, { initialBuild: result.build, initialHistory: history, onUpdateBuild: (build) => updates.push(build), onSaveBuild: () => {}, onCreateVariant: () => {}, onCreateEngine: () => {}, isVariant: true, onSaveDNAEntry: () => {}, hasUnsavedChanges: true, lastSavedAt: null }))); });
const controls = () => builder.root.findByType(GlobalControls);
assert.equal(controls().props.canUndo, true);
await act(async () => controls().props.onUndo());
assert.deepEqual(updates.at(-1).modules, active.modules);
await act(async () => controls().props.onRedo());
assert.deepEqual(updates.at(-1).modules, result.build.modules);
await act(async () => builder.unmount());

console.log('Engine application integration regression test passed.');
