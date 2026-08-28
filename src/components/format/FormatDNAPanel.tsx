import { SelectControl } from '@/components/subject/SelectControl';
import { TypedField } from '@/components/subject/TypedField';
import type { FormatDNA } from '@/types/galazar';

interface FormatDNAPanelProps { dna: FormatDNA; onChange: (dna: FormatDNA) => void; }

const FORMATS = ['Square — 1:1', 'Portrait — 4:5', 'Story / Vertical — 9:16', 'Classic Portrait — 3:4', 'Landscape — 16:9', 'Standard Photo — 3:2', 'Classic Landscape — 4:3', 'Ultrawide — 21:9', 'Banner / Wide', 'Custom'];

export function FormatDNAPanel({ dna, onChange }: FormatDNAPanelProps) {
  return <div className="space-y-3 pt-2">
    <SelectControl label="Output Format" value={dna.format} options={FORMATS} onChange={(format) => onChange({ ...dna, format })} />
    {dna.format === 'Custom' && <TypedField label="Custom Aspect Ratio / Format" value={dna.customFormat} onChange={(customFormat) => onChange({ ...dna, customFormat })} placeholder="e.g. 2:1 panoramic composition" />}
  </div>;
}
