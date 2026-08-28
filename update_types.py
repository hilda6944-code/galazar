import sys

path = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/types/galazar.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert FinishDNA interface after createEmptyMediumDNA
finish_dna_types = '''
// ──────────────────────────────────────────────────────────────
// Finish DNA Types (Phase 8)
// ──────────────────────────────────────────────────────────────

export interface FinishDNA {
  finishCharacter: string | null;
  customFinishCharacter: string;

  finishIntensity: string | null;
  customFinishIntensity: string;

  resolutionCharacter: string | null;
  customResolutionCharacter: string;

  edgeFinish: string | null;
  customEdgeFinish: string;

  contrastFinish: string | null;
  customContrastFinish: string;

  highlightHandling: string | null;
  customHighlightHandling: string;

  shadowHandling: string | null;
  customShadowHandling: string;

  atmosphericIntegration: string | null;
  customAtmosphericIntegration: string;

  surfacePolish: string | null;
  customSurfacePolish: string;

  texturePreservation: string | null;
  customTexturePreservation: string;

  finishLock: boolean;
}

export function createEmptyFinishDNA(): FinishDNA {
  return {
    finishCharacter: null,
    customFinishCharacter: '',
    finishIntensity: null,
    customFinishIntensity: '',
    resolutionCharacter: null,
    customResolutionCharacter: '',
    edgeFinish: null,
    customEdgeFinish: '',
    contrastFinish: null,
    customContrastFinish: '',
    highlightHandling: null,
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
}
'''

# Insert after createEmptyMediumDNA function
marker1 = '  };\n}\n\n// ──────────────────────────────────────────────────────────────\n// Module & App State'
if marker1 in content:
    content = content.replace(marker1, '  };\n}\n' + finish_dna_types + '\n// ──────────────────────────────────────────────────────────────\n// Module & App State')
else:
    print('ERROR: marker1 not found')
    sys.exit(1)

# 2. Add finishDNA to ModuleState
old_module_state = '  mediumDNA: MediumDNA | null;     // Phase 7: Medium DNA system (Medium module)\n}'
new_module_state = '  mediumDNA: MediumDNA | null;     // Phase 7: Medium DNA system (Medium module)\n  finishDNA: FinishDNA | null;     // Phase 8: Finish DNA system (Finish module)\n}'
if old_module_state in content:
    content = content.replace(old_module_state, new_module_state)
else:
    print('ERROR: ModuleState marker not found')
    sys.exit(1)

# 3. Add finishDNA initialization in createDefaultModules
old_defaults = "      mediumDNA: id === 'medium' ? createEmptyMediumDNA() : null,\n    };\n  }\n  return modules;"
new_defaults = "      mediumDNA: id === 'medium' ? createEmptyMediumDNA() : null,\n      finishDNA: id === 'finish' ? createEmptyFinishDNA() : null,\n    };\n  }\n  return modules;"
if old_defaults in content:
    content = content.replace(old_defaults, new_defaults)
else:
    print('ERROR: createDefaultModules marker not found')
    sys.exit(1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('galazar.ts updated successfully')
