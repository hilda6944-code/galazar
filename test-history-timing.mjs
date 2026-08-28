import assert from 'node:assert/strict';
import React, { StrictMode } from 'react';
import TestRenderer, { act } from 'react-test-renderer';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.React = React;

const { GlobalControls } = await import('./src/components/GlobalControls.tsx');
const { LivePrompt } = await import('./src/components/LivePrompt.tsx');
const { ModuleCard } = await import('./src/components/ModuleCard.tsx');
const { assembleFullPrompt } = await import('./src/lib/promptAssembly.ts');
const { PromptBuilder } = await import('./src/sections/PromptBuilder.tsx');
const { createNewBuild } = await import('./src/types/galazar.ts');

class FakeTimers {
  nextId = 1;
  timers = new Map();

  setTimeout = (callback) => {
    const id = this.nextId++;
    this.timers.set(id, callback);
    return id;
  };

  clearTimeout = (id) => {
    this.timers.delete(id);
  };

  runAll() {
    const callbacks = [...this.timers.values()];
    this.timers.clear();
    for (const callback of callbacks) callback();
  }
}

const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const fakeTimers = new FakeTimers();

function propsFor(build, updates, initialHistory) {
  return {
    initialBuild: build,
    onUpdateBuild: (updated) => updates.push(updated),
    onSaveBuild: () => {},
    onCreateVariant: () => {},
    onCreateEngine: () => {},
    isVariant: false,
    onSaveDNAEntry: () => {},
    initialHistory,
    hasUnsavedChanges: false,
    lastSavedAt: null,
  };
}

async function mountBuilder(build, updates = [], initialHistory) {
  let renderer;
  await act(async () => {
    renderer = TestRenderer.create(
      React.createElement(StrictMode, null, React.createElement(PromptBuilder, propsFor(build, updates, initialHistory)))
    );
  });
  return { renderer, updates };
}

function controls(renderer) {
  return renderer.root.findByType(GlobalControls).props;
}

function prompt(renderer) {
  return renderer.root.findByType(LivePrompt).props.prompt;
}

function intentCard(renderer) {
  return renderer.root.findAllByType(ModuleCard).find(({ props }) => props.moduleState.id === 'intent').props;
}

async function editIntent(renderer, intent) {
  await act(async () => {
    intentCard(renderer).onIntentDNAChange({ intent, customIntent: '' });
  });
}

globalThis.setTimeout = fakeTimers.setTimeout;
globalThis.clearTimeout = fakeTimers.clearTimeout;

try {
  const immediate = await mountBuilder(createNewBuild('Immediate'));
  await editIntent(immediate.renderer, 'Cinematic');
  assert.equal(prompt(immediate.renderer), 'cinematic image');
  assert.equal(controls(immediate.renderer).canUndo, true);

  await act(async () => controls(immediate.renderer).onUndo());
  assert.equal(prompt(immediate.renderer), '');
  assert.equal(controls(immediate.renderer).canRedo, true);
  await act(async () => fakeTimers.runAll());
  assert.equal(prompt(immediate.renderer), '');
  assert.equal(controls(immediate.renderer).canRedo, true);

  await act(async () => controls(immediate.renderer).onRedo());
  assert.equal(prompt(immediate.renderer), 'cinematic image');
  await act(async () => fakeTimers.runAll());
  assert.equal(prompt(immediate.renderer), 'cinematic image');
  await act(async () => immediate.renderer.unmount());

  const rapid = await mountBuilder(createNewBuild('Rapid'));
  await editIntent(rapid.renderer, 'Cinematic');
  await editIntent(rapid.renderer, 'Editorial');
  await editIntent(rapid.renderer, 'Documentary');
  assert.equal(prompt(rapid.renderer), 'documentary-style image');
  await act(async () => controls(rapid.renderer).onUndo());
  assert.equal(prompt(rapid.renderer), '');
  assert.equal(controls(rapid.renderer).canUndo, false);

  await editIntent(rapid.renderer, 'Surreal');
  await act(async () => controls(rapid.renderer).onClear());
  assert.equal(prompt(rapid.renderer), '');
  await act(async () => controls(rapid.renderer).onUndo());
  assert.equal(prompt(rapid.renderer), 'surreal image');
  await act(async () => controls(rapid.renderer).onRedo());
  assert.equal(prompt(rapid.renderer), '');
  await act(async () => rapid.renderer.unmount());

  for (const replacementName of ['Saved replacement', 'Variant replacement']) {
    const oldUpdates = [];
    const old = await mountBuilder(createNewBuild('Old Session'), oldUpdates);
    await editIntent(old.renderer, 'Cinematic');
    await act(async () => old.renderer.unmount());
    const updatesAfterUnmount = oldUpdates.length;
    assert.equal(fakeTimers.timers.size, 0);

    const replacement = createNewBuild(replacementName);
    replacement.modules.intent.intentDNA.intent = 'Editorial';
    replacement.prompt = assembleFullPrompt(replacement.modules);
    const next = await mountBuilder(replacement);
    assert.equal(prompt(next.renderer), 'editorial image');
    await act(async () => fakeTimers.runAll());
    assert.equal(prompt(next.renderer), 'editorial image');
    assert.equal(oldUpdates.length, updatesAfterUnmount);
    await act(async () => next.renderer.unmount());
  }

  const preLibrary = createNewBuild('Before Library');
  preLibrary.modules.intent.intentDNA.intent = 'Cinematic';
  preLibrary.prompt = assembleFullPrompt(preLibrary.modules);
  const postLibrary = structuredClone(preLibrary);
  postLibrary.modules.intent.intentDNA.intent = 'Fine Art';
  postLibrary.prompt = assembleFullPrompt(postLibrary.modules);

  const oldLibrarySession = await mountBuilder(createNewBuild('Pending Library Session'));
  await editIntent(oldLibrarySession.renderer, 'Documentary');
  await act(async () => oldLibrarySession.renderer.unmount());
  const library = await mountBuilder(postLibrary, [], [
    { modules: preLibrary.modules, prompt: preLibrary.prompt, timestamp: 1 },
    { modules: postLibrary.modules, prompt: postLibrary.prompt, timestamp: 2 },
  ]);
  assert.equal(prompt(library.renderer), 'fine-art image');
  await act(async () => controls(library.renderer).onUndo());
  assert.equal(prompt(library.renderer), 'cinematic image');
  await act(async () => controls(library.renderer).onRedo());
  assert.equal(prompt(library.renderer), 'fine-art image');
  await act(async () => fakeTimers.runAll());
  assert.equal(prompt(library.renderer), 'fine-art image');
  await act(async () => library.renderer.unmount());
  assert.equal(fakeTimers.timers.size, 0);

  console.log('Mounted history timing integration test passed.');
} finally {
  globalThis.setTimeout = originalSetTimeout;
  globalThis.clearTimeout = originalClearTimeout;
}
