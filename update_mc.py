import sys

path = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/components/ModuleCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = []

# 1. Add onFinishDNAChange to interface
if 'onFinishDNAChange' not in content:
    content = content.replace(
        '  onMediumDNAChange?: (dna: MediumDNA) => void;\n  isExpanded: boolean;',
        '  onMediumDNAChange?: (dna: MediumDNA) => void;\n  onFinishDNAChange?: (dna: FinishDNA) => void;\n  isExpanded: boolean;'
    )
    changes.append('interface prop')

# 2. Add onFinishDNAChange to function destructuring
if '  onMediumDNAChange,\n  isExpanded,' in content:
    content = content.replace(
        '  onMediumDNAChange,\n  isExpanded,',
        '  onMediumDNAChange,\n  onFinishDNAChange,\n  isExpanded,'
    )
    changes.append('func destructure')

# 3. Add finishDNA to moduleState destructuring
if ', mediumDNA } = moduleState;' in content:
    content = content.replace(
        ', mediumDNA } = moduleState;',
        ', mediumDNA, finishDNA } = moduleState;'
    )
    changes.append('modState destructure')

# 4. Add finish to usesTestControls
if "&& id !== 'medium';" in content and "&& id !== 'finish'" not in content:
    content = content.replace(
        "&& id !== 'medium';",
        "&& id !== 'medium' && id !== 'finish';"
    )
    changes.append('usesTestControls')

# 5. Add FinishDNAPanel render block
if "id === 'finish'" not in content:
    content = content.replace(
        "          {/* Medium Module — Phase 7: Medium DNA */}\n          {id === 'medium' && mediumDNA && onMediumDNAChange && (\n            <MediumDNAPanel dna={mediumDNA} onChange={onMediumDNAChange} />\n          )}",
        "          {/* Medium Module — Phase 7: Medium DNA */}\n          {id === 'medium' && mediumDNA && onMediumDNAChange && (\n            <MediumDNAPanel dna={mediumDNA} onChange={onMediumDNAChange} />\n          )}\n\n          {/* Finish Module — Phase 8: Finish DNA */}\n          {id === 'finish' && onFinishDNAChange && (\n            <FinishDNAPanel dna={finishDNA ?? createEmptyFinishDNA()} onChange={onFinishDNAChange} />\n          )}"
    )
    changes.append('FinishDNAPanel render')

# 6. Add finish to custom text guard
if "|| id === 'medium') && (" in content and "|| id === 'finish'" not in content:
    content = content.replace(
        "|| id === 'medium') && (",
        "|| id === 'medium' || id === 'finish') && ("
    )
    changes.append('custom text guard')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'ModuleCard.tsx updated: {changes}')
