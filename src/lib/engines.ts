import { normalizeModuleState } from '@/lib/moduleNormalization';
import { assembleFullPrompt } from '@/lib/promptAssembly';
import {
  MODULE_LABELS,
  MODULE_ORDER,
  type Build,
  type AppState,
  type Engine,
  type EngineImportance,
  type EngineModuleSpec,
  type EngineStep,
  type ModuleId,
  type ModuleState,
} from '@/types/galazar';

const ENGINE_IMPORTANCE = new Set<EngineImportance>(['core', 'recommended', 'optional']);

function isModuleId(value: unknown): value is ModuleId {
  return typeof value === 'string' && MODULE_ORDER.includes(value as ModuleId);
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function validTimestamp(value: unknown, fallback: string): string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : fallback;
}

export function normalizeEngineRecord(value: unknown): Engine | null {
  if (!value || typeof value !== 'object') return null;
  const stored = value as Record<string, unknown>;
  const name = typeof stored.name === 'string' ? stored.name.trim() : '';
  if (!name) return null;

  const rawModules = Array.isArray(stored.modules) ? stored.modules : [];
  const seenModules = new Set<ModuleId>();
  const modules = rawModules.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object') return [];
    const spec = candidate as Record<string, unknown>;
    if (!isModuleId(spec.moduleId) || seenModules.has(spec.moduleId)) return [];
    if (!spec.moduleState || typeof spec.moduleState !== 'object') return [];
    const snapshot = spec.moduleState as Partial<ModuleState>;
    if (snapshot.id !== spec.moduleId) return [];

    const normalized = normalizeModuleState({ ...structuredClone(snapshot), id: spec.moduleId });
    normalized.status = normalized.status === 'locked' ? 'active' : normalized.status;
    normalized.skipped = false;
    seenModules.add(spec.moduleId);
    return [{
      moduleId: spec.moduleId,
      importance: ENGINE_IMPORTANCE.has(spec.importance as EngineImportance)
        ? spec.importance as EngineImportance
        : 'recommended' as const,
      moduleState: normalized,
      rationale: typeof spec.rationale === 'string' ? spec.rationale : '',
    }];
  });

  if (modules.length < 2) return null;

  const validModules = new Set(modules.map((module) => module.moduleId));
  const rawSteps = Array.isArray(stored.constructionSteps) ? stored.constructionSteps : [];
  const seenStepIds = new Set<string>();
  const constructionSteps = rawSteps.flatMap((candidate, index) => {
    if (!candidate || typeof candidate !== 'object') return [];
    const step = candidate as Record<string, unknown>;
    const moduleIds = Array.isArray(step.moduleIds)
      ? [...new Set(step.moduleIds.filter((id): id is ModuleId => isModuleId(id) && validModules.has(id)))]
      : [];
    const requestedId = typeof step.id === 'string' ? step.id.trim() : '';
    let stepId = requestedId || `step_${index + 1}`;
    let suffix = 2;
    while (seenStepIds.has(stepId)) stepId = `${requestedId || `step_${index + 1}`}_${suffix++}`;
    seenStepIds.add(stepId);
    return [{
      id: stepId,
      label: typeof step.label === 'string' ? step.label : '',
      description: typeof step.description === 'string' ? step.description : '',
      moduleIds,
    }];
  });

  const fallbackTimestamp = '1970-01-01T00:00:00.000Z';
  const createdAt = validTimestamp(stored.createdAt, fallbackTimestamp);
  const identitySource = JSON.stringify({ name, modules, constructionSteps });
  const id = typeof stored.id === 'string' && stored.id.trim() ? stored.id.trim() : `engine_${stableHash(identitySource)}`;

  return structuredClone({
    id,
    name,
    description: typeof stored.description === 'string' ? stored.description : '',
    category: typeof stored.category === 'string' ? stored.category : '',
    schemaVersion: 1,
    createdAt,
    updatedAt: validTimestamp(stored.updatedAt, createdAt),
    modules,
    constructionSteps,
  });
}

export function normalizeEngineCollection(values: unknown[]): { engines: Engine[]; skipped: number; repaired: number } {
  const engines: Engine[] = [];
  const seenIds = new Set<string>();
  let skipped = 0;
  let repaired = 0;

  values.forEach((value) => {
    const normalized = normalizeEngineRecord(value);
    if (!normalized) {
      skipped += 1;
      return;
    }
    let id = normalized.id;
    let suffix = 2;
    while (seenIds.has(id)) id = `${normalized.id}_${suffix++}`;
    if (id !== normalized.id) repaired += 1;
    seenIds.add(id);
    engines.push(id === normalized.id ? normalized : { ...normalized, id });
  });

  return { engines, skipped, repaired };
}

export interface CreateEngineInput {
  id: string;
  name: string;
  description?: string;
  category?: string;
  createdAt: string;
  updatedAt?: string;
  modules: EngineModuleSpec[];
  constructionSteps?: EngineStep[];
}

export interface EngineModulePreview {
  moduleId: ModuleId;
  importance: EngineImportance;
  currentModule: ModuleState;
  proposedModule: ModuleState;
  rationale: string;
  locked: boolean;
  changed: boolean;
  selectable: boolean;
}

export interface EngineApplicationResult {
  build: Build;
  appliedModuleIds: ModuleId[];
  blockedModuleIds: ModuleId[];
  unchangedModuleIds: ModuleId[];
}

function modulesEqual(left: ModuleState, right: ModuleState): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function proposedModule(current: ModuleState, recommendation: ModuleState): ModuleState {
  const proposed = structuredClone(recommendation);
  if (current.status === 'locked') proposed.status = 'locked';
  return proposed;
}

export function createEngine(input: CreateEngineInput): Engine | null {
  return normalizeEngineRecord({
    id: input.id,
    name: input.name,
    description: input.description ?? '',
    category: input.category ?? '',
    schemaVersion: 1,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt ?? input.createdAt,
    modules: structuredClone(input.modules),
    constructionSteps: structuredClone(input.constructionSteps ?? []),
  });
}

export function renameEngine(engines: Engine[], engineId: string, name: string, updatedAt: string): Engine[] {
  const nextName = name.trim();
  if (!nextName) return engines;
  return engines.map((engine) => engine.id === engineId
    ? { ...engine, name: nextName, updatedAt }
    : engine);
}

export function duplicateEngine(engine: Engine, id: string, timestamp: string): Engine {
  const duplicate = structuredClone(engine);
  return {
    ...duplicate,
    id,
    name: `${engine.name} Copy`,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function deleteEngine(engines: Engine[], engineId: string): Engine[] {
  return engines.filter((engine) => engine.id !== engineId);
}

export function addEngineToState(state: AppState, engine: Engine): AppState {
  return { ...state, engines: [structuredClone(engine), ...state.engines] };
}

export function searchEngines(engines: Engine[], query: string): Engine[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return engines;

  return engines.filter((engine) => {
    const searchable = [
      engine.name,
      engine.description,
      engine.category,
      ...engine.modules.flatMap((module) => [
        MODULE_LABELS[module.moduleId],
        module.rationale,
      ]),
      ...engine.constructionSteps.flatMap((step) => [step.label, step.description]),
    ];
    return searchable.some((value) => value.toLocaleLowerCase().includes(normalized));
  });
}

export function previewEngineApplication(engine: Engine, build: Build, isVariant: boolean): EngineModulePreview[] {
  return engine.modules.map((spec) => {
    const currentModule = structuredClone(build.modules[spec.moduleId]);
    const proposed = proposedModule(currentModule, spec.moduleState);
    const locked = isVariant && currentModule.status === 'locked';
    return {
      moduleId: spec.moduleId,
      importance: spec.importance,
      currentModule,
      proposedModule: proposed,
      rationale: spec.rationale,
      locked,
      changed: !modulesEqual(currentModule, proposed),
      selectable: !locked,
    };
  });
}

export function defaultEngineSelection(engine: Engine, build: Build, isVariant: boolean): ModuleId[] {
  return previewEngineApplication(engine, build, isVariant)
    .filter((item) => item.changed && item.selectable)
    .map((item) => item.moduleId);
}

export function applyEngineToBuild(
  build: Build,
  engine: Engine,
  selectedModuleIds: ModuleId[],
  isVariant: boolean
): EngineApplicationResult {
  const result = structuredClone(build);
  const selected = new Set(selectedModuleIds);
  const previews = previewEngineApplication(engine, build, isVariant);
  const appliedModuleIds: ModuleId[] = [];
  const blockedModuleIds: ModuleId[] = [];
  const unchangedModuleIds: ModuleId[] = [];

  for (const preview of previews) {
    if (!selected.has(preview.moduleId)) {
      unchangedModuleIds.push(preview.moduleId);
    } else if (preview.locked) {
      blockedModuleIds.push(preview.moduleId);
    } else if (!preview.changed) {
      unchangedModuleIds.push(preview.moduleId);
    } else {
      result.modules[preview.moduleId] = structuredClone(preview.proposedModule);
      appliedModuleIds.push(preview.moduleId);
    }
  }

  result.prompt = assembleFullPrompt(result.modules);
  return { build: result, appliedModuleIds, blockedModuleIds, unchangedModuleIds };
}
