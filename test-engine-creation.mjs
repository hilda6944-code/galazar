import assert from 'node:assert/strict';
import React, { StrictMode } from 'react';
import TestRenderer, { act } from 'react-test-renderer';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.React = React;

const { EngineCreationDialog, EngineCreationForm } = await import('./src/components/EngineCreationDialog.tsx');
const { Button } = await import('./src/components/ui/button.tsx');
const { Checkbox } = await import('./src/components/ui/checkbox.tsx');
const { Input } = await import('./src/components/ui/input.tsx');
const { GlobalControls } = await import('./src/components/GlobalControls.tsx');
const { PromptBuilder } = await import('./src/sections/PromptBuilder.tsx');
const { addEngineToState } = await import('./src/lib/engines.ts');
const { createEngineFromBuildSelection, getAvailableEngineModules, getPopulatedEngineModuleIds } = await import('./src/lib/engineCreation.ts');
const { createDefaultAppState, createEmptyElement } = await import('./src/types/galazar.ts');
const { createVariant } = await import('./src/lib/variants.ts');
const { deserializeState } = await import('./src/hooks/useGalazarStorage.ts');

function nodeText(node) {
  if (typeof node === 'string') return node;
  if (!node?.children) return '';
  return node.children.map(nodeText).join('');
}

const state = createDefaultAppState();
const build = structuredClone(state.currentBuild);
build.modules.intent.status = 'active';
build.modules.intent.intentDNA.intent = 'Cinematic';
build.modules.world.status = 'locked';
build.modules.world.worldDNA.world = 'Natural Landscape';
build.modules.atmosphere.status = 'active';
build.modules.atmosphere.atmosphereDNA.atmosphere = 'Mysterious';
const buildSnapshot = structuredClone(build);

assert.deepEqual(getPopulatedEngineModuleIds(build), ['intent', 'world', 'atmosphere']);

const availabilityBuild = structuredClone(build);
availabilityBuild.modules.world.skipped = true;
const inactiveElement = createEmptyElement('internal-element-id');
inactiveElement.category = 'Object';
inactiveElement.objectType = 'glass sphere';
inactiveElement.active = false;
availabilityBuild.modules.detail.elements = [inactiveElement];
assert.deepEqual(getAvailableEngineModules(availabilityBuild), [
  { moduleId: 'intent', availability: 'contributing' },
  { moduleId: 'world', availability: 'skipped' },
  { moduleId: 'atmosphere', availability: 'contributing' },
  { moduleId: 'detail', availability: 'inactive-detail' },
]);

const baseInput = {
  build,
  id: 'engine-created',
  timestamp: '2026-03-01T00:00:00.000Z',
  name: 'Abyssal Logic',
  description: 'Coordinates atmosphere without choosing a subject',
  category: 'Atmospheric Systems',
  modules: [
    { moduleId: 'intent', importance: 'core', rationale: 'Defines the image-making objective' },
    { moduleId: 'world', importance: 'recommended', rationale: 'Creates the environmental foundation' },
  ],
  constructionSteps: [
    { id: 'step-dark', label: 'Dark Foundation', description: 'Establish the world', moduleIds: ['world'] },
    { id: 'step-focus', label: 'Creative Objective', description: 'Clarify intent', moduleIds: ['intent'] },
  ],
};

assert.equal(createEngineFromBuildSelection({ ...baseInput, name: '   ' }), null);
assert.equal(createEngineFromBuildSelection({ ...baseInput, modules: baseInput.modules.slice(0, 1) }), null);

const engine = createEngineFromBuildSelection(baseInput);
assert.ok(engine);
assert.equal(engine.modules.length, 2);
assert.equal(engine.modules[0].importance, 'core');
assert.equal(engine.modules[0].rationale, 'Defines the image-making objective');
assert.equal(engine.modules[1].importance, 'recommended');
assert.equal(engine.modules[1].rationale, 'Creates the environmental foundation');
assert.deepEqual(engine.constructionSteps.map((step) => step.label), ['Dark Foundation', 'Creative Objective']);
assert.deepEqual(engine.constructionSteps[0].moduleIds, ['world']);
assert.equal(engine.modules[1].moduleState.status, 'active');
assert.equal(build.modules.world.status, 'locked');
assert.deepEqual(build, buildSnapshot);

const threeModuleEngine = createEngineFromBuildSelection({
  ...baseInput,
  id: 'engine-three',
  modules: [...baseInput.modules, { moduleId: 'atmosphere', importance: 'optional', rationale: 'Shapes the emotional field' }],
});
assert.equal(threeModuleEngine.modules.length, 3);
engine.modules[0].moduleState.intentDNA.intent = 'Editorial';
assert.equal(build.modules.intent.intentDNA.intent, 'Cinematic');

const activeVariant = createVariant(build, 'Active Variant', 'variant-active', '2026-03-01T00:00:00.000Z');
const protectedState = {
  ...state,
  currentBuild: build,
  variants: [activeVariant],
  activeVariantId: activeVariant.id,
  savedBuilds: [structuredClone(build)],
  projects: [{ id: 'project', name: 'Project', description: '', createdAt: '', updatedAt: '', buildIds: [build.id] }],
  dnaLibrary: [{ id: 'dna', name: 'DNA', category: 'Intent', content: '', createdAt: '' }],
  engines: [threeModuleEngine],
};
const unrelatedSnapshot = structuredClone(protectedState);
const duplicateNameEngine = createEngineFromBuildSelection({ ...baseInput, id: 'engine-same-name' });
const withEngine = addEngineToState(protectedState, duplicateNameEngine);
assert.equal(withEngine.engines.length, 2);
assert.equal(withEngine.engines[0].name, withEngine.engines[1].name);
assert.deepEqual(withEngine.currentBuild, unrelatedSnapshot.currentBuild);
assert.deepEqual(withEngine.variants, unrelatedSnapshot.variants);
assert.deepEqual(withEngine.savedBuilds, unrelatedSnapshot.savedBuilds);
assert.deepEqual(withEngine.projects, unrelatedSnapshot.projects);
assert.deepEqual(withEngine.dnaLibrary, unrelatedSnapshot.dnaLibrary);
assert.deepEqual(withEngine.engines[1], unrelatedSnapshot.engines[0]);
assert.equal(deserializeState(JSON.stringify(withEngine)).engines.length, 2);

const createdFromUI = [];
let dialog;
await act(async () => { dialog = TestRenderer.create(React.createElement(EngineCreationForm, { build: availabilityBuild, onClose: () => {}, onCreate: (item) => createdFromUI.push(item) })); });
assert.ok(nodeText(dialog.root).includes('Skipped in current build'));
assert.ok(nodeText(dialog.root).includes('Inactive in current build'));
assert.equal(dialog.root.findAllByType(Checkbox).length, 4);

let createButton = dialog.root.findAllByType(Button).find((button) => nodeText(button).includes('Create Engine'));
await act(async () => createButton.props.onClick());
assert.ok(nodeText(dialog.root).includes('Enter an Engine name.'));
assert.ok(nodeText(dialog.root).includes('Select at least two populated modules.'));

await act(async () => dialog.root.findByProps({ placeholder: 'Engine name' }).props.onChange({ target: { value: 'Mounted Engine' } }));
await act(async () => dialog.root.findAllByType(Checkbox)[0].props.onCheckedChange(true));
await act(async () => createButton.props.onClick());
assert.equal(createdFromUI.length, 0);

await act(async () => dialog.root.findAllByType(Checkbox)[1].props.onCheckedChange(true));
const importanceSelect = dialog.root.findByProps({ 'aria-label': 'Intent importance' });
await act(async () => importanceSelect.props.onChange({ target: { value: 'core' } }));
await act(async () => dialog.root.findByProps({ 'aria-label': 'Intent rationale' }).props.onChange({ target: { value: 'Mounted rationale' } }));

const addStep = () => dialog.root.findAllByType(Button).find((button) => nodeText(button).includes('Add Step'));
const stepButtons = (label) => dialog.root.findAllByType(Button).filter((button) => button.props['aria-label'] === label);
await act(async () => addStep().props.onClick());
await act(async () => addStep().props.onClick());
assert.equal(stepButtons('Remove step').length, 2);
await act(async () => stepButtons('Move step up')[1].props.onClick());
await act(async () => stepButtons('Remove step')[1].props.onClick());
assert.equal(stepButtons('Remove step').length, 1);

createButton = dialog.root.findAllByType(Button).find((button) => nodeText(button).includes('Create Engine'));
await act(async () => createButton.props.onClick());
assert.equal(createdFromUI.length, 1);
assert.equal(createdFromUI[0].name, 'Mounted Engine');
assert.equal(createdFromUI[0].modules[0].importance, 'core');
assert.equal(createdFromUI[0].modules[0].rationale, 'Mounted rationale');
assert.equal(createdFromUI[0].modules[1].moduleState.skipped, false);
await act(async () => dialog.unmount());

let cancelled = 0;
let cancelDialog;
await act(async () => { cancelDialog = TestRenderer.create(React.createElement(EngineCreationForm, { build, onClose: () => { cancelled += 1; }, onCreate: () => { throw new Error('Cancel must not create'); } })); });
const cancelButton = cancelDialog.root.findAllByType(Button).find((button) => nodeText(button) === 'Cancel');
await act(async () => cancelButton.props.onClick());
assert.equal(cancelled, 1);
await act(async () => cancelDialog.unmount());

const updates = [];
let renderer;
await act(async () => {
  renderer = TestRenderer.create(React.createElement(StrictMode, null, React.createElement(PromptBuilder, {
    initialBuild: build,
    onUpdateBuild: (updated) => updates.push(updated),
    onSaveBuild: () => {},
    onCreateVariant: () => {},
    onCreateEngine: () => {},
    isVariant: true,
    onSaveDNAEntry: () => {},
    hasUnsavedChanges: true,
    lastSavedAt: null,
  })));
});
const controls = renderer.root.findByType(GlobalControls);
assert.equal(typeof controls.props.onCreateEngine, 'function');
const beforeOpen = structuredClone(build);
const updatesBeforeOpen = updates.length;
await act(async () => controls.props.onCreateEngine());
assert.equal(renderer.root.findAllByType(EngineCreationDialog).length, 1);
assert.deepEqual(build, beforeOpen);
assert.equal(updates.length, updatesBeforeOpen);
await act(async () => renderer.unmount());

console.log('Engine creation workflow regression test passed.');
