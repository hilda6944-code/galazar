import sys

path = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/lib/promptAssembly.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the unused customIntensity variable declaration
if '  const customIntensity = maybe(dna.customFinishIntensity);\n' in content:
    content = content.replace('  const customIntensity = maybe(dna.customFinishIntensity);\n', '')
    print('Removed unused customIntensity')
else:
    print('customIntensity not found')
    sys.exit(1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
