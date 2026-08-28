import { SelectControl } from '@/components/subject/SelectControl';
import { TypedField } from '@/components/subject/TypedField';
import { WORLD_OPTIONS } from '@/lib/worldPrompt';
import type { WorldDNA } from '@/types/galazar';

interface WorldDNAPanelProps {
  dna: WorldDNA;
  onChange: (dna: WorldDNA) => void;
}

export function WorldDNAPanel({ dna, onChange }: WorldDNAPanelProps) {
  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs text-muted-foreground">
        World defines the environment or setting. It does not choose your subject or mood.
      </p>
      <SelectControl
        label="World / Setting"
        value={dna.world}
        options={[...WORLD_OPTIONS]}
        onChange={(world) => onChange({
          ...dna,
          world,
          customWorld: world === null ? '' : dna.customWorld,
        })}
      />
      {(dna.world === 'Custom' || dna.customWorld.trim()) && (
        <TypedField
          label="Custom World"
          value={dna.customWorld}
          onChange={(customWorld) => onChange({ ...dna, customWorld })}
          placeholder="Describe the environment or setting..."
        />
      )}
    </div>
  );
}
