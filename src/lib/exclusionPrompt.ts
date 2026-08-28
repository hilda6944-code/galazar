import type { ExclusionDNA } from '../types/galazar.ts';

function exclusionPhrase(option: string): string {
  return option.replace(/^No\s+/i, '').trim().toLocaleLowerCase();
}

export function assembleExclusionPrompt(dna: ExclusionDNA): string {
  const phrases: string[] = [];
  const seen = new Set<string>();
  for (const option of dna.selected) {
    const phrase = exclusionPhrase(option);
    if (phrase && !seen.has(phrase)) {
      seen.add(phrase);
      phrases.push(phrase);
    }
  }
  const custom = dna.customExclusion.trim();
  if (custom && !seen.has(custom.toLocaleLowerCase())) phrases.push(custom);
  return phrases.length ? `avoid: ${phrases.join(', ')}` : '';
}
