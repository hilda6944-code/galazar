import type { CameraDNA, FinishDNA, LightDNA, MediumDNA, ModuleState, StyleDNA } from '@/types/galazar';

function hasFinishContent(dna: FinishDNA): boolean {
  return !!(dna.finishCharacter || dna.finishIntensity || dna.resolutionCharacter || dna.edgeFinish || dna.contrastFinish || dna.highlightHandling || dna.shadowHandling || dna.atmosphericIntegration || dna.surfacePolish || dna.texturePreservation);
}

function hasCameraContent(dna: CameraDNA): boolean {
  return !!(dna.cameraMode || dna.lens || dna.angle || dna.shotSize || dna.depthOfField || dna.focusTarget || dna.composition || dna.subjectPlacement || dna.gazeDirection || dna.frameOrientation || dna.breathingRoom || dna.perspectiveEmphasis);
}

function hasStyleContent(dna: StyleDNA): boolean {
  return !!(dna.styleMode || dna.specificStyle || dna.intensity || dna.realismBalance || dna.edgeLanguage || dna.detailPhilosophy || dna.formLanguage);
}

function hasLightContent(dna: LightDNA): boolean {
  return !!(dna.lightingMode || dna.lightSource || dna.lightDirection || dna.lightQuality || dna.intensity || dna.lightingStructure || dna.naturalLightCondition || dna.focalLightPriority || dna.customLightingDescription);
}

function hasMediumContent(dna: MediumDNA): boolean {
  return !!(dna.primaryMedium || dna.technique || dna.markBehavior || dna.surfaceSupport || dna.surfaceCharacter || dna.paintBody);
}

export function moduleHasContent(mod: ModuleState): boolean {
  if (mod.customText.trim() || mod.value) return true;
  if (mod.id === 'intent' && mod.intentDNA && (mod.intentDNA.intent || mod.intentDNA.customIntent.trim())) return true;
  if (mod.id === 'world' && mod.worldDNA && (mod.worldDNA.world || mod.worldDNA.customWorld.trim())) return true;
  if (mod.id === 'atmosphere' && mod.atmosphereDNA && (mod.atmosphereDNA.atmosphere || mod.atmosphereDNA.customAtmosphere.trim())) return true;
  if (mod.id === 'anchor' && mod.anchorDNA && (mod.anchorDNA.anchor || mod.anchorDNA.customAnchor.trim())) return true;
  if (mod.id === 'subject' && mod.subjectDNA?.subjectType) return true;
  if (mod.id === 'detail' && mod.elements.some((element) => element.category !== null)) return true;
  if (mod.id === 'color' && mod.colorDNA?.colorDirection) return true;
  if (mod.id === 'light' && mod.lightDNA && hasLightContent(mod.lightDNA)) return true;
  if (mod.id === 'camera' && mod.cameraDNA && hasCameraContent(mod.cameraDNA)) return true;
  if (mod.id === 'format' && mod.formatDNA?.format) return true;
  if (mod.id === 'style' && mod.styleDNA && hasStyleContent(mod.styleDNA)) return true;
  if (mod.id === 'medium' && mod.mediumDNA && hasMediumContent(mod.mediumDNA)) return true;
  if (mod.id === 'finish' && mod.finishDNA && hasFinishContent(mod.finishDNA)) return true;
  if (mod.id === 'exclusions' && mod.exclusionDNA && (mod.exclusionDNA.selected.length > 0 || mod.exclusionDNA.customExclusion.trim())) return true;
  return false;
}
