path = 'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/components/finish/FinishDNAPanel.tsx'
text = open(path).read()

old = '''onChange({ [key]: value } as FinishDNA);'''
new = '''onChange({ [key]: value } as unknown as FinishDNA);'''

if old in text:
    text = text.replace(old, new)
    print('Fixed type cast')
else:
    print('Pattern not found!')
    idx = text.find('[key]: value')
    if idx >= 0:
        print('Found at index', idx)
        print(repr(text[idx-20:idx+40]))

open(path, 'w').write(text)
