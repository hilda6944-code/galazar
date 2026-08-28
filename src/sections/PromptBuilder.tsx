import { useState, useCallback, useEffect, useRef } from 'react';
import { ModuleCard } from '@/components/ModuleCard';
import { LivePrompt } from '@/components/LivePrompt';
import { PromptRegenerator } from '@/components/PromptRegenerator';
import { GlobalControls } from '@/components/GlobalControls';
import { assembleFullPrompt } from '@/lib/promptAssembly';
import {
  type ModuleId,
  type ModuleState,
  type Build,
  type IntentDNA,
  type WorldDNA,
  type AtmosphereDNA,
  type AnchorDNA,
  type SubjectDNA,
  type Element,
  type ColorDNA,
  type LightDNA,
  type CameraDNA,
  type FormatDNA,
  type StyleDNA,
  type MediumDNA,
  type FinishDNA,
  type HistoryState,
  type ExclusionDNA,
  createEmptyElement, createEmptyFinishDNA, createNewBuild,
  MODULE_ORDER, MODULE_LABELS,
} from '@/types/galazar';
import { useHistory } from '@/hooks/useHistory';
import { enforceVariantLocks } from '@/lib/variantLocks';
import { MODULE_NAVIGATION_TARGETS } from '@/lib/moduleNavigation';
import { moduleHasContent } from '@/lib/moduleContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EngineCreationDialog } from '@/components/EngineCreationDialog';
import type { Engine } from '@/types/galazar';

interface PromptBuilderProps {
  initialBuild: Build;
  onUpdateBuild: (build: Build) => void;
  onSaveBuild: (build: Build) => void;
  onCreateVariant: (build: Build) => void;
  onCreateEngine: (engine: Engine) => void;
  isVariant: boolean;
  onSaveDNAEntry: (name: string, module: ModuleState) => void;
  initialHistory?: HistoryState[];
  initialHistoryIndex?: number;
  onHistoryChange?: (history: HistoryState[], historyIndex: number) => void;
  hasUnsavedChanges: boolean;
  lastSavedAt: string | null;
}

export function PromptBuilder({
  initialBuild,
  onUpdateBuild,
  onSaveBuild,
  onCreateVariant,
  onCreateEngine,
  isVariant,
  onSaveDNAEntry,
  initialHistory,
  initialHistoryIndex,
  onHistoryChange,
  hasUnsavedChanges,
  lastSavedAt,
}: PromptBuilderProps) {
  const [build, setBuild] = useState<Build>(initialBuild);
  const [expandedModules, setExpandedModules] = useState<Set<ModuleId>>(new Set());
  const [libraryTarget, setLibraryTarget] = useState<ModuleState | null>(null);
  const [libraryName, setLibraryName] = useState('');
  const [engineDialogOpen, setEngineDialogOpen] = useState(false);

  // Initialize history from the build
  const { canUndo, canRedo, pushGroupedState, cancelPendingGroup, pushTransition, undo, redo } = useHistory(

  // Initialize history from the build
    initialHistory ?? [
      {
        modules: initialBuild.modules,
        prompt: initialBuild.prompt,
        timestamp: 0,
      },
    ],
    initialHistoryIndex ?? (initialHistory ? initialHistory.length - 1 : 0),
    onHistoryChange
  );

  const isFirstRender = useRef(true);
  const updateModules = useCallback(
    (
      updater: (prev: Record<ModuleId, ModuleState>) => Record<ModuleId, ModuleState>,
      skipHistory = false,
      allowedLockedModule: ModuleId | null = null
    ) => {
      setBuild((prev) => {
        const nextModules = enforceVariantLocks(prev.modules, updater(prev.modules), isVariant, allowedLockedModule);
        if (nextModules === prev.modules) return prev;
        const nextPrompt = assembleFullPrompt(nextModules);
        const nextBuild = {
          ...prev,
          modules: nextModules,
          prompt: nextPrompt,
          updatedAt: new Date().toISOString(),
        };

        if (!skipHistory) {
          pushGroupedState(nextModules, nextPrompt);
        }

        return nextBuild;
      });
    },
    [isVariant, pushGroupedState]
  );

  // Sync build up to parent
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onUpdateBuild(build);
  }, [build, onUpdateBuild]);

  // Handle undo
  const handleUndo = useCallback(() => {
    const restored = undo();
    if (restored) {
      setBuild((prev) => ({
        ...prev,
        modules: restored.modules,
        prompt: restored.prompt,
      }));
    }
  }, [undo]);

  // Handle redo
  const handleRedo = useCallback(() => {
    const restored = redo();
    if (restored) {
      setBuild((prev) => ({
        ...prev,
        modules: restored.modules,
        prompt: restored.prompt,
      }));
    }
  }, [redo]);

  // Handle clear build
  const handleClearBuild = useCallback(() => {
    cancelPendingGroup();

    const freshBuild = createNewBuild();
    pushTransition(
      {
        modules: build.modules,
        prompt: build.prompt,
        timestamp: Date.now(),
      },
      {
        modules: freshBuild.modules,
        prompt: freshBuild.prompt,
        timestamp: Date.now(),
      }
    );
    setBuild(freshBuild);
    setExpandedModules(new Set());
  }, [build, cancelPendingGroup, pushTransition]);

  const navigateToModule = useCallback((id: ModuleId) => {
    // Expand the target module if collapsed
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    // Scroll into view on next tick so the DOM has updated
    requestAnimationFrame(() => {
      const el = document.getElementById(`module-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  const toggleExpand = useCallback((id: ModuleId) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSkip = useCallback(
    (id: ModuleId) => {
      updateModules((prev) => ({
        ...prev,
        [id]: { ...prev[id], skipped: !prev[id].skipped },
      }));
    },
    [updateModules]
  );

  const toggleLock = useCallback(
    (id: ModuleId) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextStatus = mod.status === 'locked' ? 'active' : 'locked';
        return { ...prev, [id]: { ...mod, status: nextStatus } };
      }, false, id);
    },
    [updateModules]
  );

  const handleCustomTextChange = useCallback(
    (id: ModuleId, text: string) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextCustomText = text;
        const nextMod = { ...mod, customText: nextCustomText };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  const handleSubjectDNAChange = useCallback(
    (id: ModuleId, dna: SubjectDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, subjectDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  // ─── Phase 4: Color DNA ───

  const handleColorDNAChange = useCallback(
    (id: ModuleId, dna: ColorDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, colorDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  // ─── Phase 5: Light DNA ───

  const handleLightDNAChange = useCallback(
    (id: ModuleId, dna: LightDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, lightDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  // ─── Phase 6: Camera DNA ───

  const handleCameraDNAChange = useCallback(
    (id: ModuleId, dna: CameraDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, cameraDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  const handleIntentDNAChange = useCallback(
    (id: ModuleId, dna: IntentDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, intentDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  const handleWorldDNAChange = useCallback(
    (id: ModuleId, dna: WorldDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, worldDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  const handleAtmosphereDNAChange = useCallback(
    (id: ModuleId, dna: AtmosphereDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, atmosphereDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  const handleAnchorDNAChange = useCallback(
    (id: ModuleId, dna: AnchorDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, anchorDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  const handleFormatDNAChange = useCallback((id: ModuleId, dna: FormatDNA) => {
    updateModules((prev) => {
      const mod = prev[id];
      const nextMod = { ...mod, formatDNA: dna };
      return { ...prev, [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' } };
    });
  }, [updateModules]);

  // ─── Phase 7: Style DNA ───

  const handleStyleDNAChange = useCallback(
    (id: ModuleId, dna: StyleDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, styleDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  // ─── Phase 7: Medium DNA ───

  const handleMediumDNAChange = useCallback(
    (id: ModuleId, dna: MediumDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, mediumDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  // ─── Phase 8: Finish DNA ───

  const handleFinishDNAChange = useCallback(
    (id: ModuleId, dna: FinishDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const mergedDNA = { ...(mod.finishDNA ?? createEmptyFinishDNA()), ...dna };
        const nextMod = { ...mod, finishDNA: mergedDNA };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  const handleExclusionDNAChange = useCallback((id: ModuleId, dna: ExclusionDNA) => {
    updateModules((prev) => {
      const mod = prev[id];
      const nextMod = { ...mod, exclusionDNA: dna };
      return { ...prev, [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' } };
    });
  }, [updateModules]);

  // ─── Phase 3: Element CRUD ───


  // ─── Phase 3: Element CRUD ───

  const handleAddElement = useCallback(() => {
    updateModules((prev) => {
      const mod = prev.detail;
      const newElement = createEmptyElement();
      const nextElements = [...(mod.elements ?? []), newElement];
      const nextMod = { ...mod, elements: nextElements };
      return {
        ...prev,
        detail: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
      };
    });
  }, [updateModules]);

  const handleRemoveElement = useCallback(
    (elementId: string) => {
      updateModules((prev) => {
        const mod = prev.detail;
        const nextElements = (mod.elements ?? []).filter((e) => e.id !== elementId);
        const nextMod = { ...mod, elements: nextElements };
        return {
          ...prev,
          detail: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  const handleUpdateElement = useCallback(
    (updated: Element) => {
      updateModules((prev) => {
        const mod = prev.detail;
        const nextElements = (mod.elements ?? []).map((e) => (e.id === updated.id ? updated : e));
        const nextMod = { ...mod, elements: nextElements };
        return {
          ...prev,
          detail: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  const handleToggleElementActive = useCallback(
    (elementId: string) => {
      updateModules((prev) => {
        const mod = prev.detail;
        const nextElements = (mod.elements ?? []).map((e) =>
          e.id === elementId ? { ...e, active: !e.active } : e
        );
        return { ...prev, detail: { ...mod, elements: nextElements } };
      });
    },
    [updateModules]
  );

  const handleToggleElementLock = useCallback(
    (elementId: string) => {
      updateModules((prev) => {
        const mod = prev.detail;
        const nextElements = (mod.elements ?? []).map((e) =>
          e.id === elementId ? { ...e, locked: !e.locked } : e
        );
        return { ...prev, detail: { ...mod, elements: nextElements } };
      });
    },
    [updateModules]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="shrink-0 pb-4">
        <GlobalControls
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={() => onSaveBuild(build)}
          onCreateVariant={() => onCreateVariant(build)}
          onCreateEngine={() => setEngineDialogOpen(true)}
          onClear={handleClearBuild}
          prompt={build.prompt}
          hasUnsavedChanges={hasUnsavedChanges}
          lastSavedAt={lastSavedAt}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-6">
        {/* Module Navigation */}
        <div className="sticky top-0 z-10 py-2 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div className="flex flex-wrap gap-1.5">
            {MODULE_NAVIGATION_TARGETS.map((t) => {
              const isExpanded = expandedModules.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => navigateToModule(t.id)}
                  title={t.fullLabel}
                  aria-label={`Go to ${t.fullLabel}`}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    isExpanded
                      ? 'bg-primary/15 text-primary hover:bg-primary/25'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modules */}
        <div className="space-y-2">
          {MODULE_ORDER.map((id) => (
            <ModuleCard
              key={id}
              moduleState={build.modules[id]}
              variantEditingLocked={isVariant && build.modules[id].status === 'locked'}
              isExpanded={expandedModules.has(id)}
              onToggleExpand={() => toggleExpand(id)}
              onToggleSkip={() => toggleSkip(id)}
              onToggleLock={() => toggleLock(id)}
              onSaveToLibrary={() => {
                setLibraryTarget(build.modules[id]);
                setLibraryName(`${MODULE_LABELS[id]} DNA`);
              }}
              onCustomTextChange={(text) => handleCustomTextChange(id, text)}
              onIntentDNAChange={id === 'intent' ? (dna) => handleIntentDNAChange(id, dna) : undefined}
              onWorldDNAChange={id === 'world' ? (dna) => handleWorldDNAChange(id, dna) : undefined}
              onAtmosphereDNAChange={id === 'atmosphere' ? (dna) => handleAtmosphereDNAChange(id, dna) : undefined}
              onAnchorDNAChange={id === 'anchor' ? (dna) => handleAnchorDNAChange(id, dna) : undefined}
              onSubjectDNAChange={id === 'subject' ? (dna) => handleSubjectDNAChange(id, dna) : undefined}
              onColorDNAChange={id === 'color' ? (dna) => handleColorDNAChange(id, dna) : undefined}
              onLightDNAChange={id === 'light' ? (dna) => handleLightDNAChange(id, dna) : undefined}
              onCameraDNAChange={id === 'camera' ? (dna) => handleCameraDNAChange(id, dna) : undefined}
              onFormatDNAChange={id === 'format' ? (dna) => handleFormatDNAChange(id, dna) : undefined}
              onStyleDNAChange={id === 'style' ? (dna) => handleStyleDNAChange(id, dna) : undefined}
              onMediumDNAChange={id === 'medium' ? (dna) => handleMediumDNAChange(id, dna) : undefined}
              onFinishDNAChange={id === 'finish' ? (dna) => handleFinishDNAChange(id, dna) : undefined}
              onExclusionDNAChange={id === 'exclusions' ? (dna) => handleExclusionDNAChange(id, dna) : undefined}
              // Phase 3: Element system for Detail
              onAddElement={id === 'detail' ? handleAddElement : undefined}
              onRemoveElement={id === 'detail' ? handleRemoveElement : undefined}
              onUpdateElement={id === 'detail' ? handleUpdateElement : undefined}
              onToggleElementActive={id === 'detail' ? handleToggleElementActive : undefined}
              onToggleElementLock={id === 'detail' ? handleToggleElementLock : undefined}
            />
          ))}
        </div>

        {/* Live Prompt */}
        <LivePrompt prompt={build.prompt} />
        <PromptRegenerator sourcePrompt={build.prompt} />
      </div>

      {engineDialogOpen && (
        <EngineCreationDialog build={build} onClose={() => setEngineDialogOpen(false)} onCreate={onCreateEngine} />
      )}

      <Dialog open={libraryTarget !== null} onOpenChange={(open) => !open && setLibraryTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Save DNA Configuration</DialogTitle><DialogDescription>Save an independent copy of this module for reuse.</DialogDescription></DialogHeader>
          <Input value={libraryName} onChange={(event) => setLibraryName(event.target.value)} autoFocus />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setLibraryTarget(null)}>Cancel</Button>
            <Button size="sm" disabled={!libraryName.trim()} onClick={() => { if (libraryTarget) onSaveDNAEntry(libraryName, libraryTarget); setLibraryTarget(null); }}>Save DNA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
