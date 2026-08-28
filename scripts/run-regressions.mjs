import { spawnSync } from 'node:child_process';

const loaderTests = [
  'test-intent-dna.mjs',
  'test-world-dna.mjs',
  'test-atmosphere-dna.mjs',
  'test-anchor-dna.mjs',
  'test-format-dna.mjs',
  'test-exclusion-dna.mjs',
  'test-engine-model.mjs',
  'test-engine-operations.mjs',
  'test-highlight.mjs',
  'test-clear-build.mjs',
  'test-saved-builds.mjs',
  'test-projects.mjs',
  'test-variants.mjs',
  'test-variant-lock.mjs',
  'test-dna-library.mjs',
  'test-persistence-history.mjs',
  'test-module-order.mjs',
  'test-legacy-prompt-normalization.mjs',
  'test-workflow-truthfulness.mjs',
  'test-visual-pipeline.mjs',
  'test-prompt-regenerator.mjs',
];

function run(args, label) {
  console.log(`\n[GALAZAR] ${label}`);
  const nodeOptions = [process.env.NODE_OPTIONS, '--require ./scripts/test-node-shim.cjs'].filter(Boolean).join(' ');
  const result = spawnSync(process.execPath, args, { cwd: process.cwd(), stdio: 'inherit', env: { ...process.env, NODE_OPTIONS: nodeOptions } });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const test of loaderTests) {
  run(['--experimental-strip-types', '--experimental-loader', './test-loader.mjs', test], test);
}

run(['node_modules/tsx/dist/cli.mjs', 'test-engine-creation.mjs'], 'test-engine-creation.mjs');
run(['node_modules/tsx/dist/cli.mjs', 'test-engine-library.mjs'], 'test-engine-library.mjs');
run(['node_modules/tsx/dist/cli.mjs', 'test-engine-application.mjs'], 'test-engine-application.mjs');
run(['node_modules/tsx/dist/cli.mjs', 'test-history-timing.mjs'], 'test-history-timing.mjs');
run(['node_modules/tsx/dist/cli.mjs', 'test-history-navigation.mjs'], 'test-history-navigation.mjs');
run(['node_modules/tsx/dist/cli.mjs', 'test-data-safety.mjs'], 'test-data-safety.mjs');
console.log('\n[GALAZAR] All supported regression suites passed.');
