import type { HistoryState } from '@/types/galazar';

const HISTORY_LIMIT = 25;

export interface HistoryTransitionResult {
  history: HistoryState[];
  historyIndex: number;
}

export function appendHistoryTransition(
  history: HistoryState[],
  historyIndex: number,
  before: HistoryState,
  after: HistoryState
): HistoryTransitionResult {
  const base = history.slice(0, historyIndex + 1);
  const current = base[base.length - 1];
  const includesBefore = current?.modules === before.modules && current.prompt === before.prompt;
  const next = [...base, ...(includesBefore ? [] : [before]), after];
  const limited = next.slice(-HISTORY_LIMIT);

  return {
    history: limited,
    historyIndex: limited.length - 1,
  };
}
