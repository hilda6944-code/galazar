import type { ModuleState } from '@/types/galazar';

const INTERNAL_KEYS = new Set([
  'id', 'active', 'locked', 'status', 'skipped', 'value', 'customText',
  'createdAt', 'updatedAt', 'moduleId', 'recordId',
]);

function labelFor(key: string): string {
  return key
    .replace(/^custom/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (letter) => letter.toUpperCase());
}

function isInternalKey(key: string): boolean {
  return INTERNAL_KEYS.has(key) || key.toLowerCase().endsWith('lock');
}

function describeObject(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => {
    if (isInternalKey(key) || child === null || child === undefined || child === '' || child === false) return [];
    const label = prefix ? `${prefix} ${labelFor(key)}` : labelFor(key);
    if (typeof child === 'string' || typeof child === 'number') return [`${label}: ${child}`];
    if (Array.isArray(child)) {
      return child.flatMap((item, index) => {
        if (typeof item === 'string' || typeof item === 'number') return [`${label}: ${item}`];
        return describeObject(item, `${label} ${index + 1}`);
      });
    }
    return describeObject(child, label);
  });
}

function describeDetail(module: ModuleState): string[] {
  return module.elements.flatMap((element, index) => {
    if (!element.category) return [];
    const state = element.active ? '' : ' (inactive)';
    const values = describeObject(element).map((entry) => entry.replace(/^.*?: /, ''));
    return [`Element ${index + 1}${state}: ${[element.category, ...values].filter((value, itemIndex, all) => all.indexOf(value) === itemIndex).join(' · ')}`];
  });
}

/** Returns every user-meaningful setting for an Engine preview, with no silent truncation. */
export function describeModuleState(module: ModuleState): string[] {
  const legacy = [module.value, module.customText.trim()].filter(Boolean).map((value) => `Selection: ${value}`);
  let typed: string[] = [];

  switch (module.id) {
    case 'intent': typed = describeObject(module.intentDNA, 'Intent'); break;
    case 'world': typed = describeObject(module.worldDNA, 'World'); break;
    case 'atmosphere': typed = describeObject(module.atmosphereDNA, 'Atmosphere'); break;
    case 'anchor': typed = describeObject(module.anchorDNA, 'Anchor'); break;
    case 'subject': typed = describeObject(module.subjectDNA); break;
    case 'detail': typed = describeDetail(module); break;
    case 'camera': typed = describeObject(module.cameraDNA); break;
    case 'format': typed = describeObject(module.formatDNA, 'Format'); break;
    case 'light': typed = describeObject(module.lightDNA); break;
    case 'color': typed = describeObject(module.colorDNA); break;
    case 'style': typed = describeObject(module.styleDNA); break;
    case 'medium': typed = describeObject(module.mediumDNA); break;
    case 'finish': typed = describeObject(module.finishDNA); break;
    case 'exclusions': typed = describeObject(module.exclusionDNA, 'Exclusion'); break;
  }

  return [...new Set([...legacy, ...typed])];
}

export function summarizeModuleState(module: ModuleState, visibleLimit = 4): string {
  const details = describeModuleState(module);
  if (details.length === 0) return 'No creative selection';
  const visible = details.slice(0, visibleLimit).map((entry) => entry.replace(/^.*?: /, ''));
  const omitted = details.length - visible.length;
  return `${visible.join(' · ')}${omitted > 0 ? ` · +${omitted} more` : ''}`;
}
