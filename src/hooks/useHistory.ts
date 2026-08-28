import { useCallback, useEffect, useRef, useState } from 'react';
import { type HistoryState, HISTORY_LIMIT, type ModuleId, type ModuleState } from '@/types/galazar';
import { appendHistoryTransition } from '@/lib/historyTransitions';

const HISTORY_GROUP_DELAY_MS = 300;

export interface HistoryAPI {
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  pushState: (modules: Record<ModuleId, ModuleState>, prompt: string) => void;
  pushGroupedState: (modules: Record<ModuleId, ModuleState>, prompt: string) => void;
  cancelPendingGroup: () => void;
  pushTransition: (before: HistoryState, after: HistoryState) => void;
  undo: () => HistoryState | null;
  redo: () => HistoryState | null;
  resetHistory: (initial: HistoryState) => void;
}

export function useHistory(
  initialHistory: HistoryState[],
  initialIndex: number,
  onChange?: (history: HistoryState[], historyIndex: number) => void
): HistoryAPI {
  const [history, setHistory] = useState<HistoryState[]>(initialHistory);
  const [historyIndex, setHistoryIndex] = useState(initialIndex);
  const historyRef = useRef(initialHistory);
  const historyIndexRef = useRef(initialIndex);
  const groupOpenRef = useRef(false);
  const groupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback((nextHistory: HistoryState[], nextIndex: number) => {
    historyRef.current = nextHistory;
    historyIndexRef.current = nextIndex;
    setHistory(nextHistory);
    setHistoryIndex(nextIndex);
  }, []);

  const cancelPendingGroup = useCallback(() => {
    if (groupTimerRef.current) {
      clearTimeout(groupTimerRef.current);
      groupTimerRef.current = null;
    }
    groupOpenRef.current = false;
  }, []);

  const scheduleGroupClose = useCallback(() => {
    if (groupTimerRef.current) clearTimeout(groupTimerRef.current);
    groupTimerRef.current = setTimeout(() => {
      groupTimerRef.current = null;
      groupOpenRef.current = false;
    }, HISTORY_GROUP_DELAY_MS);
  }, []);

  const pushState = useCallback((modules: Record<ModuleId, ModuleState>, prompt: string) => {
    cancelPendingGroup();
    const base = historyRef.current.slice(0, historyIndexRef.current + 1);
    const next = [...base, { modules, prompt, timestamp: Date.now() }].slice(-HISTORY_LIMIT);
    commit(next, next.length - 1);
  }, [cancelPendingGroup, commit]);

  const pushGroupedState = useCallback((modules: Record<ModuleId, ModuleState>, prompt: string) => {
    const nextState = { modules, prompt, timestamp: Date.now() };
    const base = historyRef.current.slice(0, historyIndexRef.current + 1);
    const next = groupOpenRef.current
      ? [...base.slice(0, -1), nextState]
      : [...base, nextState].slice(-HISTORY_LIMIT);
    groupOpenRef.current = true;
    commit(next, next.length - 1);
    scheduleGroupClose();
  }, [commit, scheduleGroupClose]);

  const pushTransition = useCallback((before: HistoryState, after: HistoryState) => {
    cancelPendingGroup();
    const result = appendHistoryTransition(
      historyRef.current,
      historyIndexRef.current,
      before,
      after
    );
    commit(result.history, result.historyIndex);
  }, [cancelPendingGroup, commit]);

  const undo = useCallback((): HistoryState | null => {
    cancelPendingGroup();
    if (historyIndexRef.current <= 0) return null;
    const nextIndex = historyIndexRef.current - 1;
    commit(historyRef.current, nextIndex);
    return historyRef.current[nextIndex];
  }, [cancelPendingGroup, commit]);

  const redo = useCallback((): HistoryState | null => {
    cancelPendingGroup();
    if (historyIndexRef.current >= historyRef.current.length - 1) return null;
    const nextIndex = historyIndexRef.current + 1;
    commit(historyRef.current, nextIndex);
    return historyRef.current[nextIndex];
  }, [cancelPendingGroup, commit]);

  const resetHistory = useCallback((initial: HistoryState) => {
    cancelPendingGroup();
    commit([initial], 0);
  }, [cancelPendingGroup, commit]);

  useEffect(() => cancelPendingGroup, [cancelPendingGroup]);
  useEffect(() => {
    onChange?.(history, historyIndex);
  }, [history, historyIndex, onChange]);

  return {
    history,
    historyIndex,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    pushState,
    pushGroupedState,
    cancelPendingGroup,
    pushTransition,
    undo,
    redo,
    resetHistory,
  };
}
