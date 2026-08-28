import sys

path = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/components/ModuleCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import FinishDNA and createEmptyFinishDNA
old_import = "type MediumDNA, MODULE_LABELS, createEmptyCameraDNA } from '@/types/galazar';"
new_import = "type MediumDNA, type FinishDNA, MODULE_LABELS, createEmptyCameraDNA, createEmptyFinishDNA } from '@/types/galazar';"
if old_import in content:
    content = content.replace(old_import, new_import)
else:
    print('ERROR: import marker not found')
    sys.exit(1)

# 2. Add FinishDNAPanel import
old_import2 = "import { MediumDNAPanel } from './medium/MediumDNAPanel';\n"
new_import2 = "import { MediumDNAPanel } from './medium/MediumDNAPanel';\nimport { FinishDNAPanel } from './finish/FinishDNAPanel';\n"
if old_import2 in content:
    content = content.replace(old_import2, new_import2)
else:
    print('ERROR: import2 marker not found')
    sys.exit(1)

# 3. Add onFinishDNAChange prop
old_props = "  onMediumDNAChange?: (dna: MediumDNA) => void;\n  isExpanded: boolean;"
new_props = "  onMediumDNAChange?: (dna: MediumDNA) => void;\n  onFinishDNAChange?: (dna: FinishDNA) => void;\n  isExpanded: boolean;"
if old_props in content:
    content = content.replace(old_props, new_props)
else:
    print('ERROR: props marker not found')
    sys.exit(1)

# 4. Destructure onFinishDNAChange from props
old_destructure = "  onMediumDNAChange,\n  isExpanded,"
new_destructure = "  onMediumDNAChange,\n  onFinishDNAChange,\n  isExpanded,"
if old_destructure in content:
    content = content.replace(old_destructure, new_destructure)
else:
    print('ERROR: destructure marker not found')
    sys.exit(1)

# 5. Add finishDNA to moduleState destructuring
old_mod_destructure = "  const { id, status, skipped, customText, value, subjectDNA, elements, colorDNA, lightDNA, cameraDNA, styleDNA, mediumDNA } = moduleState;"
new_mod_destructure = "  const { id, status, skipped, customText, value, subjectDNA, elements, colorDNA, lightDNA, cameraDNA, styleDNA, mediumDNA, finishDNA } = moduleState;"
if old_mod_destructure in content:
    content = content.replace(old_mod_destructure, new_mod_destructure)
else:
    print('ERROR: mod_destructure marker not found')
    sys.exit(1)

# 6. Add finish to usesTestControls exclusion
old_test = "const usesTestControls = id !== 'subject' && id !== 'detail' && id !== 'color' && id !== 'light' && id !== 'camera' && id !== 'style' && id !== 'medium';"
new_test = "const usesTestControls = id !== 'subject' && id !== 'detail' && id !== 'color' && id !== 'light' && id !== 'camera' && id !== 'style' && id !== 'medium' && id !== 'finish';"
if old_test in content:
    content = content.replace(old_test, new_test)
else:
    print('ERROR: test marker not found')
    sys.exit(1)

# 7. Add FinishDNAPanel render after MediumDNAPanel
old_medium_render = """          {/* Medium Module — Phase 7: Medium DNA */}
          {id === 'medium' && mediumDNA && onMediumDNAChange && (
            <MediumDNAPanel dna={mediumDNA} onChange={onMediumDNAChange} />
          )}"""
new_medium_render = """          {/* Medium Module — Phase 7: Medium DNA */}
          {id === 'medium' && mediumDNA && onMediumDNAChange && (
            <MediumDNAPanel dna={mediumDNA} onChange={onMediumDNAChange} />
          )}

          {/* Finish Module — Phase 8: Finish DNA */}
          {id === 'finish' && onFinishDNAChange && (
            <FinishDNAPanel dna={finishDNA ?? createEmptyFinishDNA()} onChange={onFinishDNAChange} />
          )}"""
if old_medium_render in content:
    content = content.replace(old_medium_render, new_medium_render)
else:
    print('ERROR: medium_render marker not found')
    sys.exit(1)

# 8. Add finish to custom text guard
old_custom = "          {(id === 'subject' || id === 'color' || id === 'light' || id === 'camera' || id === 'style' || id === 'medium') && ("
new_custom = "          {(id === 'subject' || id === 'color' || id === 'light' || id === 'camera' || id === 'style' || id === 'medium' || id === 'finish') && ("
if old_custom in content:
    content = content.replace(old_custom, new_custom)
else:
    print('ERROR: custom marker not found')
    sys.exit(1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('ModuleCard.tsx updated successfully')
