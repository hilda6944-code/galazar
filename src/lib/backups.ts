import { normalizeAppState } from '@/lib/appStateNormalization';
import { createDefaultAppState, type AppState } from '@/types/galazar';

export const BACKUP_FORMAT = 'GALAZAR_BACKUP';
export const BACKUP_SCHEMA_VERSION = 1;
export const GALAZAR_VERSION = '1.0.0';

export interface GalazarBackup {
  format: typeof BACKUP_FORMAT;
  backupSchemaVersion: typeof BACKUP_SCHEMA_VERSION;
  galazarVersion: string;
  exportedAt: string;
  data: Pick<AppState, 'currentBuild' | 'savedBuilds' | 'projects' | 'variants' | 'activeVariantId' | 'dnaLibrary' | 'engines' | 'hasUnsavedChanges' | 'lastSavedAt'>;
}

export interface RestorePreview {
  backup: GalazarBackup;
  state: AppState;
  warnings: string[];
  summary: {
    savedBuilds: number;
    projects: number;
    variants: number;
    dnaEntries: number;
    engines: number;
  };
}

export function createBackup(state: AppState, exportedAt = new Date().toISOString()): GalazarBackup {
  return structuredClone({
    format: BACKUP_FORMAT,
    backupSchemaVersion: BACKUP_SCHEMA_VERSION,
    galazarVersion: GALAZAR_VERSION,
    exportedAt,
    data: {
      currentBuild: state.currentBuild,
      savedBuilds: state.savedBuilds,
      projects: state.projects,
      variants: state.variants,
      activeVariantId: state.activeVariantId,
      dnaLibrary: state.dnaLibrary,
      engines: state.engines,
      hasUnsavedChanges: state.hasUnsavedChanges,
      lastSavedAt: state.lastSavedAt,
    },
  });
}

export function parseBackup(text: string): RestorePreview {
  const parsed = JSON.parse(text) as Partial<GalazarBackup>;
  if (!parsed || parsed.format !== BACKUP_FORMAT) throw new Error('This is not a GALAZAR backup file.');
  if (parsed.backupSchemaVersion !== BACKUP_SCHEMA_VERSION) throw new Error('This backup schema is not supported by GALAZAR 1.0.');
  if (!parsed.data || typeof parsed.data !== 'object') throw new Error('The backup does not contain workspace data.');
  const normalized = normalizeAppState({ ...createDefaultAppState(), ...parsed.data, activeView: 'prompt-builder' });
  const backup = parsed as GalazarBackup;
  return {
    backup,
    state: normalized.state,
    warnings: normalized.warnings,
    summary: {
      savedBuilds: normalized.state.savedBuilds.length,
      projects: normalized.state.projects.length,
      variants: normalized.state.variants.length,
      dnaEntries: normalized.state.dnaLibrary.length,
      engines: normalized.state.engines.length,
    },
  };
}

export function backupFileName(exportedAt: string): string {
  const date = new Date(exportedAt);
  const safe = Number.isFinite(date.getTime()) ? date.toISOString() : new Date(0).toISOString();
  return `galazar-backup-${safe.slice(0, 16).replace('T', '-').replace(':', '')}.json`;
}

export function downloadTextFile(contents: string, fileName: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadBackup(backup: GalazarBackup): void {
  downloadTextFile(JSON.stringify(backup, null, 2), backupFileName(backup.exportedAt));
}
