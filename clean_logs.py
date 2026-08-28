import re

# Remove debug logs from FinishDNAPanel.tsx
path1 = 'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/components/finish/FinishDNAPanel.tsx'
text1 = open(path1).read()
text1 = text1.replace("    console.log('[FinishDNAPanel] update:', key, '->', value);\n", '')
open(path1, 'w').write(text1)
print('Cleaned FinishDNAPanel.tsx')

# Remove debug logs from promptAssembly.ts
path2 = 'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/lib/promptAssembly.ts'
text2 = open(path2).read()
text2 = re.sub(r"^\s*console\.log\('\[assembleFinishPrompt\].*?\);\n", '', text2, flags=re.MULTILINE)
open(path2, 'w').write(text2)
print('Cleaned promptAssembly.ts')
