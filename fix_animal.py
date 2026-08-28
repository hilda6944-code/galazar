import re

path = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/lib/promptAssembly.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all occurrences of === 'animal' in the file
matches = list(re.finditer(r"=== 'animal'", content))
print(f"Found {len(matches)} occurrences of === 'animal'")

# Replace all occurrences of === 'animal' with !== 'human'
# This covers mapShotSize, mapFocusTarget, and any other remaining functions
content = content.replace("=== 'animal'", "!== 'human'")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced all === 'animal' with !== 'human'")
