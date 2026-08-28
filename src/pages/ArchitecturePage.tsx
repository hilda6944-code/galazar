import { ArrowRight, Layers } from 'lucide-react';
import { MODULE_LABELS, MODULE_ORDER } from '@/types/galazar';
import { VISUAL_PIPELINE_STAGES } from '@/lib/visualPipeline';

const promptPipeline = MODULE_ORDER.map((id) => MODULE_LABELS[id]).filter((label) => label !== 'Format');

const visualPipeline = ['Image', ...VISUAL_PIPELINE_STAGES.map((stage) => stage.label)];

const systems = [
  ['Prompt construction', 'Module cards hold typed DNA state. Dedicated assemblers convert selected state into concise prompt segments, and the deterministic pipeline follows MODULE_ORDER.'],
  ['Builder history', 'Undo and Redo are local to the mounted builder. Clear Build is an undoable full reset that clears every active module and lock.'],
  ['Reusable work', 'Saved Builds preserve complete builds. Projects associate existing Saved Builds without duplicating them. DNA Library entries preserve reusable individual module configurations.'],
  ['Branching', 'Variants are independent branches with retained origins. Variant Lock prevents ordinary changes to locked modules while Clear Build remains an explicit override.'],
  ['Persistence', 'Builds, Projects, Variants, locks, and DNA Library entries persist in browser localStorage. Builder Undo/Redo history remains in memory.'],
] as const;

export function ArchitecturePage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Architecture</h2>
        <p className="text-sm text-muted-foreground mt-1">Current GALAZAR system structure</p>
      </div>

      <div className="space-y-4 max-w-3xl overflow-y-auto">
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary/60" />
            Prompt Building Pipeline
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {promptPipeline.map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <span className="rounded-md bg-muted/30 px-2.5 py-1.5 text-xs">{label}</span>
                {index < promptPipeline.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/30" />}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary/60" />
            Visual Pipeline
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {visualPipeline.map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <span className="rounded-md bg-muted/30 px-2.5 py-1.5 text-xs">{label}</span>
                {index < visualPipeline.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/30" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {systems.map(([title, description]) => (
            <div key={title} className="rounded-lg border border-border/50 bg-card/50 p-4">
              <h3 className="font-medium text-sm mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
