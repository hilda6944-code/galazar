// Quick diagnostic test for assembleFinishPrompt
import { createEmptyFinishDNA } from './src/types/galazar.ts';

// Simulate the exact user scenario
const dna = createEmptyFinishDNA();
dna.finishCharacter = 'Dreamlike';
dna.finishIntensity = 'Moderate';
dna.contrastFinish = 'Focal Contrast';

console.log('Testing assembleFinishPrompt with:');
console.log('  finishCharacter:', dna.finishCharacter);
console.log('  finishIntensity:', dna.finishIntensity);
console.log('  contrastFinish:', dna.contrastFinish);

// Inline maybe function
function maybe(val) {
  return val && val.trim() ? val.trim() : null;
}

const character = maybe(dna.finishCharacter);
const intensity = maybe(dna.finishIntensity);
const contrast = maybe(dna.contrastFinish);

console.log('\nMaybe results:');
console.log('  character:', character);
console.log('  intensity:', intensity);
console.log('  contrast:', contrast);

console.log('\nCondition checks:');
console.log('  character && character !== Custom:', character && character !== 'Custom');
console.log('  contrast && contrast !== Custom:', contrast && contrast !== 'Custom');

// Simulate mapFinishCharacter for Dreamlike
function mapFinishCharacter(character, intensity) {
  const i = intensity && intensity !== 'Custom' ? ` ${intensity.toLowerCase()}` : '';
  if (character === 'Dreamlike') {
    return `finished with${i} gentle perceptual softness, subtly altered transitions, and controlled ambiguity`;
  }
  return 'unknown';
}

// Simulate mapContrastFinish for Focal Contrast
function mapContrastFinish(contrast) {
  if (contrast === 'Focal Contrast') {
    return 'strongest contrast concentrated near the primary focal anchor';
  }
  return 'unknown contrast';
}

const parts = [];
if (character && character !== 'Custom') {
  parts.push(mapFinishCharacter(character, intensity));
}
if (contrast && contrast !== 'Custom') {
  parts.push(mapContrastFinish(contrast));
}

console.log('\nParts:', parts);
console.log('Final result:', parts.join(', '));
