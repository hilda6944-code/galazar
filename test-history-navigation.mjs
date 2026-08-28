import assert from 'node:assert/strict';
import React, { StrictMode } from 'react';
import TestRenderer, { act } from 'react-test-renderer';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.React = React;

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};

const { default: App } = await import('./src/App.tsx');
const { GlobalControls } = await import('./src/components/GlobalControls.tsx');
const { LivePrompt } = await import('./src/components/LivePrompt.tsx');
const { ModuleCard } = await import('./src/components/ModuleCard.tsx');
const { Sidebar } = await import('./src/components/Sidebar.tsx');

let renderer;

function controls() {
  return renderer.root.findByType(GlobalControls).props;
}

function prompt() {
  return renderer.root.findByType(LivePrompt).props.prompt;
}

function intentCard() {
  return renderer.root.findAllByType(ModuleCard).find(({ props }) => props.moduleState.id === 'intent');
}

function intentDropdown() {
  return intentCard().findByType('select');
}

async function expandIntent() {
  await act(async () => intentCard().findAllByType('button')[0].props.onClick());
}

async function selectIntent(intent) {
  await act(async () => {
    intentDropdown().props.onChange({ target: { value: intent } });
  });
}

async function waitForAutosave() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2200));
  });
  assert.notEqual(controls().lastSavedAt, null);
}

try {
  await act(async () => {
    renderer = TestRenderer.create(React.createElement(StrictMode, null, React.createElement(App)));
  });

  await expandIntent();
  assert.equal(intentDropdown().props.value, '');

  await selectIntent('Photorealistic');
  assert.equal(intentDropdown().props.value, 'Photorealistic');
  assert.equal(prompt(), 'photorealistic image');
  assert.equal(controls().canUndo, true);
  assert.equal(controls().canRedo, false);
  await waitForAutosave();

  await selectIntent('Illustration');
  assert.equal(intentDropdown().props.value, 'Illustration');
  assert.equal(prompt(), 'illustration');
  assert.equal(controls().canUndo, true);
  assert.equal(controls().canRedo, false);
  await waitForAutosave();

  await act(async () => controls().onUndo());
  assert.equal(intentDropdown().props.value, 'Photorealistic');
  assert.equal(prompt(), 'photorealistic image');
  assert.equal(controls().canUndo, true);
  assert.equal(controls().canRedo, true);

  await act(async () => renderer.root.findByType(Sidebar).props.onChangeView('projects'));
  assert.equal(renderer.root.findAllByType(GlobalControls).length, 0);
  await act(async () => renderer.root.findByType(Sidebar).props.onChangeView('prompt-builder'));
  await expandIntent();

  assert.equal(intentDropdown().props.value, 'Photorealistic');
  assert.equal(prompt(), 'photorealistic image');
  assert.equal(controls().canUndo, true);
  assert.equal(controls().canRedo, true);

  await act(async () => controls().onRedo());
  assert.equal(intentDropdown().props.value, 'Illustration');
  assert.equal(prompt(), 'illustration');
  assert.equal(controls().canUndo, true);
  assert.equal(controls().canRedo, false);

  await act(async () => controls().onCreateVariant());
  assert.equal(prompt(), 'illustration');
  assert.equal(controls().canUndo, false);
  assert.equal(controls().canRedo, false);

  console.log('App navigation history regression test passed.');
} finally {
  if (renderer) await act(async () => renderer.unmount());
}
