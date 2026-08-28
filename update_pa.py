import sys

path = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/lib/promptAssembly.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = []

# 1. Import FinishDNA in the import statement
if 'type FinishDNA' not in content:
    content = content.replace(
        'type CameraDNA,\n  type StyleDNA,\n  type MediumDNA,',
        'type CameraDNA,\n  type StyleDNA,\n  type MediumDNA,\n  type FinishDNA,'
    )
    changes.append('import FinishDNA')

# 2. Add assembleFinishPrompt before assembleFullPrompt
finish_assembly = """
// ─── Finish DNA Prompt Assembler ───

export function assembleFinishPrompt(dna: FinishDNA): string {
  const character = maybe(dna.finishCharacter);
  const customCharacter = maybe(dna.customFinishCharacter);
  const intensity = maybe(dna.finishIntensity);
  const customIntensity = maybe(dna.customFinishIntensity);
  const resolution = maybe(dna.resolutionCharacter);
  const customResolution = maybe(dna.customResolutionCharacter);
  const edge = maybe(dna.edgeFinish);
  const customEdge = maybe(dna.customEdgeFinish);
  const contrast = maybe(dna.contrastFinish);
  const customContrast = maybe(dna.customContrastFinish);
  const highlight = maybe(dna.highlightHandling);
  const customHighlight = maybe(dna.customHighlightHandling);
  const shadow = maybe(dna.shadowHandling);
  const customShadow = maybe(dna.customShadowHandling);
  const atmospheric = maybe(dna.atmosphericIntegration);
  const customAtmospheric = maybe(dna.customAtmosphericIntegration);
  const polish = maybe(dna.surfacePolish);
  const customPolish = maybe(dna.customSurfacePolish);
  const texture = maybe(dna.texturePreservation);
  const customTexture = maybe(dna.customTexturePreservation);

  const parts: string[] = [];

  // 1. Finish Character (primary behavior)
  if (character && character !== 'Custom') {
    parts.push(mapFinishCharacter(character, intensity));
  } else if (character === 'Custom' && customCharacter) {
    parts.push(customCharacter);
  }

  // 2. Resolution Character
  if (resolution && resolution !== 'Custom') {
    parts.push(mapResolutionCharacter(resolution));
  } else if (resolution === 'Custom' && customResolution) {
    parts.push(customResolution);
  }

  // 3. Edge Finish
  if (edge && edge !== 'Custom') {
    parts.push(mapEdgeFinish(edge));
  } else if (edge === 'Custom' && customEdge) {
    parts.push(customEdge);
  }

  // 4. Contrast Finish
  if (contrast && contrast !== 'Custom') {
    parts.push(mapContrastFinish(contrast));
  } else if (contrast === 'Custom' && customContrast) {
    parts.push(customContrast);
  }

  // 5. Highlight Handling
  if (highlight && highlight !== 'Custom') {
    parts.push(mapHighlightHandling(highlight));
  } else if (highlight === 'Custom' && customHighlight) {
    parts.push(customHighlight);
  }

  // 6. Shadow Handling
  if (shadow && shadow !== 'Custom') {
    parts.push(mapShadowHandling(shadow));
  } else if (shadow === 'Custom' && customShadow) {
    parts.push(customShadow);
  }

  // 7. Atmospheric Integration
  if (atmospheric && atmospheric !== 'Custom') {
    parts.push(mapAtmosphericIntegration(atmospheric));
  } else if (atmospheric === 'Custom' && customAtmospheric) {
    parts.push(customAtmospheric);
  }

  // 8. Surface Polish
  if (polish && polish !== 'Custom') {
    parts.push(mapSurfacePolish(polish));
  } else if (polish === 'Custom' && customPolish) {
    parts.push(customPolish);
  }

  // 9. Texture Preservation
  if (texture && texture !== 'Custom') {
    parts.push(mapTexturePreservation(texture));
  } else if (texture === 'Custom' && customTexture) {
    parts.push(customTexture);
  }

  if (parts.length === 0) return '';
  return parts.join(', ');
}

function mapFinishCharacter(character: string, intensity: string | null): string {
  const i = intensity && intensity !== 'Custom' ? ` ${intensity.toLowerCase()}` : '';
  switch (character) {
    case 'Natural':
      return `finished with${i} believable natural rendering, restrained processing, and credible surface transitions`;
    case 'Cinematic':
      return `finished with${i} controlled dramatic resolution, intentional highlight and shadow shaping, and strong focal hierarchy`;
    case 'Polished':
      return `finished with${i} highly resolved presentation, clean transitions, and controlled edges`;
    case 'Museum / Gallery':
      return `finished with${i} carefully resolved presentation, disciplined value structure, and intentional surface handling`;
    case 'Editorial':
      return `finished with${i} deliberate presentation hierarchy, strong visual clarity, and decisive focal organization`;
    case 'Atmospheric':
      return `finished with${i} emphasis on air, depth, environmental integration, and gradual transitions`;
    case 'Raw / Painterly':
      return `finished with${i} preserved visible construction, expressive marks, and imperfect transitions`;
    case 'Soft / Ethereal':
      return `finished with${i} softened transitions, restrained contrast, and delicate atmospheric integration`;
    case 'Dramatic':
      return `finished with${i} stronger visual separation, decisive focal emphasis, and controlled high-impact transitions`;
    case 'Graphic / Crisp':
      return `finished with${i} clean separation of forms, decisive edges, and controlled visual clarity`;
    case 'Vintage / Aged':
      return `finished with${i} subtly time-worn presentation and restrained aging behavior`;
    case 'Archival / Timeless':
      return `finished with${i} restrained trend-neutral resolution, balanced values, and enduring visual coherence`;
    case 'Dreamlike':
      return `finished with${i} gentle perceptual softness, subtly altered transitions, and controlled ambiguity`;
    case 'Tactile':
      return `finished with${i} emphasis on perceivable surface presence and material variation`;
    case 'Minimal / Restrained':
      return `finished with${i} removed unnecessary complexity, clean hierarchy, and limited decorative processing`;
    default:
      return `finished with${i} ${character.toLowerCase()} presentation`;
  }
}

function mapResolutionCharacter(resolution: string): string {
  switch (resolution) {
    case 'Clean': return 'unnecessary visual noise reduced and important forms kept clear';
    case 'Refined': return 'transitions and relationships carefully resolved';
    case 'Highly Resolved': return 'high final-definition treatment with fine information remaining coherent';
    case 'Controlled Imperfection': return 'selected irregularities and human or material character preserved';
    case 'Organic': return 'natural variation visible and mechanical uniformity avoided';
    case 'Pristine': return 'exceptionally clean final presentation with surface interruptions minimized';
    default: return `${resolution.toLowerCase()} final resolution`;
  }
}

function mapEdgeFinish(edge: string): string {
  switch (edge) {
    case 'Natural Transition': return 'edges transition according to believable form, depth, atmosphere, and material behavior';
    case 'Clean Controlled': return 'important boundaries remain clean and deliberate';
    case 'Soft Integrated': return 'transitions merge gently into surrounding atmosphere';
    case 'Selective Sharpness': return 'strongest edge definition reserved for important focal information';
    case 'Crisp': return 'decisive form separation and high edge clarity';
    case 'Lost and Found': return 'selected edges dissolve into surrounding value while important structural edges re-emerge where needed';
    default: return `${edge.toLowerCase()} edge handling`;
  }
}

function mapContrastFinish(contrast: string): string {
  switch (contrast) {
    case 'Gentle': return 'restrained separation between major values with gradual transitions preserved';
    case 'Balanced': return 'clear value separation without excessive global contrast';
    case 'Focal Contrast': return 'strongest contrast concentrated near the primary focal anchor';
    case 'Strong': return 'decisive value separation preserving highlight and shadow information';
    case 'Compressed': return 'narrower final value range with quieter transitions';
    default: return `${contrast.toLowerCase()} contrast`;
  }
}

function mapHighlightHandling(highlight: string): string {
  switch (highlight) {
    case 'Natural': return 'highlights follow believable surface and illumination behavior';
    case 'Protected': return 'important highlight information remains resolved without broad clipping';
    case 'Luminous': return 'bright regions feel internally radiant while retaining useful tonal information';
    case 'Restrained': return 'highlight intensity remains controlled and subordinate to structure';
    case 'Crisp': return 'small important highlights resolve decisively where physically appropriate';
    case 'Soft Roll-Off': return 'brightest values transition gradually rather than ending abruptly';
    default: return `${highlight.toLowerCase()} highlight handling`;
  }
}

function mapShadowHandling(shadow: string): string {
  switch (shadow) {
    case 'Open': return 'shadow regions retain greater readable information';
    case 'Natural': return 'shadows preserve believable value relationships';
    case 'Deep': return 'stronger dark massing while retaining structural form';
    case 'Protected Detail': return 'important information remains visible within darker regions';
    case 'Soft': return 'shadow transitions remain gradual and integrated';
    case 'Rich': return 'shadows retain tonal complexity rather than collapsing into flat darkness';
    default: return `${shadow.toLowerCase()} shadow handling`;
  }
}

function mapAtmosphericIntegration(atmospheric: string): string {
  switch (atmospheric) {
    case 'None': return 'no additional atmospheric integration applied';
    case 'Subtle': return 'slight environmental integration between forms and surrounding space';
    case 'Moderate': return 'clearly perceptible atmospheric cohesion and depth transitions';
    case 'Deep': return 'strong atmospheric integration across spatial planes';
    case 'Focal Protection': return 'atmospheric complexity increases away from the focal anchor while the primary subject remains cleaner';
    default: return `${atmospheric.toLowerCase()} atmospheric integration`;
  }
}

function mapSurfacePolish(polish: string): string {
  switch (polish) {
    case 'Unpolished': return 'purposeful roughness and construction evidence preserved';
    case 'Natural': return 'surface variation remains believable and materially appropriate';
    case 'Controlled': return 'distracting irregularities reduced while physical character remains';
    case 'Refined': return 'surface presentation carefully resolved without erasing material identity';
    case 'Highly Polished': return 'extremely controlled final surface presentation';
    default: return `${polish.toLowerCase()} surface polish`;
  }
}

function mapTexturePreservation(texture: string): string {
  switch (texture) {
    case 'Minimal': return 'texture remains understated';
    case 'Selective': return 'texture emphasized primarily where compositionally useful';
    case 'Natural': return 'believable surface variation remains visible';
    case 'Strong': return 'texture becomes an important part of final presentation';
    case 'Material Priority': return 'material physical behavior determines which textures remain visible';
    default: return `${texture.toLowerCase()} texture preservation`;
  }
}

"""

if 'assembleFinishPrompt' not in content:
    content = content.replace(
        '// ─── Full Prompt Assembler ───',
        finish_assembly + '// ─── Full Prompt Assembler ───'
    )
    changes.append('assembleFinishPrompt')

# 3. Wire finish into assembleFullPrompt
old_finish_branch = "    } else if (id === 'medium' && mod.mediumDNA) {\n      const mediumText = assembleMediumPrompt(mod.mediumDNA);\n      if (mediumText) parts.push(mediumText);\n    } else {"
new_finish_branch = """    } else if (id === 'medium' && mod.mediumDNA) {
      const mediumText = assembleMediumPrompt(mod.mediumDNA);
      if (mediumText) parts.push(mediumText);
    } else if (id === 'finish' && mod.finishDNA) {
      const finishText = assembleFinishPrompt(mod.finishDNA);
      if (finishText) parts.push(finishText);
    } else {"""
if old_finish_branch in content:
    content = content.replace(old_finish_branch, new_finish_branch)
    changes.append('assembleFullPrompt finish')
else:
    print('WARNING: assembleFullPrompt finish branch not found')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'promptAssembly.ts updated: {changes}')
