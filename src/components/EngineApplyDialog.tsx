import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { defaultEngineSelection, previewEngineApplication } from '@/lib/engines';
import { describeModuleState, summarizeModuleState } from '@/lib/moduleSummary';
import { MODULE_LABELS, type Build, type Engine, type ModuleId } from '@/types/galazar';

interface EngineApplyDialogProps {
  engine: Engine;
  build: Build;
  isVariant: boolean;
  onClose: () => void;
  onApply: (engine: Engine, selectedModuleIds: ModuleId[]) => void;
}

export function EngineApplyForm({ engine, build, isVariant, onClose, onApply }: EngineApplyDialogProps) {
  const preview = previewEngineApplication(engine, build, isVariant);
  const [selected, setSelected] = useState<ModuleId[]>(() => defaultEngineSelection(engine, build, isVariant));

  const toggle = (moduleId: ModuleId, checked: boolean) => {
    setSelected((current) => checked ? [...current, moduleId] : current.filter((id) => id !== moduleId));
  };

  const summary = (module: Build['modules'][ModuleId]) => {
    const details = describeModuleState(module);
    return <><p className="text-xs">{summarizeModuleState(module)}</p>{details.length > 4 && <details className="mt-1"><summary className="cursor-pointer text-[10px] text-primary">Show all {details.length} settings</summary><ul className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">{details.map((detail) => <li key={detail}>{detail}</li>)}</ul></details>}</>;
  };

  return (
    <div className="space-y-3">
      <div><h2 className="text-lg font-semibold">Preview &amp; Apply: {engine.name}</h2><p className="text-sm text-muted-foreground">Review each recommendation. Nothing changes until you confirm Apply.</p></div>
        <div className="space-y-3">{preview.map((item) => (
          <div key={item.moduleId} className="rounded-md border border-border/60 p-3 space-y-2">
            <div className="flex items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm font-medium"><Checkbox checked={selected.includes(item.moduleId)} disabled={!item.selectable || !item.changed} onCheckedChange={(value) => toggle(item.moduleId, value === true)} />{MODULE_LABELS[item.moduleId]}</label><div className="flex items-center gap-2"><span className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.importance}</span>{item.locked ? <span className="text-[10px] text-amber-400 flex items-center gap-1"><Lock className="size-3" /> Blocked by Variant Lock</span> : !item.changed ? <span className="text-[10px] text-emerald-400">Already matches</span> : <span className="text-[10px] text-primary">Will change</span>}</div></div>
            {item.rationale && <p className="text-xs text-muted-foreground">{item.rationale}</p>}
            <div className="grid gap-2 sm:grid-cols-2"><div className="rounded bg-muted/30 p-2"><p className="text-[10px] uppercase text-muted-foreground mb-1">Current</p>{summary(item.currentModule)}{item.currentModule.skipped && <p className="mt-1 text-[10px] text-amber-400">Skipped in current build</p>}</div><div className="rounded bg-muted/30 p-2"><p className="text-[10px] uppercase text-muted-foreground mb-1">Proposed</p>{summary(item.proposedModule)}</div></div>
            {item.changed && summarizeModuleState(item.currentModule) === summarizeModuleState(item.proposedModule) && (JSON.stringify(describeModuleState(item.currentModule)) === JSON.stringify(describeModuleState(item.proposedModule))
              ? <p className="text-[10px] text-muted-foreground">Creative settings match; only non-creative operational metadata differs.</p>
              : <p className="text-[10px] text-muted-foreground">A setting beyond the compact summary differs. Open the full setting lists to review it.</p>)}
            {item.locked && <p className="text-xs text-muted-foreground">Variant Lock is preserving the current module.</p>}
          </div>
        ))}</div>
        {selected.length === 0 && <p className="text-xs text-muted-foreground">No changed, unlocked modules are selected for application.</p>}
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={selected.length === 0} onClick={() => { onApply(engine, selected); onClose(); }}>Apply Selected</Button></DialogFooter>
    </div>
  );
}

export function EngineApplyDialog(props: EngineApplyDialogProps) {
  return <Dialog open onOpenChange={(open) => !open && props.onClose}><DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto"><DialogHeader className="sr-only"><DialogTitle>Preview and apply Engine</DialogTitle><DialogDescription>Review proposed module changes.</DialogDescription></DialogHeader><EngineApplyForm {...props} /></DialogContent></Dialog>;
}
