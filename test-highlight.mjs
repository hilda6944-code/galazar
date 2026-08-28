import assert from 'node:assert/strict';
import { assembleFinishPrompt } from './src/lib/promptAssembly.ts';

const dna = {
  finishCharacter: 'Dreamlike',
  customFinishCharacter: '',
  finishIntensity: 'Moderate',
  customFinishIntensity: '',
  resolutionCharacter: null,
  customResolutionCharacter: '',
  edgeFinish: null,
  customEdgeFinish: '',
  contrastFinish: 'Focal Contrast',
  customContrastFinish: '',
  highlightHandling: 'Protected',
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

const result = assembleFinishPrompt(dna);
assert.equal(
  result,
  'finished with moderate gentle perceptual softness, subtly altered transitions, and controlled ambiguity, strongest contrast concentrated near the primary focal anchor, important highlight information remains resolved without broad clipping'
);

console.log('Finish highlight regression test passed.');
