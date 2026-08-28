import assert from 'node:assert/strict';
import { createDefaultAppState } from './src/types/galazar.ts';
import { searchSavedBuilds } from './src/lib/savedBuilds.ts';
import { createVariant, deleteVariantFromState, variantToBuild } from './src/lib/variants.ts';

const source = createDefaultAppState().currentBuild;
source.name = 'Source Build';
source.prompt = 'cinematic forest portrait';
const commercial = structuredClone(source);
commercial.id = 'saved-commercial';
commercial.name = 'Product Study';
commercial.prompt = 'editorial studio product';
const savedBuilds = [source, commercial];
const savedSnapshot = structuredClone(savedBuilds);

assert.equal(searchSavedBuilds(savedBuilds, '').length, 2);
assert.deepEqual(searchSavedBuilds(savedBuilds, 'product').map((build) => build.id), ['saved-commercial']);
assert.deepEqual(searchSavedBuilds(savedBuilds, 'CINEMATIC').map((build) => build.id), [source.id]);
assert.equal(searchSavedBuilds(savedBuilds, 'not present').length, 0);
assert.deepEqual(savedBuilds, savedSnapshot);

const first = createVariant(source, 'First Variant', 'variant-first', '2026-01-01T00:00:00.000Z');
const second = createVariant(source, 'Second Variant', 'variant-second', '2026-01-02T00:00:00.000Z');
const activeBuild = variantToBuild(first);
activeBuild.name = 'Visible variant work';
activeBuild.prompt = 'exact visible edited prompt';
const baseState = {
  ...createDefaultAppState(),
  currentBuild: activeBuild,
  activeVariantId: first.id,
  variants: [first, second],
  savedBuilds: [commercial],
  projects: [{ id: 'project', name: 'Project', description: '', createdAt: '', updatedAt: '', buildIds: [commercial.id] }],
  dnaLibrary: [{ id: 'dna', name: 'DNA', category: 'subject', content: '', createdAt: '' }],
};
const protectedRecords = structuredClone({
  source: first.originBuild,
  sibling: second,
  savedBuilds: baseState.savedBuilds,
  projects: baseState.projects,
  dnaLibrary: baseState.dnaLibrary,
});

const afterInactiveDelete = deleteVariantFromState(baseState, second.id);
assert.equal(afterInactiveDelete.activeVariantId, first.id);
assert.deepEqual(afterInactiveDelete.currentBuild, activeBuild);
assert.deepEqual(afterInactiveDelete.variants, [first]);

const afterActiveDelete = deleteVariantFromState(baseState, first.id);
assert.equal(afterActiveDelete.activeVariantId, null);
assert.deepEqual(afterActiveDelete.currentBuild, activeBuild);
assert.deepEqual(afterActiveDelete.variants, [second]);
assert.deepEqual(first.originBuild, protectedRecords.source);
assert.deepEqual(afterActiveDelete.variants[0], protectedRecords.sibling);
assert.deepEqual(afterActiveDelete.savedBuilds, protectedRecords.savedBuilds);
assert.deepEqual(afterActiveDelete.projects, protectedRecords.projects);
assert.deepEqual(afterActiveDelete.dnaLibrary, protectedRecords.dnaLibrary);

const afterIndependentEdit = { ...afterActiveDelete, currentBuild: { ...afterActiveDelete.currentBuild, prompt: 'independent later edit' } };
assert.deepEqual(afterIndependentEdit.variants, [second]);
assert.equal(afterIndependentEdit.variants.some((variant) => variant.id === first.id), false);

const reopenedSibling = { ...afterIndependentEdit, activeVariantId: second.id, currentBuild: variantToBuild(second) };
assert.equal(reopenedSibling.activeVariantId, second.id);
assert.deepEqual(reopenedSibling.currentBuild.modules, second.modules);

console.log('Workflow truthfulness regression test passed.');
