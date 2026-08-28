import { SelectControl } from './SelectControl';
import { TypedField } from './TypedField';
import { LockToggle } from './LockToggle';
import {
  type SubjectDNA,
  type HumanDNA,
  type AnimalDNA,
  type BirdDNA,
  type LandscapeDNA,
  type StillLifeDNA,
  type ArchitectureDNA,
  type CustomSubjectDNA,
} from '@/types/galazar';

interface SubjectDNAPanelProps {
  dna: SubjectDNA;
  onChange: (dna: SubjectDNA) => void;
}

const SUBJECT_TYPES = ['Human', 'Animal', 'Landscape', 'Still Life', 'Architecture', 'Custom / Other'];

// ─── Human ───
const HUMAN_PRESENTATION = ['Female', 'Male', 'Androgynous', 'Custom'];
const HUMAN_AGE = ['Child', 'Teen', 'Young Adult', 'Adult', 'Older Adult', 'Custom'];
const HUMAN_SKIN = ['Natural Default', 'Fair', 'Light', 'Olive', 'Tan', 'Brown', 'Deep', 'Custom'];
const HUMAN_EYES = ['Brown', 'Blue', 'Green', 'Hazel', 'Amber', 'Gray', 'Violet', 'Custom'];
const HUMAN_EXPRESSION = [
  'Serene', 'Confident', 'Defiant', 'Joyful', 'Melancholic',
  'Mysterious', 'Intense', 'Contemplative', 'Romantic', 'Neutral', 'Custom',
];
const HUMAN_CLOTHING = ['Casual', 'Formal', 'Couture', 'Historical', 'Fantasy', 'Custom'];
const HUMAN_MATERIAL = ['Cotton', 'Linen', 'Silk', 'Satin', 'Chiffon', 'Velvet', 'Leather', 'Denim', 'Lace', 'Custom'];
const HAIR_COLOR = ['Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Gray', 'White', 'Custom'];
const HAIR_LENGTH = ['Bald', 'Very Short', 'Short', 'Medium', 'Long', 'Very Long', 'Custom'];
const HAIR_TEXTURE = ['Straight', 'Wavy', 'Curly', 'Coily', 'Fine', 'Thick', 'Custom'];
const HAIR_STYLE = ['Natural', 'Styled', 'Updo', 'Braided', 'Ponytail', 'Custom'];

// ─── Animal ───
const ANIMAL_CATEGORY = ['Wildlife', 'Domesticated Animal', 'Custom / Other'];
const ANIMAL_CLASS = ['Bird', 'Mammal', 'Reptile', 'Amphibian', 'Fish', 'Other / Custom'];
const ANIMAL_BODY = ['Natural', 'Powerful', 'Lean', 'Delicate', 'Custom'];
const ANIMAL_SURFACE = ['Fur', 'Coat', 'Feathers', 'Scales', 'Skin', 'Custom'];
const ANIMAL_EXPRESSION = ['Serene', 'Alert', 'Curious', 'Defiant', 'Majestic', 'Gentle', 'Intense', 'Playful', 'Custom'];
const ANIMAL_MOVEMENT = ['Still', 'Walking', 'Running', 'Turning', 'Resting', 'In Flight', 'Action', 'Custom'];

// ─── Bird ───
const FEATHER_DETAIL = ['Natural', 'Fine Detail', 'Highly Detailed', 'Soft', 'Sleek', 'Custom'];
const FEATHER_CONDITION = ['Pristine', 'Natural', 'Weathered', 'Wet', 'Wind-Ruffled', 'Custom'];
const FEATHER_COLOR = ['Natural Species Color', 'Custom'];
const FEATHER_BEHAVIOR = ['Resting', 'Slightly Raised', 'Wind-Swept', 'In Motion', 'Custom'];

// ─── Landscape ───
const TERRAIN = ['Flat', 'Rolling', 'Rugged', 'Mountainous', 'Rocky', 'Custom'];
const WATER = ['Still', 'Gentle Movement', 'Waves', 'Rough', 'Reflective', 'Custom'];
const SKY = ['Clear', 'Clouded', 'Dramatic', 'Stormy', 'Custom'];
const WEATHER = ['Clear', 'Mist', 'Rain', 'Snow', 'Storm', 'Custom'];
const SEASON = ['Spring', 'Summer', 'Autumn', 'Winter', 'Custom'];

// ─── Still Life ───
const ARRANGEMENT = ['Single Object', 'Grouped', 'Layered', 'Asymmetrical', 'Custom'];
const SL_SURFACE = ['Wood', 'Stone', 'Marble', 'Fabric', 'Glass', 'Custom'];
const SL_CONDITION = ['Pristine', 'Aged', 'Weathered', 'Worn', 'Custom'];

// ─── Architecture ───
const ARCH_CONDITION = ['Pristine', 'Lived-In', 'Aged', 'Weathered', 'Ruined', 'Custom'];
const ARCH_MATERIAL = ['Stone', 'Brick', 'Wood', 'Concrete', 'Glass', 'Custom'];
const ARCH_CHARACTER = ['Restrained', 'Ornate', 'Monumental', 'Rustic', 'Minimal', 'Custom'];

export function SubjectDNAPanel({ dna, onChange }: SubjectDNAPanelProps) {
  const setSubjectType = (val: string | null) => {
    onChange({ ...dna, subjectType: val });
  };

  const setHuman = (partial: Partial<HumanDNA>) => {
    onChange({ ...dna, human: { ...dna.human, ...partial } });
  };

  const setAnimal = (partial: Partial<AnimalDNA>) => {
    onChange({ ...dna, animal: { ...dna.animal, ...partial } });
  };

  const setBird = (partial: Partial<BirdDNA>) => {
    onChange({ ...dna, bird: { ...dna.bird, ...partial } });
  };

  const setLandscape = (partial: Partial<LandscapeDNA>) => {
    onChange({ ...dna, landscape: { ...dna.landscape, ...partial } });
  };

  const setStillLife = (partial: Partial<StillLifeDNA>) => {
    onChange({ ...dna, stillLife: { ...dna.stillLife, ...partial } });
  };

  const setArchitecture = (partial: Partial<ArchitectureDNA>) => {
    onChange({ ...dna, architecture: { ...dna.architecture, ...partial } });
  };

  const setCustom = (partial: Partial<CustomSubjectDNA>) => {
    onChange({ ...dna, custom: { ...dna.custom, ...partial } });
  };

  const showBirdDNA = dna.animal.animalClass === 'Bird';

  return (
    <div className="space-y-5 pt-2">
      {/* Subject Type */}
      <SelectControl
        label="Subject Type"
        value={dna.subjectType}
        options={SUBJECT_TYPES}
        onChange={setSubjectType}
      />

      {/* ─── HUMAN ─── */}
      {dna.subjectType === 'Human' && (
        <div className="space-y-4 border-l-2 border-primary/20 pl-3">
          <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Human</p>

          <div className="grid grid-cols-2 gap-3">
            <SelectControl label="Presentation" value={dna.human.presentation} options={HUMAN_PRESENTATION} onChange={(v) => setHuman({ presentation: v })} />
            <SelectControl label="Age" value={dna.human.age} options={HUMAN_AGE} onChange={(v) => setHuman({ age: v })} />
          </div>

          <TypedField label="Appearance / Heritage" value={dna.human.appearance} onChange={(v) => setHuman({ appearance: v })} />

          <SelectControl label="Skin" value={dna.human.skin} options={HUMAN_SKIN} onChange={(v) => setHuman({ skin: v })} />

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Hair</p>
            <div className="grid grid-cols-2 gap-2">
              <SelectControl label="Color" value={dna.human.hairColor} options={HAIR_COLOR} onChange={(v) => setHuman({ hairColor: v })} />
              <SelectControl label="Length" value={dna.human.hairLength} options={HAIR_LENGTH} onChange={(v) => setHuman({ hairLength: v })} />
              <SelectControl label="Texture" value={dna.human.hairTexture} options={HAIR_TEXTURE} onChange={(v) => setHuman({ hairTexture: v })} />
              <SelectControl label="Style" value={dna.human.hairStyle} options={HAIR_STYLE} onChange={(v) => setHuman({ hairStyle: v })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectControl label="Eyes" value={dna.human.eyes} options={HUMAN_EYES} onChange={(v) => setHuman({ eyes: v })} />
            <SelectControl label="Expression" value={dna.human.expression} options={HUMAN_EXPRESSION} onChange={(v) => setHuman({ expression: v })} />
          </div>

          <div className="pt-1">
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Details</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectControl label="Clothing" value={dna.human.clothing} options={HUMAN_CLOTHING} onChange={(v) => setHuman({ clothing: v })} />
            <SelectControl label="Material" value={dna.human.material} options={HUMAN_MATERIAL} onChange={(v) => setHuman({ material: v })} />
          </div>

          <div className="pt-1">
            <LockToggle label="Identity Lock" locked={dna.human.identityLock} onToggle={() => setHuman({ identityLock: !dna.human.identityLock })} />
          </div>
        </div>
      )}

      {/* ─── ANIMAL ─── */}
      {dna.subjectType === 'Animal' && (
        <div className="space-y-4 border-l-2 border-primary/20 pl-3">
          <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Animal</p>

          <SelectControl label="Category" value={dna.animal.category} options={ANIMAL_CATEGORY} onChange={(v) => setAnimal({ category: v })} />
          <TypedField label="Animal Type" value={dna.animal.type} onChange={(v) => setAnimal({ type: v })} placeholder="e.g. Lion, Eagle, Wolf..." />
          <SelectControl label="Animal Class" value={dna.animal.animalClass} options={ANIMAL_CLASS} onChange={(v) => setAnimal({ animalClass: v })} />

          {dna.animal.category === 'Domesticated Animal' && (
            <TypedField label="Breed / Type" value={dna.animal.breed} onChange={(v) => setAnimal({ breed: v })} placeholder="e.g. Siberian Husky..." />
          )}

          <div className="grid grid-cols-2 gap-3">
            <SelectControl label="Body / Anatomy" value={dna.animal.body} options={ANIMAL_BODY} onChange={(v) => setAnimal({ body: v })} />
            <SelectControl label="Surface" value={dna.animal.surface} options={ANIMAL_SURFACE} onChange={(v) => setAnimal({ surface: v })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectControl label="Expression / Presence" value={dna.animal.expression} options={ANIMAL_EXPRESSION} onChange={(v) => setAnimal({ expression: v })} />
            <SelectControl label="Movement" value={dna.animal.movement} options={ANIMAL_MOVEMENT} onChange={(v) => setAnimal({ movement: v })} />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <LockToggle label="Anatomy Lock" locked={dna.animal.anatomyLock} onToggle={() => setAnimal({ anatomyLock: !dna.animal.anatomyLock })} />
            <LockToggle label="Appearance Lock" locked={dna.animal.appearanceLock} onToggle={() => setAnimal({ appearanceLock: !dna.animal.appearanceLock })} />
          </div>

          {/* ─── Bird / Feather DNA ─── */}
          {showBirdDNA && (
            <div className="space-y-3 border-l-2 border-emerald-400/30 pl-3 mt-3">
              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Bird / Feather DNA</p>
              <TypedField label="Bird Type" value={dna.bird.birdType} onChange={(v) => setBird({ birdType: v })} placeholder="e.g. Bald Eagle, Macaw..." />
              <div className="grid grid-cols-2 gap-3">
                <SelectControl label="Feather Detail" value={dna.bird.featherDetail} options={FEATHER_DETAIL} onChange={(v) => setBird({ featherDetail: v })} />
                <SelectControl label="Feather Condition" value={dna.bird.featherCondition} options={FEATHER_CONDITION} onChange={(v) => setBird({ featherCondition: v })} />
                <SelectControl label="Feather Color" value={dna.bird.featherColor} options={FEATHER_COLOR} onChange={(v) => setBird({ featherColor: v })} />
                <SelectControl label="Feather Behavior" value={dna.bird.featherBehavior} options={FEATHER_BEHAVIOR} onChange={(v) => setBird({ featherBehavior: v })} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── LANDSCAPE ─── */}
      {dna.subjectType === 'Landscape' && (
        <div className="space-y-4 border-l-2 border-primary/20 pl-3">
          <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Landscape</p>

          <TypedField label="Landscape Type" value={dna.landscape.landscapeType} onChange={(v) => setLandscape({ landscapeType: v })} placeholder="e.g. Coastal cliffs, Desert dunes..." />

          <div className="grid grid-cols-2 gap-3">
            <SelectControl label="Terrain" value={dna.landscape.terrain} options={TERRAIN} onChange={(v) => setLandscape({ terrain: v })} />
            <SelectControl label="Water" value={dna.landscape.water} options={WATER} onChange={(v) => setLandscape({ water: v })} />
            <SelectControl label="Sky" value={dna.landscape.sky} options={SKY} onChange={(v) => setLandscape({ sky: v })} />
            <SelectControl label="Weather" value={dna.landscape.weather} options={WEATHER} onChange={(v) => setLandscape({ weather: v })} />
            <SelectControl label="Season" value={dna.landscape.season} options={SEASON} onChange={(v) => setLandscape({ season: v })} />
          </div>

          <TypedField label="Environmental Anchor" value={dna.landscape.environmentalAnchor} onChange={(v) => setLandscape({ environmentalAnchor: v })} placeholder="e.g. Lone oak tree, Ancient stone arch..." />

          <div className="pt-1">
            <LockToggle label="Anchor Lock" locked={dna.landscape.anchorLock} onToggle={() => setLandscape({ anchorLock: !dna.landscape.anchorLock })} />
          </div>
        </div>
      )}

      {/* ─── STILL LIFE ─── */}
      {dna.subjectType === 'Still Life' && (
        <div className="space-y-4 border-l-2 border-primary/20 pl-3">
          <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Still Life</p>

          <TypedField label="Primary Object" value={dna.stillLife.primaryObject} onChange={(v) => setStillLife({ primaryObject: v })} placeholder="e.g. Antique pocket watch, Crumpled letter..." />

          <div className="grid grid-cols-2 gap-3">
            <SelectControl label="Arrangement" value={dna.stillLife.arrangement} options={ARRANGEMENT} onChange={(v) => setStillLife({ arrangement: v })} />
            <SelectControl label="Surface" value={dna.stillLife.surface} options={SL_SURFACE} onChange={(v) => setStillLife({ surface: v })} />
            <SelectControl label="Condition" value={dna.stillLife.condition} options={SL_CONDITION} onChange={(v) => setStillLife({ condition: v })} />
          </div>
        </div>
      )}

      {/* ─── ARCHITECTURE ─── */}
      {dna.subjectType === 'Architecture' && (
        <div className="space-y-4 border-l-2 border-primary/20 pl-3">
          <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Architecture</p>

          <TypedField label="Structure" value={dna.architecture.structure} onChange={(v) => setArchitecture({ structure: v })} placeholder="e.g. Gothic cathedral, Modernist villa..." />

          <div className="grid grid-cols-2 gap-3">
            <SelectControl label="Condition" value={dna.architecture.condition} options={ARCH_CONDITION} onChange={(v) => setArchitecture({ condition: v })} />
            <SelectControl label="Exterior Material" value={dna.architecture.exteriorMaterial} options={ARCH_MATERIAL} onChange={(v) => setArchitecture({ exteriorMaterial: v })} />
            <SelectControl label="Character" value={dna.architecture.character} options={ARCH_CHARACTER} onChange={(v) => setArchitecture({ character: v })} />
          </div>
        </div>
      )}

      {/* ─── CUSTOM / OTHER ─── */}
      {dna.subjectType === 'Custom / Other' && (
        <div className="space-y-4 border-l-2 border-primary/20 pl-3">
          <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Custom / Other</p>
          <TypedField
            label="Subject Description"
            value={dna.custom.description}
            onChange={(v) => setCustom({ description: v })}
            placeholder="Describe your subject..."
          />
        </div>
      )}
    </div>
  );
}
