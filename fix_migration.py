import sys

path = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/hooks/useGalazarStorage.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the broken normalizeModule with the fixed version
old_func = """function normalizeModule(mod: Partial<ModuleState> & { id: ModuleId }): ModuleState {
  const defaults = createDefaultAppState().currentBuild.modules[mod.id];
  return {
    ...defaults,
    ...mod,
    // Ensure DNA sub-objects exist even if stored state predates them
    subjectDNA: mod.subjectDNA ?? defaults.subjectDNA,
    elements: mod.elements ?? defaults.elements,
    colorDNA: mod.colorDNA ?? defaults.colorDNA,
    lightDNA: mod.lightDNA ?? defaults.lightDNA,
    cameraDNA: mod.cameraDNA ?? defaults.cameraDNA,
    styleDNA: mod.styleDNA ?? defaults.styleDNA,
    mediumDNA: mod.mediumDNA ?? defaults.mediumDNA,
    finishDNA: mod.finishDNA ?? defaults.finishDNA,
  };

  // Migrate old Finish module values to new FinishDNA
  if (result.id === 'finish' && mod.value && !result.finishDNA?.finishCharacter) {
    const oldValue = mod.value;
    const validCharacters = [
      'Natural', 'Cinematic', 'Polished', 'Museum / Gallery', 'Editorial',
      'Atmospheric', 'Raw / Painterly', 'Soft / Ethereal', 'Dramatic',
      'Graphic / Crisp', 'Vintage / Aged', 'Archival / Timeless',
      'Dreamlike', 'Tactile', 'Minimal / Restrained',
    ];
    if (validCharacters.includes(oldValue)) {
      result.finishDNA = {
        ...result.finishDNA!,
        finishCharacter: oldValue,
      };
    }
  }
}"""

new_func = """function normalizeModule(mod: Partial<ModuleState> & { id: ModuleId }): ModuleState {
  const defaults = createDefaultAppState().currentBuild.modules[mod.id];
  const result: ModuleState = {
    ...defaults,
    ...mod,
    // Ensure DNA sub-objects exist even if stored state predates them
    subjectDNA: mod.subjectDNA ?? defaults.subjectDNA,
    elements: mod.elements ?? defaults.elements,
    colorDNA: mod.colorDNA ?? defaults.colorDNA,
    lightDNA: mod.lightDNA ?? defaults.lightDNA,
    cameraDNA: mod.cameraDNA ?? defaults.cameraDNA,
    styleDNA: mod.styleDNA ?? defaults.styleDNA,
    mediumDNA: mod.mediumDNA ?? defaults.mediumDNA,
    finishDNA: mod.finishDNA ?? defaults.finishDNA,
  };

  // Migrate old Finish module values to new FinishDNA
  if (result.id === 'finish' && mod.value && !result.finishDNA?.finishCharacter) {
    const oldValue = mod.value;
    const validCharacters = [
      'Natural', 'Cinematic', 'Polished', 'Museum / Gallery', 'Editorial',
      'Atmospheric', 'Raw / Painterly', 'Soft / Ethereal', 'Dramatic',
      'Graphic / Crisp', 'Vintage / Aged', 'Archival / Timeless',
      'Dreamlike', 'Tactile', 'Minimal / Restrained',
    ];
    if (oldValue && validCharacters.includes(oldValue)) {
      result.finishDNA = {
        ...result.finishDNA!,
        finishCharacter: oldValue,
      };
    }
  }

  return result;
}"""

if old_func in content:
    content = content.replace(old_func, new_func)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('useGalazarStorage.ts fixed')
else:
    print('ERROR: old_func not found')
    sys.exit(1)
