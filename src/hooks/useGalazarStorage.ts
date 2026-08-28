import { useCallback, useEffect, useRef, useState } from 'react';
import { deserializeAppState } from '@/lib/appStateNormalization';
export { prepareActiveBuild } from '@/lib/appStateNormalization';
import { isCurrentPersistenceRevision, preparePersistedState } from '@/lib/statePersistence';
import { createDefaultAppState, STORAGE_KEY, type AppState } from '@/types/galazar';

type StateAction = React.SetStateAction<AppState>;

export interface RecoveryState {
  message: string;
  rawPayload: string | null;
}

export interface StorageAPI {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  saveToStorage: (action: StateAction) => boolean;
  replaceStatePersisted: (state: AppState) => boolean;
  loadFromStorage: () => AppState | null;
  persistenceError: string | null;
  recovery: RecoveryState | null;
  discardRecoveryAndUseCurrent: () => boolean;
}

function serializeState(state: AppState): string {
  return JSON.stringify(state);
}

export function deserializeState(json: string): AppState {
  return deserializeAppState(json).state;
}

function loadInitialState(): { state: AppState; recovery: RecoveryState | null } {
  let rawPayload: string | null = null;
  try {
    rawPayload = localStorage.getItem(STORAGE_KEY);
    if (!rawPayload) return { state: createDefaultAppState(), recovery: null };
    const normalized = deserializeAppState(rawPayload);
    if (normalized.warnings.length > 0) {
      return {
        state: normalized.state,
        recovery: {
          message: `Stored GALAZAR data needs review. Autosave is paused. ${normalized.warnings.join(' ')}`,
          rawPayload,
        },
      };
    }
    return { state: normalized.state, recovery: null };
  } catch (error) {
    console.warn('GALAZAR: Stored data could not be loaded', error);
    return {
      state: createDefaultAppState(),
      recovery: {
        message: 'Stored GALAZAR data could not be loaded. Autosave is paused to protect the original payload.',
        rawPayload,
      },
    };
  }
}

export function useGalazarStorage(): StorageAPI {
  const [initial] = useState(loadInitialState);
  const [state, setReactState] = useState<AppState>(initial.state);
  const [recovery, setRecovery] = useState<RecoveryState | null>(initial.recovery);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestStateRef = useRef(state);
  const mutationRevisionRef = useRef(0);

  const cancelPendingAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  const setState = useCallback((action: StateAction) => {
    cancelPendingAutoSave();
    mutationRevisionRef.current += 1;
    const next = typeof action === 'function' ? action(latestStateRef.current) : action;
    latestStateRef.current = next;
    setReactState(next);
  }, [cancelPendingAutoSave]);

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  const commitPersistedState = useCallback((next: AppState): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeState(next));
      latestStateRef.current = next;
      setReactState(next);
      setPersistenceError(null);
      return true;
    } catch (error) {
      console.warn('GALAZAR: Failed to save to localStorage', error);
      setPersistenceError('GALAZAR could not save changes to browser storage. Keep this page open and export a backup.');
      return false;
    }
  }, []);

  const saveToStorage = useCallback((action: StateAction): boolean => {
    cancelPendingAutoSave();
    mutationRevisionRef.current += 1;
    const updated = typeof action === 'function' ? action(latestStateRef.current) : action;
    return commitPersistedState(preparePersistedState(updated, new Date().toISOString()));
  }, [cancelPendingAutoSave, commitPersistedState]);

  const replaceStatePersisted = useCallback((next: AppState): boolean => {
    cancelPendingAutoSave();
    mutationRevisionRef.current += 1;
    const persisted = preparePersistedState(next, new Date().toISOString());
    if (!commitPersistedState(persisted)) return false;
    setRecovery(null);
    return true;
  }, [cancelPendingAutoSave, commitPersistedState]);

  const discardRecoveryAndUseCurrent = useCallback((): boolean => {
    if (!replaceStatePersisted(latestStateRef.current)) return false;
    setRecovery(null);
    return true;
  }, [replaceStatePersisted]);

  const loadFromStorage = useCallback((): AppState | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? deserializeState(stored) : null;
    } catch (error) {
      console.warn('GALAZAR: Failed to load from localStorage', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (recovery) return;
    cancelPendingAutoSave();
    const scheduledRevision = mutationRevisionRef.current;
    autoSaveTimerRef.current = setTimeout(() => {
      if (!isCurrentPersistenceRevision(scheduledRevision, mutationRevisionRef.current)) return;
      const stateToSave = preparePersistedState(latestStateRef.current, new Date().toISOString());
      commitPersistedState(stateToSave);
    }, 2000);
    return cancelPendingAutoSave;
  }, [cancelPendingAutoSave, commitPersistedState, recovery, state.activeView, state.activeVariantId, state.currentBuild, state.projects, state.savedBuilds, state.variants, state.dnaLibrary, state.engines]);

  return {
    state,
    setState,
    saveToStorage,
    replaceStatePersisted,
    loadFromStorage,
    persistenceError,
    recovery,
    discardRecoveryAndUseCurrent,
  };
}
