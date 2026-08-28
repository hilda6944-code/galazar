import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.React = React;

const { createBackup, parseBackup, BACKUP_FORMAT } = await import('./src/lib/backups.ts');
const { normalizeEngineCollection, normalizeEngineRecord } = await import('./src/lib/engines.ts');
const { requiresSavedBuildLoadConfirmation } = await import('./src/lib/savedBuilds.ts');
const { saveActiveBuildState } = await import('./src/lib/statePersistence.ts');
const { requiresVariantLoadConfirmation } = await import('./src/lib/variants.ts');
const { createDefaultAppState, STORAGE_KEY } = await import('./src/types/galazar.ts');
const { Button } = await import('./src/components/ui/button.tsx');
const { LivePrompt } = await import('./src/components/LivePrompt.tsx');

class FakeStorage {
  values = new Map();
  failWrites = false;
  getItem = (key) => this.values.get(key) ?? null;
  setItem = (key, value) => {
    if (this.failWrites) throw new Error('quota exceeded');
    this.values.set(key, String(value));
  };
  removeItem = (key) => this.values.delete(key);
}

class FakeTimers {
  nextId = 1;
  timers = new Map();
  setTimeout = (callback) => { const id = this.nextId++; this.timers.set(id, callback); return id; };
  clearTimeout = (id) => this.timers.delete(id);
  runAll = () => { const callbacks = [...this.timers.values()]; this.timers.clear(); callbacks.forEach((callback) => callback()); };
}

function nodeText(node) {
  if (typeof node === 'string') return node;
  if (!node?.children) return '';
  return node.children.map(nodeText).join('');
}

const originalStorage = globalThis.localStorage;
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const storage = new FakeStorage();
const timers = new FakeTimers();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
globalThis.setTimeout = timers.setTimeout;
globalThis.clearTimeout = timers.clearTimeout;

const { useGalazarStorage } = await import('./src/hooks/useGalazarStorage.ts');

let api;
function Harness() {
  api = useGalazarStorage();
  return null;
}

async function mountStorage(initialValue) {
  storage.values.clear();
  storage.failWrites = false;
  timers.timers.clear();
  if (initialValue !== undefined) storage.values.set(STORAGE_KEY, initialValue);
  let renderer;
  await act(async () => { renderer = TestRenderer.create(React.createElement(Harness)); });
  return renderer;
}

try {
  const initialState = createDefaultAppState();
  let renderer = await mountStorage(JSON.stringify(initialState));
  const edited = structuredClone(api.state.currentBuild);
  edited.modules.intent.intentDNA.intent = 'Cinematic';
  await act(async () => api.setState((state) => ({ ...state, currentBuild: edited, hasUnsavedChanges: true })));
  await act(async () => timers.runAll());
  assert.equal(api.state.hasUnsavedChanges, true);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).hasUnsavedChanges, true);
  assert.equal(requiresSavedBuildLoadConfirmation(api.state.hasUnsavedChanges), true);
  assert.equal(requiresVariantLoadConfirmation(api.state.hasUnsavedChanges), true);

  await act(async () => {
    const success = api.saveToStorage((state) => saveActiveBuildState(state, state.currentBuild, '2026-08-12T12:00:00.000Z'));
    assert.equal(success, true);
  });
  assert.equal(api.state.hasUnsavedChanges, false);
  await act(async () => api.setState((state) => ({ ...state, currentBuild: { ...state.currentBuild, name: 'Further edit' }, hasUnsavedChanges: true })));
  assert.equal(api.state.hasUnsavedChanges, true);

  storage.failWrites = true;
  const beforeFailure = structuredClone(api.state.currentBuild);
  await act(async () => timers.runAll());
  assert.ok(api.persistenceError?.includes('could not save'));
  assert.deepEqual(api.state.currentBuild, beforeFailure);
  await act(async () => assert.equal(api.saveToStorage((state) => saveActiveBuildState(state, state.currentBuild, 'later')), false));
  assert.equal(api.state.hasUnsavedChanges, true);
  storage.failWrites = false;
  await act(async () => assert.equal(api.saveToStorage((state) => state), true));
  assert.equal(api.persistenceError, null);
  await act(async () => renderer.unmount());

  const malformed = '{not json';
  renderer = await mountStorage(malformed);
  assert.ok(api.recovery);
  assert.equal(api.recovery.rawPayload, malformed);
  assert.equal(timers.timers.size, 0);
  await act(async () => timers.runAll());
  assert.equal(storage.getItem(STORAGE_KEY), malformed);
  await act(async () => renderer.unmount());

  const malformedCollection = JSON.stringify({ ...createDefaultAppState(), savedBuilds: {} });
  renderer = await mountStorage(malformedCollection);
  assert.ok(api.recovery);
  assert.equal(storage.getItem(STORAGE_KEY), malformedCollection);
  assert.equal(timers.timers.size, 0);
  await act(async () => renderer.unmount());

  const populated = createDefaultAppState();
  populated.savedBuilds = [structuredClone(populated.currentBuild)];
  populated.projects = [{ id: 'project', name: 'Project', description: '', createdAt: '', updatedAt: '', buildIds: [populated.currentBuild.id] }];
  populated.variants = [{ id: 'variant', name: 'Variant', parentBuildId: populated.currentBuild.id, createdAt: '', modules: structuredClone(populated.currentBuild.modules), prompt: populated.currentBuild.prompt, originBuild: structuredClone(populated.currentBuild) }];
  populated.activeVariantId = 'variant';
  populated.currentBuild = { ...structuredClone(populated.currentBuild), id: 'variant', name: 'Variant' };
  populated.dnaLibrary = [{ id: 'dna', name: 'DNA', category: 'Intent', content: '', createdAt: '' }];
  const engineSource = { id: '', name: 'Portable Engine', description: '', category: '', createdAt: 'bad', updatedAt: 'bad', modules: [
    { moduleId: 'intent', importance: 'core', moduleState: { ...structuredClone(populated.currentBuild.modules.intent), status: 'active' }, rationale: '' },
    { moduleId: 'world', importance: 'recommended', moduleState: { ...structuredClone(populated.currentBuild.modules.world), status: 'active' }, rationale: '' },
  ], constructionSteps: [{ id: '', label: 'Step', description: '', moduleIds: ['intent'] }] };
  const normalizedEngine = normalizeEngineRecord(engineSource);
  assert.ok(normalizedEngine.id.startsWith('engine_'));
  assert.equal(normalizedEngine.createdAt, '1970-01-01T00:00:00.000Z');
  assert.equal(normalizedEngine.constructionSteps[0].id, 'step_1');
  const duplicates = normalizeEngineCollection([{ ...engineSource, id: 'duplicate' }, { ...engineSource, id: 'duplicate' }]);
  assert.deepEqual(duplicates.engines.map((engine) => engine.id), ['duplicate', 'duplicate_2']);
  populated.engines = [normalizedEngine];

  const backup = createBackup(populated, '2026-08-12T12:34:00.000Z');
  assert.equal(backup.format, BACKUP_FORMAT);
  assert.equal(backup.backupSchemaVersion, 1);
  assert.equal(backup.galazarVersion, '1.0.0');
  assert.equal('history' in backup.data, false);
  assert.deepEqual(populated.engines, [normalizedEngine]);
  const preview = parseBackup(JSON.stringify(backup));
  assert.equal(preview.summary.savedBuilds, 1);
  assert.equal(preview.summary.projects, 1);
  assert.equal(preview.summary.variants, 1);
  assert.equal(preview.summary.dnaEntries, 1);
  assert.equal(preview.summary.engines, 1);
  assert.equal(preview.state.activeVariantId, 'variant');
  assert.deepEqual(preview.state.currentBuild.modules, populated.currentBuild.modules);
  assert.throws(() => parseBackup('not json'));
  assert.throws(() => parseBackup(JSON.stringify({ format: 'OTHER', backupSchemaVersion: 1, data: {} })));

  renderer = await mountStorage(JSON.stringify(initialState));
  const originalBeforeRestore = structuredClone(api.state);
  storage.failWrites = true;
  await act(async () => assert.equal(api.replaceStatePersisted(preview.state), false));
  assert.deepEqual(api.state, originalBeforeRestore);
  storage.failWrites = false;
  await act(async () => assert.equal(api.replaceStatePersisted(preview.state), true));
  assert.equal(api.state.engines.length, 1);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).variants.length, 1);
  await act(async () => renderer.unmount());

  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { writeText: async () => { throw new Error('denied'); } } } });
  let promptRenderer;
  await act(async () => { promptRenderer = TestRenderer.create(React.createElement(LivePrompt, { prompt: 'test prompt' })); });
  const copyButton = promptRenderer.root.findAllByType(Button).find((button) => nodeText(button).includes('Copy Prompt'));
  await act(async () => copyButton.props.onClick());
  assert.ok(nodeText(promptRenderer.root).includes('Copy failed'));
  await act(async () => promptRenderer.unmount());

  const settingsSource = await readFile('./src/pages/SettingsPage.tsx', 'utf8');
  for (const phrase of ['active workspace', 'Saved Builds', 'Projects', 'Variants', 'DNA Library', 'Engine Library', 'Export a backup first']) assert.ok(settingsSource.includes(phrase));

  console.log('Data safety and backup regression test passed.');
} finally {
  globalThis.setTimeout = originalSetTimeout;
  globalThis.clearTimeout = originalClearTimeout;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalStorage });
}
