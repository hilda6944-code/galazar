import { SelectControl } from '@/components/subject/SelectControl';
import { TypedField } from '@/components/subject/TypedField';
import { LockToggle } from '@/components/subject/LockToggle';
import { type LightDNA } from '@/types/galazar';
import { AlertTriangle } from 'lucide-react';

interface LightDNAPanelProps {
  dna: LightDNA;
  onChange: (dna: LightDNA) => void;
}

const LIGHTING_MODES = [
  'Natural Light',
  'Studio Light',
  'Cinematic Light',
  'Classical / Painterly Light',
  'Atmospheric Light',
  'Custom',
];

const LIGHT_SOURCES = [
  'Sunlight',
  'Window Light',
  'Skylight',
  'Moonlight',
  'Candlelight',
  'Firelight',
  'Artificial Light',
  'Mixed Light',
  'Custom',
];

const LIGHT_DIRECTIONS = [
  'Front',
  'Side',
  'Back',
  'Upper Left',
  'Upper Right',
  'Below',
  'Overhead',
  'Rim / Edge',
  'Custom',
];

const LIGHT_QUALITIES = [
  'Soft Diffused',
  'Hard',
  'Directional',
  'Dappled',
  'Filtered',
  'Broad',
  'Focused',
  'Custom',
];

const INTENSITIES = [
  'Low',
  'Subtle',
  'Moderate',
  'Strong',
  'Dramatic',
  'Custom',
];

const LIGHTING_STRUCTURES = [
  'Low Contrast',
  'Balanced',
  'High Contrast',
  'Chiaroscuro',
  'Rembrandt',
  'Silhouette',
  'Rim-Lit',
  'Custom',
];

const NATURAL_LIGHT_CONDITIONS = [
  'Dawn',
  'Morning',
  'Midday',
  'Afternoon',
  'Golden Hour',
  'Sunset',
  'Blue Hour',
  'Night',
  'Overcast',
  'Storm Light',
  'Custom',
];

const FOCAL_LIGHT_PRIORITIES = [
  'Face',
  'Eyes',
  'Subject',
  'Silhouette',
  'Object',
  'Environment',
  'Custom',
];

function detectConflicts(dna: LightDNA): string | null {
  const source = dna.lightSource;
  const condition = dna.naturalLightCondition;

  if (!source || !condition) return null;

  const daytimeSources = ['Sunlight', 'Window Light', 'Skylight'];
  const nighttimeSources = ['Moonlight', 'Candlelight', 'Firelight'];
  const daytimeConditions = ['Dawn', 'Morning', 'Midday', 'Afternoon', 'Golden Hour', 'Sunset'];
  const nighttimeConditions = ['Blue Hour', 'Night'];

  const isDaySource = daytimeSources.includes(source);
  const isNightSource = nighttimeSources.includes(source);
  const isDayCondition = daytimeConditions.includes(condition);
  const isNightCondition = nighttimeConditions.includes(condition);

  if ((isDaySource && isNightCondition) || (isNightSource && isDayCondition)) {
    return `Conflict: ${source} with ${condition} may be contradictory.`;
  }

  return null;
}

export function LightDNAPanel({ dna, onChange }: LightDNAPanelProps) {
  const update = (partial: Partial<LightDNA>) => {
    onChange({ ...dna, ...partial });
  };

  const conflict = detectConflicts(dna);

  const isCustomMode = dna.lightingMode === 'Custom';

  return (
    <div className="space-y-5 pt-2">
      {/* Lighting Mode */}
      <SelectControl
        label="Lighting Mode"
        value={dna.lightingMode}
        options={LIGHTING_MODES}
        onChange={(v) => update({ lightingMode: v })}
      />

      {/* Light Lock */}
      <div className="pt-1">
        <LockToggle
          label="Light Lock"
          locked={dna.lightLock}
          onToggle={() => update({ lightLock: !dna.lightLock })}
        />
      </div>

      {/* Conflict Warning */}
      {conflict && (
        <div className="flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400">{conflict}</p>
        </div>
      )}

      {/* Custom Mode */}
      {isCustomMode && (
        <div className="space-y-2 border-l-2 border-emerald-400/30 pl-3">
          <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Custom Lighting</p>
          <TypedField
            label="Custom Lighting Description"
            value={dna.customLightingDescription}
            onChange={(v) => update({ customLightingDescription: v })}
            placeholder="Describe your intended lighting..."
          />
        </div>
      )}

      {/* Core Controls */}
      {!isCustomMode && (
        <div className="space-y-4">
          {/* Source & Direction */}
          <div className="grid grid-cols-2 gap-3">
            <SelectControl
              label="Light Source"
              value={dna.lightSource}
              options={LIGHT_SOURCES}
              onChange={(v) => update({ lightSource: v })}
            />
            <SelectControl
              label="Direction"
              value={dna.lightDirection}
              options={LIGHT_DIRECTIONS}
              onChange={(v) => update({ lightDirection: v })}
            />
          </div>

          {/* Quality & Intensity */}
          <div className="grid grid-cols-2 gap-3">
            <SelectControl
              label="Quality"
              value={dna.lightQuality}
              options={LIGHT_QUALITIES}
              onChange={(v) => update({ lightQuality: v })}
            />
            <SelectControl
              label="Intensity"
              value={dna.intensity}
              options={INTENSITIES}
              onChange={(v) => update({ intensity: v })}
            />
          </div>

          {/* Lighting Structure */}
          <SelectControl
            label="Lighting Structure"
            value={dna.lightingStructure}
            options={LIGHTING_STRUCTURES}
            onChange={(v) => update({ lightingStructure: v })}
          />

          {/* Natural Light Condition */}
          <SelectControl
            label="Natural Light Condition"
            value={dna.naturalLightCondition}
            options={NATURAL_LIGHT_CONDITIONS}
            onChange={(v) => update({ naturalLightCondition: v })}
          />

          {/* Focal Light Priority */}
          <SelectControl
            label="Focal Light Priority"
            value={dna.focalLightPriority}
            options={FOCAL_LIGHT_PRIORITIES}
            onChange={(v) => update({ focalLightPriority: v })}
          />

          {dna.focalLightPriority === 'Custom' && (
            <TypedField
              label="Target"
              value={dna.focalLightCustomTarget}
              onChange={(v) => update({ focalLightCustomTarget: v })}
              placeholder="e.g. hands, foreground rock"
            />
          )}
        </div>
      )}

      {/* Info / Disclaimers */}
      <div className="space-y-2 rounded-md border border-border/30 bg-background/50 p-3">
        <p className="text-xs font-medium text-muted-foreground">Guidelines</p>
        <ul className="space-y-1 text-xs text-muted-foreground/70 list-disc list-inside">
          <li>Light DNA describes lighting behavior — it does not override Color DNA.</li>
          <li>Atmospheric light does not automatically create fog, haze, or particles.</li>
          <li>Storm Light does not automatically add rain.</li>
          <li>Night does not automatically select Moonlight.</li>
          <li>Golden Hour does not automatically force warm Color DNA.</li>
        </ul>
      </div>
    </div>
  );
}
