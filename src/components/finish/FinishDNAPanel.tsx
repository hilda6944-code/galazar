import { type FinishDNA } from '@/types/galazar';
import { LockToggle } from '@/components/subject/LockToggle';

const FINISH_CHARACTERS = [
  'No Selection',
  'Natural',
  'Cinematic',
  'Polished',
  'Museum / Gallery',
  'Editorial',
  'Atmospheric',
  'Raw / Painterly',
  'Soft / Ethereal',
  'Dramatic',
  'Graphic / Crisp',
  'Vintage / Aged',
  'Archival / Timeless',
  'Dreamlike',
  'Tactile',
  'Minimal / Restrained',
  'Custom',
];

const FINISH_INTENSITIES = ['No Selection', 'Subtle', 'Moderate', 'Strong', 'Custom'];

const RESOLUTION_CHARACTERS = [
  'No Selection',
  'Clean',
  'Refined',
  'Highly Resolved',
  'Controlled Imperfection',
  'Organic',
  'Pristine',
  'Custom',
];

const EDGE_FINISHES = [
  'No Selection',
  'Natural Transition',
  'Clean Controlled',
  'Soft Integrated',
  'Selective Sharpness',
  'Crisp',
  'Lost and Found',
  'Custom',
];

const CONTRAST_FINISHES = [
  'No Selection',
  'Gentle',
  'Balanced',
  'Focal Contrast',
  'Strong',
  'Compressed',
  'Custom',
];

const HIGHLIGHT_HANDLINGS = [
  'No Selection',
  'Natural',
  'Protected',
  'Luminous',
  'Restrained',
  'Crisp',
  'Soft Roll-Off',
  'Custom',
];

const SHADOW_HANDLINGS = [
  'No Selection',
  'Open',
  'Natural',
  'Deep',
  'Protected Detail',
  'Soft',
  'Rich',
  'Custom',
];

const ATMOSPHERIC_INTEGRATIONS = [
  'No Selection',
  'None',
  'Subtle',
  'Moderate',
  'Deep',
  'Focal Protection',
  'Custom',
];

const SURFACE_POLISHES = [
  'No Selection',
  'Unpolished',
  'Natural',
  'Controlled',
  'Refined',
  'Highly Polished',
  'Custom',
];

const TEXTURE_PRESERVATIONS = [
  'No Selection',
  'Minimal',
  'Selective',
  'Natural',
  'Strong',
  'Material Priority',
  'Custom',
];

interface FinishDNAPanelProps {
  dna: FinishDNA;
  onChange: (dna: FinishDNA) => void;
}

function SelectField({
  label,
  value,
  options,
  onChange,
  showCustom,
  customValue,
  onCustomChange,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (val: string | null) => void;
  showCustom?: boolean;
  customValue?: string;
  onCustomChange?: (val: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground block">{label}</label>
      <select
        value={value ?? 'No Selection'}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === 'No Selection' ? null : val);
        }}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {showCustom && onCustomChange && (
        <input
          type="text"
          value={customValue ?? ''}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={`Custom ${label.toLowerCase()}...`}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
        />
      )}
    </div>
  );
}

// Compatibility guidance based on the spec
function getCompatibilityGuidance(dna: FinishDNA): string | null {
  const { finishCharacter, surfacePolish } = dna;

  if (finishCharacter === 'Cinematic') {
    return 'Cinematic finish adds controlled dramatic resolution and focal hierarchy without film grain, vignette, or color grading.';
  }
  if (finishCharacter === 'Raw / Painterly') {
    return 'Raw / Painterly finish preserves visible construction and expressive marks. Avoid combining with Highly Polished surface finish unless intentional.';
  }
  if (finishCharacter === 'Vintage / Aged') {
    return 'Vintage finish applies restrained aging behavior without scratches, sepia, or fake borders unless explicitly selected elsewhere.';
  }
  if (surfacePolish === 'Highly Polished') {
    return 'Highly Polished creates extremely controlled surface presentation. Must not produce plastic skin, artificial fur, or synthetic foliage.';
  }
  if (surfacePolish === 'Pristine') {
    return 'Pristine minimizes surface interruptions. Ensure this does not erase the physical character of the selected Medium.';
  }
  return null;
}

export function FinishDNAPanel({ dna, onChange }: FinishDNAPanelProps) {
  const update = <K extends keyof FinishDNA>(key: K, value: FinishDNA[K]) => {
    // Send only the changed field as a partial update.
    // PromptBuilder merges this with existing state, avoiding stale-closure overwrites.
    onChange({ [key]: value } as unknown as FinishDNA);
  };

  const guidance = getCompatibilityGuidance(dna);

  return (
    <div className="space-y-4 pt-2">
      {/* Finish Lock */}
      <div className="pt-1">
        <LockToggle
          label="Finish Lock"
          locked={dna.finishLock}
          onToggle={() => update('finishLock', !dna.finishLock)}
        />
      </div>

      {/* Compatibility Guidance */}
      {guidance && (
        <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <p className="text-[11px] text-amber-400/90 leading-relaxed">{guidance}</p>
        </div>
      )}

      {/* ─── Simple Controls ─── */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Primary Finish</p>

        <SelectField
          label="Finish Character"
          value={dna.finishCharacter}
          options={FINISH_CHARACTERS}
          onChange={(val) => update('finishCharacter', val)}
          showCustom={dna.finishCharacter === 'Custom'}
          customValue={dna.customFinishCharacter}
          onCustomChange={(val) => update('customFinishCharacter', val)}
        />

        <SelectField
          label="Finish Intensity"
          value={dna.finishIntensity}
          options={FINISH_INTENSITIES}
          onChange={(val) => update('finishIntensity', val)}
          showCustom={dna.finishIntensity === 'Custom'}
          customValue={dna.customFinishIntensity}
          onCustomChange={(val) => update('customFinishIntensity', val)}
        />

        <SelectField
          label="Resolution Character"
          value={dna.resolutionCharacter}
          options={RESOLUTION_CHARACTERS}
          onChange={(val) => update('resolutionCharacter', val)}
          showCustom={dna.resolutionCharacter === 'Custom'}
          customValue={dna.customResolutionCharacter}
          onCustomChange={(val) => update('customResolutionCharacter', val)}
        />
      </div>

      {/* ─── Advanced Finish ─── */}
      <div className="space-y-3 pt-1">
        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Advanced Finish</p>

        <SelectField
          label="Edge Finish"
          value={dna.edgeFinish}
          options={EDGE_FINISHES}
          onChange={(val) => update('edgeFinish', val)}
          showCustom={dna.edgeFinish === 'Custom'}
          customValue={dna.customEdgeFinish}
          onCustomChange={(val) => update('customEdgeFinish', val)}
        />

        <SelectField
          label="Contrast Finish"
          value={dna.contrastFinish}
          options={CONTRAST_FINISHES}
          onChange={(val) => update('contrastFinish', val)}
          showCustom={dna.contrastFinish === 'Custom'}
          customValue={dna.customContrastFinish}
          onCustomChange={(val) => update('customContrastFinish', val)}
        />

        <SelectField
          label="Highlight Handling"
          value={dna.highlightHandling}
          options={HIGHLIGHT_HANDLINGS}
          onChange={(val) => update('highlightHandling', val)}
          showCustom={dna.highlightHandling === 'Custom'}
          customValue={dna.customHighlightHandling}
          onCustomChange={(val) => update('customHighlightHandling', val)}
        />

        <SelectField
          label="Shadow Handling"
          value={dna.shadowHandling}
          options={SHADOW_HANDLINGS}
          onChange={(val) => update('shadowHandling', val)}
          showCustom={dna.shadowHandling === 'Custom'}
          customValue={dna.customShadowHandling}
          onCustomChange={(val) => update('customShadowHandling', val)}
        />

        <SelectField
          label="Atmospheric Integration"
          value={dna.atmosphericIntegration}
          options={ATMOSPHERIC_INTEGRATIONS}
          onChange={(val) => update('atmosphericIntegration', val)}
          showCustom={dna.atmosphericIntegration === 'Custom'}
          customValue={dna.customAtmosphericIntegration}
          onCustomChange={(val) => update('customAtmosphericIntegration', val)}
        />

        <SelectField
          label="Surface Polish"
          value={dna.surfacePolish}
          options={SURFACE_POLISHES}
          onChange={(val) => update('surfacePolish', val)}
          showCustom={dna.surfacePolish === 'Custom'}
          customValue={dna.customSurfacePolish}
          onCustomChange={(val) => update('customSurfacePolish', val)}
        />

        <SelectField
          label="Texture Preservation"
          value={dna.texturePreservation}
          options={TEXTURE_PRESERVATIONS}
          onChange={(val) => update('texturePreservation', val)}
          showCustom={dna.texturePreservation === 'Custom'}
          customValue={dna.customTexturePreservation}
          onCustomChange={(val) => update('customTexturePreservation', val)}
        />
      </div>
    </div>
  );
}
