import sys

# Edit SubjectDNAPanel.tsx
path1 = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/components/subject/SubjectDNAPanel.tsx'
with open(path1, 'r', encoding='utf-8') as f:
    content = f.read()

old = '          <div className="grid grid-cols-2 gap-3">\n            <SelectControl label="Clothing"'
new = '          <div className="pt-1">\n            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Details</p>\n          </div>\n\n          <div className="grid grid-cols-2 gap-3">\n            <SelectControl label="Clothing"'

if old in content:
    content = content.replace(old, new, 1)
    with open(path1, 'w', encoding='utf-8') as f:
        f.write(content)
    print('SubjectDNAPanel updated')
else:
    print('ERROR: old string not found in SubjectDNAPanel')
    sys.exit(1)
