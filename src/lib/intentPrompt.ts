import type { IntentDNA } from '../types/galazar.ts';

export const INTENT_OPTIONS = [
  'Photorealistic',
  'Cinematic',
  'Fine Art',
  'Editorial',
  'Concept Art',
  'Illustration',
  'Portrait Study',
  'Environmental Portrait',
  'Documentary',
  'Fashion',
  'Product / Commercial',
  'Storytelling',
  'Surreal',
  'Abstract',
  'Custom',
] as const;

const INTENT_PHRASES: Record<string, string> = {
  Photorealistic: 'photorealistic image',
  Cinematic: 'cinematic image',
  'Fine Art': 'fine-art image',
  Editorial: 'editorial image',
  'Concept Art': 'concept-art image',
  Illustration: 'illustration',
  'Portrait Study': 'portrait study',
  'Environmental Portrait': 'environmental portrait',
  Documentary: 'documentary-style image',
  Fashion: 'fashion image',
  'Product / Commercial': 'commercial product image',
  Storytelling: 'narrative storytelling image',
  Surreal: 'surreal image',
  Abstract: 'abstract image',
};

export function isBuiltInIntent(value: string): boolean {
  return value in INTENT_PHRASES;
}

export function assembleIntentPrompt(dna: IntentDNA): string {
  const custom = dna.customIntent.trim();
  if (dna.intent === 'Custom') return custom;

  const phrase = dna.intent ? INTENT_PHRASES[dna.intent] ?? '' : '';
  return [phrase, custom].filter(Boolean).join(', ');
}
