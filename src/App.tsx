import { useCallback, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PromptBuilder } from '@/sections/PromptBuilder';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { SavedBuildsPage } from '@/pages/SavedBuildsPage';
import { DNALibraryPage } from '@/pages/DNALibraryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ArchitecturePage } from '@/pages/ArchitecturePage';
import { VisualPipelinePage } from '@/pages/VisualPipelinePage';
import { VariantsPage } from '@/pages/VariantsPage';
import { EngineLibraryPage } from '@/pages/EngineLibraryPage';
import { prepareActiveBuild, useGalazarStorage } from '@/hooks/useGalazarStorage';
import {
  deleteSavedBuild,
  loadSavedBuild,
  renameSavedBuild,
} from '@/lib/savedBuilds';
import {
  assignBuildToProject,
  createProject,
  deleteProject,
  removeBuildFromAllProjects,
  removeBuildFromProject,
  renameProject,
} from '@/lib/projects';
import { createVariant, deleteVariantFromState, renameVariant, updateVariantFromBuild, variantToBuild } from '@/lib/variants';
import { applyDNAEntryToBuild, createDNAEntry, deleteDNAEntry, renameDNAEntry } from '@/lib/dnaLibrary';
import { assembleFullPrompt } from '@/lib/promptAssembly';
import { saveActiveBuildState } from '@/lib/statePersistence';
import { addEngineToState, applyEngineToBuild, deleteEngine, duplicateEngine, renameEngine } from '@/lib/engines';
import { createBackup, downloadBackup, downloadTextFile } from '@/lib/backups';
import {
  type ViewId,
  type Build,
  type Variant,
  type DNALibraryEntry,
  type ModuleState,
  type HistoryState,
  type Engine,
  type ModuleId,
  createDefaultAppState,
} from '@/types/galazar';

export default function App() {
  const { state, setState, saveToStorage, replaceStatePersisted, persistenceError, recovery, discardRecoveryAndUseCurrent } = useGalazarStorage();
  const [saveFlash, setSaveFlash] = useState(false);
  const [builderSession, setBuilderSession] = useState(0);
  const [builderHistorySession, setBuilderHistorySession] = useState<
    { history: HistoryState[]; historyIndex: number } | undefined
  >(undefined);
  const [variantStatus, setVariantStatus] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<string | null>(null);

  const handleBuilderHistoryChange = useCallback((history: HistoryState[], historyIndex: number) => {
    setBuilderHistorySession({ history, historyIndex });
  }, []);

  const handleChangeView = useCallback(
    (view: ViewId) => {
      setState((prev) => ({
        ...prev,
        activeView: view,
      }));
    },
    [setState]
  );

  const handleUpdateBuild = useCallback(
    (build: Build) => {
      setState((prev) => ({
        ...prev,
        currentBuild: build,
        variants: prev.activeVariantId
          ? updateVariantFromBuild(prev.variants, prev.activeVariantId, build)
          : prev.variants,
        hasUnsavedChanges: true,
      }));
    },
    [setState]
  );

  const handleSaveBuild = useCallback((activeBuild: Build) => {
    const savedAt = new Date().toISOString();
    if (saveToStorage((prev) => saveActiveBuildState(prev, activeBuild, savedAt))) {
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1200);
    }
  }, [saveToStorage]);

  const handleLoadSavedBuild = useCallback(
    (build: Build) => {
      setState((prev) => ({
        ...prev,
        activeView: 'prompt-builder',
        currentBuild: prepareActiveBuild(loadSavedBuild(build)),
        activeVariantId: null,
        hasUnsavedChanges: false,
      }));
      setBuilderSession((session) => session + 1);
      setBuilderHistorySession(undefined);
    },
    [setState]
  );

  const handleCreateVariant = useCallback((source: Build) => {
    setVariantStatus(null);
    const createdAt = new Date().toISOString();
    const id = `variant_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setState((prev) => {
      const variant = createVariant(source, `${source.name} Variant ${prev.variants.length + 1}`, id, createdAt);
      return {
        ...prev,
        variants: [variant, ...prev.variants],
        activeVariantId: variant.id,
        activeView: 'prompt-builder',
        currentBuild: variantToBuild(variant),
        hasUnsavedChanges: false,
      };
    });
    setBuilderSession((session) => session + 1);
    setBuilderHistorySession(undefined);
  }, [setState]);

  const handleOpenVariant = useCallback((variant: Variant) => {
    setVariantStatus(null);
    setState((prev) => ({
      ...prev,
      activeView: 'prompt-builder',
      activeVariantId: variant.id,
      currentBuild: prepareActiveBuild(variantToBuild(variant)),
      hasUnsavedChanges: false,
    }));
    setBuilderSession((session) => session + 1);
    setBuilderHistorySession(undefined);
  }, [setState]);

  const handleRenameVariant = useCallback((variantId: string, name: string) => {
    const nextName = name.trim();
    if (!nextName) return;
    setState((prev) => ({
      ...prev,
      variants: renameVariant(prev.variants, variantId, nextName),
      currentBuild: prev.activeVariantId === variantId ? { ...prev.currentBuild, name: nextName } : prev.currentBuild,
    }));
  }, [setState]);

  const handleDeleteVariant = useCallback((variantId: string) => {
    if (state.activeVariantId === variantId) {
      setVariantStatus('Variant deleted. This build is now independent.');
    } else {
      setVariantStatus(null);
    }
    setState((prev) => deleteVariantFromState(prev, variantId));
  }, [setState, state.activeVariantId]);

  const handleCreateDNAEntry = useCallback((name: string, module: ModuleState) => {
    const entry = createDNAEntry(module, name, `dna_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, new Date().toISOString());
    setState((prev) => ({ ...prev, dnaLibrary: [entry, ...prev.dnaLibrary] }));
  }, [setState]);

  const handleCreateEngine = useCallback((engine: Engine) => {
    setState((prev) => addEngineToState(prev, engine));
    setEngineStatus(`Engine created: ${engine.name}`);
    setTimeout(() => setEngineStatus(null), 1800);
  }, [setState]);

  const handleRenameEngine = useCallback((engineId: string, name: string) => {
    setState((prev) => ({ ...prev, engines: renameEngine(prev.engines, engineId, name, new Date().toISOString()) }));
  }, [setState]);

  const handleDuplicateEngine = useCallback((engine: Engine) => {
    const timestamp = new Date().toISOString();
    const duplicate = duplicateEngine(engine, `engine_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, timestamp);
    setState((prev) => ({ ...prev, engines: [duplicate, ...prev.engines] }));
  }, [setState]);

  const handleDeleteEngine = useCallback((engineId: string) => {
    setState((prev) => ({ ...prev, engines: deleteEngine(prev.engines, engineId) }));
  }, [setState]);

  const handleApplyEngine = useCallback((engine: Engine, selectedModuleIds: ModuleId[]) => {
    const before = state.currentBuild;
    const result = applyEngineToBuild(before, engine, selectedModuleIds, state.activeVariantId !== null);
    if (result.appliedModuleIds.length === 0) return;
    const history: HistoryState[] = [
      { modules: before.modules, prompt: before.prompt, timestamp: Date.now() },
      { modules: result.build.modules, prompt: result.build.prompt, timestamp: Date.now() },
    ];
    setState((prev) => ({
      ...prev,
      activeView: 'prompt-builder',
      currentBuild: result.build,
      variants: prev.activeVariantId
        ? updateVariantFromBuild(prev.variants, prev.activeVariantId, result.build)
        : prev.variants,
      hasUnsavedChanges: true,
    }));
    setBuilderHistorySession({ history, historyIndex: history.length - 1 });
    setBuilderSession((session) => session + 1);
    const blocked = result.blockedModuleIds.length ? ` · ${result.blockedModuleIds.length} blocked` : '';
    setEngineStatus(`Engine applied: ${engine.name} · ${result.appliedModuleIds.length} applied${blocked}`);
    setTimeout(() => setEngineStatus(null), 2200);
  }, [setState, state.activeVariantId, state.currentBuild]);

  const handleApplyDNAEntry = useCallback((entry: DNALibraryEntry) => {
    const before = state.currentBuild;
    const result = applyDNAEntryToBuild(before, entry, state.activeVariantId !== null, assembleFullPrompt);
    const history: HistoryState[] = result.applied
      ? [
          { modules: before.modules, prompt: before.prompt, timestamp: Date.now() },
          { modules: result.build.modules, prompt: result.build.prompt, timestamp: Date.now() },
        ]
      : [{ modules: before.modules, prompt: before.prompt, timestamp: Date.now() }];
    setState((prev) => ({
      ...prev,
      activeView: 'prompt-builder',
      currentBuild: result.build,
      variants: result.applied && prev.activeVariantId
        ? updateVariantFromBuild(prev.variants, prev.activeVariantId, result.build)
        : prev.variants,
      hasUnsavedChanges: result.applied ? true : prev.hasUnsavedChanges,
    }));
    setBuilderHistorySession({ history, historyIndex: history.length - 1 });
    setBuilderSession((session) => session + 1);
  }, [setState, state.activeVariantId, state.currentBuild]);

  const handleRenameDNAEntry = useCallback((entryId: string, name: string) => {
    setState((prev) => ({ ...prev, dnaLibrary: renameDNAEntry(prev.dnaLibrary, entryId, name) }));
  }, [setState]);

  const handleDeleteDNAEntry = useCallback((entryId: string) => {
    setState((prev) => ({ ...prev, dnaLibrary: deleteDNAEntry(prev.dnaLibrary, entryId) }));
  }, [setState]);

  const handleDeleteSavedBuild = useCallback(
    (buildId: string) => {
      setState((prev) => ({
        ...prev,
        savedBuilds: deleteSavedBuild(prev.savedBuilds, buildId),
        projects: removeBuildFromAllProjects(prev.projects, buildId),
      }));
    },
    [setState]
  );

  const handleRenameSavedBuild = useCallback(
    (buildId: string, name: string) => {
      setState((prev) => ({
        ...prev,
        savedBuilds: renameSavedBuild(prev.savedBuilds, buildId, name, new Date().toISOString()),
      }));
    },
    [setState]
  );

  const handleCreateProject = useCallback(
    (name: string) => {
      const timestamp = new Date().toISOString();
      const newProject = createProject(name, `proj_${Date.now()}`, timestamp);
      setState((prev) => ({
        ...prev,
        projects: [newProject, ...prev.projects],
      }));
    },
    [setState]
  );

  const handleRenameProject = useCallback((projectId: string, name: string) => {
    setState((prev) => ({ ...prev, projects: renameProject(prev.projects, projectId, name, new Date().toISOString()) }));
  }, [setState]);

  const handleDeleteProject = useCallback((projectId: string) => {
    setState((prev) => ({ ...prev, projects: deleteProject(prev.projects, projectId) }));
  }, [setState]);

  const handleAssignBuildToProject = useCallback((buildId: string, projectId: string) => {
    setState((prev) => ({ ...prev, projects: assignBuildToProject(prev.projects, buildId, projectId, new Date().toISOString()) }));
  }, [setState]);

  const handleRemoveBuildFromProject = useCallback((projectId: string, buildId: string) => {
    setState((prev) => ({ ...prev, projects: removeBuildFromProject(prev.projects, projectId, buildId, new Date().toISOString()) }));
  }, [setState]);

  const handleClearAllData = useCallback(() => {
    replaceStatePersisted(createDefaultAppState());
    setBuilderHistorySession(undefined);
    setBuilderSession((session) => session + 1);
  }, [replaceStatePersisted]);

  const handleExportBackup = useCallback(() => downloadBackup(createBackup(state)), [state]);

  const handleRestoreBackup = useCallback((restoredState: typeof state): boolean => {
    if (!replaceStatePersisted({ ...restoredState, activeView: 'prompt-builder' })) return false;
    setBuilderHistorySession(undefined);
    setBuilderSession((session) => session + 1);
    return true;
  }, [replaceStatePersisted]);

  const renderView = () => {
    switch (state.activeView) {
      case 'prompt-builder':
        return (
          <PromptBuilder
            key={builderSession}
            initialBuild={state.currentBuild}
            onUpdateBuild={handleUpdateBuild}
            onSaveBuild={handleSaveBuild}
            onCreateVariant={handleCreateVariant}
            onCreateEngine={handleCreateEngine}
            isVariant={state.activeVariantId !== null}
            onSaveDNAEntry={handleCreateDNAEntry}
            initialHistory={builderHistorySession?.history}
            initialHistoryIndex={builderHistorySession?.historyIndex}
            onHistoryChange={handleBuilderHistoryChange}
            hasUnsavedChanges={state.hasUnsavedChanges}
            lastSavedAt={state.lastSavedAt}
          />
        );
      case 'visual-pipeline':
        return <VisualPipelinePage />;
      case 'projects':
        return (
          <ProjectsPage
            projects={state.projects}
            savedBuilds={state.savedBuilds}
            hasUnsavedActiveBuild={state.hasUnsavedChanges}
            onCreateProject={handleCreateProject}
            onRenameProject={handleRenameProject}
            onDeleteProject={handleDeleteProject}
            onAssignBuild={handleAssignBuildToProject}
            onRemoveBuild={handleRemoveBuildFromProject}
            onOpenBuild={handleLoadSavedBuild}
          />
        );
      case 'saved-builds':
        return (
          <SavedBuildsPage
            builds={state.savedBuilds}
            hasUnsavedActiveBuild={state.hasUnsavedChanges}
            onLoadBuild={handleLoadSavedBuild}
            onDeleteBuild={handleDeleteSavedBuild}
            onRenameBuild={handleRenameSavedBuild}
          />
        );
      case 'variants':
        return (
          <VariantsPage
            variants={state.variants}
            activeVariantId={state.activeVariantId}
            hasUnsavedActiveBuild={state.hasUnsavedChanges}
            onOpenVariant={handleOpenVariant}
            onRenameVariant={handleRenameVariant}
            onDeleteVariant={handleDeleteVariant}
          />
        );
      case 'dna-library':
        return <DNALibraryPage entries={state.dnaLibrary} onApplyEntry={handleApplyDNAEntry} onRenameEntry={handleRenameDNAEntry} onDeleteEntry={handleDeleteDNAEntry} />;
      case 'engine-library':
        return <EngineLibraryPage engines={state.engines} activeBuild={state.currentBuild} isVariant={state.activeVariantId !== null} onRenameEngine={handleRenameEngine} onDuplicateEngine={handleDuplicateEngine} onDeleteEngine={handleDeleteEngine} onApplyEngine={handleApplyEngine} />;
      case 'settings':
        return <SettingsPage onClearAllData={handleClearAllData} onExportBackup={handleExportBackup} onRestoreBackup={handleRestoreBackup} />;
      case 'architecture':
        return <ArchitecturePage />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar activeView={state.activeView} onChangeView={handleChangeView} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="shrink-0 h-14 border-b border-border/40 flex items-center justify-between px-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            {state.currentBuild.name}
          </h2>
          <div className="flex items-center gap-3">
            {saveFlash && (
              <span className="text-[11px] text-emerald-400 animate-pulse">
                Build Saved
              </span>
            )}
            {variantStatus && (
              <span className="text-[11px] text-muted-foreground">{variantStatus}</span>
            )}
            {engineStatus && <span className="text-[11px] text-emerald-400">{engineStatus}</span>}
            <span className="text-[10px] text-muted-foreground/50">
              {state.hasUnsavedChanges ? '●' : '○'}
            </span>
          </div>
        </header>

        {(persistenceError || recovery) && <div className="shrink-0 border-b border-amber-400/30 bg-amber-400/10 px-6 py-2 text-xs text-amber-200 flex items-center justify-between gap-4"><span>{recovery?.message ?? persistenceError}</span><div className="flex gap-2">{recovery?.rawPayload && <button className="underline" onClick={() => downloadTextFile(recovery.rawPayload!, 'galazar-recovery-payload.json', 'text/plain')}>Download raw payload</button>}{recovery && <button className="underline" onClick={discardRecoveryAndUseCurrent}>Use fresh workspace</button>}{!recovery && <button className="underline" onClick={handleExportBackup}>Export backup</button>}</div></div>}

        {/* Content */}
        <div className="flex-1 overflow-hidden px-6 py-5">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
