import assert from 'node:assert/strict';
import { assignBuildToProject, createProject, deleteProject, filterProjects, removeBuildFromProject, renameProject } from './src/lib/projects.ts';
import { loadSavedBuild } from './src/lib/savedBuilds.ts';
import { createNewBuild } from './src/types/galazar.ts';

const timestamp = '2026-08-12T12:00:00.000Z';
const first = createProject('Portraits', 'project-1', timestamp);
const second = createProject('Landscapes', 'project-2', timestamp);
let projects = [first, second];
const portrait = createNewBuild('Portrait Build');
portrait.prompt = 'exact portrait prompt';
portrait.modules.subject.subjectDNA.subjectType = 'Human';
const landscape = createNewBuild('Landscape Build');
landscape.prompt = 'exact landscape prompt';
const savedBuilds = [portrait, landscape];

projects = assignBuildToProject(projects, portrait.id, first.id, timestamp);
projects = assignBuildToProject(projects, landscape.id, second.id, timestamp);
assert.deepEqual(projects[0].buildIds, [portrait.id]);
assert.deepEqual(projects[1].buildIds, [landscape.id]);

const reloaded = JSON.parse(JSON.stringify({ projects, savedBuilds }));
assert.deepEqual(reloaded.projects[0].buildIds, [portrait.id]);
assert.deepEqual(reloaded.projects[1].buildIds, [landscape.id]);

projects = assignBuildToProject(projects, portrait.id, second.id, timestamp);
assert.deepEqual(projects[0].buildIds, []);
assert.deepEqual(projects[1].buildIds, [landscape.id, portrait.id]);

projects = removeBuildFromProject(projects, second.id, portrait.id, timestamp);
assert.deepEqual(projects[1].buildIds, [landscape.id]);
assert.equal(savedBuilds.length, 2);

projects = renameProject(projects, second.id, 'Fine Landscapes', timestamp);
assert.equal(projects[1].name, 'Fine Landscapes');
assert.deepEqual(projects[1].buildIds, [landscape.id]);
assert.equal(filterProjects(projects, 'fine').length, 1);
assert.equal(filterProjects(projects, 'portraits')[0].id, first.id);

const opened = loadSavedBuild(landscape);
assert.deepEqual(opened.modules, landscape.modules);
assert.equal(opened.prompt, landscape.prompt);
assert.notStrictEqual(opened, landscape);

projects = deleteProject(projects, second.id);
assert.equal(projects.length, 1);
assert.equal(savedBuilds.length, 2);
assert.equal(savedBuilds[1].prompt, 'exact landscape prompt');

console.log('Projects workflow regression test passed.');
