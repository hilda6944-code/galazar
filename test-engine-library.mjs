import assert from 'node:assert/strict';
import React, { StrictMode } from 'react';
import TestRenderer, { act } from 'react-test-renderer';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.React = React;

const { Sidebar } = await import('./src/components/Sidebar.tsx');
const { EngineDeleteForm, EngineDetail, EngineLibraryPage, EngineRenameForm } = await import('./src/pages/EngineLibraryPage.tsx');
const { Input } = await import('./src/components/ui/input.tsx');
const { Button } = await import('./src/components/ui/button.tsx');
const { createDefaultAppState } = await import('./src/types/galazar.ts');
const { createEngineFromBuildSelection } = await import('./src/lib/engineCreation.ts');
const { deleteEngine, duplicateEngine, renameEngine, searchEngines } = await import('./src/lib/engines.ts');
const { deserializeState } = await import('./src/hooks/useGalazarStorage.ts');

function nodeText(node) {
  if (typeof node === 'string') return node;
  if (!node || !node.children) return '';
  return node.children.map(nodeText).join('');
}

const defaults = createDefaultAppState();
const build = structuredClone(defaults.currentBuild);
build.modules.intent.status = 'active';
build.modules.intent.intentDNA.intent = 'Cinematic';
build.modules.world.status = 'active';
build.modules.world.worldDNA.world = 'Natural Landscape';
const engine = createEngineFromBuildSelection({
  build,
  id: 'engine-one',
  timestamp: '2026-04-01T00:00:00.000Z',
  name: 'Luminous Foundation',
  description: 'Coordinates internal illumination',
  category: 'Atmospheric Systems',
  modules: [
    { moduleId: 'intent', importance: 'core', rationale: 'Establishes cinematic purpose' },
    { moduleId: 'world', importance: 'recommended', rationale: 'Builds the environmental base' },
  ],
  constructionSteps: [
    { id: 'step-one', label: 'Dark Foundation', description: 'Establish the field', moduleIds: ['world'] },
    { id: 'step-two', label: 'Internal Glow', description: 'Shape illumination', moduleIds: ['intent'] },
  ],
});
const second = duplicateEngine(engine, 'engine-two', '2026-04-02T00:00:00.000Z');
second.name = 'Quiet Structure';
const engines = [engine, second];

const changedViews = [];
let sidebar;
await act(async () => { sidebar = TestRenderer.create(React.createElement(Sidebar, { activeView: 'prompt-builder', onChangeView: (view) => changedViews.push(view) })); });
const engineNav = sidebar.root.findAllByType('button').find((button) => nodeText(button).includes('Engine Library'));
assert.ok(engineNav);
await act(async () => engineNav.props.onClick());
assert.deepEqual(changedViews, ['engine-library']);
await act(async () => sidebar.unmount());

const callbacks = { renamed: [], duplicated: [], deleted: [] };
let page;
await act(async () => { page = TestRenderer.create(React.createElement(StrictMode, null, React.createElement(EngineLibraryPage, {
  engines,
  activeBuild: build,
  isVariant: false,
  onRenameEngine: (...args) => callbacks.renamed.push(args),
  onDuplicateEngine: (item) => callbacks.duplicated.push(item),
  onDeleteEngine: (id) => callbacks.deleted.push(id),
  onApplyEngine: () => {},
}))); });
let renderedText = nodeText(page.root);
assert.ok(renderedText.includes('Luminous Foundation'));
assert.ok(renderedText.includes('Quiet Structure'));
assert.ok(renderedText.includes('2 affected modules'));
assert.ok(renderedText.includes('Intent, World'));

const search = page.root.findByProps({ 'aria-label': 'Search Engines' });
await act(async () => search.props.onChange({ target: { value: 'luminous' } }));
renderedText = nodeText(page.root);
assert.ok(renderedText.includes('Luminous Foundation'));
assert.ok(!renderedText.includes('Quiet Structure'));
await act(async () => search.props.onChange({ target: { value: 'no-match-value' } }));
assert.ok(nodeText(page.root).includes('No Engines match your search'));
await act(async () => search.props.onChange({ target: { value: '' } }));

const renameButton = page.root.findByProps({ 'aria-label': 'Rename Luminous Foundation' });
await act(async () => renameButton.props.onClick());
let renameForm;
await act(async () => { renameForm = TestRenderer.create(React.createElement(EngineRenameForm, { engine, onCancel: () => {}, onRename: (name) => callbacks.renamed.push([engine.id, name]) })); });
let renameConfirm = renameForm.root.findAllByType(Button).find((button) => nodeText(button) === 'Rename');
const renameInput = renameForm.root.findByProps({ 'aria-label': 'Engine name' });
await act(async () => renameInput.props.onChange({ target: { value: '   ' } }));
renameConfirm = renameForm.root.findAllByType(Button).find((button) => nodeText(button) === 'Rename');
assert.equal(renameConfirm.props.disabled, true);
await act(async () => renameInput.props.onChange({ target: { value: 'Mounted Rename' } }));
renameConfirm = renameForm.root.findAllByType(Button).find((button) => nodeText(button) === 'Rename');
await act(async () => renameConfirm.props.onClick());
assert.deepEqual(callbacks.renamed, [['engine-one', 'Mounted Rename']]);
await act(async () => renameForm.unmount());

await act(async () => page.root.findByProps({ 'aria-label': 'Duplicate Luminous Foundation' }).props.onClick());
assert.equal(callbacks.duplicated[0], engine);
await act(async () => page.root.findByProps({ 'aria-label': 'Delete Luminous Foundation' }).props.onClick());
let deleteForm;
await act(async () => { deleteForm = TestRenderer.create(React.createElement(EngineDeleteForm, { engine, onCancel: () => {}, onDelete: () => callbacks.deleted.push(engine.id) })); });
const deleteConfirm = deleteForm.root.findAllByType(Button).find((button) => nodeText(button) === 'Delete Engine');
await act(async () => deleteConfirm.props.onClick());
assert.deepEqual(callbacks.deleted, ['engine-one']);
await act(async () => deleteForm.unmount());

assert.deepEqual(searchEngines(engines, 'illumination').map((item) => item.id), ['engine-one', 'engine-two']);
assert.deepEqual(searchEngines(engines, 'ATMOSPHERIC').map((item) => item.id), ['engine-one', 'engine-two']);
assert.deepEqual(searchEngines(engines, 'world').map((item) => item.id), ['engine-one', 'engine-two']);
assert.deepEqual(searchEngines(engines, 'environmental base').map((item) => item.id), ['engine-one', 'engine-two']);
assert.deepEqual(searchEngines(engines, 'dark foundation').map((item) => item.id), ['engine-one', 'engine-two']);
assert.strictEqual(searchEngines(engines, '  '), engines);

const beforeOpen = structuredClone({ engine, build });
const openButton = page.root.findAllByType('button').find((button) => nodeText(button).includes('Open'));
await act(async () => openButton.props.onClick());
assert.deepEqual({ engine, build }, beforeOpen);
await act(async () => page.unmount());

let detailRenderer;
await act(async () => { detailRenderer = TestRenderer.create(React.createElement(EngineDetail, { engine })); });
assert.deepEqual(engine.constructionSteps.map((step) => step.label), ['Dark Foundation', 'Internal Glow']);
assert.ok(nodeText(detailRenderer.root).includes('core'));
assert.ok(nodeText(detailRenderer.root).includes('Establishes cinematic purpose'));
await act(async () => detailRenderer.unmount());

const renamed = renameEngine(engines, engine.id, 'Renamed Engine', '2026-04-03T00:00:00.000Z');
assert.equal(renamed[0].id, engine.id);
assert.equal(renamed[0].createdAt, engine.createdAt);
assert.equal(renamed[0].updatedAt, '2026-04-03T00:00:00.000Z');
assert.strictEqual(renameEngine(engines, engine.id, '  ', 'later'), engines);
const duplicate = duplicateEngine(engine, 'engine-copy', '2026-04-04T00:00:00.000Z');
assert.equal(duplicate.name, 'Luminous Foundation Copy');
duplicate.modules[0].rationale = 'copy only';
assert.equal(engine.modules[0].rationale, 'Establishes cinematic purpose');
assert.deepEqual(deleteEngine(engines, engine.id), [second]);

const protectedState = { ...defaults, currentBuild: build, savedBuilds: [build], projects: [{ id: 'project', name: 'Project', description: '', createdAt: '', updatedAt: '', buildIds: [build.id] }], variants: [], dnaLibrary: [], engines: [duplicate, ...engines] };
const protectedSnapshot = structuredClone(protectedState);
const managedState = { ...protectedState, engines: deleteEngine(protectedState.engines, engine.id) };
assert.deepEqual(managedState.currentBuild, protectedSnapshot.currentBuild);
assert.deepEqual(managedState.savedBuilds, protectedSnapshot.savedBuilds);
assert.deepEqual(managedState.projects, protectedSnapshot.projects);
assert.deepEqual(managedState.variants, protectedSnapshot.variants);
assert.deepEqual(managedState.dnaLibrary, protectedSnapshot.dnaLibrary);
assert.equal(deserializeState(JSON.stringify(managedState)).engines.length, 2);

console.log('Engine Library workflow regression test passed.');
