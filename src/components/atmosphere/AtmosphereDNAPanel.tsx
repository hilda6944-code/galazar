import { SelectControl } from '@/components/subject/SelectControl';
import { TypedField } from '@/components/subject/TypedField';
import { ATMOSPHERE_OPTIONS } from '@/lib/atmospherePrompt';
import type { AtmosphereDNA } from '@/types/galazar';

interface AtmosphereDNAPanelProps {
  dna: AtmosphereDNA;
  onChange: (dna: AtmosphereDNA) => void;
}

export function AtmosphereDNAPanel({ dna, onChange }: AtmosphereDNAPanelProps) {
  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs text-muted-foreground">
        Atmosphere defines the emotional and perceptual feeling of the scene, without choosing lighting or color.
      </p>
      <SelectControl
        label="Atmosphere / Feeling"
        value={dna.atmosphere}
        options={[...ATMOSPHERE_OPTIONS]}
        onChange={(atmosphere) => onChange({
          ...dna,
          atmosphere,
          customAtmosphere: atmosphere === null ? '' : dna.customAtmosphere,
        })}
      />
      {(dna.atmosphere === 'Custom' || dna.customAtmosphere.trim()) && (
        <TypedField
          label="Custom Atmosphere"
          value={dna.customAtmosphere}
          onChange={(customAtmosphere) => onChange({ ...dna, customAtmosphere })}
          placeholder="Describe the emotional or perceptual feeling..."
        />
      )}
    </div>
  );
}
