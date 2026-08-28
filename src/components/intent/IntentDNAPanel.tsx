import { SelectControl } from '@/components/subject/SelectControl';
import { TypedField } from '@/components/subject/TypedField';
import { INTENT_OPTIONS } from '@/lib/intentPrompt';
import type { IntentDNA } from '@/types/galazar';

interface IntentDNAPanelProps {
  dna: IntentDNA;
  onChange: (dna: IntentDNA) => void;
}

export function IntentDNAPanel({ dna, onChange }: IntentDNAPanelProps) {
  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs text-muted-foreground">
        Intent defines the image-making goal. It does not choose your subject or other creative modules.
      </p>
      <SelectControl
        label="Creative Intent"
        value={dna.intent}
        options={[...INTENT_OPTIONS]}
        onChange={(intent) => onChange({
          ...dna,
          intent,
          customIntent: intent === null ? '' : dna.customIntent,
        })}
      />
      {(dna.intent === 'Custom' || dna.customIntent.trim()) && (
        <TypedField
          label="Custom Intent"
          value={dna.customIntent}
          onChange={(customIntent) => onChange({ ...dna, customIntent })}
          placeholder="Describe the image-making goal..."
        />
      )}
    </div>
  );
}
