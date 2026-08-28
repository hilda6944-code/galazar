import type { WorldDNA } from '../types/galazar.ts';

export const WORLD_OPTIONS = [
  'Natural Landscape',
  'Forest / Woodland',
  'Coastal / Ocean',
  'Mountain / Alpine',
  'Desert / Arid',
  'Rural / Countryside',
  'Garden / Botanical',
  'Urban Exterior',
  'Street / Alley',
  'Interior',
  'Domestic Interior',
  'Studio',
  'Architectural Space',
  'Industrial',
  'Historical Setting',
  'Fantasy World',
  'Surreal Environment',
  'Abstract Space',
  'Minimal / Undefined Space',
  'Custom',
] as const;

const WORLD_PHRASES: Record<string, string> = {
  'Natural Landscape': 'natural landscape setting',
  'Forest / Woodland': 'forest environment',
  'Coastal / Ocean': 'coastal ocean environment',
  'Mountain / Alpine': 'mountain alpine environment',
  'Desert / Arid': 'desert environment',
  'Rural / Countryside': 'rural countryside setting',
  'Garden / Botanical': 'botanical garden setting',
  'Urban Exterior': 'urban exterior setting',
  'Street / Alley': 'street or alley setting',
  Interior: 'interior setting',
  'Domestic Interior': 'domestic interior',
  Studio: 'studio setting',
  'Architectural Space': 'architectural environment',
  Industrial: 'industrial environment',
  'Historical Setting': 'historical setting',
  'Fantasy World': 'fantasy environment',
  'Surreal Environment': 'surreal environment',
  'Abstract Space': 'abstract spatial environment',
  'Minimal / Undefined Space': 'minimal undefined setting',
};

export function isBuiltInWorld(value: string): boolean {
  return value in WORLD_PHRASES;
}

export function assembleWorldPrompt(dna: WorldDNA): string {
  const custom = dna.customWorld.trim();
  if (dna.world === 'Custom') return custom;

  const phrase = dna.world ? WORLD_PHRASES[dna.world] ?? '' : '';
  return [phrase, custom].filter(Boolean).join(', ');
}
