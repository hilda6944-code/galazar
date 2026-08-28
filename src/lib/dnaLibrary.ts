import { enforceVariantLocks } from './variantLocks.ts';
import { MODULE_LABELS, type Build, type DNALibraryEntry, type ModuleId, type ModuleState } from '../types/galazar.ts';

export function createDNAEntry(module: ModuleState, name: string, id: string, createdAt: string): DNALibraryEntry {
  return {
    id,
    name: name.trim(),
    category: MODULE_LABELS[module.id],
    content: module.customText.trim() || module.value || `Saved ${MODULE_LABELS[module.id]} configuration`,
    createdAt,
    moduleId: module.id,
    moduleState: structuredClone(module),
  };
}

export function renameDNAEntry(entries: DNALibraryEntry[], entryId: string, name: string): DNALibraryEntry[] {
  const nextName = name.trim();
  if (!nextName) return entries;
  return entries.map((entry) => entry.id === entryId ? { ...entry, name: nextName } : entry);
}

export function deleteDNAEntry(entries: DNALibraryEntry[], entryId: string): DNALibraryEntry[] {
  return entries.filter((entry) => entry.id !== entryId);
}

export function filterDNAEntries(entries: DNALibraryEntry[], query: string): DNALibraryEntry[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return entries;
  return entries.filter((entry) => `${entry.name} ${entry.category} ${entry.content}`.toLocaleLowerCase().includes(normalized));
}

export function applyDNAEntryToBuild(
  build: Build,
  entry: DNALibraryEntry,
  isVariant: boolean,
  assemblePrompt: (modules: Record<ModuleId, ModuleState>) => string
): { build: Build; applied: boolean } {
  if (!entry.moduleId || !entry.moduleState || entry.moduleState.id !== entry.moduleId) {
    return { build, applied: false };
  }

  const candidateModules = { ...build.modules, [entry.moduleId]: structuredClone(entry.moduleState) };
  const modules = enforceVariantLocks(build.modules, candidateModules, isVariant);
  if (modules === build.modules) return { build, applied: false };

  return {
    applied: true,
    build: {
      ...build,
      modules,
      prompt: assemblePrompt(modules),
      updatedAt: new Date().toISOString(),
    },
  };
}
