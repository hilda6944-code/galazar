import assert from 'node:assert/strict';
import { createDefaultAppState } from './src/types/galazar.ts';
import {
  applyEngineToBuild,
  createEngine,
  deleteEngine,
  duplicateEngine,
  previewEngineApplication,
  renameEngine,
  searchEngines,
} from './src/lib/engines.ts';
import { upsertSavedBuild } from './src/lib/savedBuilds.ts';
import { createVariant } from './src/lib/variants.ts';
import { createDNAEntry } from './src/lib/dnaLibrary.ts';

const base = createDefaultAppState().currentBuild;
const sourceIntent = structuredClone(base.modules.intent);
sourceIntent.status = 'locked';
sourceIntent.intentDNA.intent = 'Cinematic';
const sourceWorld = structuredClone(base.modules.world);
sourceWorld.status = 'locked';
sourceWorld.worldDNA.world = 'Natural Landscape';
const sourceSnapshot = structuredClone({ sourceIntent, sourceWorld });

const engine = createEngine({
  id: 'engine-primary',
  name: '  Luminous Logic  ',
  description: 'Coordinates a dark foundation with guided illumination',
  category: 'Atmospheric Systems',
  createdAt: '2026-02-01T00:00:00.000Z',
  modules: [
    { moduleId: 'intent', importance: 'core', moduleState: sourceIntent, rationale: 'Establishes cinematic purpose' },
    { moduleId: 'world', importance: 'recommended', moduleState: sourceWorld, rationale: 'Provides the environmental foundation' },
  ],
  constructionSteps: [{ id: 'step-1', label: 'Internal Glow', description: 'Build illumination from within', moduleIds: ['intent', 'world'] }],
});

assert.ok(engine);
assert.equal(engine.name, 'Luminous Logic');
assert.equal(engine.schemaVersion, 1);
assert.equal(engine.modules.length, 2);
assert.equal(engine.modules[0].moduleState.status, 'active');
assert.equal(engine.modules[1].moduleState.status, 'active');
assert.deepEqual({ sourceIntent, sourceWorld }, sourceSnapshot);
assert.equal(createEngine({ id: 'bad', name: 'One', createdAt: '', modules: [engine.modules[0]] }), null);
assert.equal(createEngine({ id: 'bad', name: '   ', createdAt: '', modules: engine.modules }), null);

const second = duplicateEngine(engine, 'engine-second', '2026-02-02T00:00:00.000Z');
const collection = [engine, second];
const renamed = renameEngine(collection, engine.id, '  Renamed Logic  ', '2026-02-03T00:00:00.000Z');
assert.equal(renamed[0].name, 'Renamed Logic');
assert.equal(renamed[0].createdAt, engine.createdAt);
assert.equal(renamed[0].updatedAt, '2026-02-03T00:00:00.000Z');
assert.strictEqual(renamed[1], second);
assert.strictEqual(renameEngine(collection, engine.id, '   ', 'later'), collection);

assert.equal(second.id, 'engine-second');
assert.equal(second.name, 'Luminous Logic Copy');
assert.equal(second.createdAt, '2026-02-02T00:00:00.000Z');
assert.notStrictEqual(second.modules, engine.modules);
assert.notStrictEqual(second.modules[0].moduleState, engine.modules[0].moduleState);
assert.notStrictEqual(second.constructionSteps, engine.constructionSteps);
second.modules[0].rationale = 'duplicate-only rationale';
second.modules[0].moduleState.intentDNA.intent = 'Editorial';
second.constructionSteps[0].label = 'Duplicate step';
assert.equal(engine.modules[0].rationale, 'Establishes cinematic purpose');
assert.equal(engine.modules[0].moduleState.intentDNA.intent, 'Cinematic');
assert.equal(engine.constructionSteps[0].label, 'Internal Glow');

const beforeDeleteOther = structuredClone(second);
const deleted = deleteEngine(collection, engine.id);
assert.deepEqual(deleted, [beforeDeleteOther]);
assert.deepEqual(second, beforeDeleteOther);

assert.deepEqual(searchEngines(collection, 'luminous').map((item) => item.id), ['engine-primary', 'engine-second']);
assert.deepEqual(searchEngines(collection, 'guided illumination').map((item) => item.id), ['engine-primary', 'engine-second']);
assert.deepEqual(searchEngines(collection, 'atmospheric systems').map((item) => item.id), ['engine-primary', 'engine-second']);
assert.deepEqual(searchEngines(collection, 'WORLD').map((item) => item.id), ['engine-primary', 'engine-second']);
assert.deepEqual(searchEngines(collection, 'environmental foundation').map((item) => item.id), ['engine-primary', 'engine-second']);
assert.deepEqual(searchEngines(collection, 'illumination from within').map((item) => item.id), ['engine-primary', 'engine-second']);
assert.strictEqual(searchEngines(collection, '   '), collection);

const active = structuredClone(base);
active.id = 'active-build';
active.name = 'Active Build';
active.updatedAt = 'preserved-update';
active.modules.intent.status = 'active';
active.modules.intent.intentDNA.intent = 'Editorial';
active.modules.world.status = 'locked';
active.modules.world.worldDNA.world = 'Urban Exterior';
const activeSnapshot = structuredClone(active);
const engineSnapshot = structuredClone(engine);

const preview = previewEngineApplication(engine, active, true);
assert.equal(preview[0].changed, true);
assert.equal(preview[0].locked, false);
assert.equal(preview[0].selectable, true);
assert.equal(preview[1].changed, true);
assert.equal(preview[1].locked, true);
assert.equal(preview[1].selectable, false);
assert.equal(preview[1].proposedModule.status, 'locked');
assert.deepEqual(active, activeSnapshot);
assert.deepEqual(engine, engineSnapshot);

const identicalBuild = structuredClone(active);
identicalBuild.modules.intent = structuredClone(engine.modules[0].moduleState);
assert.equal(previewEngineApplication(engine, identicalBuild, false)[0].changed, false);

const variantResult = applyEngineToBuild(active, engine, ['intent', 'world'], true);
assert.deepEqual(variantResult.appliedModuleIds, ['intent']);
assert.deepEqual(variantResult.blockedModuleIds, ['world']);
assert.deepEqual(variantResult.unchangedModuleIds, []);
assert.equal(variantResult.build.modules.intent.intentDNA.intent, 'Cinematic');
assert.deepEqual(variantResult.build.modules.world, active.modules.world);
assert.equal(variantResult.build.prompt, 'cinematic image. urban exterior setting');
assert.equal(variantResult.build.id, active.id);
assert.equal(variantResult.build.name, active.name);
assert.equal(variantResult.build.updatedAt, active.updatedAt);

const subsetResult = applyEngineToBuild(active, engine, ['intent'], true);
assert.deepEqual(subsetResult.appliedModuleIds, ['intent']);
assert.deepEqual(subsetResult.blockedModuleIds, []);
assert.deepEqual(subsetResult.unchangedModuleIds, ['world']);
assert.deepEqual(subsetResult.build.modules.world, active.modules.world);

const unlocked = structuredClone(active);
unlocked.modules.world.status = 'active';
const allResult = applyEngineToBuild(unlocked, engine, ['intent', 'world'], true);
assert.deepEqual(allResult.appliedModuleIds, ['intent', 'world']);
assert.deepEqual(allResult.blockedModuleIds, []);
assert.equal(allResult.build.prompt, 'cinematic image. natural landscape setting');
assert.deepEqual(active, activeSnapshot);
assert.deepEqual(engine, engineSnapshot);

const saved = upsertSavedBuild([], active);
assert.deepEqual(saved[0].modules, active.modules);
const variant = createVariant(active, 'Branch', 'variant', '2026-02-04T00:00:00.000Z');
assert.deepEqual(variant.modules, active.modules);
const dna = createDNAEntry(active.modules.intent, 'Intent DNA', 'dna', '2026-02-04T00:00:00.000Z');
assert.deepEqual(dna.moduleState, active.modules.intent);

console.log('Engine operations regression test passed.');
