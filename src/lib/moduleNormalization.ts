import {
  MODULE_ORDER,
  createDefaultAppState,
  createEmptyAnchorDNA,
  createEmptyAtmosphereDNA,
  createEmptyExclusionDNA,
  createEmptyIntentDNA,
  createEmptyWorldDNA,
  type ModuleId,
  type ModuleState,
} from '@/types/galazar';
import { isBuiltInAnchor } from './anchorPrompt';
import { isBuiltInAtmosphere } from './atmospherePrompt';
import { isBuiltInIntent } from './intentPrompt';
import { isBuiltInWorld } from './worldPrompt';

export function normalizeModuleState(mod: Partial<ModuleState> & { id: ModuleId }): ModuleState {
  const defaults = createDefaultAppState().currentBuild.modules[mod.id];
  const result: ModuleState = {
    ...defaults,
    ...mod,
    intentDNA: mod.intentDNA ?? defaults.intentDNA,
    worldDNA: mod.worldDNA ?? defaults.worldDNA,
    atmosphereDNA: mod.atmosphereDNA ?? defaults.atmosphereDNA,
    anchorDNA: mod.anchorDNA ?? defaults.anchorDNA,
    subjectDNA: mod.subjectDNA ?? defaults.subjectDNA,
    elements: mod.elements ?? defaults.elements,
    colorDNA: mod.colorDNA ?? defaults.colorDNA,
    lightDNA: mod.lightDNA ?? defaults.lightDNA,
    cameraDNA: mod.cameraDNA ?? defaults.cameraDNA,
    formatDNA: mod.formatDNA ?? defaults.formatDNA,
    exclusionDNA: mod.exclusionDNA ?? defaults.exclusionDNA,
    styleDNA: mod.styleDNA ?? defaults.styleDNA,
    mediumDNA: mod.mediumDNA ?? defaults.mediumDNA,
    finishDNA: mod.finishDNA ?? defaults.finishDNA,
  };

  if (result.id === 'intent' && !mod.intentDNA) {
    const migrated = createEmptyIntentDNA();
    const legacyValue = mod.value?.trim() ?? '';
    const legacyText = mod.customText?.trim() ?? '';
    if (legacyValue === 'Custom') {
      migrated.intent = 'Custom';
      migrated.customIntent = legacyText;
    } else if (legacyValue && isBuiltInIntent(legacyValue)) {
      migrated.intent = legacyValue;
      migrated.customIntent = legacyText;
    } else if (legacyValue || legacyText) {
      migrated.intent = 'Custom';
      migrated.customIntent = [legacyValue, legacyText].filter(Boolean).join(', ');
    }
    result.intentDNA = migrated;
    result.value = null;
    result.customText = '';
  }

  if (result.id === 'world' && !mod.worldDNA) {
    const migrated = createEmptyWorldDNA();
    const legacyValue = mod.value?.trim() ?? '';
    const legacyText = mod.customText?.trim() ?? '';
    const mappedValue = legacyValue === 'Fantasy Realm' ? 'Fantasy World' : legacyValue;
    if (mappedValue === 'Custom') {
      migrated.world = 'Custom';
      migrated.customWorld = legacyText;
    } else if (mappedValue && isBuiltInWorld(mappedValue)) {
      migrated.world = mappedValue;
      migrated.customWorld = legacyText;
    } else if (legacyValue || legacyText) {
      migrated.world = 'Custom';
      migrated.customWorld = [legacyValue, legacyText].filter(Boolean).join(', ');
    }
    result.worldDNA = migrated;
    result.value = null;
    result.customText = '';
  }

  if (result.id === 'atmosphere' && !mod.atmosphereDNA) {
    const migrated = createEmptyAtmosphereDNA();
    const legacyValue = mod.value?.trim() ?? '';
    const legacyText = mod.customText?.trim() ?? '';
    if (legacyValue === 'Custom') {
      migrated.atmosphere = 'Custom';
      migrated.customAtmosphere = legacyText;
    } else if (legacyValue && isBuiltInAtmosphere(legacyValue)) {
      migrated.atmosphere = legacyValue;
      migrated.customAtmosphere = legacyText;
    } else if (legacyValue || legacyText) {
      migrated.atmosphere = 'Custom';
      migrated.customAtmosphere = [legacyValue, legacyText].filter(Boolean).join(', ');
    }
    result.atmosphereDNA = migrated;
    result.value = null;
    result.customText = '';
  }

  if (result.id === 'anchor' && !mod.anchorDNA) {
    const migrated = createEmptyAnchorDNA();
    const legacyValue = mod.value?.trim() ?? '';
    const legacyText = mod.customText?.trim() ?? '';
    if (legacyValue === 'Custom') {
      migrated.anchor = 'Custom';
      migrated.customAnchor = legacyText;
    } else if (legacyValue && isBuiltInAnchor(legacyValue)) {
      migrated.anchor = legacyValue;
      migrated.customAnchor = legacyText;
    } else if (legacyValue || legacyText) {
      migrated.anchor = 'Custom';
      migrated.customAnchor = [legacyValue, legacyText].filter(Boolean).join(', ');
    }
    result.anchorDNA = migrated;
    result.value = null;
    result.customText = '';
  }

  if (result.id === 'exclusions' && !mod.exclusionDNA) {
    const legacyMap: Record<string, string> = {
      'No Text': 'No unwanted text',
      'No Watermark': 'No unintended watermark',
      'No Humans': 'No unintended people',
    };
    const migrated = createEmptyExclusionDNA();
    if (mod.value && legacyMap[mod.value]) migrated.selected.push(legacyMap[mod.value]);
    const legacyCustom = [mod.value && !legacyMap[mod.value] ? mod.value : '', mod.customText ?? '']
      .map((value) => value.trim())
      .filter(Boolean);
    migrated.customExclusion = legacyCustom.join(', ');
    result.exclusionDNA = migrated;
    result.value = null;
    result.customText = '';
  }

  if (result.id === 'finish' && mod.value && !result.finishDNA?.finishCharacter) {
    const validCharacters = [
      'Natural', 'Cinematic', 'Polished', 'Museum / Gallery', 'Editorial',
      'Atmospheric', 'Raw / Painterly', 'Soft / Ethereal', 'Dramatic',
      'Graphic / Crisp', 'Vintage / Aged', 'Archival / Timeless',
      'Dreamlike', 'Tactile', 'Minimal / Restrained',
    ];
    if (validCharacters.includes(mod.value)) {
      result.finishDNA = { ...result.finishDNA!, finishCharacter: mod.value };
    }
  }

  return structuredClone(result);
}

export function normalizeBuildModules(modules: Record<ModuleId, ModuleState>): Record<ModuleId, ModuleState> {
  const defaults = createDefaultAppState().currentBuild.modules;
  const normalized = { ...defaults } as Record<ModuleId, ModuleState>;
  for (const id of MODULE_ORDER) {
    if (modules[id]) normalized[id] = normalizeModuleState({ ...modules[id], id });
  }
  return normalized;
}
