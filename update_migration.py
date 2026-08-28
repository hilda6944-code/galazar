import sys

path = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/hooks/useGalazarStorage.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add finish migration after the finishDNA normalization line
old_norm = "    finishDNA: mod.finishDNA ?? defaults.finishDNA,\n  };"
new_norm = """    finishDNA: mod.finishDNA ?? defaults.finishDNA,
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
  }"""

if old_norm in content:
    content = content.replace(old_norm, new_norm)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('useGalazarStorage.ts migration added')
else:
    print('ERROR: normalization marker not found')
    sys.exit(1)
