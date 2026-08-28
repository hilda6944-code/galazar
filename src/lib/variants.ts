import type { AppState, Build, Variant } from '@/types/galazar';

export function createVariant(source: Build, name: string, id: string, createdAt: string): Variant {
  const originBuild = structuredClone(source);
  return {
    id,
    name: name.trim(),
    parentBuildId: source.id,
    createdAt,
    modules: structuredClone(source.modules),
    prompt: source.prompt,
    originBuild,
  };
}

export function variantToBuild(variant: Variant): Build {
  return {
    id: variant.id,
    name: variant.name,
    createdAt: variant.createdAt,
    updatedAt: variant.createdAt,
    modules: structuredClone(variant.modules),
    prompt: variant.prompt,
  };
}

export function updateVariantFromBuild(variants: Variant[], variantId: string, build: Build): Variant[] {
  return variants.map((variant) => variant.id === variantId
    ? { ...variant, modules: structuredClone(build.modules), prompt: build.prompt }
    : variant);
}

export function renameVariant(variants: Variant[], variantId: string, name: string): Variant[] {
  const nextName = name.trim();
  if (!nextName) return variants;
  return variants.map((variant) => variant.id === variantId ? { ...variant, name: nextName } : variant);
}

export function deleteVariant(variants: Variant[], variantId: string): Variant[] {
  return variants.filter((variant) => variant.id !== variantId);
}

export function deleteVariantFromState(state: AppState, variantId: string): AppState {
  const deletingActiveVariant = state.activeVariantId === variantId;
  return {
    ...state,
    variants: deleteVariant(state.variants, variantId),
    activeVariantId: deletingActiveVariant ? null : state.activeVariantId,
    currentBuild: state.currentBuild,
  };
}

export function requiresVariantLoadConfirmation(hasUnsavedActiveBuild: boolean): boolean {
  return hasUnsavedActiveBuild;
}
