import { Checkbox } from '@/components/ui/checkbox';
import { TypedField } from '@/components/subject/TypedField';
import type { ExclusionDNA } from '@/types/galazar';

interface ExclusionDNAPanelProps { dna: ExclusionDNA; onChange: (dna: ExclusionDNA) => void; }

const EXCLUSION_OPTIONS = [
  'No unwanted text', 'No lettering', 'No typography', 'No calligraphy', 'No symbols', 'No seals',
  'No unintended watermark', 'No extra fingers', 'No extra limbs', 'No duplicated body parts',
  'No malformed hands', 'No distorted anatomy', 'No tangled/stringy artifacts',
  'No excessive decorative clutter', 'No unwanted objects', 'No unintended people',
];

export function ExclusionDNAPanel({ dna, onChange }: ExclusionDNAPanelProps) {
  const toggle = (option: string) => onChange({ ...dna, selected: dna.selected.includes(option) ? dna.selected.filter((item) => item !== option) : [...dna.selected, option] });
  return <div className="space-y-4 pt-2">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {EXCLUSION_OPTIONS.map((option) => <label key={option} className="flex items-center gap-2 rounded-md border border-border/40 px-3 py-2 text-xs cursor-pointer"><Checkbox checked={dna.selected.includes(option)} onCheckedChange={() => toggle(option)} /><span>{option}</span></label>)}
    </div>
    <TypedField label="Custom exclusion text" value={dna.customExclusion} onChange={(customExclusion) => onChange({ ...dna, customExclusion })} placeholder="Describe anything else to avoid..." />
    <p className="text-[10px] text-muted-foreground">“Unintended watermark” does not exclude a deliberately requested GALAZAR signature.</p>
  </div>;
}
