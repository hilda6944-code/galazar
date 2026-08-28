import re
path = 'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/sections/PromptBuilder.tsx'
text = open(path).read()
text = text.replace('  createEmptyElement,', '  createEmptyElement,createEmptyFinishDNA,', 1)
open(path, 'w').write(text)
print('Done')
