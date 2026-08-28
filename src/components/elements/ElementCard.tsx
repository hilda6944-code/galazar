import { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { SelectControl } from '@/components/subject/SelectControl';
import { TypedField } from '@/components/subject/TypedField';
import {
  type Element,
  type ElementCategory,
  ELEMENT_CATEGORIES,
} from '@/types/galazar';

interface ElementCardProps {
  element: Element;
  index: number;
  onChange: (element: Element) => void;
  onToggleActive: () => void;
  onToggleLock: () => void;
  onRemove: () => void;
}

// ── Option lists (spec-matching) ──
const FLOWER_COLOR = ['Natural', 'White', 'Red', 'Pink', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Black', 'Custom'];
const FLOWER_CONDITION = ['Bud', 'Opening', 'Peak Bloom', 'Aged', 'Wilted', 'Dried', 'Custom'];
const FLOWER_PLACEMENT = ['Foreground', 'Background', 'Beside Subject', 'Held', 'Worn', 'Scattered', 'Custom'];

const ANIMAL_EXPRESSION = ['Serene', 'Alert', 'Curious', 'Defiant', 'Majestic', 'Gentle', 'Intense', 'Playful', 'Custom'];
const ANIMAL_MOVEMENT = ['Still', 'Walking', 'Running', 'Turning', 'Resting', 'Action', 'Custom'];

const FEATHER_DETAIL = ['Natural', 'Fine Detail', 'Highly Detailed', 'Soft', 'Sleek', 'Custom'];
const FEATHER_CONDITION = ['Pristine', 'Natural', 'Weathered', 'Wet', 'Wind-Ruffled', 'Custom'];
const FEATHER_COLOR = ['Natural Species Color', 'Custom'];
const FEATHER_BEHAVIOR = ['Resting', 'Slightly Raised', 'Wind-Swept', 'In Motion', 'Custom'];

const PERSON_PRESENTATION = ['Female', 'Male', 'Androgynous', 'Custom'];
const PERSON_AGE = ['Child', 'Teen', 'Young Adult', 'Adult', 'Older Adult', 'Custom'];

const OBJECT_MATERIAL = ['Wood', 'Metal', 'Glass', 'Stone', 'Ceramic', 'Fabric', 'Leather', 'Paper', 'Custom'];
const OBJECT_CONDITION = ['Pristine', 'Aged', 'Weathered', 'Worn', 'Custom'];
const OBJECT_PLACEMENT = ['Foreground', 'Background', 'Beside Subject', 'Held', 'On Surface', 'Custom'];

const CLOTHING_MATERIAL = ['Cotton', 'Linen', 'Silk', 'Satin', 'Chiffon', 'Velvet', 'Leather', 'Denim', 'Lace', 'Custom'];
const CLOTHING_BEHAVIOR = ['Structured', 'Soft Draping', 'Flowing', 'Wind-Moved', 'Heavy Folds', 'Custom'];

const HEADWEAR_MATERIAL = ['Fabric', 'Leather', 'Felt', 'Straw', 'Metal', 'Custom'];

const ACCESSORY_MATERIAL = ['Gold', 'Silver', 'Brass', 'Bronze', 'Pearl', 'Gemstone', 'Leather', 'Fabric', 'Custom'];

const STORY_INCLUDE_PHYSICAL = ['Yes', 'No'];

export function ElementCard({
  element,
  index,
  onChange,
  onToggleActive,
  onToggleLock,
  onRemove,
}: ElementCardProps) {
  const [expanded, setExpanded] = useState(true);

  const update = (partial: Partial<Element>) => {
    onChange({ ...element, ...partial });
  };

  const setCategory = (cat: string | null) => {
    update({ category: cat as ElementCategory | null });
  };

  const cardOpacity = element.active ? 'opacity-100' : 'opacity-60';
  const borderClass = element.locked
    ? 'border-amber-400/40'
    : element.active
    ? 'border-primary/30'
    : 'border-border/40';

  return (
    <div className={`rounded-lg border ${borderClass} bg-card/60 transition-all ${cardOpacity}`}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <span className="text-xs font-semibold text-muted-foreground shrink-0">Element {index + 1}</span>
          {element.category && (
            <span className="text-xs text-primary/80 truncate">— {element.typedName || element.category}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Active toggle */}
          <button
            onClick={onToggleActive}
            title={element.active ? 'Active (contributes to prompt)' : 'Inactive'}
            className={`p-1.5 rounded-md transition-colors ${
              element.active
                ? 'text-emerald-400 hover:bg-emerald-400/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {element.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Lock toggle */}
          <button
            onClick={onToggleLock}
            title={element.locked ? 'Locked' : 'Unlocked'}
            className={`p-1.5 rounded-md transition-colors ${
              element.locked
                ? 'text-amber-400 hover:bg-amber-400/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          {/* Remove */}
          <button
            onClick={onRemove}
            title="Remove element"
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Category selector */}
          <div className="pt-2">
            <SelectControl
              label="Element Category"
              value={element.category}
              options={ELEMENT_CATEGORIES}
              onChange={setCategory}
            />
          </div>

          {/* Typed name — common to all */}
          {element.category && (
            <TypedField
              label="Name / Identifier"
              value={element.typedName}
              onChange={(v) => update({ typedName: v })}
              placeholder={`e.g. ${placeholderFor(element.category)}`}
            />
          )}

          {/* ═══════════════════════════════════════
              CATEGORY-SPECIFIC CONTROLS
          ═══════════════════════════════════════ */}

          {/* ── Flower / Plant ── */}
          {element.category === 'Flower / Plant' && (
            <div className="space-y-3 border-l-2 border-emerald-400/30 pl-3">
              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Flower / Plant</p>
              <TypedField label="Flower / Plant Type" value={element.flowerType} onChange={(v) => update({ flowerType: v })} placeholder="e.g. Rose, Cherry blossom..." />
              <div className="grid grid-cols-2 gap-3">
                <SelectControl label="Color" value={element.flowerColor} options={FLOWER_COLOR} onChange={(v) => update({ flowerColor: v })} />
                <SelectControl label="Condition" value={element.flowerCondition} options={FLOWER_CONDITION} onChange={(v) => update({ flowerCondition: v })} />
                <SelectControl label="Placement" value={element.flowerPlacement} options={FLOWER_PLACEMENT} onChange={(v) => update({ flowerPlacement: v })} />
              </div>
            </div>
          )}

          {/* ── Animal / Pet ── */}
          {element.category === 'Animal / Pet' && (
            <div className="space-y-3 border-l-2 border-emerald-400/30 pl-3">
              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Animal / Pet</p>
              <TypedField label="Animal Type" value={element.animalType} onChange={(v) => update({ animalType: v })} placeholder="e.g. Dog, Horse..." />
              <TypedField label="Optional Breed / Type" value={element.animalBreed} onChange={(v) => update({ animalBreed: v })} placeholder="e.g. Golden Retriever..." />
              <div className="grid grid-cols-2 gap-3">
                <SelectControl label="Expression" value={element.animalExpression} options={ANIMAL_EXPRESSION} onChange={(v) => update({ animalExpression: v })} />
                <SelectControl label="Movement" value={element.animalMovement} options={ANIMAL_MOVEMENT} onChange={(v) => update({ animalMovement: v })} />
              </div>
            </div>
          )}

          {/* ── Bird ── */}
          {element.category === 'Bird' && (
            <div className="space-y-3 border-l-2 border-emerald-400/30 pl-3">
              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Bird</p>
              <TypedField label="Bird Type" value={element.birdType} onChange={(v) => update({ birdType: v })} placeholder="e.g. Raven, Heron..." />
              <div className="grid grid-cols-2 gap-3">
                <SelectControl label="Feather Detail" value={element.birdFeatherDetail} options={FEATHER_DETAIL} onChange={(v) => update({ birdFeatherDetail: v })} />
                <SelectControl label="Feather Condition" value={element.birdFeatherCondition} options={FEATHER_CONDITION} onChange={(v) => update({ birdFeatherCondition: v })} />
                <SelectControl label="Feather Color" value={element.birdFeatherColor} options={FEATHER_COLOR} onChange={(v) => update({ birdFeatherColor: v })} />
                <SelectControl label="Feather Behavior" value={element.birdFeatherBehavior} options={FEATHER_BEHAVIOR} onChange={(v) => update({ birdFeatherBehavior: v })} />
              </div>
            </div>
          )}

          {/* ── Person ── */}
          {element.category === 'Person' && (
            <div className="space-y-3 border-l-2 border-emerald-400/30 pl-3">
              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Person</p>
              <TypedField label="Description" value={element.personDescription} onChange={(v) => update({ personDescription: v })} placeholder="e.g. Elderly fisherman..." />
              <div className="grid grid-cols-2 gap-3">
                <SelectControl label="Presentation" value={element.personPresentation} options={PERSON_PRESENTATION} onChange={(v) => update({ personPresentation: v })} />
                <SelectControl label="Age" value={element.personAge} options={PERSON_AGE} onChange={(v) => update({ personAge: v })} />
              </div>
              <TypedField label="Role / Relationship" value={element.personRole} onChange={(v) => update({ personRole: v })} placeholder="e.g. Blacksmith at work..." />
            </div>
          )}

          {/* ── Object ── */}
          {element.category === 'Object' && (
            <div className="space-y-3 border-l-2 border-emerald-400/30 pl-3">
              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Object</p>
              <TypedField label="Object Type" value={element.objectType} onChange={(v) => update({ objectType: v })} placeholder="e.g. Pocket watch, Clay jug..." />
              <div className="grid grid-cols-2 gap-3">
                <SelectControl label="Material" value={element.objectMaterial} options={OBJECT_MATERIAL} onChange={(v) => update({ objectMaterial: v })} />
                <SelectControl label="Condition" value={element.objectCondition} options={OBJECT_CONDITION} onChange={(v) => update({ objectCondition: v })} />
                <SelectControl label="Placement" value={element.objectPlacement} options={OBJECT_PLACEMENT} onChange={(v) => update({ objectPlacement: v })} />
              </div>
            </div>
          )}

          {/* ── Clothing / Fabric ── */}
          {element.category === 'Clothing / Fabric' && (
            <div className="space-y-3 border-l-2 border-emerald-400/30 pl-3">
              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Clothing / Fabric</p>
              <TypedField label="Item" value={element.clothingItem} onChange={(v) => update({ clothingItem: v })} placeholder="e.g. Silk robe, Leather vest..." />
              <div className="grid grid-cols-2 gap-3">
                <SelectControl label="Material" value={element.clothingMaterial} options={CLOTHING_MATERIAL} onChange={(v) => update({ clothingMaterial: v })} />
                <SelectControl label="Behavior" value={element.clothingBehavior} options={CLOTHING_BEHAVIOR} onChange={(v) => update({ clothingBehavior: v })} />
              </div>
              <TypedField label="Apply To" value={element.clothingApplyTo} onChange={(v) => update({ clothingApplyTo: v })} placeholder="e.g. Main figure, Background character..." />
            </div>
          )}

          {/* ── Headwear ── */}
          {element.category === 'Headwear' && (
            <div className="space-y-3 border-l-2 border-emerald-400/30 pl-3">
              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Headwear</p>
              <TypedField label="Type" value={element.headwearType} onChange={(v) => update({ headwearType: v })} placeholder="e.g. Wide-brim hat, Crown..." />
              <SelectControl label="Material" value={element.headwearMaterial} options={HEADWEAR_MATERIAL} onChange={(v) => update({ headwearMaterial: v })} />
              <TypedField label="Style / Character" value={element.headwearStyle} onChange={(v) => update({ headwearStyle: v })} placeholder="e.g. Ornate, Simple, Weathered..." />
            </div>
          )}

          {/* ── Accessory / Jewelry ── */}
          {element.category === 'Accessory / Jewelry' && (
            <div className="space-y-3 border-l-2 border-emerald-400/30 pl-3">
              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Accessory / Jewelry</p>
              <TypedField label="Type" value={element.accessoryType} onChange={(v) => update({ accessoryType: v })} placeholder="e.g. Pendant necklace, Signet ring..." />
              <SelectControl label="Material" value={element.accessoryMaterial} options={ACCESSORY_MATERIAL} onChange={(v) => update({ accessoryMaterial: v })} />
              <TypedField label="Placement" value={element.accessoryPlacement ?? ''} onChange={(v) => update({ accessoryPlacement: v || null })} placeholder="e.g. Worn on neck, Held in hand..." />
            </div>
          )}

          {/* ── Environmental Element ── */}
          {element.category === 'Environmental Element' && (
            <div className="space-y-3 border-l-2 border-emerald-400/30 pl-3">
              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Environmental Element</p>
              <TypedField label="Element" value={element.envElement} onChange={(v) => update({ envElement: v })} placeholder="e.g. Mist, Dust particles, Rain..." />
              <TypedField label="Behavior / Placement" value={element.envBehavior} onChange={(v) => update({ envBehavior: v })} placeholder="e.g. Swirling, Drifting, Falling..." />
            </div>
          )}

          {/* ── Story Element ── */}
          {element.category === 'Story Element' && (
            <div className="space-y-3 border-l-2 border-emerald-400/30 pl-3">
              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Story Element</p>
              <TypedField label="Story / Moment" value={element.storyMoment} onChange={(v) => update({ storyMoment: v })} placeholder="e.g. The moment before dawn..." />
              <SelectControl label="Include Physical Story Element" value={element.storyIncludePhysical} options={STORY_INCLUDE_PHYSICAL} onChange={(v) => update({ storyIncludePhysical: v })} />
              {element.storyIncludePhysical === 'Yes' && (
                <TypedField label="Visible Element" value={element.storyVisibleElement} onChange={(v) => update({ storyVisibleElement: v })} placeholder="e.g. A broken lantern at their feet..." />
              )}
            </div>
          )}

          {/* ── Other / Custom ── */}
          {element.category === 'Other / Custom' && (
            <div className="space-y-3 border-l-2 border-emerald-400/30 pl-3">
              <p className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Other / Custom</p>
              <TypedField label="Description" value={element.customDescription} onChange={(v) => update({ customDescription: v })} placeholder="Describe the element..." />
              <TypedField label="Optional Placement / Behavior" value={element.customPlacement} onChange={(v) => update({ customPlacement: v })} placeholder="e.g. Foreground, Background, Held..." />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function placeholderFor(category: ElementCategory | null): string {
  switch (category) {
    case 'Flower / Plant': return 'Rose bouquet';
    case 'Animal / Pet': return 'Wolf';
    case 'Bird': return 'Raven';
    case 'Person': return 'Elderly fisherman';
    case 'Object': return 'Pocket watch';
    case 'Clothing / Fabric': return 'Silk scarf';
    case 'Headwear': return 'Wide-brim hat';
    case 'Accessory / Jewelry': return 'Gold pendant';
    case 'Environmental Element': return 'Mist';
    case 'Story Element': return 'Moment of revelation';
    case 'Other / Custom': return 'Custom element';
    default: return 'Name';
  }
}
