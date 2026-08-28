import { SelectControl } from '@/components/subject/SelectControl';
import { TypedField } from '@/components/subject/TypedField';
import { LockToggle } from '@/components/subject/LockToggle';
import {
  type ColorDNA,
  type LimitedPaletteColor,
  type CustomPaletteRole,
} from '@/types/galazar';

interface ColorDNAPanelProps {
  dna: ColorDNA;
  onChange: (dna: ColorDNA) => void;
}

const COLOR_DIRECTIONS = [
  'Natural / True Color',
  'Monochrome',
  'Limited Palette',
  'Color Harmony',
  'Custom Palette',
];

const MONOCHROME_TYPES = ['Black & White', 'Sepia', 'Single Color Family', 'Custom'];

const PALETTE_SIZES = ['2 Colors', '3 Colors', '4 Colors'];

const COLOR_ROLES = ['Dominant', 'Secondary', 'Anchor', 'Accent', 'Custom'];

const HARMONY_TYPES = [
  'Analogous',
  'Complementary',
  'Split Complementary',
  'Triadic',
  'Warm / Cool Contrast',
  'Tonal',
  'Custom',
];

export function ColorDNAPanel({ dna, onChange }: ColorDNAPanelProps) {
  const update = (partial: Partial<ColorDNA>) => {
    onChange({ ...dna, ...partial });
  };

  const setLimitedColor = (index: number, partial: Partial<LimitedPaletteColor>) => {
    const next = dna.limitedPaletteColors.map((c, i) =>
      i === index ? { ...c, ...partial } : c
    );
    update({ limitedPaletteColors: next });
  };

  const setCustomRole = (role: 'customDominant' | 'customSecondary' | 'customAnchor' | 'customAccent', partial: Partial<CustomPaletteRole>) => {
    update({ [role]: { ...dna[role], ...partial } } as Partial<ColorDNA>);
  };

  const paletteSizeNum = dna.limitedPaletteSize
    ? parseInt(dna.limitedPaletteSize)
    : 0;

  return (
    <div className="space-y-5 pt-2">
      {/* Color Direction */}
      <SelectControl
        label="Color Direction"
        value={dna.colorDirection}
        options={COLOR_DIRECTIONS}
        onChange={(v) => update({ colorDirection: v })}
      />

      {/* Color Lock */}
      <div className="pt-1">
        <LockToggle
          label="Color Lock"
          locked={dna.colorLock}
          onToggle={() => update({ colorLock: !dna.colorLock })}
        />
      </div>

      {/* ═══════════════════════════════════════
          BRANCH-SPECIFIC CONTROLS
      ═══════════════════════════════════════ */}

      {/* ── Natural / True Color ── */}
      {dna.colorDirection === 'Natural / True Color' && (
        <div className="space-y-2 border-l-2 border-emerald-400/30 pl-3">
          <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Natural / True Color</p>
          <p className="text-xs text-muted-foreground">
            Preserves believable real-world color relationships. Does not alter subject biology or materials.
          </p>
        </div>
      )}

      {/* ── Monochrome ── */}
      {dna.colorDirection === 'Monochrome' && (
        <div className="space-y-4 border-l-2 border-emerald-400/30 pl-3">
          <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Monochrome</p>

          <SelectControl
            label="Monochrome Type"
            value={dna.monochromeType}
            options={MONOCHROME_TYPES}
            onChange={(v) => update({ monochromeType: v })}
          />

          {(dna.monochromeType === 'Single Color Family' || dna.monochromeType === 'Custom') && (
            <TypedField
              label="Color Family / Description"
              value={dna.monochromeDescription}
              onChange={(v) => update({ monochromeDescription: v })}
              placeholder="e.g. muted cobalt blue"
            />
          )}
        </div>
      )}

      {/* ── Limited Palette ── */}
      {dna.colorDirection === 'Limited Palette' && (
        <div className="space-y-4 border-l-2 border-emerald-400/30 pl-3">
          <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Limited Palette</p>

          <SelectControl
            label="Palette Size"
            value={dna.limitedPaletteSize}
            options={PALETTE_SIZES}
            onChange={(v) => update({ limitedPaletteSize: v })}
          />

          {paletteSizeNum > 0 && (
            <div className="space-y-4">
              {dna.limitedPaletteColors.slice(0, paletteSizeNum).map((color, idx) => (
                <div key={idx} className="space-y-2 rounded-md border border-border/30 bg-background/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Color {idx + 1}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <TypedField
                      label="Color Name"
                      value={color.colorName}
                      onChange={(v) => setLimitedColor(idx, { colorName: v })}
                      placeholder="e.g. Deep Amber"
                    />
                    <TypedField
                      label="Optional HEX"
                      value={color.hex}
                      onChange={(v) => setLimitedColor(idx, { hex: v })}
                      placeholder="#E8A010"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <SelectControl
                      label="Role"
                      value={color.role}
                      options={COLOR_ROLES}
                      onChange={(v) => setLimitedColor(idx, { role: v })}
                    />
                    <TypedField
                      label="Coverage / Weight"
                      value={color.coverage}
                      onChange={(v) => setLimitedColor(idx, { coverage: v })}
                      placeholder="e.g. 60%"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Color Harmony ── */}
      {dna.colorDirection === 'Color Harmony' && (
        <div className="space-y-4 border-l-2 border-emerald-400/30 pl-3">
          <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Color Harmony</p>

          <SelectControl
            label="Harmony Type"
            value={dna.harmonyType}
            options={HARMONY_TYPES}
            onChange={(v) => update({ harmonyType: v })}
          />

          <div className="grid grid-cols-2 gap-3">
            <TypedField label="Primary Color" value={dna.harmonyPrimaryColor} onChange={(v) => update({ harmonyPrimaryColor: v })} placeholder="e.g. teal" />
            <TypedField label="Secondary Color" value={dna.harmonySecondaryColor} onChange={(v) => update({ harmonySecondaryColor: v })} placeholder="e.g. burnt orange" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TypedField label="Optional Accent Color" value={dna.harmonyAccentColor} onChange={(v) => update({ harmonyAccentColor: v })} placeholder="e.g. warm ivory" />
            <TypedField label="Optional Anchor Color" value={dna.harmonyAnchorColor} onChange={(v) => update({ harmonyAnchorColor: v })} placeholder="e.g. deep navy" />
          </div>
        </div>
      )}

      {/* ── Custom Palette ── */}
      {dna.colorDirection === 'Custom Palette' && (
        <div className="space-y-4 border-l-2 border-emerald-400/30 pl-3">
          <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Custom Palette</p>

          {([
            { key: 'customDominant' as const, label: 'Dominant' },
            { key: 'customSecondary' as const, label: 'Secondary' },
            { key: 'customAnchor' as const, label: 'Anchor' },
            { key: 'customAccent' as const, label: 'Accent' },
          ]).map(({ key, label }) => (
            <div key={key} className="space-y-2 rounded-md border border-border/30 bg-background/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <div className="grid grid-cols-3 gap-2">
                <TypedField
                  label="Color Name"
                  value={dna[key].colorName}
                  onChange={(v) => setCustomRole(key, { colorName: v })}
                  placeholder="e.g. Deep Amber"
                />
                <TypedField
                  label="Optional HEX"
                  value={dna[key].hex}
                  onChange={(v) => setCustomRole(key, { hex: v })}
                  placeholder="#E8A010"
                />
                <TypedField
                  label="Optional Coverage"
                  value={dna[key].coverage}
                  onChange={(v) => setCustomRole(key, { coverage: v })}
                  placeholder="e.g. 60%"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
