import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createEngineFromBuildSelection, getAvailableEngineModules } from '@/lib/engineCreation';
import { MODULE_LABELS, type Build, type Engine, type EngineImportance, type ModuleId } from '@/types/galazar';

interface StepDraft {
  id: string;
  label: string;
  description: string;
  moduleIds: ModuleId[];
}

interface EngineCreationDialogProps {
  build: Build;
  onClose: () => void;
  onCreate: (engine: Engine) => void;
}

export function EngineCreationForm({ build, onClose, onCreate }: EngineCreationDialogProps) {
  const availableModules = getAvailableEngineModules(build);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<ModuleId[]>([]);
  const [importance, setImportance] = useState<Partial<Record<ModuleId, EngineImportance>>>({});
  const [rationales, setRationales] = useState<Partial<Record<ModuleId, string>>>({});
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [attempted, setAttempted] = useState(false);

  const toggleModule = (moduleId: ModuleId, checked: boolean) => {
    setSelected((current) => checked ? [...current, moduleId] : current.filter((id) => id !== moduleId));
    if (!checked) {
      setSteps((current) => current.map((step) => ({ ...step, moduleIds: step.moduleIds.filter((id) => id !== moduleId) })));
    }
  };

  const updateStep = (stepId: string, update: Partial<StepDraft>) => {
    setSteps((current) => current.map((step) => step.id === stepId ? { ...step, ...update } : step));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= steps.length) return;
    setSteps((current) => {
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  };

  const submit = () => {
    setAttempted(true);
    if (!name.trim() || selected.length < 2) return;
    const timestamp = new Date().toISOString();
    const engine = createEngineFromBuildSelection({
      build,
      id: `engine_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      description,
      category,
      timestamp,
      modules: selected.map((moduleId) => ({
        moduleId,
        importance: importance[moduleId] ?? 'recommended',
        rationale: rationales[moduleId] ?? '',
      })),
      constructionSteps: steps.map((step) => ({ ...step })),
    });
    if (!engine) return;
    onCreate(engine);
    onClose();
  };

  return (
    <div className="space-y-5">
      <div><h2 className="text-lg font-semibold">Create Engine</h2><p className="text-sm text-muted-foreground">Capture selected creative decisions as an independent reusable construction recipe. The active build will not change.</p></div>

        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs"><span>Engine name</span><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Engine name" /></label>
            <label className="space-y-1 text-xs"><span>Category <span className="text-muted-foreground">(optional)</span></span><Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="e.g. Atmospheric Systems" /></label>
            <label className="space-y-1 text-xs sm:col-span-2"><span>Description</span><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What creative logic does this Engine coordinate?" /></label>
          </div>

          <section className="space-y-2">
            <div><h3 className="text-sm font-medium">Creative modules</h3><p className="text-xs text-muted-foreground">Choose at least two populated modules. Nothing is selected automatically.</p></div>
            {availableModules.length === 0 ? <p className="text-xs text-muted-foreground rounded-md border p-3">This build has no populated modules available.</p> : availableModules.map(({ moduleId, availability }) => {
              const isSelected = selected.includes(moduleId);
              const availabilityLabel = availability === 'skipped'
                ? 'Skipped in current build'
                : availability === 'inactive-detail'
                  ? 'Inactive in current build'
                  : null;
              return (
                <div key={moduleId} className="rounded-md border border-border/60 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm font-medium"><Checkbox checked={isSelected} onCheckedChange={(value) => toggleModule(moduleId, value === true)} />{MODULE_LABELS[moduleId]}</label>{availabilityLabel && <span className="text-[10px] text-amber-400">{availabilityLabel}</span>}</div>
                  {availabilityLabel && <p className="text-xs text-muted-foreground">This stored creative setup may be included deliberately. Engine application treats it as a reusable recommendation; module Skip and Variant Lock are not captured.</p>}
                  {isSelected && <div className="grid gap-2 sm:grid-cols-[10rem_1fr]">
                    <select className="h-9 rounded-md border bg-background px-2 text-xs" value={importance[moduleId] ?? 'recommended'} onChange={(event) => setImportance((current) => ({ ...current, [moduleId]: event.target.value as EngineImportance }))} aria-label={`${MODULE_LABELS[moduleId]} importance`}>
                      <option value="core">Core</option><option value="recommended">Recommended</option><option value="optional">Optional</option>
                    </select>
                    <Input value={rationales[moduleId] ?? ''} onChange={(event) => setRationales((current) => ({ ...current, [moduleId]: event.target.value }))} placeholder="Optional rationale" aria-label={`${MODULE_LABELS[moduleId]} rationale`} />
                  </div>}
                </div>
              );
            })}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between"><div><h3 className="text-sm font-medium">Construction steps</h3><p className="text-xs text-muted-foreground">Optional explanatory sequence; steps do not execute commands.</p></div><Button type="button" variant="outline" size="sm" onClick={() => setSteps((current) => [...current, { id: `step_${Date.now()}_${current.length}`, label: '', description: '', moduleIds: [] }])}><Plus className="size-3.5" /> Add Step</Button></div>
            {steps.map((step, index) => <div key={step.id} className="rounded-md border border-border/60 p-3 space-y-2">
              <div className="flex gap-2"><Input value={step.label} onChange={(event) => updateStep(step.id, { label: event.target.value })} placeholder="Step label" /><Button variant="ghost" size="icon" disabled={index === 0} onClick={() => moveStep(index, -1)} aria-label="Move step up"><ArrowUp className="size-4" /></Button><Button variant="ghost" size="icon" disabled={index === steps.length - 1} onClick={() => moveStep(index, 1)} aria-label="Move step down"><ArrowDown className="size-4" /></Button><Button variant="ghost" size="icon" onClick={() => setSteps((current) => current.filter((item) => item.id !== step.id))} aria-label="Remove step"><Trash2 className="size-4" /></Button></div>
              <Input value={step.description} onChange={(event) => updateStep(step.id, { description: event.target.value })} placeholder="Short description" />
              <div className="flex flex-wrap gap-3">{selected.map((moduleId) => <label key={moduleId} className="flex items-center gap-1.5 text-xs"><Checkbox checked={step.moduleIds.includes(moduleId)} onCheckedChange={(value) => updateStep(step.id, { moduleIds: value === true ? [...step.moduleIds, moduleId] : step.moduleIds.filter((id) => id !== moduleId) })} />{MODULE_LABELS[moduleId]}</label>)}</div>
            </div>)}
          </section>

          {attempted && !name.trim() && <p className="text-xs text-destructive">Enter an Engine name.</p>}
          {attempted && selected.length < 2 && <p className="text-xs text-destructive">Select at least two populated modules.</p>}
        </div>

      <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit}>Create Engine</Button></DialogFooter>
    </div>
  );
}

export function EngineCreationDialog(props: EngineCreationDialogProps) {
  return <Dialog open onOpenChange={(open) => !open && props.onClose}><DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto"><DialogHeader className="sr-only"><DialogTitle>Create Engine</DialogTitle><DialogDescription>Create a reusable multi-module Engine.</DialogDescription></DialogHeader><EngineCreationForm {...props} /></DialogContent></Dialog>;
}
