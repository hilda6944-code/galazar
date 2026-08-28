import sys

# Add console.log debugging to trace the Finish DNA state flow

# 1. Add to FinishDNAPanel.update
path1 = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/components/finish/FinishDNAPanel.tsx'
with open(path1, 'r', encoding='utf-8') as f:
    content = f.read()

old_update = "  const update = <K extends keyof FinishDNA>(key: K, value: FinishDNA[K]) => {\n    onChange({ ...dna, [key]: value });\n  };"
new_update = "  const update = <K extends keyof FinishDNA>(key: K, value: FinishDNA[K]) => {\n    console.log('[FinishDNAPanel] update:', key, '->', value);\n    onChange({ ...dna, [key]: value });\n  };"

if old_update in content:
    content = content.replace(old_update, new_update)
    with open(path1, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Added console.log to FinishDNAPanel.update')
else:
    print('ERROR: FinishDNAPanel update not found')
    sys.exit(1)

# 2. Add to handleFinishDNAChange
path2 = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/sections/PromptBuilder.tsx'
with open(path2, 'r', encoding='utf-8') as f:
    content = f.read()

old_handler = "  const handleFinishDNAChange = useCallback(\n    (id: ModuleId, dna: FinishDNA) => {\n      updateModules((prev) => {\n        const mod = prev[id];\n        const nextMod = { ...mod, finishDNA: dna };"
new_handler = "  const handleFinishDNAChange = useCallback(\n    (id: ModuleId, dna: FinishDNA) => {\n        console.log('[PromptBuilder] handleFinishDNAChange:', id, 'contrastFinish=', dna.contrastFinish);\n      updateModules((prev) => {\n        const mod = prev[id];\n        const nextMod = { ...mod, finishDNA: dna };"

if old_handler in content:
    content = content.replace(old_handler, new_handler)
    with open(path2, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Added console.log to handleFinishDNAChange')
else:
    print('ERROR: handleFinishDNAChange not found')
    sys.exit(1)

# 3. Add to assembleFinishPrompt
path3 = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/lib/promptAssembly.ts'
with open(path3, 'r', encoding='utf-8') as f:
    content = f.read()

old_assemble = "export function assembleFinishPrompt(dna: FinishDNA): string {\n  const character = maybe(dna.finishCharacter);"
new_assemble = "export function assembleFinishPrompt(dna: FinishDNA): string {\n  console.log('[assembleFinishPrompt] dna:', JSON.stringify(dna));\n  const character = maybe(dna.finishCharacter);"

if old_assemble in content:
    content = content.replace(old_assemble, new_assemble)
    # Also log the parts before returning
    old_return = "  if (parts.length === 0) return '';\n  return parts.join(', ');"
    new_return = "  console.log('[assembleFinishPrompt] parts:', parts);\n  if (parts.length === 0) return '';\n  return parts.join(', ');"
    content = content.replace(old_return, new_return)
    with open(path3, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Added console.log to assembleFinishPrompt')
else:
    print('ERROR: assembleFinishPrompt not found')
    sys.exit(1)

print('All debug logging added')
