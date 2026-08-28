import { useState } from 'react';
import { Copy, Edit3, Eye, Play, Search, Settings2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { searchEngines } from '@/lib/engines';
import { MODULE_LABELS, type Build, type Engine, type ModuleId } from '@/types/galazar';
import { EngineApplyDialog } from '@/components/EngineApplyDialog';

interface EngineLibraryPageProps {
  engines: Engine[];
  activeBuild: Build;
  isVariant: boolean;
  onRenameEngine: (engineId: string, name: string) => void;
  onDuplicateEngine: (engine: Engine) => void;
  onDeleteEngine: (engineId: string) => void;
  onApplyEngine: (engine: Engine, selectedModuleIds: ModuleId[]) => void;
}

export function EngineDetail({ engine }: { engine: Engine }) {
  return (
    <div className="space-y-5">
      {(engine.category || engine.description) && <div className="space-y-1"><p className="text-xs font-medium">{engine.category || 'Uncategorized'}</p>{engine.description && <p className="text-sm text-muted-foreground">{engine.description}</p>}</div>}
      <section className="space-y-2"><h3 className="text-sm font-medium">Affected modules</h3>{engine.modules.map((module) => <div key={module.moduleId} className="rounded-md border border-border/60 p-3"><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">{MODULE_LABELS[module.moduleId]}</span><span className="text-[10px] uppercase tracking-wide text-muted-foreground">{module.importance}</span></div>{module.rationale && <p className="text-xs text-muted-foreground mt-1">{module.rationale}</p>}</div>)}</section>
      <section className="space-y-2"><h3 className="text-sm font-medium">Construction sequence</h3>{engine.constructionSteps.length === 0 ? <p className="text-xs text-muted-foreground">No construction steps recorded.</p> : engine.constructionSteps.map((step, index) => <div key={step.id || index} className="flex gap-3 rounded-md border border-border/60 p-3"><span className="text-xs text-muted-foreground">{index + 1}</span><div><p className="text-sm font-medium">{step.label || 'Untitled step'}</p>{step.description && <p className="text-xs text-muted-foreground mt-1">{step.description}</p>}<p className="text-[10px] text-muted-foreground/70 mt-1">{step.moduleIds.map((id) => MODULE_LABELS[id]).join(' · ')}</p></div></div>)}</section>
      <p className="text-[10px] text-muted-foreground/60">Engine schema v{engine.schemaVersion} · Updated {new Date(engine.updatedAt).toLocaleDateString()}</p>
    </div>
  );
}

export function EngineRenameForm({ engine, onCancel, onRename }: { engine: Engine; onCancel: () => void; onRename: (name: string) => void }) {
  const [value, setValue] = useState(engine.name);
  const submit = () => value.trim() && onRename(value);
  return <div className="space-y-4"><div><h2 className="text-lg font-semibold">Rename Engine</h2><p className="text-sm text-muted-foreground">Only this Engine record will be renamed.</p></div><Input aria-label="Engine name" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submit()} autoFocus /><DialogFooter><Button variant="outline" onClick={onCancel}>Cancel</Button><Button disabled={!value.trim()} onClick={submit}>Rename</Button></DialogFooter></div>;
}

export function EngineDeleteForm({ engine, onCancel, onDelete }: { engine: Engine; onCancel: () => void; onDelete: () => void }) {
  return <div className="space-y-4"><div><h2 className="text-lg font-semibold">Delete Engine?</h2><p className="text-sm text-muted-foreground">This permanently deletes “{engine.name}” only. Builds, Variants, Projects, DNA entries, and other Engines will remain unchanged.</p></div><DialogFooter><Button variant="outline" onClick={onCancel}>Cancel</Button><Button variant="destructive" onClick={onDelete}>Delete Engine</Button></DialogFooter></div>;
}

export function EngineLibraryPage({ engines, activeBuild, isVariant, onRenameEngine, onDuplicateEngine, onDeleteEngine, onApplyEngine }: EngineLibraryPageProps) {
  const [query, setQuery] = useState('');
  const [detailTarget, setDetailTarget] = useState<Engine | null>(null);
  const [renameTarget, setRenameTarget] = useState<Engine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Engine | null>(null);
  const [applyTarget, setApplyTarget] = useState<Engine | null>(null);
  const visibleEngines = searchEngines(engines, query);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6"><h2 className="text-xl font-semibold">Engine Library</h2><p className="text-sm text-muted-foreground mt-1">Reusable multi-module creative construction recipes</p></div>
      <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input aria-label="Search Engines" placeholder="Search Engines..." className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} /></div>

      {engines.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground"><Settings2 className="size-12 mb-4 opacity-40" /><p className="text-sm">No Engines yet</p><p className="text-xs mt-1 opacity-60">Create an Engine from Prompt Builder</p></div> : visibleEngines.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground"><Search className="size-12 mb-4 opacity-40" /><p className="text-sm">No Engines match your search</p></div> : <div className="space-y-2 overflow-y-auto">{visibleEngines.map((engine) => <div key={engine.id} className="rounded-lg border border-border/50 bg-card/50 p-4 hover:bg-card transition-colors"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h3 className="font-medium text-sm">{engine.name}</h3>{engine.category && <p className="text-[10px] uppercase tracking-wide text-primary/70 mt-1">{engine.category}</p>}{engine.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{engine.description}</p>}<p className="text-[10px] text-muted-foreground/70 mt-2">{engine.modules.length} affected modules · {engine.modules.map((module) => MODULE_LABELS[module.moduleId]).join(', ')}</p></div><div className="flex items-center gap-1 shrink-0"><Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDetailTarget(engine)}><Eye className="size-3.5" /> Open</Button><Button variant="ghost" size="icon" className="size-7" aria-label={`Rename ${engine.name}`} onClick={() => setRenameTarget(engine)}><Edit3 className="size-3.5" /></Button><Button variant="ghost" size="icon" className="size-7" aria-label={`Duplicate ${engine.name}`} onClick={() => onDuplicateEngine(engine)}><Copy className="size-3.5" /></Button><Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" aria-label={`Delete ${engine.name}`} onClick={() => setDeleteTarget(engine)}><Trash2 className="size-3.5" /></Button></div></div></div>)}</div>}

      <Dialog open={detailTarget !== null} onOpenChange={(open) => !open && setDetailTarget(null)}><DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{detailTarget?.name}</DialogTitle><DialogDescription>Review this Engine’s construction details before deciding whether to preview its changes.</DialogDescription></DialogHeader>{detailTarget && <><EngineDetail engine={detailTarget} /><DialogFooter><Button onClick={() => { setApplyTarget(detailTarget); setDetailTarget(null); }}><Play className="size-3.5" /> Preview &amp; Apply</Button></DialogFooter></>}</DialogContent></Dialog>
      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}><DialogContent><DialogHeader className="sr-only"><DialogTitle>Rename Engine</DialogTitle><DialogDescription>Rename this Engine record.</DialogDescription></DialogHeader>{renameTarget && <EngineRenameForm engine={renameTarget} onCancel={() => setRenameTarget(null)} onRename={(name) => { onRenameEngine(renameTarget.id, name); setRenameTarget(null); }} />}</DialogContent></Dialog>
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}><DialogContent><DialogHeader className="sr-only"><DialogTitle>Delete Engine</DialogTitle><DialogDescription>Delete this Engine record.</DialogDescription></DialogHeader>{deleteTarget && <EngineDeleteForm engine={deleteTarget} onCancel={() => setDeleteTarget(null)} onDelete={() => { onDeleteEngine(deleteTarget.id); setDeleteTarget(null); }} />}</DialogContent></Dialog>
      {applyTarget && <EngineApplyDialog engine={applyTarget} build={activeBuild} isVariant={isVariant} onClose={() => setApplyTarget(null)} onApply={onApplyEngine} />}
    </div>
  );
}
