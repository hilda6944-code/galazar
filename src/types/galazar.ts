// GALAZAR Core Type Definitions
// Phase 7 — Style + Medium DNA

export type ModuleId =
  | 'intent'
  | 'world'
  | 'atmosphere'
  | 'anchor'
  | 'subject'
  | 'detail'
  | 'light'
  | 'color'
  | 'camera'
  | 'format'
  | 'style'
  | 'medium'
  | 'finish'
  | 'exclusions';

export const MODULE_ORDER: ModuleId[] = [
  'intent',
  'world',
  'atmosphere',
  'anchor',
  'subject',
  'detail',
  'camera',
  'format',
  'light',
  'color',
  'style',
  'medium',
  'finish',
  'exclusions',
];

export const MODULE_LABELS: Record<ModuleId, string> = {
  intent: 'Intent',
  world: 'World',
  atmosphere: 'Atmosphere',
  anchor: 'Anchor',
  subject: 'Subject',
  detail: 'Detail',
  light: 'Light',
  color: 'Color',
  camera: 'Camera & Composition',
  format: 'Format',
  style: 'Style',
  medium: 'Medium',
  finish: 'Finish',
  exclusions: 'Exclusions',
};

export type ModuleStatus = 'empty' | 'active' | 'locked';

// ──────────────────────────────────────────────────────────────
// Subject DNA Types (Phase 2)
// ──────────────────────────────────────────────────────────────

export interface HumanDNA {
  presentation: string | null;
  age: string | null;
  appearance: string;
  skin: string | null;
  hairColor: string | null;
  hairLength: string | null;
  hairTexture: string | null;
  hairStyle: string | null;
  eyes: string | null;
  expression: string | null;
  clothing: string | null;
  material: string | null;
  identityLock: boolean;
}

export interface AnimalDNA {
  category: string | null;
  type: string;
  breed: string;
  animalClass: string | null;
  body: string | null;
  surface: string | null;
  expression: string | null;
  movement: string | null;
  anatomyLock: boolean;
  appearanceLock: boolean;
}

export interface BirdDNA {
  birdType: string;
  featherDetail: string | null;
  featherCondition: string | null;
  featherColor: string | null;
  featherBehavior: string | null;
}

export interface LandscapeDNA {
  landscapeType: string;
  terrain: string | null;
  water: string | null;
  sky: string | null;
  weather: string | null;
  season: string | null;
  environmentalAnchor: string;
  anchorLock: boolean;
}

export interface StillLifeDNA {
  primaryObject: string;
  arrangement: string | null;
  surface: string | null;
  condition: string | null;
}

export interface ArchitectureDNA {
  structure: string;
  condition: string | null;
  exteriorMaterial: string | null;
  character: string | null;
}

export interface CustomSubjectDNA {
  description: string;
}

export interface SubjectDNA {
  subjectType: string | null;
  human: HumanDNA;
  animal: AnimalDNA;
  bird: BirdDNA;
  landscape: LandscapeDNA;
  stillLife: StillLifeDNA;
  architecture: ArchitectureDNA;
  custom: CustomSubjectDNA;
}

export function createEmptyHumanDNA(): HumanDNA {
  return {
    presentation: null, age: null, appearance: '', skin: null,
    hairColor: null, hairLength: null, hairTexture: null, hairStyle: null,
    eyes: null, expression: null, clothing: null, material: null,
    identityLock: false,
  };
}

export function createEmptyAnimalDNA(): AnimalDNA {
  return {
    category: null, type: '', breed: '', animalClass: null,
    body: null, surface: null, expression: null, movement: null,
    anatomyLock: false, appearanceLock: false,
  };
}

export function createEmptyBirdDNA(): BirdDNA {
  return { birdType: '', featherDetail: null, featherCondition: null, featherColor: null, featherBehavior: null };
}

export function createEmptyLandscapeDNA(): LandscapeDNA {
  return { landscapeType: '', terrain: null, water: null, sky: null, weather: null, season: null, environmentalAnchor: '', anchorLock: false };
}

export function createEmptyStillLifeDNA(): StillLifeDNA {
  return { primaryObject: '', arrangement: null, surface: null, condition: null };
}

export function createEmptyArchitectureDNA(): ArchitectureDNA {
  return { structure: '', condition: null, exteriorMaterial: null, character: null };
}

export function createEmptyCustomSubjectDNA(): CustomSubjectDNA {
  return { description: '' };
}

export function createEmptySubjectDNA(): SubjectDNA {
  return {
    subjectType: null,
    human: createEmptyHumanDNA(),
    animal: createEmptyAnimalDNA(),
    bird: createEmptyBirdDNA(),
    landscape: createEmptyLandscapeDNA(),
    stillLife: createEmptyStillLifeDNA(),
    architecture: createEmptyArchitectureDNA(),
    custom: createEmptyCustomSubjectDNA(),
  };
}

// ──────────────────────────────────────────────────────────────
// Element Types (Phase 3)
// ──────────────────────────────────────────────────────────────

export type ElementCategory =
  | 'Flower / Plant'
  | 'Animal / Pet'
  | 'Bird'
  | 'Person'
  | 'Object'
  | 'Clothing / Fabric'
  | 'Headwear'
  | 'Accessory / Jewelry'
  | 'Environmental Element'
  | 'Story Element'
  | 'Other / Custom';

export const ELEMENT_CATEGORIES: ElementCategory[] = [
  'Flower / Plant',
  'Animal / Pet',
  'Bird',
  'Person',
  'Object',
  'Clothing / Fabric',
  'Headwear',
  'Accessory / Jewelry',
  'Environmental Element',
  'Story Element',
  'Other / Custom',
];

export interface Element {
  id: string;
  category: ElementCategory | null;
  active: boolean;
  locked: boolean;

  // ── Common typed identity ──
  typedName: string;

  // ── Flower / Plant ──
  flowerType: string;
  flowerColor: string | null;
  flowerCondition: string | null;
  flowerPlacement: string | null;

  // ── Animal / Pet ──
  animalType: string;
  animalBreed: string;
  animalExpression: string | null;
  animalMovement: string | null;

  // ── Bird ──
  birdType: string;
  birdFeatherDetail: string | null;
  birdFeatherCondition: string | null;
  birdFeatherColor: string | null;
  birdFeatherBehavior: string | null;

  // ── Person ──
  personDescription: string;
  personPresentation: string | null;
  personAge: string | null;
  personRole: string;

  // ── Object ──
  objectType: string;
  objectMaterial: string | null;
  objectCondition: string | null;
  objectPlacement: string | null;

  // ── Clothing / Fabric ──
  clothingItem: string;
  clothingMaterial: string | null;
  clothingBehavior: string | null;
  clothingApplyTo: string;

  // ── Headwear ──
  headwearType: string;
  headwearMaterial: string | null;
  headwearStyle: string;

  // ── Accessory / Jewelry ──
  accessoryType: string;
  accessoryMaterial: string | null;
  accessoryPlacement: string | null;

  // ── Environmental Element ──
  envElement: string;
  envBehavior: string;

  // ── Story Element ──
  storyMoment: string;
  storyIncludePhysical: string | null;
  storyVisibleElement: string;

  // ── Other / Custom ──
  customDescription: string;
  customPlacement: string;
}

export function createEmptyElement(id?: string): Element {
  return {
    id: id ?? `elem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    category: null,
    active: true,
    locked: false,
    typedName: '',

    flowerType: '', flowerColor: null, flowerCondition: null, flowerPlacement: null,
    animalType: '', animalBreed: '', animalExpression: null, animalMovement: null,
    birdType: '', birdFeatherDetail: null, birdFeatherCondition: null, birdFeatherColor: null, birdFeatherBehavior: null,
    personDescription: '', personPresentation: null, personAge: null, personRole: '',
    objectType: '', objectMaterial: null, objectCondition: null, objectPlacement: null,
    clothingItem: '', clothingMaterial: null, clothingBehavior: null, clothingApplyTo: '',
    headwearType: '', headwearMaterial: null, headwearStyle: '',
    accessoryType: '', accessoryMaterial: null, accessoryPlacement: null,
    envElement: '', envBehavior: '',
    storyMoment: '', storyIncludePhysical: null, storyVisibleElement: '',
    customDescription: '', customPlacement: '',
  };
}

// ──────────────────────────────────────────────────────────────
// Color DNA Types (Phase 4)
// ──────────────────────────────────────────────────────────────

export interface LimitedPaletteColor {
  colorName: string;
  hex: string;
  role: string | null;
  coverage: string;
}

export interface CustomPaletteRole {
  colorName: string;
  hex: string;
  coverage: string;
}

export interface ColorDNA {
  colorDirection: string | null;
  colorLock: boolean;

  // Monochrome
  monochromeType: string | null;
  monochromeDescription: string;

  // Limited Palette
  limitedPaletteSize: string | null;
  limitedPaletteColors: LimitedPaletteColor[];

  // Color Harmony
  harmonyType: string | null;
  harmonyPrimaryColor: string;
  harmonySecondaryColor: string;
  harmonyAccentColor: string;
  harmonyAnchorColor: string;

  // Custom Palette
  customDominant: CustomPaletteRole;
  customSecondary: CustomPaletteRole;
  customAnchor: CustomPaletteRole;
  customAccent: CustomPaletteRole;
}

export function createEmptyLimitedPaletteColor(): LimitedPaletteColor {
  return { colorName: '', hex: '', role: null, coverage: '' };
}

export function createEmptyCustomPaletteRole(): CustomPaletteRole {
  return { colorName: '', hex: '', coverage: '' };
}

export function createEmptyColorDNA(): ColorDNA {
  return {
    colorDirection: null,
    colorLock: false,
    monochromeType: null,
    monochromeDescription: '',
    limitedPaletteSize: null,
    limitedPaletteColors: Array.from({ length: 4 }, () => createEmptyLimitedPaletteColor()),
    harmonyType: null,
    harmonyPrimaryColor: '',
    harmonySecondaryColor: '',
    harmonyAccentColor: '',
    harmonyAnchorColor: '',
    customDominant: createEmptyCustomPaletteRole(),
    customSecondary: createEmptyCustomPaletteRole(),
    customAnchor: createEmptyCustomPaletteRole(),
    customAccent: createEmptyCustomPaletteRole(),
  };
}

// ──────────────────────────────────────────────────────────────
// Light DNA Types (Phase 5)
// ──────────────────────────────────────────────────────────────

export interface LightDNA {
  lightingMode: string | null;
  lightSource: string | null;
  lightDirection: string | null;
  lightQuality: string | null;
  intensity: string | null;
  lightingStructure: string | null;
  naturalLightCondition: string | null;
  focalLightPriority: string | null;
  focalLightCustomTarget: string;
  lightLock: boolean;
  customLightingDescription: string;
}

export function createEmptyLightDNA(): LightDNA {
  return {
    lightingMode: null,
    lightSource: null,
    lightDirection: null,
    lightQuality: null,
    intensity: null,
    lightingStructure: null,
    naturalLightCondition: null,
    focalLightPriority: null,
    focalLightCustomTarget: '',
    lightLock: false,
    customLightingDescription: '',
  };
}

// ──────────────────────────────────────────────────────────────
// Camera DNA Types (Phase 6)
// ──────────────────────────────────────────────────────────────

export interface CameraDNA {
  cameraMode: string | null;
  lens: string | null;
  customLens: string;
  angle: string | null;
  customAngle: string;
  shotSize: string | null;
  customShotSize: string;
  depthOfField: string | null;
  customDepthOfField: string;
  focusTarget: string | null;
  customFocusTarget: string;
  composition: string | null;
  customComposition: string;
  subjectPlacement: string | null;
  customSubjectPlacement: string;
  gazeDirection: string | null;
  customGazeDirection: string;
  frameOrientation: string | null;
  customFrameOrientation: string;
  breathingRoom: string | null;
  customBreathingRoom: string;
  perspectiveEmphasis: string | null;
  customPerspectiveEmphasis: string;
  cameraLock: boolean;
}

export function createEmptyCameraDNA(): CameraDNA {
  return {
    cameraMode: null,
    lens: null,
    customLens: '',
    angle: null,
    customAngle: '',
    shotSize: null,
    customShotSize: '',
    depthOfField: null,
    customDepthOfField: '',
    focusTarget: null,
    customFocusTarget: '',
    composition: null,
    customComposition: '',
    subjectPlacement: null,
    customSubjectPlacement: '',
    gazeDirection: null,
    customGazeDirection: '',
    frameOrientation: null,
    customFrameOrientation: '',
    breathingRoom: null,
    customBreathingRoom: '',
    perspectiveEmphasis: null,
    customPerspectiveEmphasis: '',
    cameraLock: false,
  };
}

// ──────────────────────────────────────────────────────────────
// Style DNA Types (Phase 7)
// ──────────────────────────────────────────────────────────────

export interface StyleDNA {
  styleMode: string | null;
  customStyleMode: string;
  specificStyle: string | null;
  customSpecificStyle: string;
  intensity: string | null;
  customIntensity: string;
  realismBalance: string | null;
  customRealismBalance: string;
  edgeLanguage: string | null;
  customEdgeLanguage: string;
  detailPhilosophy: string | null;
  customDetailPhilosophy: string;
  formLanguage: string | null;
  customFormLanguage: string;
  styleLock: boolean;
}

export function createEmptyStyleDNA(): StyleDNA {
  return {
    styleMode: null,
    customStyleMode: '',
    specificStyle: null,
    customSpecificStyle: '',
    intensity: null,
    customIntensity: '',
    realismBalance: null,
    customRealismBalance: '',
    edgeLanguage: null,
    customEdgeLanguage: '',
    detailPhilosophy: null,
    customDetailPhilosophy: '',
    formLanguage: null,
    customFormLanguage: '',
    styleLock: false,
  };
}

// ──────────────────────────────────────────────────────────────
// Medium DNA Types (Phase 7)
// ──────────────────────────────────────────────────────────────

export interface MediumDNA {
  primaryMedium: string | null;
  customMedium: string;
  technique: string | null;
  customTechnique: string;
  markBehavior: string | null;
  customMarkBehavior: string;
  surfaceSupport: string | null;
  customSurfaceSupport: string;
  surfaceCharacter: string | null;
  customSurfaceCharacter: string;
  paintBody: string | null;
  customPaintBody: string;
  mediumLock: boolean;
}

export function createEmptyMediumDNA(): MediumDNA {
  return {
    primaryMedium: null,
    customMedium: '',
    technique: null,
    customTechnique: '',
    markBehavior: null,
    customMarkBehavior: '',
    surfaceSupport: null,
    customSurfaceSupport: '',
    surfaceCharacter: null,
    customSurfaceCharacter: '',
    paintBody: null,
    customPaintBody: '',
    mediumLock: false,
  };
}

// ──────────────────────────────────────────────────────────────
// Finish DNA Types (Phase 8)
// ──────────────────────────────────────────────────────────────

export interface FinishDNA {
  finishCharacter: string | null;
  customFinishCharacter: string;

  finishIntensity: string | null;
  customFinishIntensity: string;

  resolutionCharacter: string | null;
  customResolutionCharacter: string;

  edgeFinish: string | null;
  customEdgeFinish: string;

  contrastFinish: string | null;
  customContrastFinish: string;

  highlightHandling: string | null;
  customHighlightHandling: string;

  shadowHandling: string | null;
  customShadowHandling: string;

  atmosphericIntegration: string | null;
  customAtmosphericIntegration: string;

  surfacePolish: string | null;
  customSurfacePolish: string;

  texturePreservation: string | null;
  customTexturePreservation: string;

  finishLock: boolean;
}

export function createEmptyFinishDNA(): FinishDNA {
  return {
    finishCharacter: null,
    customFinishCharacter: '',
    finishIntensity: null,
    customFinishIntensity: '',
    resolutionCharacter: null,
    customResolutionCharacter: '',
    edgeFinish: null,
    customEdgeFinish: '',
    contrastFinish: null,
    customContrastFinish: '',
    highlightHandling: null,
    customHighlightHandling: '',
    shadowHandling: null,
    customShadowHandling: '',
    atmosphericIntegration: null,
    customAtmosphericIntegration: '',
    surfacePolish: null,
    customSurfacePolish: '',
    texturePreservation: null,
    customTexturePreservation: '',
    finishLock: false,
  };
}

// ──────────────────────────────────────────────────────────────
// Module & App State
// ──────────────────────────────────────────────────────────────

export interface ModuleState {
  id: ModuleId;
  status: ModuleStatus;
  skipped: boolean;
  value: string | null;
  customText: string;
  intentDNA: IntentDNA | null;
  worldDNA: WorldDNA | null;
  atmosphereDNA: AtmosphereDNA | null;
  anchorDNA: AnchorDNA | null;
  subjectDNA: SubjectDNA | null;
  elements: Element[];
  colorDNA: ColorDNA | null;       // Phase 4: Color DNA system (Color module)
  lightDNA: LightDNA | null;       // Phase 5: Light DNA system (Light module)
  cameraDNA: CameraDNA | null;     // Phase 6: Camera + Composition DNA (Camera module)
  formatDNA: FormatDNA | null;
  exclusionDNA: ExclusionDNA | null;
  styleDNA: StyleDNA | null;       // Phase 7: Style DNA system (Style module)
  mediumDNA: MediumDNA | null;     // Phase 7: Medium DNA system (Medium module)
  finishDNA: FinishDNA | null;     // Phase 8: Finish DNA system (Finish module)
}

export interface Build {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  modules: Record<ModuleId, ModuleState>;
  prompt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  buildIds: string[];
}

export interface Variant {
  id: string;
  name: string;
  parentBuildId: string;
  createdAt: string;
  modules: Record<ModuleId, ModuleState>;
  prompt: string;
  originBuild: Build;
}

export interface DNALibraryEntry {
  id: string;
  name: string;
  category: string;
  content: string;
  createdAt: string;
  moduleId?: ModuleId;
  moduleState?: ModuleState;
}

export type EngineImportance = 'core' | 'recommended' | 'optional';

export interface EngineModuleSpec {
  moduleId: ModuleId;
  importance: EngineImportance;
  moduleState: ModuleState;
  rationale: string;
}

export interface EngineStep {
  id: string;
  label: string;
  description: string;
  moduleIds: ModuleId[];
}

export interface Engine {
  id: string;
  name: string;
  description: string;
  category: string;
  schemaVersion: 1;
  createdAt: string;
  updatedAt: string;
  modules: EngineModuleSpec[];
  constructionSteps: EngineStep[];
}

export interface FormatDNA {
  format: string | null;
  customFormat: string;
}

export interface IntentDNA {
  intent: string | null;
  customIntent: string;
}

export function createEmptyIntentDNA(): IntentDNA {
  return { intent: null, customIntent: '' };
}

export interface WorldDNA {
  world: string | null;
  customWorld: string;
}

export function createEmptyWorldDNA(): WorldDNA {
  return { world: null, customWorld: '' };
}

export interface AtmosphereDNA {
  atmosphere: string | null;
  customAtmosphere: string;
}

export function createEmptyAtmosphereDNA(): AtmosphereDNA {
  return { atmosphere: null, customAtmosphere: '' };
}

export interface AnchorDNA {
  anchor: string | null;
  customAnchor: string;
}

export function createEmptyAnchorDNA(): AnchorDNA {
  return { anchor: null, customAnchor: '' };
}

export function createEmptyFormatDNA(): FormatDNA {
  return { format: null, customFormat: '' };
}

export interface ExclusionDNA {
  selected: string[];
  customExclusion: string;
}

export function createEmptyExclusionDNA(): ExclusionDNA {
  return { selected: [], customExclusion: '' };
}

export interface AppState {
  activeView: ViewId;
  currentBuild: Build;
  projects: Project[];
  savedBuilds: Build[];
  variants: Variant[];
  activeVariantId: string | null;
  dnaLibrary: DNALibraryEntry[];
  engines: Engine[];
  hasUnsavedChanges: boolean;
  lastSavedAt: string | null;
}

export type ViewId =
  | 'prompt-builder'
  | 'visual-pipeline'
  | 'projects'
  | 'saved-builds'
  | 'variants'
  | 'dna-library'
  | 'engine-library'
  | 'settings'
  | 'architecture';

export interface HistoryState {
  modules: Record<ModuleId, ModuleState>;
  prompt: string;
  timestamp: number;
}

export const STORAGE_KEY = 'galazar-app-state-v6';
export const HISTORY_LIMIT = 25;

export function createDefaultModules(): Record<ModuleId, ModuleState> {
  const modules = {} as Record<ModuleId, ModuleState>;
  for (const id of MODULE_ORDER) {
    modules[id] = {
      id,
      status: 'empty',
      skipped: false,
      value: null,
      customText: '',
      intentDNA: id === 'intent' ? createEmptyIntentDNA() : null,
      worldDNA: id === 'world' ? createEmptyWorldDNA() : null,
      atmosphereDNA: id === 'atmosphere' ? createEmptyAtmosphereDNA() : null,
      anchorDNA: id === 'anchor' ? createEmptyAnchorDNA() : null,
      subjectDNA: id === 'subject' ? createEmptySubjectDNA() : null,
      elements: id === 'detail' ? [] : [],
      colorDNA: id === 'color' ? createEmptyColorDNA() : null,
      lightDNA: id === 'light' ? createEmptyLightDNA() : null,
      cameraDNA: id === 'camera' ? createEmptyCameraDNA() : null,
      formatDNA: id === 'format' ? createEmptyFormatDNA() : null,
      exclusionDNA: id === 'exclusions' ? createEmptyExclusionDNA() : null,
      styleDNA: id === 'style' ? createEmptyStyleDNA() : null,
      mediumDNA: id === 'medium' ? createEmptyMediumDNA() : null,
      finishDNA: id === 'finish' ? createEmptyFinishDNA() : null,
    };
  }
  return modules;
}

export function createNewBuild(name = 'Untitled Build'): Build {
  const now = new Date().toISOString();
  return {
    id: `build_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    createdAt: now,
    updatedAt: now,
    modules: createDefaultModules(),
    prompt: '',
  };
}

export function createDefaultAppState(): AppState {
  const build = createNewBuild();
  return {
    activeView: 'prompt-builder',
    currentBuild: build,
    projects: [],
    savedBuilds: [],
    variants: [],
    activeVariantId: null,
    dnaLibrary: [],
    engines: [],
    hasUnsavedChanges: false,
    lastSavedAt: null,
  };
}
