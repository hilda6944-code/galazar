import { type StyleDNA } from '@/types/galazar';

const STYLE_MODES = [
  'No Selection',
  'Realism',
  'Painterly',
  'Illustrative',
  'Graphic',
  'Abstract',
  'Surreal',
  'Historical',
  'Editorial / Fashion',
  'Experimental',
  'Custom',
];

const SPECIFIC_STYLES: Record<string, string[]> = {
  'No Selection': ['No Selection'],
  Realism: ['No Selection', 'Photorealism', 'Ultra-Realism', 'Naturalistic Realism', 'Fine-Art Realism', 'Atmospheric Realism', 'Classical Realism', 'Dutch Realism', 'Custom'],
  Painterly: ['No Selection', 'Painterly Realism', 'Loose Painterly', 'Expressive Painterly', 'Impressionistic', 'Romantic Painterly', 'Tonalist', 'Custom'],
  Illustrative: ['No Selection', 'Fine-Art Illustration', 'Editorial Illustration', 'Botanical Illustration', 'Natural History Illustration', 'Fashion Illustration', 'Storybook Illustration', 'Custom'],
  Graphic: ['No Selection', 'Art Deco', 'Art Nouveau', 'Minimalist Graphic', 'Geometric', 'Poster Art', 'Stained Glass', 'Woodcut / Linocut Language', 'Custom'],
  Abstract: ['No Selection', 'Abstract Expressionism', 'Geometric Abstraction', 'Organic Abstraction', 'Color Field', 'Lyrical Abstraction', 'Custom'],
  Surreal: ['No Selection', 'Surrealism', 'Dreamlike Realism', 'Symbolic Surrealism', 'Architectural Surrealism', 'Restrained Surrealism', 'Custom'],
  Historical: ['No Selection', 'Renaissance', 'Baroque', 'Rococo', 'Neoclassical', 'Romanticism', 'Victorian', 'Pre-Raphaelite', 'Belle Époque', '1920s Deco', 'Mid-Century', 'Custom'],
  'Editorial / Fashion': ['No Selection', 'Contemporary Editorial', 'Luxury Editorial', 'Avant-Garde Fashion', 'Beauty Editorial', 'Couture Illustration', 'Custom'],
  Experimental: ['No Selection', 'Mixed Visual Language', 'Collage Language', 'Layered Transparency', 'Fragmented Form', 'Controlled Distortion', 'Custom'],
  Custom: ['No Selection', 'Custom'],
};

const INTENSITIES = ['No Selection', 'Subtle', 'Moderate', 'Strong', 'Dominant', 'Custom'];
const REALISM_BALANCES = ['No Selection', 'Strictly Realistic', 'Mostly Realistic', 'Balanced', 'Mostly Stylized', 'Highly Stylized', 'Custom'];
const EDGE_LANGUAGES = ['No Selection', 'Crisp', 'Soft', 'Mixed', 'Lost and Found', 'Hard Graphic', 'Painterly Broken', 'Atmospheric', 'Custom'];
const DETAIL_PHILOSOPHIES = ['No Selection', 'Micro-Detailed', 'Controlled Detail', 'Focal Detail', 'Simplified Secondary Detail', 'Broad Form', 'Decorative Detail', 'Custom'];
const FORM_LANGUAGES = ['No Selection', 'Naturalistic', 'Sculptural', 'Geometric', 'Organic', 'Elongated', 'Simplified', 'Fragmented', 'Flowing', 'Monumental', 'Custom'];

interface StyleDNAPanelProps {
  dna: StyleDNA;
  onChange: (dna: StyleDNA) => void;
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

export function StyleDNAPanel({ dna, onChange }: StyleDNAPanelProps) {
  const specificOptions = SPECIFIC_STYLES[dna.styleMode ?? 'No Selection'] ?? ['No Selection'];

  const update = <K extends keyof StyleDNA>(key: K, value: StyleDNA[K]) => {
    onChange({ ...dna, [key]: value });
  };

  return (
    <div className="space-y-4">
      <SelectField
        label="Style Mode"
        value={dna.styleMode}
        options={STYLE_MODES}
        onChange={(val) => update('styleMode', val)}
        showCustom={dna.styleMode === 'Custom'}
        customValue={dna.customStyleMode}
        onCustomChange={(val) => update('customStyleMode', val)}
      />

      <SelectField
        label="Specific Style"
        value={dna.specificStyle}
        options={specificOptions}
        onChange={(val) => update('specificStyle', val)}
        showCustom={dna.specificStyle === 'Custom'}
        customValue={dna.customSpecificStyle}
        onCustomChange={(val) => update('customSpecificStyle', val)}
      />

      <SelectField
        label="Style Intensity"
        value={dna.intensity}
        options={INTENSITIES}
        onChange={(val) => update('intensity', val)}
        showCustom={dna.intensity === 'Custom'}
        customValue={dna.customIntensity}
        onCustomChange={(val) => update('customIntensity', val)}
      />

      <SelectField
        label="Realism / Stylization Balance"
        value={dna.realismBalance}
        options={REALISM_BALANCES}
        onChange={(val) => update('realismBalance', val)}
        showCustom={dna.realismBalance === 'Custom'}
        customValue={dna.customRealismBalance}
        onCustomChange={(val) => update('customRealismBalance', val)}
      />

      <SelectField
        label="Edge Language"
        value={dna.edgeLanguage}
        options={EDGE_LANGUAGES}
        onChange={(val) => update('edgeLanguage', val)}
        showCustom={dna.edgeLanguage === 'Custom'}
        customValue={dna.customEdgeLanguage}
        onCustomChange={(val) => update('customEdgeLanguage', val)}
      />

      <SelectField
        label="Detail Philosophy"
        value={dna.detailPhilosophy}
        options={DETAIL_PHILOSOPHIES}
        onChange={(val) => update('detailPhilosophy', val)}
        showCustom={dna.detailPhilosophy === 'Custom'}
        customValue={dna.customDetailPhilosophy}
        onCustomChange={(val) => update('customDetailPhilosophy', val)}
      />

      <SelectField
        label="Form Language"
        value={dna.formLanguage}
        options={FORM_LANGUAGES}
        onChange={(val) => update('formLanguage', val)}
        showCustom={dna.formLanguage === 'Custom'}
        customValue={dna.customFormLanguage}
        onCustomChange={(val) => update('customFormLanguage', val)}
      />
    </div>
  );
}
