import { normalizeEngineCollection } from '@/lib/engines';
import { normalizeBuildModules, normalizeModuleState } from '@/lib/moduleNormalization';
import { assembleFullPrompt } from '@/lib/promptAssembly';
import {
  createDefaultAppState,
  MODULE_ORDER,
  type AppState,
  type Build,
  type DNALibraryEntry,
  type Project,
  type Variant,
  type ViewId,
} from '@/types/galazar';

export interface AppStateNormalizationResult {
  state: AppState;
  warnings: string[];
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function requiredCollection(source: Record<string, unknown>, key: string): unknown[] {
  const value = source[key];
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${key} must be an array`);
  return value;
}

function normalizeBuild(value: unknown, fallback?: Build, reassemblePrompt = false): Build | null {
  const source = record(value);
  if (!source || !record(source.modules)) return null;
  const base = fallback ?? createDefaultAppState().currentBuild;
  const modules = normalizeBuildModules(source.modules as Build['modules']);
  return {
    ...base,
    ...source,
    id: typeof source.id === 'string' && source.id.trim() ? source.id : base.id,
    name: typeof source.name === 'string' && source.name.trim() ? source.name : base.name,
    createdAt: typeof source.createdAt === 'string' ? source.createdAt : base.createdAt,
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : base.updatedAt,
    modules,
    prompt: reassemblePrompt ? assembleFullPrompt(modules) : typeof source.prompt === 'string' ? source.prompt : assembleFullPrompt(modules),
  } as Build;
}

export function prepareActiveBuild(build: Build): Build {
  const modules = normalizeBuildModules(build.modules);
  return { ...build, modules, prompt: assembleFullPrompt(modules) };
}

function normalizeProject(value: unknown, savedIds: Set<string>): Project | null {
  const source = record(value);
  if (!source || typeof source.id !== 'string' || !source.id.trim() || typeof source.name !== 'string' || !source.name.trim()) return null;
  if (!Array.isArray(source.buildIds)) return null;
  return {
    id: source.id,
    name: source.name,
    description: typeof source.description === 'string' ? source.description : '',
    createdAt: typeof source.createdAt === 'string' ? source.createdAt : '',
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : '',
    buildIds: [...new Set(source.buildIds.filter((id): id is string => typeof id === 'string' && savedIds.has(id)))],
  };
}

function normalizeVariant(value: unknown): Variant | null {
  const source = record(value);
  if (!source || typeof source.id !== 'string' || !source.id.trim() || typeof source.name !== 'string' || !record(source.modules)) return null;
  const modules = normalizeBuildModules(source.modules as Build['modules']);
  const origin = normalizeBuild(source.originBuild);
  const createdAt = typeof source.createdAt === 'string' ? source.createdAt : '';
  return {
    id: source.id,
    name: source.name,
    parentBuildId: typeof source.parentBuildId === 'string' ? source.parentBuildId : origin?.id ?? '',
    createdAt,
    modules,
    prompt: typeof source.prompt === 'string' ? source.prompt : assembleFullPrompt(modules),
    originBuild: origin ?? {
      ...createDefaultAppState().currentBuild,
      id: typeof source.parentBuildId === 'string' ? source.parentBuildId : source.id,
      name: 'Branch Origin',
      createdAt,
      updatedAt: createdAt,
      modules: structuredClone(modules),
      prompt: assembleFullPrompt(modules),
    },
  };
}

function normalizeDNAEntry(value: unknown): DNALibraryEntry | null {
  const source = record(value);
  if (!source || typeof source.id !== 'string' || !source.id.trim() || typeof source.name !== 'string') return null;
  const moduleId = typeof source.moduleId === 'string' && MODULE_ORDER.includes(source.moduleId as NonNullable<DNALibraryEntry['moduleId']>)
    ? source.moduleId as DNALibraryEntry['moduleId']
    : undefined;
  const storedModule = record(source.moduleState);
  const moduleState = moduleId && storedModule ? normalizeModuleState({ ...storedModule, id: moduleId }) : undefined;
  return {
    id: source.id,
    name: source.name,
    category: typeof source.category === 'string' ? source.category : '',
    content: typeof source.content === 'string' ? source.content : '',
    createdAt: typeof source.createdAt === 'string' ? source.createdAt : '',
    moduleId,
    moduleState,
  };
}

const VALID_VIEWS = new Set<ViewId>(['prompt-builder', 'visual-pipeline', 'projects', 'saved-builds', 'variants', 'dna-library', 'engine-library', 'settings', 'architecture']);

export function normalizeAppState(value: unknown): AppStateNormalizationResult {
  const source = record(value);
  if (!source) throw new Error('GALAZAR state must be an object');
  const defaults = createDefaultAppState();
  const currentBuild = normalizeBuild(source.currentBuild, defaults.currentBuild, true);
  if (!currentBuild) throw new Error('currentBuild is missing or invalid');
  const warnings: string[] = [];

  const rawSaved = requiredCollection(source, 'savedBuilds');
  const savedBuilds = rawSaved.flatMap((item) => {
    const build = normalizeBuild(item);
    if (!build) { warnings.push('Skipped an invalid Saved Build.'); return []; }
    return [build];
  });
  const savedIds = new Set(savedBuilds.map((build) => build.id));

  const rawProjects = requiredCollection(source, 'projects');
  const projects = rawProjects.flatMap((item) => {
    const project = normalizeProject(item, savedIds);
    if (!project) { warnings.push('Skipped an invalid Project.'); return []; }
    return [project];
  });

  const rawVariants = requiredCollection(source, 'variants');
  const variants = rawVariants.flatMap((item) => {
    const variant = normalizeVariant(item);
    if (!variant) { warnings.push('Skipped an invalid Variant.'); return []; }
    return [variant];
  });

  const rawDNA = requiredCollection(source, 'dnaLibrary');
  const dnaLibrary = rawDNA.flatMap((item) => {
    const entry = normalizeDNAEntry(item);
    if (!entry) { warnings.push('Skipped an invalid DNA Library entry.'); return []; }
    return [entry];
  });

  const rawEngines = requiredCollection(source, 'engines');
  const engineResult = normalizeEngineCollection(rawEngines);
  if (engineResult.skipped) warnings.push(`Skipped ${engineResult.skipped} invalid Engine record${engineResult.skipped === 1 ? '' : 's'}.`);
  if (engineResult.repaired) warnings.push(`Repaired ${engineResult.repaired} duplicate Engine identifier${engineResult.repaired === 1 ? '' : 's'}.`);

  const requestedVariant = typeof source.activeVariantId === 'string' ? source.activeVariantId : null;
  const activeVariantId = requestedVariant && currentBuild.id === requestedVariant && variants.some((variant) => variant.id === requestedVariant) ? requestedVariant : null;
  if (requestedVariant && !activeVariantId) warnings.push('Cleared an invalid active Variant reference.');

  return {
    warnings,
    state: {
      ...defaults,
      activeView: typeof source.activeView === 'string' && VALID_VIEWS.has(source.activeView as ViewId) ? source.activeView as ViewId : 'prompt-builder',
      currentBuild,
      projects,
      savedBuilds,
      variants,
      activeVariantId,
      dnaLibrary,
      engines: engineResult.engines,
      hasUnsavedChanges: source.hasUnsavedChanges === true,
      lastSavedAt: typeof source.lastSavedAt === 'string' ? source.lastSavedAt : null,
    },
  };
}

export function deserializeAppState(json: string): AppStateNormalizationResult {
  return normalizeAppState(JSON.parse(json));
}
