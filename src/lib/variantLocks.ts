import type { ModuleId, ModuleState } from '@/types/galazar';

export function enforceVariantLocks(
  current: Record<ModuleId, ModuleState>,
  candidate: Record<ModuleId, ModuleState>,
  isVariant: boolean,
  allowedLockedModule: ModuleId | null = null
): Record<ModuleId, ModuleState> {
  if (!isVariant) return candidate;

  const protectedModules = { ...candidate };
  for (const id of Object.keys(current) as ModuleId[]) {
    if (current[id].status === 'locked' && id !== allowedLockedModule) {
      protectedModules[id] = current[id];
    }
  }

  const unchanged = (Object.keys(current) as ModuleId[]).every((id) => protectedModules[id] === current[id]);
  return unchanged ? current : protectedModules;
}
