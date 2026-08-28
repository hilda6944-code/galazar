import { upsertSavedBuild } from './savedBuilds.ts';
import { updateVariantFromBuild } from './variants.ts';
import type { AppState, Build } from '../types/galazar.ts';

export function saveActiveBuildState(
  state: AppState,
  activeBuild: Build,
  savedAt: string
): AppState {
  const buildToSave: Build = {
    ...activeBuild,
    updatedAt: savedAt,
  };

  return {
    ...state,
    savedBuilds: upsertSavedBuild(state.savedBuilds, buildToSave),
    currentBuild: buildToSave,
    variants: state.activeVariantId
      ? updateVariantFromBuild(state.variants, state.activeVariantId, buildToSave)
      : state.variants,
    hasUnsavedChanges: false,
    lastSavedAt: savedAt,
  };
}

export function preparePersistedState(state: AppState, savedAt: string): AppState {
  return {
    ...state,
    lastSavedAt: savedAt,
  };
}

export function isCurrentPersistenceRevision(scheduled: number, current: number): boolean {
  return scheduled === current;
}
