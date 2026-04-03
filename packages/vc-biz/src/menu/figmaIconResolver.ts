import { iconTypes } from '../internal/vcIconTypeNames';

const iconTypeSet = new Set(iconTypes.map((v) => v.toLowerCase()));

function normalizeIconName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * 严格按 Figma 命名尝试映射：同名优先，不命中则返回占位图标。
 */
export function resolveMenuIconFromFigma(figmaIconName: string): string {
  const raw = figmaIconName.trim().toLowerCase();
  if (iconTypeSet.has(raw)) return raw;

  const normalized = normalizeIconName(figmaIconName);
  if (iconTypeSet.has(normalized)) return normalized;

  return 'help-circle';
}

export const figmaMenuIconNames = {
  topActionExpand: 'indent-right',
  topActionCollapse: 'indent-left',
  groupIcon: 'control-platform',
  groupActionOpen: 'chevron-up',
  groupActionClose: 'chevron-down',
};

export const figmaMenuRecognizedIconNames = [
  'indent-right',
  'indent-left',
  'control-platform',
  'chevron-down',
  'chevron-up',
  'folder',
  'fork',
  'form',
  'chart',
  'adjustment',
] as const;
