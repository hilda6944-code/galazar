import { SelectControl } from '@/components/subject/SelectControl';
import { TypedField } from '@/components/subject/TypedField';
import { ANCHOR_OPTIONS } from '@/lib/anchorPrompt';
import type { AnchorDNA } from '@/types/galazar';

interface AnchorDNAPanelProps {
  dna: AnchorDNA;
  onChange: (dna: AnchorDNA) => void;
}

export function AnchorDNAPanel({ dna, onChange }: AnchorDNAPanelProps) {
  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs text-muted-foreground">
        Anchor is the visual element intended to attract attention first. It does not alter focus, framing, or lighting.
      </p>
      <SelectControl
        label="Primary Visual Anchor"
        value={dna.anchor}
        options={[...ANCHOR_OPTIONS]}
        onChange={(anchor) => onChange({
          ...dna,
          anchor,
          customAnchor: anchor === null ? '' : dna.customAnchor,
        })}
      />
      {(dna.anchor === 'Custom' || dna.customAnchor.trim()) && (
        <TypedField
          label="Custom Anchor"
          value={dna.customAnchor}
          onChange={(customAnchor) => onChange({ ...dna, customAnchor })}
          placeholder="Describe what should attract attention first..."
        />
      )}
    </div>
  );
}
