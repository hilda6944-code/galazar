path = 'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/sections/PromptBuilder.tsx'
text = open(path).read()
text = text.replace('  createEmptyElement,createEmptyFinishDNA,', '  createEmptyElement,\n  createEmptyFinishDNA,', 1)
open(path, 'w').write(text)
print('Done')
