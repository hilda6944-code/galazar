import type { AtmosphereDNA } from '../types/galazar.ts';

export const ATMOSPHERE_OPTIONS = [
  'Calm',
  'Serene',
  'Ethereal',
  'Dreamlike',
  'Mysterious',
  'Moody',
  'Melancholic',
  'Intimate',
  'Romantic',
  'Tense',
  'Dramatic',
  'Ominous',
  'Haunting',
  'Hopeful',
  'Joyful',
  'Quiet',
  'Contemplative',
  'Majestic',
  'Otherworldly',
  'Custom',
] as const;

const ATMOSPHERE_PHRASES: Record<string, string> = {
  Calm: 'calm atmosphere',
  Serene: 'serene atmosphere',
  Ethereal: 'ethereal atmosphere',
  Dreamlike: 'dreamlike atmosphere',
  Mysterious: 'mysterious atmosphere',
  Moody: 'moody atmosphere',
  Melancholic: 'melancholic atmosphere',
  Intimate: 'intimate atmosphere',
  Romantic: 'romantic atmosphere',
  Tense: 'tense atmosphere',
  Dramatic: 'dramatic atmosphere',
  Ominous: 'ominous atmosphere',
  Haunting: 'haunting atmosphere',
  Hopeful: 'hopeful atmosphere',
  Joyful: 'joyful atmosphere',
  Quiet: 'quiet atmosphere',
  Contemplative: 'contemplative atmosphere',
  Majestic: 'majestic atmosphere',
  Otherworldly: 'otherworldly atmosphere',
};

export function isBuiltInAtmosphere(value: string): boolean {
  return value in ATMOSPHERE_PHRASES;
}

export function assembleAtmospherePrompt(dna: AtmosphereDNA): string {
  const custom = dna.customAtmosphere.trim();
  if (dna.atmosphere === 'Custom') return custom;

  const phrase = dna.atmosphere ? ATMOSPHERE_PHRASES[dna.atmosphere] ?? '' : '';
  return [phrase, custom].filter(Boolean).join(', ');
}
