import {
  type SubjectDNA,
  type ModuleState,
  type Element,
  type ColorDNA,
  type LightDNA,
  type CameraDNA,
  type StyleDNA,
  type MediumDNA,
  type FinishDNA,
  MODULE_ORDER,
  MODULE_LABELS,
  type ModuleId,
} from '@/types/galazar';
import { assembleFormatPrompt } from './formatPrompt';
import { assembleExclusionPrompt } from './exclusionPrompt';
import { assembleIntentPrompt } from './intentPrompt';
import { assembleWorldPrompt } from './worldPrompt';
import { assembleAtmospherePrompt } from './atmospherePrompt';
import { assembleAnchorPrompt } from './anchorPrompt';

// ─── Subject DNA Prompt Assembler ───
// Generates readable natural-language prompt text from Subject DNA.
// No Selection and empty typed fields contribute zero text.

function maybe(val: string | null): string | null {
  return val && val.trim() ? val.trim() : null;
}

function article(word: string): string {
  if (!word) return '';
  const first = word.toLowerCase().charAt(0);
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  return vowels.includes(first) ? 'an' : 'a';
}

function joinParts(parts: (string | null)[], sep = ', '): string {
  return parts.filter(Boolean).join(sep);
}

export function assembleSubjectPrompt(dna: SubjectDNA): string {
  if (!dna.subjectType) return '';

  switch (dna.subjectType) {
    case 'Human':
      return assembleHuman(dna);
    case 'Animal':
      return assembleAnimal(dna);
    case 'Landscape':
      return assembleLandscape(dna);
    case 'Still Life':
      return assembleStillLife(dna);
    case 'Architecture':
      return assembleArchitecture(dna);
    case 'Custom / Other':
      return assembleCustom(dna);
    default:
      return '';
  }
}

function assembleHuman(dna: SubjectDNA): string {
  const h = dna.human;
  const parts: string[] = [];

  const age = maybe(h.age);
  const pres = maybe(h.presentation);
  if (age || pres) {
    parts.push(`${article(`${age || ''} ${pres || ''}`)} ${joinParts([age, pres], ' ')}`);
  }

  const app = maybe(h.appearance);
  if (app) parts.push(`with ${app} features`);

  const skin = maybe(h.skin);
  if (skin && skin !== 'Natural Default') parts.push(`with ${skin.toLowerCase()} skin`);

  const hairParts: string[] = [];
  if (maybe(h.hairLength)) hairParts.push(maybe(h.hairLength)!);
  if (maybe(h.hairColor)) hairParts.push(maybe(h.hairColor)!);
  if (maybe(h.hairTexture)) hairParts.push(maybe(h.hairTexture)!);
  if (maybe(h.hairStyle)) hairParts.push(maybe(h.hairStyle)!);
  if (hairParts.length > 0) {
    parts.push(`with ${hairParts.join(' ').toLowerCase()} hair`);
  }

  const eyes = maybe(h.eyes);
  if (eyes) parts.push(`with ${eyes.toLowerCase()} eyes`);

  const expr = maybe(h.expression);
  if (expr) parts.push(`expression: ${expr.toLowerCase()}`);

  const cloth = maybe(h.clothing);
  const mat = maybe(h.material);
  if (cloth || mat) {
    parts.push(`wearing ${joinParts([cloth, mat], ' ').toLowerCase()} attire`);
  }

  return parts.join(', ');
}

function assembleAnimal(dna: SubjectDNA): string {
  const a = dna.animal;
  const parts: string[] = [];

  const expr = maybe(a.expression);
  const type = maybe(a.type);
  if (expr && type) {
    parts.push(`${article(type)} ${expr.toLowerCase()} ${type.toLowerCase()}`);
  } else if (type) {
    parts.push(`${article(type)} ${type.toLowerCase()}`);
  }

  const breed = maybe(a.breed);
  if (breed) parts.push(`(${breed})`);

  const body = maybe(a.body);
  if (body && body !== 'Natural') parts.push(`with a ${body.toLowerCase()} build`);

  const surf = maybe(a.surface);
  if (surf && surf !== 'Skin') parts.push(`${surf.toLowerCase()} coat`);

  const move = maybe(a.movement);
  if (move && move !== 'Still') parts.push(`${move.toLowerCase()}`);

  if (dna.animal.animalClass === 'Bird') {
    const b = dna.bird;
    const birdType = maybe(b.birdType);
    if (birdType) parts.push(`${birdType.toLowerCase()}`);

    const featherParts: string[] = [];
    if (maybe(b.featherDetail) && maybe(b.featherDetail) !== 'Natural') featherParts.push(maybe(b.featherDetail)!.toLowerCase());
    if (maybe(b.featherCondition) && maybe(b.featherCondition) !== 'Natural') featherParts.push(maybe(b.featherCondition)!.toLowerCase());
    if (maybe(b.featherColor) && maybe(b.featherColor) !== 'Natural Species Color') featherParts.push(maybe(b.featherColor)!.toLowerCase());
    if (maybe(b.featherBehavior) && maybe(b.featherBehavior) !== 'Resting') featherParts.push(maybe(b.featherBehavior)!.toLowerCase());
    if (featherParts.length > 0) {
      parts.push(`${featherParts.join(', ')} feathers`);
    }
  }

  return parts.join(', ');
}

function assembleLandscape(dna: SubjectDNA): string {
  const l = dna.landscape;
  const parts: string[] = [];

  const type = maybe(l.landscapeType);
  const terrain = maybe(l.terrain);

  if (type) {
    parts.push(`${article(type)} ${type.toLowerCase()}`);
  } else if (terrain) {
    parts.push(`${article(terrain)} ${terrain.toLowerCase()} landscape`);
  }

  const water = maybe(l.water);
  if (water && water !== 'Still') parts.push(`with ${water.toLowerCase()} water`);

  const sky = maybe(l.sky);
  if (sky && sky !== 'Clear') parts.push(`${sky.toLowerCase()} sky`);

  const weather = maybe(l.weather);
  if (weather && weather !== 'Clear') parts.push(`${weather.toLowerCase()} weather`);

  const season = maybe(l.season);
  if (season) parts.push(`${season.toLowerCase()} season`);

  const anchor = maybe(l.environmentalAnchor);
  if (anchor) parts.push(`featuring ${anchor.toLowerCase()}`);

  return parts.join(', ');
}

function assembleStillLife(dna: SubjectDNA): string {
  const s = dna.stillLife;
  const parts: string[] = [];

  const obj = maybe(s.primaryObject);
  const cond = maybe(s.condition);
  const surf = maybe(s.surface);
  const arr = maybe(s.arrangement);

  if (obj) {
    const desc = cond && cond !== 'Pristine' ? `${cond.toLowerCase()} ${obj.toLowerCase()}` : obj.toLowerCase();
    parts.push(`${article(desc)} ${desc}`);
  }

  if (arr && arr !== 'Single Object') parts.push(`arranged as ${arr.toLowerCase()}`);
  if (surf) parts.push(`on a ${surf.toLowerCase()} surface`);

  return parts.join(', ');
}

function assembleArchitecture(dna: SubjectDNA): string {
  const a = dna.architecture;
  const parts: string[] = [];

  const struct = maybe(a.structure);
  const mat = maybe(a.exteriorMaterial);
  const char = maybe(a.character);
  const cond = maybe(a.condition);

  if (struct) {
    let desc = struct.toLowerCase();
    if (char && char !== 'Restrained') desc = `${char.toLowerCase()} ${desc}`;
    if (mat) desc = `${mat.toLowerCase()} ${desc}`;
    parts.push(`${article(desc)} ${desc}`);
  }

  if (cond && cond !== 'Pristine') parts.push(`in ${cond.toLowerCase()} condition`);

  return parts.join(', ');
}

function assembleCustom(dna: SubjectDNA): string {
  return maybe(dna.custom.description) ?? '';
}

// ─── Element Prompt Assembler ───
// Every explicit selection contributes. No Selection and empty fields contribute zero.

function assembleElement(element: Element): string | null {
  if (!element.active || !element.category) return null;

  const name = maybe(element.typedName);
  if (!name) return null;

  switch (element.category) {
    case 'Flower / Plant':
      return assembleFlower(element);
    case 'Animal / Pet':
      return assembleAnimalElement(element);
    case 'Bird':
      return assembleBirdElement(element);
    case 'Person':
      return assemblePersonElement(element);
    case 'Object':
      return assembleObjectElement(element);
    case 'Clothing / Fabric':
      return assembleClothingElement(element);
    case 'Headwear':
      return assembleHeadwearElement(element);
    case 'Accessory / Jewelry':
      return assembleAccessoryElement(element);
    case 'Environmental Element':
      return assembleEnvElement(element);
    case 'Story Element':
      return assembleStoryElement(element);
    case 'Other / Custom':
      return assembleCustomElement(element);
    default:
      return null;
  }
}

function assembleFlower(el: Element): string {
  const parts: string[] = [];
  const name = maybe(el.typedName)!;
  const color = maybe(el.flowerColor);
  const condition = maybe(el.flowerCondition);
  const placement = maybe(el.flowerPlacement);

  let desc = name.toLowerCase();
  if (color) desc = `${color.toLowerCase()} ${desc}`;
  if (condition) desc = `${condition.toLowerCase()} ${desc}`;
  parts.push(`${article(desc)} ${desc}`);

  if (placement) parts.push(`(${placement.toLowerCase()})`);
  return parts.join(' ');
}

function assembleAnimalElement(el: Element): string {
  const parts: string[] = [];
  const type = maybe(el.animalType);
  const name = maybe(el.typedName);
  const breed = maybe(el.animalBreed);
  const expr = maybe(el.animalExpression);
  const move = maybe(el.animalMovement);

  const core = type || name!;
  let desc = core.toLowerCase();
  if (expr) desc = `${expr.toLowerCase()} ${desc}`;
  parts.push(`${article(desc)} ${desc}`);

  if (breed) parts.push(`(${breed})`);
  if (move) parts.push(`${move.toLowerCase()}`);
  return parts.join(', ');
}

function assembleBirdElement(el: Element): string {
  const parts: string[] = [];
  const type = maybe(el.birdType);
  const name = maybe(el.typedName);

  const core = type || name!;
  parts.push(`${article(core)} ${core.toLowerCase()}`);

  const featherParts: string[] = [];
  if (maybe(el.birdFeatherDetail)) featherParts.push(maybe(el.birdFeatherDetail)!.toLowerCase());
  if (maybe(el.birdFeatherCondition)) featherParts.push(maybe(el.birdFeatherCondition)!.toLowerCase());
  if (maybe(el.birdFeatherColor)) featherParts.push(maybe(el.birdFeatherColor)!.toLowerCase());
  if (maybe(el.birdFeatherBehavior)) featherParts.push(maybe(el.birdFeatherBehavior)!.toLowerCase());
  if (featherParts.length > 0) {
    parts.push(`${featherParts.join(', ')} feathers`);
  }

  return parts.join(', ');
}

function assemblePersonElement(el: Element): string {
  const parts: string[] = [];
  const desc = maybe(el.personDescription)!;
  const pres = maybe(el.personPresentation);
  const age = maybe(el.personAge);
  const role = maybe(el.personRole);

  let opener = '';
  if (pres || age) opener = `${joinParts([pres, age], ' ')} `;
  parts.push(`${opener}${desc.toLowerCase()}`);

  if (role) parts.push(`(${role.toLowerCase()})`);
  return parts.join(' ');
}

function assembleObjectElement(el: Element): string {
  const parts: string[] = [];
  const type = maybe(el.objectType)!;
  const mat = maybe(el.objectMaterial);
  const cond = maybe(el.objectCondition);
  const place = maybe(el.objectPlacement);

  let desc = type.toLowerCase();
  if (mat) desc = `${mat.toLowerCase()} ${desc}`;
  if (cond) desc = `${cond.toLowerCase()} ${desc}`;
  parts.push(`${article(desc)} ${desc}`);

  if (place) parts.push(`(${place.toLowerCase()})`);
  return parts.join(' ');
}

function assembleClothingElement(el: Element): string {
  const parts: string[] = [];
  const item = maybe(el.clothingItem)!;
  const mat = maybe(el.clothingMaterial);
  const behavior = maybe(el.clothingBehavior);
  const applyTo = maybe(el.clothingApplyTo);

  let desc = item.toLowerCase();
  if (mat) desc = `${mat.toLowerCase()} ${desc}`;
  if (behavior) desc = `${desc}, ${behavior.toLowerCase()}`;
  parts.push(desc);

  if (applyTo) parts.push(`worn by ${applyTo.toLowerCase()}`);
  return parts.join(', ');
}

function assembleHeadwearElement(el: Element): string {
  const parts: string[] = [];
  const type = maybe(el.headwearType)!;
  const mat = maybe(el.headwearMaterial);
  const style = maybe(el.headwearStyle);

  let desc = type.toLowerCase();
  if (mat) desc = `${mat.toLowerCase()} ${desc}`;
  parts.push(`${article(desc)} ${desc}`);

  if (style) parts.push(`(${style.toLowerCase()})`);
  return parts.join(' ');
}

function assembleAccessoryElement(el: Element): string {
  const parts: string[] = [];
  const type = maybe(el.accessoryType)!;
  const mat = maybe(el.accessoryMaterial);
  const place = maybe(el.accessoryPlacement);

  let desc = type.toLowerCase();
  if (mat) desc = `${mat.toLowerCase()} ${desc}`;
  parts.push(`${article(desc)} ${desc}`);

  if (place) parts.push(`(${place.toLowerCase()})`);
  return parts.join(' ');
}

function assembleEnvElement(el: Element): string {
  const elem = maybe(el.envElement)!;
  const behavior = maybe(el.envBehavior);
  if (behavior) return `${elem.toLowerCase()}, ${behavior.toLowerCase()}`;
  return elem.toLowerCase();
}

function assembleStoryElement(el: Element): string {
  const parts: string[] = [];
  const moment = maybe(el.storyMoment)!;
  parts.push(moment);

  if (el.storyIncludePhysical === 'Yes') {
    const visible = maybe(el.storyVisibleElement);
    if (visible) parts.push(`Visible: ${visible.toLowerCase()}`);
  }
  return parts.join('. ');
}

function assembleCustomElement(el: Element): string {
  const desc = maybe(el.customDescription)!;
  const place = maybe(el.customPlacement);
  if (place) return `${desc} (${place.toLowerCase()})`;
  return desc;
}

export function assembleElements(elements: Element[]): string {
  const texts = elements.map(assembleElement).filter(Boolean) as string[];
  if (texts.length === 0) return '';
  return `Also featuring: ${texts.join('. ')}`;
}

// ─── Color DNA Prompt Assembler ───

export function assembleColorPrompt(dna: ColorDNA): string {
  if (!dna.colorDirection) return '';

  switch (dna.colorDirection) {
    case 'Natural / True Color':
      return 'preserve believable natural color relationships';

    case 'Monochrome':
      return assembleMonochrome(dna);

    case 'Limited Palette':
      return assembleLimitedPalette(dna);

    case 'Color Harmony':
      return assembleColorHarmony(dna);

    case 'Custom Palette':
      return assembleCustomPalette(dna);

    default:
      return '';
  }
}

function assembleMonochrome(dna: ColorDNA): string {
  const type = dna.monochromeType;
  if (!type) return '';

  switch (type) {
    case 'Black & White':
      return 'rendered in monochrome black and white';
    case 'Sepia':
      return 'rendered in sepia monochrome';
    case 'Single Color Family':
    case 'Custom': {
      const desc = maybe(dna.monochromeDescription);
      if (desc) return `rendered in a monochrome ${desc} palette`;
      return 'rendered in monochrome';
    }
    default:
      return 'rendered in monochrome';
  }
}

function assembleLimitedPalette(dna: ColorDNA): string {
  const size = dna.limitedPaletteSize;
  if (!size) return '';

  const count = parseInt(size);
  const colors = dna.limitedPaletteColors.slice(0, count).filter((c) => maybe(c.colorName));
  if (colors.length === 0) return '';

  const colorTexts = colors.map((c) => {
    const name = maybe(c.colorName)!;
    const hex = maybe(c.hex);
    const role = maybe(c.role);
    const coverage = maybe(c.coverage);
    let text = name;
    if (hex) text += ` ${hex}`;
    if (coverage) text += ` (${coverage})`;
    return { text, role };
  });

  // Natural language assembly based on roles
  const dominant = colorTexts.find((c) => c.role === 'Dominant');
  const secondary = colorTexts.find((c) => c.role === 'Secondary');
  const anchor = colorTexts.find((c) => c.role === 'Anchor');
  const accent = colorTexts.find((c) => c.role === 'Accent');
  const customRole = colorTexts.find((c) => c.role === 'Custom');
  const others = colorTexts.filter((c) => !c.role);

  const parts: string[] = [];

  if (dominant) {
    parts.push(`dominated by ${dominant.text}`);
  }
  if (secondary) {
    parts.push(`supported by ${secondary.text}`);
  }
  if (anchor) {
    parts.push(`anchored by ${anchor.text}`);
  }
  if (accent) {
    parts.push(`accented with ${accent.text}`);
  }
  if (customRole) {
    parts.push(`with ${customRole.text} as a custom role`);
  }
  // Un-roled colors
  others.forEach((c) => {
    parts.push(`including ${c.text}`);
  });

  if (parts.length === 0) return '';
  return `using a restrained palette ${parts.join(', ')}`;
}

function assembleColorHarmony(dna: ColorDNA): string {
  const harmonyType = maybe(dna.harmonyType);
  const primary = maybe(dna.harmonyPrimaryColor);
  const secondary = maybe(dna.harmonySecondaryColor);
  const accent = maybe(dna.harmonyAccentColor);
  const anchor = maybe(dna.harmonyAnchorColor);

  if (!harmonyType) return '';

  const colorParts: string[] = [];
  if (primary) colorParts.push(primary);
  if (secondary) colorParts.push(secondary);
  if (accent) colorParts.push(accent);
  if (anchor) colorParts.push(anchor);

  if (colorParts.length === 0) {
    return `using a ${harmonyType.toLowerCase()} color harmony`;
  }

  const colorText = colorParts.length === 2
    ? `${colorParts[0]} and ${colorParts[1]}`
    : colorParts.join(', ');

  return `using a ${harmonyType.toLowerCase()} ${colorText} color harmony`;
}

function assembleCustomPalette(dna: ColorDNA): string {
  const roles: { key: string; name: string; label: string }[] = [];

  const d = dna.customDominant;
  if (maybe(d.colorName)) roles.push({ key: d.colorName, name: maybe(d.hex) ? `${d.colorName} ${d.hex}` : d.colorName, label: 'dominant' });

  const s = dna.customSecondary;
  if (maybe(s.colorName)) roles.push({ key: s.colorName, name: maybe(s.hex) ? `${s.colorName} ${s.hex}` : s.colorName, label: 'secondary' });

  const a = dna.customAnchor;
  if (maybe(a.colorName)) roles.push({ key: a.colorName, name: maybe(a.hex) ? `${a.colorName} ${a.hex}` : a.colorName, label: 'structural anchor' });

  const ac = dna.customAccent;
  if (maybe(ac.colorName)) roles.push({ key: ac.colorName, name: maybe(ac.hex) ? `${ac.colorName} ${ac.hex}` : ac.colorName, label: 'restrained accent' });

  if (roles.length === 0) return '';

  if (roles.length === 1) {
    return `with ${roles[0].name} as the ${roles[0].label} color`;
  }

  const last = roles[roles.length - 1];
  const rest = roles.slice(0, -1);
  const restText = rest.map((r) => `${r.name} as ${r.label}`).join(', ');
  return `with ${restText}, and ${last.name} as a ${last.label}`;
}

// ─── Light DNA Prompt Assembler ───

export function assembleLightPrompt(dna: LightDNA): string {
  const hasContent = !!(
    dna.lightingMode ||
    dna.lightSource ||
    dna.lightDirection ||
    dna.lightQuality ||
    dna.intensity ||
    dna.lightingStructure ||
    dna.naturalLightCondition ||
    dna.focalLightPriority ||
    dna.customLightingDescription
  );
  if (!hasContent) return '';

  if (dna.lightingMode === 'Custom') {
    return maybe(dna.customLightingDescription) ?? '';
  }
  if (!dna.lightingMode) return '';

  if (dna.lightingMode === 'Custom') {
    return maybe(dna.customLightingDescription) ?? '';
  }

  const source = maybe(dna.lightSource);
  const quality = maybe(dna.lightQuality);
  const direction = maybe(dna.lightDirection);
  const intensity = maybe(dna.intensity);
  const structure = maybe(dna.lightingStructure);
  const condition = maybe(dna.naturalLightCondition);
  const focal = maybe(dna.focalLightPriority);
  const focalCustom = maybe(dna.focalLightCustomTarget);

  const parts: string[] = [];

  // Core light description
  const core: string[] = [];

  if (intensity && intensity !== 'Custom') core.push(intensity.toLowerCase());
  if (source && source !== 'Custom') core.push(mapSource(source));

  if (core.length > 0) {
    let clause = core.join(' ');
    if (direction && direction !== 'Custom') {
      clause += ` ${mapDirection(direction)}`;
    }
    parts.push(clause);
  } else if (direction && direction !== 'Custom') {
    parts.push(mapDirection(direction));
  }

  // Quality as standalone behavioral description
  if (quality && quality !== 'Custom') {
    parts.push(mapQuality(quality));
  }
  // Lighting structure
  if (structure && structure !== 'Custom') {
    parts.push(mapStructure(structure));
  }

  // Natural light condition
  if (condition && condition !== 'Custom') {
    parts.push(`${condition.toLowerCase()} light`);
  }

  // Focal priority
  if (focal && focal !== 'Custom') {
    parts.push(`lighting prioritizes the ${focal.toLowerCase()}`);
  } else if (focal === 'Custom' && focalCustom) {
    parts.push(`lighting prioritizes ${focalCustom}`);
  }

  return parts.join(', ');
}

function mapSource(source: string): string {
  switch (source) {
    case 'Moonlight':
      return 'cool nocturnal moonlight';
    case 'Candlelight':
      return 'warm localized candlelight';
    case 'Firelight':
      return 'warm flickering firelight';
    case 'Window Light':
      return 'window light';
    case 'Skylight':
      return 'soft skylight';
    case 'Artificial Light':
      return 'artificial light';
    case 'Mixed Light':
      return 'mixed light';
    case 'Sunlight':
      return 'sunlight';
    default:
      return source.toLowerCase();
  }
}

function mapQuality(quality: string): string {
  switch (quality) {
    case 'Soft Diffused':
      return 'soft diffused light with gentle modeling and gradual transitions';
    case 'Hard':
      return 'hard light with crisp edges and strong shadow definition';
    case 'Directional':
      return 'directional light with decisive form modeling and clear shadow structure';
    case 'Dappled':
      return 'dappled light with shifting illuminated patches and broken shadow patterns';
    case 'Filtered':
      return 'filtered light with softened intensity and subtle atmospheric diffusion';
    case 'Broad':
      return 'broad light with expansive even illumination and minimal shadow contrast';
    case 'Focused':
      return 'focused light with concentrated illumination and strong focal emphasis';
    default:
      return quality.toLowerCase();
  }
}

function mapDirection(direction: string): string {
  switch (direction) {
    case 'Front':
      return 'from the front';
    case 'Side':
      return 'from the side';
    case 'Back':
      return 'from behind';
    case 'Upper Left':
      return 'from the upper left';
    case 'Upper Right':
      return 'from the upper right';
    case 'Below':
      return 'from below';
    case 'Overhead':
      return 'from overhead';
    case 'Rim / Edge':
      return 'rim light from behind';
    default:
      return `from ${direction.toLowerCase()}`;
  }
}

function mapStructure(structure: string): string {
  switch (structure) {
    case 'Low Contrast':
      return 'low contrast lighting';
    case 'Balanced':
      return 'balanced lighting';
    case 'High Contrast':
      return 'high contrast lighting';
    case 'Chiaroscuro':
      return 'chiaroscuro with strong organization of light and dark and deliberate illuminated focal areas';
    case 'Rembrandt':
      return 'Rembrandt lighting with modeled form and characteristic controlled light and shadow structure';
    case 'Silhouette':
      return 'silhouette with the subject primarily defined against a brighter field';
    case 'Rim-Lit':
      return 'rim-lit with edge illumination separating the subject from the background';
    default:
      return `${structure.toLowerCase()} lighting`;
  }
}


// ─── Camera DNA Prompt Assembler ───

function getCameraSubjectContext(subjectDNA: SubjectDNA | null): 'human' | 'animal' | 'other' {
  if (!subjectDNA || !subjectDNA.subjectType) return 'other';
  const type = subjectDNA.subjectType;
  if (type === 'Human') return 'human';
  if (type === 'Animal') return 'animal';
  return 'other';
}


export function assembleCameraPrompt(
  dna: CameraDNA,
  subjectDNA: SubjectDNA | null = null
): string {
  const mode = maybe(dna.cameraMode);
  const lens = maybe(dna.lens);
  const customLens = maybe(dna.customLens);
  const angle = maybe(dna.angle);
  const customAngle = maybe(dna.customAngle);
  const shotSize = maybe(dna.shotSize);
  const customShotSize = maybe(dna.customShotSize);
  const depthOfField = maybe(dna.depthOfField);
  const customDepthOfField = maybe(dna.customDepthOfField);
  const focusTarget = maybe(dna.focusTarget);
  const customFocusTarget = maybe(dna.customFocusTarget);
  const composition = maybe(dna.composition);
  const customComposition = maybe(dna.customComposition);
  const subjectPlacement = maybe(dna.subjectPlacement);
  const customSubjectPlacement = maybe(dna.customSubjectPlacement);
  const gazeDirection = maybe(dna.gazeDirection);
  const customGazeDirection = maybe(dna.customGazeDirection);
  const frameOrientation = maybe(dna.frameOrientation);
  const customFrameOrientation = maybe(dna.customFrameOrientation);
  const breathingRoom = maybe(dna.breathingRoom);
  const customBreathingRoom = maybe(dna.customBreathingRoom);
  const perspectiveEmphasis = maybe(dna.perspectiveEmphasis);
  const customPerspectiveEmphasis = maybe(dna.customPerspectiveEmphasis);

  const parts: string[] = [];

  const subjectCtx = getCameraSubjectContext(subjectDNA);

  // 1. Camera Mode (guides how other controls are interpreted)
  const modeText = mode && mode !== 'Custom' ? mapCameraMode(mode) : null;

  // 2. Shot Size / Camera Distance
  if (shotSize && shotSize !== 'Custom') {
    parts.push(mapShotSize(shotSize, subjectCtx));
  } else if (shotSize === 'Custom' && customShotSize) {
    parts.push(customShotSize);
  }

  // 3. Lens / Field of View
  // 3. Lens / Field of View
  if (lens && lens !== 'Custom') {
    parts.push(mapLens(lens, subjectCtx));
  } else if (lens === 'Custom' && customLens) {
    parts.push(customLens);
  }

  // 4. Camera Angle / Viewpoint
  // 4. Camera Angle / Viewpoint
  if (angle && angle !== 'Custom') {
    parts.push(mapCameraAngle(angle, subjectCtx));
  } else if (angle === 'Custom' && customAngle) {
    parts.push(customAngle);
  }

  // 5. Perspective / Depth Emphasis
  if (perspectiveEmphasis && perspectiveEmphasis !== 'Custom') {
    parts.push(mapPerspectiveEmphasis(perspectiveEmphasis, lens));
  } else if (perspectiveEmphasis === 'Custom' && customPerspectiveEmphasis) {
    parts.push(customPerspectiveEmphasis);
  }

  // 6. Subject Placement
  if (subjectPlacement && subjectPlacement !== 'Custom') {
    parts.push(mapSubjectPlacement(subjectPlacement));
  } else if (subjectPlacement === 'Custom' && customSubjectPlacement) {
    parts.push(customSubjectPlacement);
  }

  // 7. Composition Structure
  if (composition && composition !== 'Custom') {
    parts.push(mapComposition(composition));
  } else if (composition === 'Custom' && customComposition) {
    parts.push(customComposition);
  }

  // 8. Gaze / Direction
  // 8. Gaze / Direction
  if (gazeDirection && gazeDirection !== 'Custom') {
    parts.push(mapGazeDirection(gazeDirection, subjectCtx));
  } else if (gazeDirection === 'Custom' && customGazeDirection) {
    parts.push(customGazeDirection);
  }

  // 9. Focus Target
  // 9. Focus Target
  if (focusTarget && focusTarget !== 'Custom') {
    parts.push(mapFocusTarget(focusTarget, subjectCtx));
  } else if (focusTarget === 'Custom' && customFocusTarget) {
    parts.push(customFocusTarget);
  }

  // 10. Depth of Field / Focus Behavior
  if (depthOfField && depthOfField !== 'Custom') {
    parts.push(mapDepthOfField(depthOfField));
  } else if (depthOfField === 'Custom' && customDepthOfField) {
    parts.push(customDepthOfField);
  }

  // 11. Breathing Room
  if (breathingRoom && breathingRoom !== 'Custom') {
    parts.push(mapBreathingRoom(breathingRoom));
  } else if (breathingRoom === 'Custom' && customBreathingRoom) {
    parts.push(customBreathingRoom);
  }

  // 12. Frame Orientation
  if (frameOrientation && frameOrientation !== 'Custom') {
    parts.push(mapFrameOrientation(frameOrientation));
  } else if (frameOrientation === 'Custom' && customFrameOrientation) {
    parts.push(customFrameOrientation);
  }

  if (parts.length === 0) return '';

  // Assemble: prepend mode if present, then join all parts
  if (modeText) {
    return `${modeText} ${parts.join('. ')}`;
  }
  return parts.join('. ');
}

function mapCameraMode(mode: string): string | null {
  switch (mode) {
    case 'Photography':
      return 'photographically,';
    case 'Cinematic':
      return 'cinematically,';
    case 'Painterly / Virtual Camera':
      return 'with painterly spatial guidance,';
    case 'Illustrative Composition':
      return 'through illustrative composition,';
    default:
      return null;
  }
}

function mapLens(lens: string, _subjectCtx: 'human' | 'animal' | 'other' = 'other'): string {
  switch (lens) {
    case 'Ultra Wide 14mm':
      return 'very broad field of view with exaggerated near-far spatial relationships, strong perspective expansion, and pronounced foreground scale';
    case 'Wide 24mm':
      return 'broad environmental field of view with noticeable perspective depth, stronger foreground emphasis, and clear separation between near and distant spatial planes';
    case 'Environmental 35mm':
      return 'moderately broad field of view with natural environmental storytelling, clear relationship between subject and surroundings, and mild perspective expansion';
    case 'Natural 50mm':
      return 'balanced natural-looking field of view with visually neutral spatial relationships and minimal obvious compression or wide-angle expansion';
    case 'Portrait 85mm': {
      const base = 'increased camera-to-subject distance with a flattering portrait perspective, gentle background compression, and controlled subject isolation through a narrower field of view';
      if (_subjectCtx !== 'human') {
        return `${base.replace('flattering portrait perspective', 'pleasing perspective')} with reduced distortion`;
      }
      return `${base}, reduced facial distortion`;
    }
    case 'Portrait Telephoto 105mm': {
      const base = 'increased camera-to-subject distance with a flattering compressed portrait perspective, stronger background compression, and controlled subject isolation';
      if (_subjectCtx !== 'human') {
        return base;
      }
      return `${base}, refined facial proportions`;
    }
    case 'Telephoto 135mm':
      return 'increased camera-to-subject distance with clearly compressed perspective, narrow field of view, reduced apparent distance between subject and background, and strong subject isolation';
    case 'Telephoto 200mm':
      return 'significantly increased camera-to-subject distance with strong compressed perspective, very narrow field of view, background appearing visually closer to the subject, reduced spacing between depth planes, and strong controlled subject isolation';
    case 'Macro':
      return 'extreme close focusing with enlarged fine detail, micro-texture compositionally important, very narrow apparent focus zone, and rapid focus falloff around the critical focal plane';
    case 'Fisheye':
      return 'extremely broad field of view with pronounced barrel distortion, curved lines near frame edges, and exaggerated foreground scale';
    case 'Orthographic / No Perspective Distortion':
      return 'minimal perspective convergence with parallel structures remaining visually parallel, reduced near-far size exaggeration, and flattened diagrammatic spatial presentation';
    default:
      return lens.toLowerCase();
  }
}

function mapCameraAngle(angle: string, _subjectCtx: 'human' | 'animal' | 'other' = 'other'): string {
  switch (angle) {
    case 'Eye Level':
      return 'viewed from eye level with neutral visual authority and natural interpersonal perspective';
    case 'Low Angle':
      return 'viewed from below with upward direction, giving the subject visual dominance and increased perceived scale';
    case 'High Angle':
      return 'viewed from above with downward direction, upper surfaces more visible';
    case "Bird's-Eye":
      return "viewed from a bird's-eye perspective with strong downward spatial reading and prominent environmental layout";
    case "Worm's-Eye":
      return "viewed from a worm's-eye perspective with dramatic vertical exaggeration and strong impression of height and scale";
    case 'Ground Level':
      return 'viewed from near the ground plane with prominent foreground textures and strong low spatial perspective';
    case 'Overhead / Top-Down':
      return 'viewed from overhead with layout and shape relationships emphasized and depth intentionally flattened';
    case 'Dutch Angle':
      return 'viewed with an intentionally tilted camera axis, horizon and vertical structures diagonal, creating controlled visual tension';
    case 'Over-the-Shoulder':
      if (_subjectCtx !== 'human') {
        return 'viewed over a partial foreground form, creating layered spatial relationship and positioning the viewer within the scene';
      }
      return 'viewed over a partial foreground shoulder or figure, creating layered spatial relationship and positioning the viewer within an interaction';
    case 'Profile View':
      return 'viewed from the side with silhouette and side-plane structure emphasized';
    case 'Three-Quarter View':
      return 'viewed from a three-quarter angle with dimensional form visible and stronger depth than a flat frontal view';
    case 'Front Facing':
      return 'front-facing with strong direct connection to the viewer';
    case 'Rear View':
      return 'viewed from behind, directing attention deeper into the scene';
    default:
      return `viewed from ${angle.toLowerCase()}`;
  }
}

function mapShotSize(size: string, subjectCtx: 'human' | 'animal' | 'other' = 'other'): string {
  switch (size) {
    case 'Extreme Close-Up': {
      if (subjectCtx !== 'human') {
        return 'extreme close-up framing isolating a very small region with micro-detail dominating and almost no environmental context';
      }
      return 'extreme close-up framing isolating a very small region with micro-detail dominating and almost no environmental context';
    }
    case 'Close-Up': {
      if (subjectCtx !== 'human') {
        return 'close-up framing with the primary feature filling most of the frame, strong character emphasis, and limited environmental information';
      }
      return 'close-up framing with the primary feature filling most of the frame, strong emotional emphasis, and limited environmental information';
    }
    case 'Head and Shoulders': {
      if (subjectCtx !== 'human') {
        return 'head and shoulders framing at intimate portrait scale with features and expression dominant';
      }
      return 'head and shoulders framing at intimate portrait scale with expression dominant';
    }
    case 'Bust Portrait': {
      if (subjectCtx !== 'human') {
        return 'bust portrait framing showing head, shoulders, and upper body with traditional portrait balance';
      }
      return 'bust portrait framing showing head, shoulders, and upper torso with traditional portrait balance';
    }
    case 'Medium Close-Up': {
      if (subjectCtx !== 'human') {
        return 'medium close-up framing approximately chest-up with features prominent and posture gaining importance';
      }
      return 'medium close-up framing approximately chest-up with expression prominent and gesture gaining importance';
    }
    case 'Medium Shot': {
      if (subjectCtx !== 'human') {
        return 'medium shot framing approximately waist-up, balancing expression, posture, and environmental context';
      }
      return 'medium shot framing approximately waist-up, balancing expression, gesture, posture, and environmental context';
    }
    case 'Three-Quarter Shot': {
      if (subjectCtx !== 'human') {
        return 'three-quarter framing showing most of the animal while preserving posture, body structure, stance, and recognizable anatomical proportions';
      }
      return 'three-quarter shot framing from thighs or knees upward with clothing, stance, and gesture important';
    }
    case 'Full Body': {
      if (subjectCtx !== 'human') {
        return 'full body framing with the complete primary subject visible, posture, stance, body structure, and surrounding space readable';
      }
      return 'full body framing with the complete primary subject visible, posture, stance, clothing, and surrounding space readable';
    }
    case 'Wide Shot':
      return 'wide shot with environment occupying substantial frame area and subject remaining identifiable while sharing attention with setting';
    case 'Extreme Wide Shot':
      return 'extreme wide shot with environment dominating the composition, subject small relative to world, emphasizing scale and geography';
    case 'Environmental Portrait':
      return 'environmental portrait with the primary subject clearly important and surroundings actively communicating identity, story, or context';
    default:
      return `${size.toLowerCase()} framing`;
  }
}

function mapDepthOfField(dof: string): string {
  switch (dof) {
    case 'Deep Focus':
      return 'deep focus with foreground, subject, and background substantially readable, minimal blur-based separation';
    case 'Moderate Depth':
      return 'moderate depth of field with primary subject clearly focused and background softening gradually while remaining recognizable';
    case 'Shallow Depth':
      return 'shallow depth of field with the primary focal plane crisp and foreground and/or background noticeably softened';
    case 'Very Shallow Depth':
      return 'very shallow depth of field with extremely narrow focal plane and rapid focus falloff, only critical focal details sharply defined';
    case 'Selective Focus':
      return 'selective focus with one intentional focal anchor receiving maximum clarity and surrounding information softened';
    case 'Tilt-Shift Focus Plane':
      return 'tilt-shift focus plane with narrow angled selective spatial slices remaining sharp and unconventional focus geometry';
    case 'Painterly Focus Falloff':
      return 'painterly focus falloff with clarity decreasing through softer edges and reduced detail rather than photographic bokeh';
    case 'Uniform Sharpness':
      return 'uniform sharpness with consistent detail clarity across major spatial planes and no deliberate photographic blur';
    default:
      return `${dof.toLowerCase()}`;
  }
}

function mapFocusTarget(target: string, subjectCtx: 'human' | 'animal' | 'other' = 'other'): string {
  switch (target) {
    case 'Eyes': {
      if (subjectCtx !== 'human') {
        return 'eyes as the sharpest visual anchor with gaze receiving priority';
      }
      return 'eyes as the sharpest visual anchor with gaze clarity receiving priority';
    }
    case 'Face': {
      if (subjectCtx !== 'human') {
        return 'facial structure and features receiving maximum clarity';
      }
      return 'facial structure and expression receiving maximum clarity';
    }
    case 'Hands': {
      if (subjectCtx !== 'human') {
        return 'forelimbs and posture receiving critical clarity with structurally believable anatomy';
      }
      return 'hands and gesture receiving critical clarity with structurally believable anatomy';
    }
    case 'Primary Subject':
      return 'maximum visual clarity concentrated on the principal subject';
    case 'Foreground':
      return 'foreground as the sharpest spatial plane';
    case 'Midground':
      return 'midground receiving maximum clarity with foreground and background framing it';
    case 'Background':
      return 'distant plane receiving deliberate clarity priority';
    case 'Object / Prop':
      return 'object as a critical clarity anchor, structurally readable';
    default:
      return `${target.toLowerCase()} in sharp focus`;
  }
}

function mapComposition(comp: string): string {
  switch (comp) {
    case 'Centered':
      return 'primary focal subject placed near visual center with strong direct emphasis';
    case 'Rule of Thirds':
      return 'primary focal anchor positioned near a thirds intersection with supporting visual weight balancing the remaining frame';
    case 'Golden Ratio':
      return 'major visual masses following proportional balance approximately related to golden ratio';
    case 'Golden Spiral':
      return 'visual flow curving progressively toward the primary focal anchor with supporting elements reinforcing the inward path';
    case 'Symmetrical':
      return 'strong bilateral balance with controlled visual stability';
    case 'Asymmetrical Balance':
      return 'unequal visual masses balanced through scale, value, color, texture, and placement';
    case 'Diagonal Composition':
      return 'major forms traveling diagonally through the frame with controlled movement and energy';
    case 'Triangular Composition':
      return 'primary subjects forming a triangular hierarchy creating stability while guiding the eye between anchors';
    case 'Layered Depth':
      return 'foreground, midground, and background intentionally differentiated with overlap and scale reinforcing spatial depth';
    case 'Frame Within a Frame':
      return 'architecture, foliage, objects, or foreground forms partially surrounding the focal subject and directing attention inward';
    case 'Leading Lines':
      return 'structural or environmental lines directing the viewer toward the focal anchor';
    case 'Negative Space':
      return 'substantial quiet area surrounding the focal subject with empty space as an active compositional element';
    case 'Radial Composition':
      return 'visual elements radiating from or converging toward a central focal region';
    case 'S-Curve':
      return 'visual movement following a graceful S-shaped path through the composition';
    case 'L-Composition':
      return 'major masses establishing an L-shaped structural framework with open area balancing the heavier mass';
    case 'Central Monumental':
      return 'dominant subject occupying a powerful central position with scale and framing creating visual authority';
    case 'Editorial Crop':
      return 'intentional close or unconventional cropping for graphic impact';
    case 'Partial Reveal':
      return 'intentionally concealing a significant portion of the subject while preserving one dominant focal anchor following reveal, transition, and conceal';
    case 'Environmental Framing':
      return 'surrounding environment naturally framing the primary subject through architecture, foliage, terrain, windows, or light';
    default:
      return `${comp.toLowerCase()} composition`;
  }
}

function mapSubjectPlacement(placement: string): string {
  switch (placement) {
    case 'Center':
      return 'focal subject positioned centrally';
    case 'Left Third':
      return 'focal anchor weighted toward the left thirds region with counterbalance in the remaining frame';
    case 'Right Third':
      return 'focal anchor weighted toward the right thirds region with counterbalance in the remaining frame';
    case 'Upper Third':
      return 'focal anchor positioned higher in the composition';
    case 'Lower Third':
      return 'focal anchor positioned lower in the composition';
    case 'Off-Center Left':
      return 'deliberate left-weighted asymmetry';
    case 'Off-Center Right':
      return 'deliberate right-weighted asymmetry';
    case 'Near Frame Edge':
      return 'focal subject deliberately positioned close to an edge with intentional edge tension';
    case 'Deep in Frame':
      return 'subject positioned farther into represented space with environment and spatial approach important';
    default:
      return `subject ${placement.toLowerCase()}`;
  }
}

function mapGazeDirection(gaze: string, subjectCtx: 'human' | 'animal' | 'other' = 'other'): string {
  switch (gaze) {
    case 'Direct to Viewer': {
      if (subjectCtx !== 'human') {
        return 'gaze connecting directly with the viewer';
      }
      return 'gaze connecting directly with the viewer, eyes a strong relational anchor';
    }
    case 'Looking Left':
      return 'gaze directed toward frame left with appropriate visual breathing room';
    case 'Looking Right':
      return 'gaze directed toward frame right with appropriate visual breathing room';
    case 'Looking Up':
      return 'gaze directed upward with composition preserving space in that direction';
    case 'Looking Down':
      return 'gaze directed downward with gesture and posture supporting the direction';
    case 'Looking Away':
      return 'subject looking away from the viewer creating an observational or introspective relationship';
    case 'Looking Toward Subject':
      return 'gaze connecting to another established subject with spatially coherent eye-line';
    case 'Looking Into Distance':
      return 'gaze extending beyond the immediate foreground with directional space provided';
    default:
      return `gaze ${gaze.toLowerCase()}`;
  }
}

function mapFrameOrientation(orientation: string): string {
  switch (orientation) {
    case 'Portrait / Vertical':
      return 'vertical compositional orientation';
    case 'Landscape / Horizontal':
      return 'horizontal compositional orientation';
    case 'Square':
      return 'square compositional field';
    case 'Panoramic':
      return 'strongly extended horizontal panoramic spatial reading';
    default:
      return `${orientation.toLowerCase()} orientation`;
  }
}

function mapBreathingRoom(room: string): string {
  switch (room) {
    case 'Tight':
      return 'tight framing with subject occupying a large percentage of frame and minimal surrounding space';
    case 'Balanced':
      return 'balanced framing with subject and surrounding space sharing visual importance';
    case 'Generous':
      return 'generous open space around the focal subject with restrained uncluttered composition';
    case 'Expansive':
      return 'expansive surrounding space with large areas of environment or negative space around the focal anchor';
    default:
      return `${room.toLowerCase()} breathing room`;
  }
}

function mapPerspectiveEmphasis(emphasis: string, lens: string | null): string {
  switch (emphasis) {
    case 'Flat / Graphic':
      return 'reduced apparent spatial recession emphasizing shape, silhouette, pattern, and designed arrangement';
    case 'Subtle Depth':
      return 'gentle overlap and scale changes with restrained spatial recession';
    case 'Natural Depth':
      return 'believable foreground, midground, and background relationships with normal spatial recession';
    case 'Strong Depth':
      return 'clearly separated spatial planes with foreground-to-background progression visually important';
    case 'Exaggerated Depth':
      if (lens && lens.includes('Telephoto')) {
        return 'strong spatial depth with foreground scale emphasized, balanced against telephoto compression';
      }
      return 'amplified near-far relationships with foreground scale and recession strongly emphasized';
    case 'Compressed Depth':
      if (lens && (lens.includes('Wide') || lens.includes('Ultra Wide') || lens.includes('Fisheye'))) {
        return 'reduced apparent spacing between depth planes interpreted as compositional staging';
      }
      return 'reduced apparent spacing between depth planes with background appearing closer to the subject';
    default:
      return `${emphasis.toLowerCase()} perspective`;
  }
}


// ─── Style DNA Prompt Assembler ───

export function assembleStylePrompt(dna: StyleDNA): string {
  if (!dna.styleMode && !dna.specificStyle && !dna.intensity && !dna.realismBalance && !dna.edgeLanguage && !dna.detailPhilosophy && !dna.formLanguage) {
    return '';
  }

  const parts: string[] = [];

  // Style Mode + Specific Style
  const mode = maybe(dna.styleMode);
  const specific = maybe(dna.specificStyle);
  const customStyle = maybe(dna.customStyleMode);
  const customSpecific = maybe(dna.customSpecificStyle);

  if (mode === 'Custom' && customStyle) {
    parts.push(customStyle);
  } else if (specific === 'Custom' && customSpecific) {
    parts.push(customSpecific);
  } else if (specific && specific !== 'No Selection') {
    parts.push(mapSpecificStyle(specific));
  } else if (mode && mode !== 'No Selection' && mode !== 'Custom') {
    parts.push(mapStyleMode(mode));
  }

  // Intensity
  const intensity = maybe(dna.intensity);
  const customIntensity = maybe(dna.customIntensity);
  if (intensity === 'Custom' && customIntensity) {
    parts.push(customIntensity);
  } else if (intensity && intensity !== 'No Selection') {
    parts.push(mapStyleIntensity(intensity));
  }

  // Realism Balance
  const realism = maybe(dna.realismBalance);
  const customRealism = maybe(dna.customRealismBalance);
  if (realism === 'Custom' && customRealism) {
    parts.push(customRealism);
  } else if (realism && realism !== 'No Selection') {
    parts.push(mapRealismBalance(realism));
  }

  // Edge Language
  const edge = maybe(dna.edgeLanguage);
  const customEdge = maybe(dna.customEdgeLanguage);
  if (edge === 'Custom' && customEdge) {
    parts.push(customEdge);
  } else if (edge && edge !== 'No Selection') {
    parts.push(mapEdgeLanguage(edge));
  }

  // Detail Philosophy
  const detail = maybe(dna.detailPhilosophy);
  const customDetail = maybe(dna.customDetailPhilosophy);
  if (detail === 'Custom' && customDetail) {
    parts.push(customDetail);
  } else if (detail && detail !== 'No Selection') {
    parts.push(mapDetailPhilosophy(detail));
  }

  // Form Language
  const form = maybe(dna.formLanguage);
  const customForm = maybe(dna.customFormLanguage);
  if (form === 'Custom' && customForm) {
    parts.push(customForm);
  } else if (form && form !== 'No Selection') {
    parts.push(mapFormLanguage(form));
  }
  if (parts.length === 0) return '';
  return parts.join(', ');
}

function mapStyleMode(mode: string): string {
  switch (mode) {
    case 'Realism': return 'realist visual treatment';
    case 'Painterly': return 'painterly visual treatment';
    case 'Illustrative': return 'illustrative visual treatment';
    case 'Graphic': return 'graphic visual treatment';
    case 'Abstract': return 'abstract visual treatment';
    case 'Surreal': return 'surreal visual treatment';
    case 'Historical': return 'historical visual language';
    case 'Editorial / Fashion': return 'editorial visual treatment';
    case 'Experimental': return 'experimental visual treatment';
    default: return `${mode.toLowerCase()} visual treatment`;
  }
}

function mapSpecificStyle(style: string): string {
  switch (style) {
    case 'Photorealism': return 'photorealist precision with meticulous surface detail and believable material behavior';
    case 'Ultra-Realism': return 'ultra-realist treatment with heightened detail, controlled perfection, and hyper-believable surface behavior';
    case 'Naturalistic Realism': return 'naturalistic realism preserving believable structure, light, and surface without artificial perfection';
    case 'Fine-Art Realism': return 'fine-art realism with controlled detail, refined values, and deliberate compositional clarity';
    case 'Atmospheric Realism': return 'atmospheric realism with softened spatial recession, depth through value and air, and restrained detail at distance';
    case 'Classical Realism': return 'classical realist balance with modeled form, controlled value structure, and timeless compositional clarity';
    case 'Dutch Realism': return 'Dutch-realist naturalism with controlled value hierarchy, restrained palette behavior, and quiet observational clarity';
    case 'Painterly Realism': return 'painterly realism where form remains readable through visible mark-making and color organization';
    case 'Loose Painterly': return 'loose painterly treatment with broader strokes, reduced detail emphasis, and energetic surface activity';
    case 'Expressive Painterly': return 'expressive painterly handling with dynamic mark-making, heightened color response, and emotional surface energy';
    case 'Impressionistic': return 'impressionistic treatment capturing light effect, color vibration, and momentary visual sensation over fixed detail';
    case 'Romantic Painterly': return 'romantic painterly atmosphere with dramatic scale, emotive color, and expressive form handling';
    case 'Tonalist': return 'tonalist treatment with subdued harmonious values, atmospheric unity, and restrained color emphasis';
    case 'Fine-Art Illustration': return 'fine-art illustration with refined line, controlled value, and deliberate narrative clarity';
    case 'Editorial Illustration': return 'editorial illustration with communicative clarity, stylized emphasis, and purposeful visual hierarchy';
    case 'Botanical Illustration': return 'botanical illustration with precise structural accuracy, scientific clarity, and controlled detail';
    case 'Natural History Illustration': return 'natural history illustration with observational accuracy, informative detail, and documentary clarity';
    case 'Fashion Illustration': return 'fashion illustration with elongated elegant proportions, expressive line, and stylized garment emphasis';
    case 'Storybook Illustration': return 'storybook illustration with approachable warmth, narrative charm, and readable stylization';
    case 'Art Deco': return 'Art Deco visual language with geometric precision, stylized symmetry, and elegant streamlined form';
    case 'Art Nouveau': return 'Art Nouveau visual language with organic flowing line, naturalistic ornament, and elegant curvilinear form';
    case 'Minimalist Graphic': return 'minimalist graphic treatment with essential form, restrained detail, and deliberate negative space';
    case 'Geometric': return 'geometric visual language with simplified angular form, pattern, and structured shape relationships';
    case 'Poster Art': return 'poster art language with bold shape, strong value contrast, and communicative visual impact';
    case 'Stained Glass': return 'stained glass visual language with leaded shape boundaries, luminous color fields, and mosaic-like structure';
    case 'Woodcut / Linocut Language': return 'woodcut or linocut visual language with bold carved line, high contrast, and graphic shape emphasis';
    case 'Abstract Expressionism': return 'abstract expressionist energy with gestural mark-making, emotive color, and dynamic compositional force';
    case 'Geometric Abstraction': return 'geometric abstraction with pure shape, precise relationship, and non-representational form language';
    case 'Organic Abstraction': return 'organic abstraction with flowing non-representational form, natural rhythm, and soft shape interaction';
    case 'Color Field': return 'color field treatment with large unified color areas, subtle edge vibration, and atmospheric hue interaction';
    case 'Lyrical Abstraction': return 'lyrical abstraction with poetic flowing form, harmonious color, and expressive spontaneous energy';
    case 'Surrealism': return 'surrealist visual logic with unexpected juxtaposition, dreamlike spatial behavior, and symbolic form relationship';
    case 'Dreamlike Realism': return 'dreamlike realism where believable form exists within impossible or shifted spatial logic';
    case 'Symbolic Surrealism': return 'symbolic surrealism with meaningful object transformation and metaphorical visual narrative';
    case 'Architectural Surrealism': return 'architectural surrealism with impossible structure, shifted scale, and dreamlike spatial construction';
    case 'Restrained Surrealism': return 'restrained surrealism with subtle uncanny shifts in otherwise believable representation';
    case 'Renaissance': return 'Renaissance visual language with balanced composition, modeled form, classical proportion, and restrained harmonious color';
    case 'Baroque': return 'Baroque visual language with dramatic movement, strong chiaroscuro, rich deep color, and theatrical compositional energy';
    case 'Rococo': return 'Rococo visual language with playful elegance, delicate ornament, soft pastel values, and graceful curvilinear form';
    case 'Neoclassical': return 'neoclassical visual language with clean contour, idealized form, compositional clarity, and restrained noble simplicity';
    case 'Romanticism': return 'Romantic visual language with dramatic nature, emotive scale, turbulent atmosphere, and sublime compositional power';
    case 'Victorian': return 'Victorian visual language with rich detail, dense ornament, narrative depth, and layered symbolic content';
    case 'Pre-Raphaelite': return 'Pre-Raphaelite visual language with intense saturated color, hyper-detailed nature, luminous clarity, and medieval romanticism';
    case 'Belle Époque': return 'Belle Époque visual elegance with refined grace, ornamental beauty, and sophisticated decorative harmony';
    case '1920s Deco': return '1920s Deco visual language with bold geometry, luxurious streamlined form, and modernist decorative precision';
    case 'Mid-Century': return 'mid-century visual language with clean organic form, optimistic color, and functional elegant simplicity';
    case 'Contemporary Editorial': return 'contemporary editorial visual language with sharp graphic clarity, modern composition, and fashion-forward emphasis';
    case 'Luxury Editorial': return 'luxury editorial visual language with refined restraint, premium material emphasis, and sophisticated tonal control';
    case 'Avant-Garde Fashion': return 'avant-garde fashion visual language with experimental form, bold conceptual structure, and boundary-pushing silhouette';
    case 'Beauty Editorial': return 'beauty editorial visual language with luminous flawless surface, controlled highlight, and polished aspirational clarity';
    case 'Couture Illustration': return 'couture illustration with elegant elongated form, refined line, and luxurious garment emphasis';
    case 'Mixed Visual Language': return 'mixed visual language combining multiple stylistic approaches into a single unified image';
    case 'Collage Language': return 'collage language with layered overlapping sources, cut-edge graphic quality, and assembled visual narrative';
    case 'Layered Transparency': return 'layered transparency with overlapping visible planes, translucent veils, and depth through see-through form';
    case 'Fragmented Form': return 'fragmented form with controlled broken structure, multiple viewpoints, and reassembled visual logic';
    case 'Controlled Distortion': return 'controlled distortion with deliberate proportional shift, warped perspective, and expressive structural alteration';
    default: return style.toLowerCase();
  }
}

function mapStyleIntensity(intensity: string): string {
  switch (intensity) {
    case 'Subtle': return 'style influences secondary visual characteristics while subject identity and structural realism remain strongly protected';
    case 'Moderate': return 'style clearly shapes the image while subject readability remains strong';
    case 'Strong': return 'style becomes a major visual force with structural integrity and focal hierarchy protected';
    case 'Dominant': return 'style strongly governs the visual language while preserving essential anatomy, focal clarity, and locked subject characteristics';
    default: return '';
  }
}

function mapRealismBalance(balance: string): string {
  switch (balance) {
    case 'Strictly Realistic': return 'strictly realistic with believable anatomy, materials, lighting, perspective, and surface behavior; suppress decorative stylization that contradicts physical structure';
    case 'Mostly Realistic': return 'mostly realistic with realism dominant and restrained stylistic interpretation';
    case 'Balanced': return 'balanced between realism and stylization sharing visual importance';
    case 'Mostly Stylized': return 'mostly stylized with visual interpretation prominent while recognizable subject structure remains intact';
    case 'Highly Stylized': return 'highly stylized where shape, edge, color, pattern, or rendering language may depart substantially from natural appearance while preserving essential subject recognition';
    default: return '';
  }
}

function mapEdgeLanguage(edge: string): string {
  switch (edge) {
    case 'Crisp': return 'crisp clearly resolved contours with controlled separation between major forms';
    case 'Soft': return 'soft edges with gentle transitions and reduced hard contour emphasis';
    case 'Mixed': return 'mixed edges with sharp focal edges combined with softer secondary edges';
    case 'Lost and Found': return 'lost and found edges where selected contours dissolve into surrounding values while critical edges reappear near focal areas';
    case 'Hard Graphic': return 'hard graphic edges with strong clean boundaries and flat or sharply separated shape relationships';
    case 'Painterly Broken': return 'painterly broken contours interrupted by visible mark-making and varied edge resolution';
    case 'Atmospheric': return 'atmospheric edges softening progressively through air, light, value, and depth';
    default: return '';
  }
}

function mapDetailPhilosophy(detail: string): string {
  switch (detail) {
    case 'Micro-Detailed': return 'micro-detailed with fine surface information highly resolved across important areas';
    case 'Controlled Detail': return 'controlled detail that remains rich but organized, avoiding uniform visual noise';
    case 'Focal Detail': return 'focal detail with highest resolution concentrated around the primary focal anchor and surrounding regions progressively simplified';
    case 'Simplified Secondary Detail': return 'simplified secondary detail where secondary forms remain readable but deliberately less resolved';
    case 'Broad Form': return 'broad form emphasis prioritizing large masses, silhouette, value structure, and major planes over small detail';
    case 'Decorative Detail': return 'decorative detail where ornament, pattern, or surface intricacy becomes visually important without overwhelming the focal hierarchy';
    default: return '';
  }
}

function mapFormLanguage(form: string): string {
  switch (form) {
    case 'Naturalistic': return 'naturalistic proportions and forms following believable natural structure';
    case 'Sculptural': return 'sculptural forms reading through clear volume, planes, mass, and modeled dimensionality';
    case 'Geometric': return 'geometric forms simplified or organized through deliberate geometric relationships';
    case 'Organic': return 'organic irregular natural curves and living forms dominating';
    case 'Elongated': return 'elongated proportions intentionally lengthened while maintaining coherent structure';
    case 'Simplified': return 'simplified forms reduced to essential readable masses';
    case 'Fragmented': return 'fragmented forms intentionally broken into controlled visual sections while preserving compositional logic';
    case 'Flowing': return 'flowing contours and forms transitioning through continuous directional movement';
    case 'Monumental': return 'monumental forms emphasizing weight, scale, stability, and visual authority';
    default: return '';
  }
}

// ─── Medium DNA Prompt Assembler ───

export function assembleMediumPrompt(dna: MediumDNA): string {
  if (!dna.primaryMedium && !dna.technique && !dna.markBehavior && !dna.surfaceSupport && !dna.surfaceCharacter && !dna.paintBody) {
    return '';
  }

  const parts: string[] = [];

  // Primary Medium + Technique
  const medium = maybe(dna.primaryMedium);
  const technique = maybe(dna.technique);
  const customMedium = maybe(dna.customMedium);
  const customTechnique = maybe(dna.customTechnique);

  if (medium === 'Custom' && customMedium) {
    parts.push(customMedium);
  } else if (medium && medium !== 'No Selection') {
    parts.push(mapMedium(medium, technique, customTechnique));
  }

  // Mark Behavior
  const mark = maybe(dna.markBehavior);
  const customMark = maybe(dna.customMarkBehavior);
  if (mark === 'Custom' && customMark) {
    parts.push(customMark);
  } else if (mark && mark !== 'No Selection') {
    parts.push(mapMarkBehavior(mark));
  }

  // Surface / Support
  const surface = maybe(dna.surfaceSupport);
  const customSurface = maybe(dna.customSurfaceSupport);
  if (surface === 'Custom' && customSurface) {
    parts.push(customSurface);
  } else if (surface && surface !== 'No Selection') {
    parts.push(mapSurfaceSupport(surface));
  }

  // Surface Character
  const character = maybe(dna.surfaceCharacter);
  const customCharacter = maybe(dna.customSurfaceCharacter);
  if (character === 'Custom' && customCharacter) {
    parts.push(customCharacter);
  } else if (character && character !== 'No Selection') {
    parts.push(mapSurfaceCharacter(character));
  }

  // Paint Body — only valid for paint-based media
  const isPaintMedium = medium && ['Oil Painting', 'Acrylic Painting', 'Watercolor', 'Gouache', 'Tempera', 'Digital Painting'].includes(medium);
  const body = maybe(dna.paintBody);
  const customBody = maybe(dna.customPaintBody);
  if (isPaintMedium) {
    if (body === 'Custom' && customBody) {
      parts.push(customBody);
    } else if (body && body !== 'No Selection') {
      parts.push(mapPaintBody(body));
    }
  }
  if (parts.length === 0) return '';
  return parts.join(', ');
}

function mapMedium(medium: string, technique: string | null, customTechnique: string | null): string {
  const tech = technique && technique !== 'No Selection' && technique !== 'Custom'
    ? mapTechnique(technique)
    : customTechnique || '';

  switch (medium) {
    case 'Oil Painting':
      return tech
        ? `rendered in oil with ${tech}`
        : 'rendered in oil with layered pigment behavior and visible brushwork structure';
    case 'Acrylic Painting':
      return tech
        ? `rendered in acrylic with ${tech}`
        : 'rendered in acrylic with versatile layered pigment and modern paint behavior';
    case 'Watercolor':
      return tech
        ? `rendered in watercolor with ${tech}`
        : 'rendered in transparent watercolor with luminous wash behavior and softened edge diffusion';
    case 'Gouache':
      return tech
        ? `rendered in gouache with ${tech}`
        : 'rendered in opaque gouache with flat velvety pigment and controlled matte surface';
    case 'Tempera':
      return tech
        ? `rendered in tempera with ${tech}`
        : 'rendered in tempera with fine precise detail and luminous matte surface';
    case 'Ink':
      return tech
        ? `rendered in ink with ${tech}`
        : 'rendered in ink with fluid line behavior and tonal wash variation';
    case 'Graphite':
      return tech
        ? `rendered in graphite with ${tech}`
        : 'rendered in graphite with controlled tonal gradation and fine linear detail';
    case 'Charcoal':
      return tech
        ? `rendered in charcoal with ${tech}`
        : 'rendered in charcoal with deep velvety tonal masses and soft blended transitions';
    case 'Pastel':
      return tech
        ? `rendered in pastel with ${tech}`
        : 'rendered in pastel with powdery pigment layers and soft blended color transitions';
    case 'Colored Pencil':
      return tech
        ? `rendered in colored pencil with ${tech}`
        : 'rendered in colored pencil with layered waxy pigment and fine controlled mark-making';
    case 'Digital Painting':
      return tech
        ? `rendered as digital painting with ${tech}`
        : 'rendered as digital painting with smooth controlled pigment and versatile brush behavior';
    case 'Digital Illustration':
      return tech
        ? `rendered as digital illustration with ${tech}`
        : 'rendered as digital illustration with clean precise form and controlled digital mark-making';
    case 'Photography':
      return tech
        ? `captured photographically with ${tech}`
        : 'captured photographically with natural light behavior and lens-based image formation';
    case 'Mixed Media':
      return tech
        ? `rendered in mixed media with ${tech}`
        : 'rendered in mixed media with layered material combinations and diverse surface behavior';
    case 'Collage':
      return tech
        ? `rendered as collage with ${tech}`
        : 'rendered as collage with assembled layered sources and cut-edge graphic quality';
    case 'Printmaking':
      return tech
        ? `rendered as printmaking with ${tech}`
        : 'rendered as printmaking with ink-transfer character and matrix-based mark behavior';
    case 'Sculptural / 3D Render':
      return tech
        ? `rendered as sculptural or 3D with ${tech}`
        : 'rendered as sculptural or 3D with modeled volumetric form and material surface simulation';
    default:
      return medium.toLowerCase();
  }
}

function mapTechnique(technique: string): string {
  switch (technique) {
    // Oil
    case 'Glazing': return 'thin transparent glazes building depth through layered luminosity';
    case 'Impasto': return 'substantial impasto buildup and raised pigment ridges catching light';
    case 'Alla Prima': return 'wet-into-wet alla prima handling and fresh spontaneous surface';
    case 'Scumbling': return 'scumbled dry-brush layers creating atmospheric veil and broken color';
    case 'Layered Classical': return 'layered classical technique with underpainting and controlled overlayering';
    case 'Palette Knife': return 'palette-knife texture with broad deposited ridges and scraped transitions';
    case 'Fine Brushwork': return 'fine controlled brushwork building precise detail and smooth transitions';
    case 'Loose Brushwork': return 'loose economical brushwork implying form through broader gestural strokes';
    // Acrylic
    case 'Layered Acrylic': return 'layered acrylic passages building depth through successive transparent and opaque coats';
    case 'Acrylic Glazing': return 'acrylic glazing with transparent color veils and controlled luminosity';
    case 'Heavy Body': return 'heavy body acrylic with substantial pigment texture and visible stroke relief';
    case 'Dry Brush': return 'dry brush technique with broken pigment catching raised texture';
    case 'Fluid Acrylic': return 'fluid acrylic with poured and flowing pigment behavior';
    case 'Smooth Blending': return 'smooth acrylic blending with gradual tonal and color transitions';
    // Watercolor
    case 'Wet-on-Wet': return 'wet-on-wet pigment diffusion and soft blooms';
    case 'Wet-on-Dry': return 'wet-on-dry controlled edge and precise shape definition';
    case 'Granulation': return 'granulating pigment separating into visible crystalline texture';
    case 'Loose Wash': return 'loose washes with broad flowing color and spontaneous edge behavior';
    case 'Controlled Wash': return 'controlled washes with precise boundaries and deliberate value layering';
    // Gouache
    case 'Opaque Layering': return 'opaque layering with flat velvety color and controlled overlap';
    case 'Flat Gouache': return 'flat gouache areas with even matte coverage and graphic clarity';
    case 'Graphic Gouache': return 'graphic gouache with bold shape and strong flat color';
    // Ink
    case 'Fine Line': return 'fine precise line work and controlled contour';
    case 'Brush Ink': return 'brush ink with varied line weight and expressive stroke quality';
    case 'Ink Wash': return 'ink wash with tonal gradation and atmospheric dilution';
    case 'Cross-Hatching': return 'cross-hatching building tone through intersecting linear marks';
    case 'Stippling': return 'stippling building tone through dense dot accumulation';
    case 'Expressive Ink': return 'expressive ink with dynamic gesture and energetic mark-making';
    // Graphite
    case 'Fine Rendering': return 'fine rendering with precise gradation and controlled detail';
    case 'Soft Shading': return 'soft shading with smooth tonal transitions';
    case 'Loose Sketch': return 'loose sketch with exploratory line and spontaneous form finding';
    case 'Tonal Graphite': return 'tonal graphite with broad value masses and atmospheric effect';
    // Charcoal
    case 'Vine Charcoal': return 'vine charcoal with soft easily lifted deposits and delicate tonal control';
    case 'Compressed Charcoal': return 'compressed charcoal with dense dark deposits and strong value range';
    case 'Powdered Charcoal': return 'powdered charcoal with soft atmospheric tonal veils';
    case 'Blended Tonal': return 'blended tonal masses with smooth gradation and soft atmospheric depth';
    case 'Expressive Mark': return 'expressive charcoal marks with dynamic gesture and energetic tonal contrast';
    // Pastel
    case 'Soft Pastel': return 'soft pastel with powdery deposits and gentle blended color layers';
    case 'Oil Pastel': return 'oil pastel with waxy bold color and buttery blendability';
    case 'Layered Pastel': return 'layered pastel with successive color veils and optical mixing';
    case 'Blended Pastel': return 'blended pastel with smooth color fusion and soft atmospheric transitions';
    case 'Textured Pastel': return 'textured pastel with visible stroke quality and broken color';
    // Digital
    case 'Smooth Digital Painting': return 'smooth digital painting with refined blending and seamless surface';
    case 'Painterly Digital': return 'painterly digital with visible brush simulation and textured mark-making';
    case 'Digital Impasto Simulation': return 'digital impasto simulation with raised texture and simulated pigment relief';
    case 'Airbrush': return 'airbrush with soft gradient and seamless tonal transition';
    case 'Textured Brushwork': return 'textured digital brushwork with varied stroke quality';
    case 'Mixed Digital Brushwork': return 'mixed digital brushwork combining multiple simulated tools';
    // Photography
    case 'Natural Photography': return 'natural unmanipulated photographic capture';
    case 'Fine-Art Photography': return 'fine-art photographic treatment with deliberate composition and tonal control';
    case 'Editorial Photography': return 'editorial photographic clarity with communicative framing and sharp detail';
    case 'Studio Photography': return 'studio photography with controlled lighting and clean background separation';
    case 'Environmental Photography': return 'environmental photography with natural context and authentic setting';
    case 'Documentary Photography': return 'documentary photography with observational clarity and narrative context';
    case 'Macro Photography': return 'macro photography with extreme close-up detail and narrow depth of field';
    // Mixed Media / Collage / Printmaking / 3D
    case 'Paint + Drawing': return 'combined paint and drawing media with layered mixed surface behavior';
    case 'Paint + Collage': return 'combined paint and collage with assembled layered elements';
    case 'Ink + Wash': return 'ink and wash combination with line and tonal dilution';
    case 'Digital + Traditional': return 'digital and traditional media combined into unified surface';
    case 'Layered Mixed Media': return 'layered mixed media with diverse material interactions';
    case 'Layered Paper': return 'layered paper collage with overlapping cut elements';
    case 'Photographic Collage': return 'photographic collage with assembled image fragments';
    case 'Painted Collage': return 'painted collage combining brushwork with assembled elements';
    case 'Mixed Material': return 'mixed material collage with diverse surface textures';
    case 'Etching': return 'etched line with ink held in incised grooves and characteristic plate tone';
    case 'Engraving': return 'engraved line with sharp precise burin marks and clean ink deposits';
    case 'Linocut': return 'linocut with bold carved shape and graphic flat color';
    case 'Woodcut': return 'woodcut with bold carved line and strong graphic contrast';
    case 'Lithograph': return 'lithographic crayon and wash marks with characteristic grain and tonal range';
    case 'Screenprint': return 'screenprint with flat opaque color layers and sharp registration';
    case 'Clay': return 'clay surface with earthy material warmth and hand-worked texture';
    case 'Bronze': return 'bronze surface with metallic warmth and patina variation';
    case 'Marble': return 'marble surface with cool stone luminosity and veined crystalline structure';
    case 'Porcelain': return 'porcelain surface with refined smooth glaze and delicate ceramic luminosity';
    case 'Resin': return 'resin surface with synthetic clarity and molded precision';
    case 'Digital Sculpt': return 'digital sculpt with modeled volumetric form and virtual material behavior';
    case 'Photoreal 3D Render': return 'photorealistic 3D render with simulated light, material, and camera behavior';
    case 'Stylized 3D Render': return 'stylized 3D render with controlled artistic interpretation of form and material';
    default:
      return technique.toLowerCase();
  }
}

function mapMarkBehavior(mark: string): string {
  switch (mark) {
    case 'Invisible / Smooth': return 'invisible smooth transitions with refined surface and no dominant individual strokes';
    case 'Fine Controlled': return 'fine controlled marks building precise form and detail through small deliberate strokes';
    case 'Visible Brushwork': return 'visible brushwork with direction and stroke structure remaining present';
    case 'Loose Brushwork': return 'loose brushwork with broader economical strokes implying form without over-rendering';
    case 'Broken Marks': return 'broken marks with interrupted strokes allowing underlying layers to participate visually';
    case 'Palette-Knife Texture': return 'palette-knife texture with broad deposited ridges and scraped tactile surface variation';
    case 'Dry Brush Texture': return 'dry brush texture with broken pigment catching raised surface and leaving irregular gaps';
    case 'Gestural': return 'gestural marks with energetic directional strokes communicating movement and construction';
    case 'Graphic Flat': return 'graphic flat areas with minimal modeled brush texture and clean controlled value';
    default: return '';
  }
}

function mapSurfaceSupport(support: string): string {
  switch (support) {
    case 'Canvas': return 'over a subtly woven canvas surface';
    case 'Fine Linen': return 'over fine linen with restrained surface tooth';
    case 'Wood Panel': return 'over rigid wood panel suited to controlled layered work';
    case 'Watercolor Paper': return 'on watercolor paper with visible tooth and absorbency affecting pigment behavior';
    case 'Textured Paper': return 'on textured paper where visible tooth affects dry media and broken pigment';
    case 'Smooth Paper': return 'on smooth paper supporting controlled fine rendering with reduced surface interruption';
    case 'Illustration Board': return 'on firm illustration board suited to precise mixed or opaque media';
    case 'Digital Canvas': return 'on digital canvas without simulated physical texture unless explicitly requested';
    case 'Photographic Surface': return 'on photographic surface without painted canvas texture';
    default: return '';
  }
}

function mapSurfaceCharacter(character: string): string {
  switch (character) {
    case 'Matte': return 'matte surface with low reflective sheen reading softly without specular emphasis';
    case 'Satin': return 'satin surface with restrained soft sheen and controlled highlight response';
    case 'Glossy': return 'glossy surface with visibly reflective finish appropriate to the medium';
    case 'Velvety': return 'velvety surface with soft dense tonal quality';
    case 'Chalky': return 'chalky dry matte pigment character with soft powdery visual texture';
    case 'Translucent': return 'translucent with underlying layers or support partially influencing visible color';
    case 'Opaque': return 'opaque with strong covering power and reduced substrate visibility';
    case 'Layered': return 'layered surface with visible depth created through multiple material passes';
    case 'Tactile': return 'tactile surface with physical variation visibly present';
    case 'Smooth': return 'smooth refined continuous surface with reduced visible tooth or mark interruption';
    default: return '';
  }
}

function mapPaintBody(body: string): string {
  switch (body) {
    case 'Thin': return 'thin restrained paint thickness with subtle surface texture';
    case 'Transparent': return 'transparent with underlying layers influencing visible color and depth';
    case 'Layered': return 'layered with multiple paint passages building depth and complexity';
    case 'Moderate Body': return 'moderate paint body with visible presence without extreme relief';
    case 'Thick': return 'thick substantial physical paint body and visible stroke relief';
    case 'Heavy Impasto': return 'heavy impasto with pronounced raised ridges and tactile pigment buildup catching light';
    default: return '';
  }
}


// ─── Finish DNA Prompt Assembler ───

export function assembleFinishPrompt(dna: FinishDNA): string {
  const character = maybe(dna.finishCharacter);
  const customCharacter = maybe(dna.customFinishCharacter);
  const intensity = maybe(dna.finishIntensity);
  const resolution = maybe(dna.resolutionCharacter);
  const customResolution = maybe(dna.customResolutionCharacter);
  const edge = maybe(dna.edgeFinish);
  const customEdge = maybe(dna.customEdgeFinish);
  const contrast = maybe(dna.contrastFinish);
  const customContrast = maybe(dna.customContrastFinish);
  const highlight = maybe(dna.highlightHandling);
  const customHighlight = maybe(dna.customHighlightHandling);
  const shadow = maybe(dna.shadowHandling);
  const customShadow = maybe(dna.customShadowHandling);
  const atmospheric = maybe(dna.atmosphericIntegration);
  const customAtmospheric = maybe(dna.customAtmosphericIntegration);
  const polish = maybe(dna.surfacePolish);
  const customPolish = maybe(dna.customSurfacePolish);
  const texture = maybe(dna.texturePreservation);
  const customTexture = maybe(dna.customTexturePreservation);

  const parts: string[] = [];

  // 1. Finish Character (primary behavior)
  if (character && character !== 'Custom') {
    parts.push(mapFinishCharacter(character, intensity));
  } else if (character === 'Custom' && customCharacter) {
    parts.push(customCharacter);
  }

  // 2. Resolution Character
  if (resolution && resolution !== 'Custom') {
    parts.push(mapResolutionCharacter(resolution));
  } else if (resolution === 'Custom' && customResolution) {
    parts.push(customResolution);
  }

  // 3. Edge Finish
  if (edge && edge !== 'Custom') {
    parts.push(mapEdgeFinish(edge));
  } else if (edge === 'Custom' && customEdge) {
    parts.push(customEdge);
  }

  // 4. Contrast Finish
  if (contrast && contrast !== 'Custom') {
    parts.push(mapContrastFinish(contrast));
  } else if (contrast === 'Custom' && customContrast) {
    parts.push(customContrast);
  }

  // 5. Highlight Handling
  if (highlight && highlight !== 'Custom') {
    parts.push(mapHighlightHandling(highlight));
  } else if (highlight === 'Custom' && customHighlight) {
    parts.push(customHighlight);
  }

  // 6. Shadow Handling
  if (shadow && shadow !== 'Custom') {
    parts.push(mapShadowHandling(shadow));
  } else if (shadow === 'Custom' && customShadow) {
    parts.push(customShadow);
  }

  // 7. Atmospheric Integration
  if (atmospheric && atmospheric !== 'Custom') {
    parts.push(mapAtmosphericIntegration(atmospheric));
  } else if (atmospheric === 'Custom' && customAtmospheric) {
    parts.push(customAtmospheric);
  }

  // 8. Surface Polish
  if (polish && polish !== 'Custom') {
    parts.push(mapSurfacePolish(polish));
  } else if (polish === 'Custom' && customPolish) {
    parts.push(customPolish);
  }

  // 9. Texture Preservation
  if (texture && texture !== 'Custom') {
    parts.push(mapTexturePreservation(texture));
  } else if (texture === 'Custom' && customTexture) {
    parts.push(customTexture);
  }

  if (parts.length === 0) return '';
  console.log('[assembleFinishPrompt] dna.highlightHandling=', dna.highlightHandling, 'parts=', parts);
  return parts.join(', ');
}

function mapFinishCharacter(character: string, intensity: string | null): string {
  const i = intensity && intensity !== 'Custom' ? ` ${intensity.toLowerCase()}` : '';
  switch (character) {
    case 'Natural':
      return `finished with${i} believable natural rendering, restrained processing, and credible surface transitions`;
    case 'Cinematic':
      return `finished with${i} controlled dramatic resolution, intentional highlight and shadow shaping, and strong focal hierarchy`;
    case 'Polished':
      return `finished with${i} highly resolved presentation, clean transitions, and controlled edges`;
    case 'Museum / Gallery':
      return `finished with${i} carefully resolved presentation, disciplined value structure, and intentional surface handling`;
    case 'Editorial':
      return `finished with${i} deliberate presentation hierarchy, strong visual clarity, and decisive focal organization`;
    case 'Atmospheric':
      return `finished with${i} emphasis on air, depth, environmental integration, and gradual transitions`;
    case 'Raw / Painterly':
      return `finished with${i} preserved visible construction, expressive marks, and imperfect transitions`;
    case 'Soft / Ethereal':
      return `finished with${i} softened transitions, restrained contrast, and delicate atmospheric integration`;
    case 'Dramatic':
      return `finished with${i} stronger visual separation, decisive focal emphasis, and controlled high-impact transitions`;
    case 'Graphic / Crisp':
      return `finished with${i} clean separation of forms, decisive edges, and controlled visual clarity`;
    case 'Vintage / Aged':
      return `finished with${i} subtly time-worn presentation and restrained aging behavior`;
    case 'Archival / Timeless':
      return `finished with${i} restrained trend-neutral resolution, balanced values, and enduring visual coherence`;
    case 'Dreamlike':
      return `finished with${i} gentle perceptual softness, subtly altered transitions, and controlled ambiguity`;
    case 'Tactile':
      return `finished with${i} emphasis on perceivable surface presence and material variation`;
    case 'Minimal / Restrained':
      return `finished with${i} removed unnecessary complexity, clean hierarchy, and limited decorative processing`;
    default:
      return `finished with${i} ${character.toLowerCase()} presentation`;
  }
}

function mapResolutionCharacter(resolution: string): string {
  switch (resolution) {
    case 'Clean': return 'unnecessary visual noise reduced and important forms kept clear';
    case 'Refined': return 'transitions and relationships carefully resolved';
    case 'Highly Resolved': return 'high final-definition treatment with fine information remaining coherent';
    case 'Controlled Imperfection': return 'selected irregularities and human or material character preserved';
    case 'Organic': return 'natural variation visible and mechanical uniformity avoided';
    case 'Pristine': return 'exceptionally clean final presentation with surface interruptions minimized';
    default: return `${resolution.toLowerCase()} final resolution`;
  }
}

function mapEdgeFinish(edge: string): string {
  switch (edge) {
    case 'Natural Transition': return 'edges transition according to believable form, depth, atmosphere, and material behavior';
    case 'Clean Controlled': return 'important boundaries remain clean and deliberate';
    case 'Soft Integrated': return 'transitions merge gently into surrounding atmosphere';
    case 'Selective Sharpness': return 'strongest edge definition reserved for important focal information';
    case 'Crisp': return 'decisive form separation and high edge clarity';
    case 'Lost and Found': return 'selected edges dissolve into surrounding value while important structural edges re-emerge where needed';
    default: return `${edge.toLowerCase()} edge handling`;
  }
}

function mapContrastFinish(contrast: string): string {
  switch (contrast) {
    case 'Gentle': return 'restrained separation between major values with gradual transitions preserved';
    case 'Balanced': return 'clear value separation without excessive global contrast';
    case 'Focal Contrast': return 'strongest contrast concentrated near the primary focal anchor';
    case 'Strong': return 'decisive value separation preserving highlight and shadow information';
    case 'Compressed': return 'narrower final value range with quieter transitions';
    default: return `${contrast.toLowerCase()} contrast`;
  }
}

function mapHighlightHandling(highlight: string): string {
  switch (highlight) {
    case 'Natural': return 'highlights follow believable surface and illumination behavior';
    case 'Protected': return 'important highlight information remains resolved without broad clipping';
    case 'Luminous': return 'bright regions feel internally radiant while retaining useful tonal information';
    case 'Restrained': return 'highlight intensity remains controlled and subordinate to structure';
    case 'Crisp': return 'small important highlights resolve decisively where physically appropriate';
    case 'Soft Roll-Off': return 'brightest values transition gradually rather than ending abruptly';
    default: return `${highlight.toLowerCase()} highlight handling`;
  }
}

function mapShadowHandling(shadow: string): string {
  switch (shadow) {
    case 'Open': return 'shadow regions retain greater readable information';
    case 'Natural': return 'shadows preserve believable value relationships';
    case 'Deep': return 'stronger dark massing while retaining structural form';
    case 'Protected Detail': return 'important information remains visible within darker regions';
    case 'Soft': return 'shadow transitions remain gradual and integrated';
    case 'Rich': return 'shadows retain tonal complexity rather than collapsing into flat darkness';
    default: return `${shadow.toLowerCase()} shadow handling`;
  }
}

function mapAtmosphericIntegration(atmospheric: string): string {
  switch (atmospheric) {
    case 'None': return 'no additional atmospheric integration applied';
    case 'Subtle': return 'slight environmental integration between forms and surrounding space';
    case 'Moderate': return 'clearly perceptible atmospheric cohesion and depth transitions';
    case 'Deep': return 'strong atmospheric integration across spatial planes';
    case 'Focal Protection': return 'atmospheric complexity increases away from the focal anchor while the primary subject remains cleaner';
    default: return `${atmospheric.toLowerCase()} atmospheric integration`;
  }
}

function mapSurfacePolish(polish: string): string {
  switch (polish) {
    case 'Unpolished': return 'purposeful roughness and construction evidence preserved';
    case 'Natural': return 'surface variation remains believable and materially appropriate';
    case 'Controlled': return 'distracting irregularities reduced while physical character remains';
    case 'Refined': return 'surface presentation carefully resolved without erasing material identity';
    case 'Highly Polished': return 'extremely controlled final surface presentation';
    default: return `${polish.toLowerCase()} surface polish`;
  }
}

function mapTexturePreservation(texture: string): string {
  switch (texture) {
    case 'Minimal': return 'texture remains understated';
    case 'Selective': return 'texture emphasized primarily where compositionally useful';
    case 'Natural': return 'believable surface variation remains visible';
    case 'Strong': return 'texture becomes an important part of final presentation';
    case 'Material Priority': return 'material physical behavior determines which textures remain visible';
    default: return `${texture.toLowerCase()} texture preservation`;
  }
}

// ─── Full Prompt Assembler ───

export function assembleFullPrompt(modules: Record<ModuleId, ModuleState>): string {
  const parts: string[] = [];

  for (const id of MODULE_ORDER) {
    const mod = modules[id];
    if (!mod || mod.skipped) continue;

    if (id === 'intent' && mod.intentDNA) {
      const intentText = assembleIntentPrompt(mod.intentDNA);
      if (intentText) parts.push(intentText);
    } else if (id === 'world' && mod.worldDNA) {
      const worldText = assembleWorldPrompt(mod.worldDNA);
      if (worldText) parts.push(worldText);
    } else if (id === 'atmosphere' && mod.atmosphereDNA) {
      const atmosphereText = assembleAtmospherePrompt(mod.atmosphereDNA);
      if (atmosphereText) parts.push(atmosphereText);
    } else if (id === 'anchor' && mod.anchorDNA) {
      const anchorText = assembleAnchorPrompt(mod.anchorDNA);
      if (anchorText) parts.push(anchorText);
    } else if (id === 'subject' && mod.subjectDNA) {
      const subjectText = assembleSubjectPrompt(mod.subjectDNA);
      if (subjectText) parts.push(subjectText);
    } else if (id === 'detail' && mod.elements && mod.elements.length > 0) {
      const elementText = assembleElements(mod.elements);
      if (elementText) parts.push(elementText);
    } else if (id === 'color' && mod.colorDNA) {
      const colorText = assembleColorPrompt(mod.colorDNA);
      if (colorText) parts.push(colorText);
    } else if (id === 'light' && mod.lightDNA) {
      const lightText = assembleLightPrompt(mod.lightDNA);
      if (lightText) parts.push(lightText);
    } else if (id === 'camera' && mod.cameraDNA) {
      const subjectMod = modules['subject'];
      const subjectDNA = subjectMod?.subjectDNA ?? null;
      const cameraText = assembleCameraPrompt(mod.cameraDNA, subjectDNA);
      if (cameraText) parts.push(cameraText);
    } else if (id === 'format' && mod.formatDNA) {
      const formatText = assembleFormatPrompt(mod.formatDNA);
      if (formatText) parts.push(formatText);
    } else if (id === 'style' && mod.styleDNA) {
      const styleText = assembleStylePrompt(mod.styleDNA);
      if (styleText) parts.push(styleText);
    } else if (id === 'medium' && mod.mediumDNA) {
      const mediumText = assembleMediumPrompt(mod.mediumDNA);
      if (mediumText) parts.push(mediumText);
    } else if (id === 'finish' && mod.finishDNA) {
      const finishText = assembleFinishPrompt(mod.finishDNA);
      if (finishText) parts.push(finishText);
    } else if (id === 'exclusions' && mod.exclusionDNA) {
      const exclusionText = assembleExclusionPrompt(mod.exclusionDNA);
      if (exclusionText) parts.push(exclusionText);
    } else {
      if (mod.value) {
        parts.push(`${MODULE_LABELS[id]}: ${mod.value}`);
      }
    }

    if (!['intent', 'world', 'atmosphere', 'anchor'].includes(id) && mod.customText.trim()) {
      parts.push(mod.customText.trim());
    }
  }

  return parts.join('. ');
}
