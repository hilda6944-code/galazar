import sys

path = r'C:/Users/hilda/OneDrive/Documents/Kimi/Workspaces/galazar/galazar-app/src/sections/PromptBuilder.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = []

# 1. Import FinishDNA
if 'type FinishDNA' not in content:
    content = content.replace(
        "type StyleDNA,\n  type MediumDNA,",
        "type StyleDNA,\n  type MediumDNA,\n  type FinishDNA,"
    )
    changes.append('import FinishDNA')

# 2. Add hasFinishContent function before moduleHasContent
if 'function hasFinishContent' not in content:
    finish_content_fn = """function hasFinishContent(dna: FinishDNA): boolean {
  return !!(
    dna.finishCharacter ||
    dna.finishIntensity ||
    dna.resolutionCharacter ||
    dna.edgeFinish ||
    dna.contrastFinish ||
    dna.highlightHandling ||
    dna.shadowHandling ||
    dna.atmosphericIntegration ||
    dna.surfacePolish ||
    dna.texturePreservation
  );
}

"""
    # Insert before moduleHasContent
    content = content.replace(
        'function moduleHasContent(mod: ModuleState): boolean {',
        finish_content_fn + 'function moduleHasContent(mod: ModuleState): boolean {'
    )
    changes.append('hasFinishContent')

# 3. Add finish check to moduleHasContent
if "mod.id === 'medium'" in content and "mod.id === 'finish'" not in content:
    content = content.replace(
        "  if (mod.id === 'medium' && mod.mediumDNA && hasMediumContent(mod.mediumDNA)) return true;\n  return false;",
        "  if (mod.id === 'medium' && mod.mediumDNA && hasMediumContent(mod.mediumDNA)) return true;\n  if (mod.id === 'finish' && mod.finishDNA && hasFinishContent(mod.finishDNA)) return true;\n  return false;"
    )
    changes.append('moduleHasContent finish')

# 4. Remove finish from TEST_OPTIONS
if "finish: ['Polished', 'Raw', 'Painterly', 'Cinematic']," in content:
    content = content.replace(
        "  finish: ['Polished', 'Raw', 'Painterly', 'Cinematic'],\n",
        "  finish: [],\n"
    )
    changes.append('TEST_OPTIONS finish')

# 5. Add handleFinishDNAChange after handleMediumDNAChange
if 'handleFinishDNAChange' not in content:
    content = content.replace(
        "  // ─── Phase 7: Medium DNA ───\n\n  const handleMediumDNAChange",
        "  // ─── Phase 7: Medium DNA ───\n\n  const handleMediumDNAChange"
    )
    # Actually insert after handleMediumDNAChange block
    old_medium_handler = """  // ─── Phase 7: Medium DNA ───

  const handleMediumDNAChange = useCallback(
    (id: ModuleId, dna: MediumDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, mediumDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  // ─── Phase 3: Element CRUD ───"""
    new_medium_handler = """  // ─── Phase 7: Medium DNA ───

  const handleMediumDNAChange = useCallback(
    (id: ModuleId, dna: MediumDNA) => {
      updateModules((prev) => {
        const mod = prev[id];
        const nextMod = { ...mod, mediumDNA: dna };
        return {
          ...prev,
          [id]: { ...nextMod, status: moduleHasContent(nextMod) ? 'active' : 'empty' },
        };
      });
    },
    [updateModules]
  );

  // ─── Phase 8: Finish DNA ───

  const handleFinishDNAChange = useCallback(
    (id: ModuleId, dna: FinishDNA) => {
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
  );

  // ─── Phase 3: Element CRUD ───"""
    if old_medium_handler in content:
        content = content.replace(old_medium_handler, new_medium_handler)
        changes.append('handleFinishDNAChange')
    else:
        print('WARNING: old_medium_handler not found')

# 6. Pass onFinishDNAChange to ModuleCard
if 'onFinishDNAChange' not in content:
    content = content.replace(
        "              onMediumDNAChange={id === 'medium' ? (dna) => handleMediumDNAChange(id, dna) : undefined}",
        "              onMediumDNAChange={id === 'medium' ? (dna) => handleMediumDNAChange(id, dna) : undefined}\n              onFinishDNAChange={id === 'finish' ? (dna) => handleFinishDNAChange(id, dna) : undefined}"
    )
    changes.append('ModuleCard onFinishDNAChange')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'PromptBuilder.tsx updated: {changes}')
