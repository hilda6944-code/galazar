path = 'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/components/finish/FinishDNAPanel.tsx'
text = open(path).read()

old = '''  const update = <K extends keyof FinishDNA>(key: K, value: FinishDNA[K]) => {
    onChange({ ...dna, [key]: value });
  };'''

new = '''  const update = <K extends keyof FinishDNA>(key: K, value: FinishDNA[K]) => {
    // Send only the changed field as a partial update.
    // PromptBuilder merges this with existing state, avoiding stale-closure overwrites.
    onChange({ [key]: value } as FinishDNA);
  };'''

if old in text:
    text = text.replace(old, new)
    print('Replaced update function')
else:
    print('Old pattern not found!')
    idx = text.find('const update')
    if idx >= 0:
        print('Found at index', idx)
        print(repr(text[idx:idx+200]))

open(path, 'w').write(text)
