path = 'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/sections/PromptBuilder.tsx'
text = open(path).read()

old = """  const handleFinishDNAChange = useCallback(
    (id: ModuleId, dna: FinishDNA) => {
        console.log('[PromptBuilder] handleFinishDNAChange:', id, 'contrastFinish=', dna.contrastFinish);
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, finishDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );"""

new = """  const handleFinishDNAChange = useCallback(
    (id: ModuleId, dna: FinishDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const mergedDNA = { ...(mod.finishDNA ?? createEmptyFinishDNA()), ...dna };
        const nextMod = { ...mod, finishDNA: mergedDNA };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );"""

if old in text:
    text = text.replace(old, new)
    print('Replaced handleFinishDNAChange')
else:
    print('Old pattern not found!')
    # Show nearby context
    idx = text.find('handleFinishDNAChange')
    if idx >= 0:
        print('Found at index', idx)
        print(repr(text[idx:idx+600]))

open(path, 'w').write(text)
