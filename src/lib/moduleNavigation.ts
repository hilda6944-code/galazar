import { MODULE_LABELS, MODULE_ORDER, type ModuleId } from '../types/galazar.ts';

const COMPACT_LABELS: Partial<Record<ModuleId, string>> = {
  camera: 'Camera',
};

export interface ModuleNavigationTarget {
  id: ModuleId;
  label: string;
  fullLabel: string;
}

export const MODULE_NAVIGATION_TARGETS: ModuleNavigationTarget[] = MODULE_ORDER.map((id) => ({
  id,
  label: COMPACT_LABELS[id] ?? MODULE_LABELS[id],
  fullLabel: MODULE_LABELS[id],
}));
