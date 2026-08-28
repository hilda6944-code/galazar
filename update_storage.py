import sys

path = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/hooks/useGalazarStorage.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add finishDNA to normalizeModule
old_norm = "    mediumDNA: mod.mediumDNA ?? defaults.mediumDNA,\n  };"
new_norm = "    mediumDNA: mod.mediumDNA ?? defaults.mediumDNA,\n    finishDNA: mod.finishDNA ?? defaults.finishDNA,\n  };"
if old_norm in content:
    content = content.replace(old_norm, new_norm)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('useGalazarStorage.ts updated successfully')
else:
    print('ERROR: normalizeModule marker not found')
    sys.exit(1)
