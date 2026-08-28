import type { AnchorDNA } from '../types/galazar.ts';

export const ANCHOR_OPTIONS = [
  'Eyes',
  'Face',
  'Hands',
  'Gesture',
  'Single Flower',
  'Animal Eye',
  'Silhouette',
  'Distant Horizon',
  'Doorway',
  'Reflection',
  'Light Source',
  'Single Object',
  'Architectural Feature',
  'Foreground Detail',
  'Custom',
] as const;

const ANCHOR_PHRASES: Record<string, string> = {
  Eyes: 'eyes as the primary visual anchor',
  Face: 'face as the primary visual anchor',
  Hands: 'hands as the primary visual anchor',
  Gesture: 'gesture as the primary visual anchor',
  'Single Flower': 'a single flower as the primary visual anchor',
  'Animal Eye': "the animal's eye as the primary visual anchor",
  Silhouette: 'silhouette as the primary visual anchor',
  'Distant Horizon': 'the distant horizon as the primary visual anchor',
  Doorway: 'doorway as the primary visual anchor',
  Reflection: 'reflection as the primary visual anchor',
  'Light Source': 'the light source as the primary visual anchor',
  'Single Object': 'a single object as the primary visual anchor',
  'Architectural Feature': 'an architectural feature as the primary visual anchor',
  'Foreground Detail': 'a foreground detail as the primary visual anchor',
};

export function isBuiltInAnchor(value: string): boolean {
  return value in ANCHOR_PHRASES;
}

export function assembleAnchorPrompt(dna: AnchorDNA): string {
  const custom = dna.customAnchor.trim();
  if (dna.anchor === 'Custom') return custom;

  const phrase = dna.anchor ? ANCHOR_PHRASES[dna.anchor] ?? '' : '';
  return [phrase, custom].filter(Boolean).join(', ');
}
