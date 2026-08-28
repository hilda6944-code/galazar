import { createEngine } from '@/lib/engines';
import { moduleHasContent } from '@/lib/moduleContent';
import { MODULE_ORDER, type Build, type Engine, type EngineImportance, type EngineStep, type ModuleId } from '@/types/galazar';

export interface EngineCreationModuleInput {
  moduleId: ModuleId;
  importance: EngineImportance;
  rationale: string;
}

export interface EngineCreationInput {
  build: Build;
  id: string;
  timestamp: string;
  name: string;
  description: string;
  category: string;
  modules: EngineCreationModuleInput[];
  constructionSteps: EngineStep[];
}

export type EngineModuleAvailability = 'contributing' | 'skipped' | 'inactive-detail';

export interface AvailableEngineModule {
  moduleId: ModuleId;
  availability: EngineModuleAvailability;
}

export function getAvailableEngineModules(build: Build): AvailableEngineModule[] {
  return MODULE_ORDER.reduce<AvailableEngineModule[]>((available, moduleId) => {
    const module = build.modules[moduleId];
    if (!moduleHasContent(module)) return available;
    if (module.skipped) return [...available, { moduleId, availability: 'skipped' }];
    if (moduleId === 'detail' && !module.elements.some((element) => element.active && element.category !== null)) {
      return [...available, { moduleId, availability: 'inactive-detail' }];
    }
    return [...available, { moduleId, availability: 'contributing' }];
  }, []);
}

export function getPopulatedEngineModuleIds(build: Build): ModuleId[] {
  return getAvailableEngineModules(build).map(({ moduleId }) => moduleId);
}

export function createEngineFromBuildSelection(input: EngineCreationInput): Engine | null {
  return createEngine({
    id: input.id,
    name: input.name,
    description: input.description,
    category: input.category,
    createdAt: input.timestamp,
    modules: input.modules.map((module) => ({
      ...module,
      moduleState: input.build.modules[module.moduleId],
    })),
    constructionSteps: input.constructionSteps,
  });
}
