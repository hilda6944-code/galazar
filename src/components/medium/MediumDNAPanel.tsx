import { type MediumDNA } from '@/types/galazar';

const PRIMARY_MEDIA = [
  'No Selection',
  'Photography',
  'Oil Painting',
  'Acrylic Painting',
  'Watercolor',
  'Gouache',
  'Tempera',
  'Ink',
  'Graphite',
  'Charcoal',
  'Pastel',
  'Colored Pencil',
  'Digital Painting',
  'Digital Illustration',
  'Mixed Media',
  'Collage',
  'Printmaking',
  'Sculptural / 3D Render',
  'Custom',
];

const TECHNIQUES: Record<string, string[]> = {
  'No Selection': ['No Selection'],
  'Oil Painting': ['No Selection', 'Glazing', 'Impasto', 'Alla Prima', 'Scumbling', 'Layered Classical', 'Palette Knife', 'Fine Brushwork', 'Loose Brushwork', 'Custom'],
  'Acrylic Painting': ['No Selection', 'Layered Acrylic', 'Acrylic Glazing', 'Heavy Body', 'Dry Brush', 'Palette Knife', 'Fluid Acrylic', 'Smooth Blending', 'Custom'],
  Watercolor: ['No Selection', 'Wet-on-Wet', 'Wet-on-Dry', 'Glazing', 'Dry Brush', 'Granulation', 'Loose Wash', 'Controlled Wash', 'Custom'],
  Gouache: ['No Selection', 'Opaque Layering', 'Flat Gouache', 'Dry Brush', 'Smooth Blending', 'Graphic Gouache', 'Custom'],
  Ink: ['No Selection', 'Fine Line', 'Brush Ink', 'Ink Wash', 'Cross-Hatching', 'Stippling', 'Expressive Ink', 'Custom'],
  Graphite: ['No Selection', 'Fine Rendering', 'Soft Shading', 'Cross-Hatching', 'Loose Sketch', 'Tonal Graphite', 'Custom'],
  Charcoal: ['No Selection', 'Vine Charcoal', 'Compressed Charcoal', 'Powdered Charcoal', 'Blended Tonal', 'Expressive Mark', 'Custom'],
  Pastel: ['No Selection', 'Soft Pastel', 'Oil Pastel', 'Layered Pastel', 'Blended Pastel', 'Textured Pastel', 'Custom'],
  'Digital Painting': ['No Selection', 'Smooth Digital Painting', 'Painterly Digital', 'Digital Impasto Simulation', 'Airbrush', 'Textured Brushwork', 'Mixed Digital Brushwork', 'Custom'],
  'Digital Illustration': ['No Selection', 'Clean Vector-Like', 'Painterly Digital', 'Textured Digital', 'Mixed Digital Brushwork', 'Custom'],
  Photography: ['No Selection', 'Natural Photography', 'Fine-Art Photography', 'Editorial Photography', 'Studio Photography', 'Environmental Photography', 'Documentary Photography', 'Macro Photography', 'Custom'],
  'Mixed Media': ['No Selection', 'Paint + Drawing', 'Paint + Collage', 'Ink + Wash', 'Digital + Traditional', 'Layered Mixed Media', 'Custom'],
  Collage: ['No Selection', 'Layered Paper', 'Photographic Collage', 'Painted Collage', 'Mixed Material', 'Custom'],
  Printmaking: ['No Selection', 'Etching', 'Engraving', 'Linocut', 'Woodcut', 'Lithograph', 'Screenprint', 'Custom'],
  'Sculptural / 3D Render': ['No Selection', 'Clay', 'Bronze', 'Marble', 'Porcelain', 'Resin', 'Digital Sculpt', 'Photoreal 3D Render', 'Stylized 3D Render', 'Custom'],
  Tempera: ['No Selection', 'Egg Tempera', 'Layered Tempera', 'Smooth Tempera', 'Custom'],
  'Colored Pencil': ['No Selection', 'Layered Color', 'Burnished', 'Waxy Buildup', 'Loose Colored Pencil', 'Custom'],
  Custom: ['No Selection', 'Custom'],
};

const MARK_BEHAVIORS = ['No Selection', 'Invisible / Smooth', 'Fine Controlled', 'Visible Brushwork', 'Loose Brushwork', 'Broken Marks', 'Palette-Knife Texture', 'Dry Brush Texture', 'Gestural', 'Graphic Flat', 'Custom'];
const SURFACE_SUPPORTS = ['No Selection', 'Canvas', 'Fine Linen', 'Wood Panel', 'Watercolor Paper', 'Textured Paper', 'Smooth Paper', 'Illustration Board', 'Digital Canvas', 'Photographic Surface', 'Custom'];
const SURFACE_CHARACTERS = ['No Selection', 'Matte', 'Satin', 'Glossy', 'Velvety', 'Chalky', 'Translucent', 'Opaque', 'Layered', 'Tactile', 'Smooth', 'Custom'];
const PAINT_BODIES = ['No Selection', 'Thin', 'Transparent', 'Layered', 'Moderate Body', 'Thick', 'Heavy Impasto', 'Custom'];

interface MediumDNAPanelProps {
  dna: MediumDNA;
  onChange: (dna: MediumDNA) => void;
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

export function MediumDNAPanel({ dna, onChange }: MediumDNAPanelProps) {
  const techniqueOptions = TECHNIQUES[dna.primaryMedium ?? 'No Selection'] ?? ['No Selection'];
  const isPaintMedium = dna.primaryMedium && ['Oil Painting', 'Acrylic Painting', 'Watercolor', 'Gouache', 'Tempera', 'Digital Painting'].includes(dna.primaryMedium);

  const update = <K extends keyof MediumDNA>(key: K, value: MediumDNA[K]) => {
    onChange({ ...dna, [key]: value });
  };

  return (
    <div className="space-y-4">
      <SelectField
        label="Primary Medium"
        value={dna.primaryMedium}
        options={PRIMARY_MEDIA}
        onChange={(val) => {
          // Reset technique when medium changes to avoid stale incompatible selection
          // Also clear paintBody when switching to a non-paint medium
          const isNewPaintMedium = val !== null && ['Oil Painting', 'Acrylic Painting', 'Watercolor', 'Gouache', 'Tempera', 'Digital Painting'].includes(val);
          const updates: Record<string, unknown> = {
            primaryMedium: val,
            technique: null,
            customTechnique: '',
            markBehavior: null,
            customMarkBehavior: '',
            surfaceSupport: null,
            customSurfaceSupport: '',
            surfaceCharacter: null,
            customSurfaceCharacter: '',
          };
          if (!isNewPaintMedium) {
            updates.paintBody = null;
            updates.customPaintBody = '';
          }
          onChange({ ...dna, ...updates } as MediumDNA);
        }}
        showCustom={dna.primaryMedium === 'Custom'}
        customValue={dna.customMedium}
        onCustomChange={(val) => update('customMedium', val)}
      />

      <SelectField
        label="Technique"
        value={dna.technique}
        options={techniqueOptions}
        onChange={(val) => update('technique', val)}
        showCustom={dna.technique === 'Custom'}
        customValue={dna.customTechnique}
        onCustomChange={(val) => update('customTechnique', val)}
      />

      <SelectField
        label="Mark / Brush Behavior"
        value={dna.markBehavior}
        options={MARK_BEHAVIORS}
        onChange={(val) => update('markBehavior', val)}
        showCustom={dna.markBehavior === 'Custom'}
        customValue={dna.customMarkBehavior}
        onCustomChange={(val) => update('customMarkBehavior', val)}
      />

      <SelectField
        label="Surface / Support"
        value={dna.surfaceSupport}
        options={SURFACE_SUPPORTS}
        onChange={(val) => update('surfaceSupport', val)}
        showCustom={dna.surfaceSupport === 'Custom'}
        customValue={dna.customSurfaceSupport}
        onCustomChange={(val) => update('customSurfaceSupport', val)}
      />

      <SelectField
        label="Surface Character"
        value={dna.surfaceCharacter}
        options={SURFACE_CHARACTERS}
        onChange={(val) => update('surfaceCharacter', val)}
        showCustom={dna.surfaceCharacter === 'Custom'}
        customValue={dna.customSurfaceCharacter}
        onCustomChange={(val) => update('customSurfaceCharacter', val)}
      />

      {isPaintMedium && (
        <SelectField
          label="Paint / Pigment Body"
          value={dna.paintBody}
          options={PAINT_BODIES}
          onChange={(val) => update('paintBody', val)}
          showCustom={dna.paintBody === 'Custom'}
          customValue={dna.customPaintBody}
          onCustomChange={(val) => update('customPaintBody', val)}
        />
      )}
    </div>
  );
}
