import assert from 'node:assert/strict';
import { createDefaultAppState, STORAGE_KEY } from './src/types/galazar.ts';
import { deserializeState } from './src/hooks/useGalazarStorage.ts';
import { normalizeEngineRecord } from './src/lib/engines.ts';

const defaults = createDefaultAppState();
assert.deepEqual(defaults.engines, []);
assert.equal(STORAGE_KEY, 'galazar-app-state-v6');

const oldState = structuredClone(defaults);
delete oldState.engines;
assert.deepEqual(deserializeState(JSON.stringify(oldState)).engines, []);

const sourceSubject = structuredClone(defaults.currentBuild.modules.subject);
sourceSubject.status = 'locked';
sourceSubject.subjectDNA.subjectType = 'Human';
sourceSubject.subjectDNA.human.appearance = 'independent source appearance';
const sourceCamera = structuredClone(defaults.currentBuild.modules.camera);
sourceCamera.status = 'locked';
sourceCamera.cameraDNA.shotSize = 'Close-Up';

const storedEngine = {
  id: 'engine-one',
  name: '  Coordinated Engine  ',
  description: 'Two-module construction logic',
  category: 'Atmospheric',
  schemaVersion: 99,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  modules: [
    { moduleId: 'subject', importance: 'core', moduleState: sourceSubject, rationale: 'Defines the subject treatment.' },
    { moduleId: 'camera', importance: 'unexpected', moduleState: sourceCamera, rationale: 'Controls framing.' },
    { moduleId: 'not-a-module', importance: 'optional', moduleState: { id: 'not-a-module' }, rationale: 'Invalid.' },
  ],
  constructionSteps: [
    { id: 'step-one', label: 'Shape', description: 'Coordinate subject and framing.', moduleIds: ['subject', 'camera', 'invalid', 'subject'] },
    { id: 'step-empty', label: 'Notes', description: '', moduleIds: ['invalid'] },
  ],
};

const normalized = normalizeEngineRecord(storedEngine);
assert.ok(normalized);
assert.equal(normalized.name, 'Coordinated Engine');
assert.equal(normalized.schemaVersion, 1);
assert.deepEqual(normalized.modules.map((module) => module.moduleId), ['subject', 'camera']);
assert.equal(normalized.modules[0].moduleState.status, 'active');
assert.equal(normalized.modules[1].moduleState.status, 'active');
assert.equal(normalized.modules[1].importance, 'recommended');
assert.equal(normalized.modules[0].moduleState.skipped, false);
assert.deepEqual(normalized.constructionSteps[0].moduleIds, ['subject', 'camera']);
assert.deepEqual(normalized.constructionSteps[1].moduleIds, []);

sourceSubject.subjectDNA.human.appearance = 'changed after normalization';
assert.equal(normalized.modules[0].moduleState.subjectDNA.human.appearance, 'independent source appearance');
normalized.modules[0].moduleState.subjectDNA.human.appearance = 'changed engine copy';
assert.equal(sourceSubject.subjectDNA.human.appearance, 'changed after normalization');

const legacyIntent = structuredClone(defaults.currentBuild.modules.intent);
legacyIntent.intentDNA = null;
legacyIntent.value = 'Cinematic';
const legacyWorld = structuredClone(defaults.currentBuild.modules.world);
legacyWorld.worldDNA = null;
legacyWorld.value = 'Fantasy Realm';
const legacyEngine = normalizeEngineRecord({
  ...storedEngine,
  id: 'legacy-engine',
  modules: [
    { moduleId: 'intent', importance: 'core', moduleState: legacyIntent, rationale: '' },
    { moduleId: 'world', importance: 'recommended', moduleState: legacyWorld, rationale: '' },
  ],
});
assert.equal(legacyEngine.modules[0].moduleState.intentDNA.intent, 'Cinematic');
assert.equal(legacyEngine.modules[1].moduleState.worldDNA.world, 'Fantasy World');

assert.equal(normalizeEngineRecord({ ...storedEngine, modules: storedEngine.modules.slice(0, 1) }), null);
assert.equal(normalizeEngineRecord({ ...storedEngine, name: '   ' }), null);

const stateWithEngine = { ...defaults, engines: [storedEngine] };
const protectedState = structuredClone({
  currentBuild: stateWithEngine.currentBuild,
  projects: stateWithEngine.projects,
  savedBuilds: stateWithEngine.savedBuilds,
  variants: stateWithEngine.variants,
  dnaLibrary: stateWithEngine.dnaLibrary,
});
const reloaded = deserializeState(JSON.stringify(stateWithEngine));
assert.equal(reloaded.engines.length, 1);
assert.equal(reloaded.engines[0].name, 'Coordinated Engine');
assert.deepEqual(reloaded.currentBuild, protectedState.currentBuild);
assert.deepEqual(reloaded.projects, protectedState.projects);
assert.deepEqual(reloaded.savedBuilds, protectedState.savedBuilds);
assert.deepEqual(reloaded.variants, protectedState.variants);
assert.deepEqual(reloaded.dnaLibrary, protectedState.dnaLibrary);

console.log('Engine model and normalization regression test passed.');
