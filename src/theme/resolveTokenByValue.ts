import { vcTokens } from './vcTokens';

/**
 * 与 Figma / 设计稿侧「引用场景」对齐：先按场景过滤 token，再按数值匹配，减少同名异义冲突。
 */
export type TokenReferenceRole =
  | 'background'
  | 'fill'
  | 'text'
  | 'border'
  | 'icon'
  /** 侧栏 Menu 专用语义（color.menu.*） */
  | 'menu'
  /** 尺寸：padding、controlHeight 等 */
  | 'spacing'
  | 'radius'
  | 'fontSize'
  | 'lineHeight';

export interface TokenValueMatch {
  /** 如 `color.neutral.background.container`、`size.padding.sm` */
  path: string;
  value: string | number;
}

type FlatLeaf = { path: string; value: string | number };

function flattenTokens(obj: unknown, prefix: string): FlatLeaf[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj === 'string' || typeof obj === 'number') {
    return [{ path: prefix, value: obj }];
  }
  if (typeof obj !== 'object') return [];
  const out: FlatLeaf[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const next = prefix ? `${prefix}.${k}` : k;
    out.push(...flattenTokens(v, next));
  }
  return out;
}

/** 判断某 token 路径在指定引用场景下是否参与匹配 */
export function tokenPathMatchesRole(path: string, role: TokenReferenceRole): boolean {
  const roles = getReferenceRolesForPath(path);
  if (role === 'menu') {
    return path.startsWith('color.menu.');
  }
  return roles.includes(role);
}

/**
 * 根据路径推断该 token 可用于哪些「引用场景」（同一路径可属于多类，如 menu + background）。
 */
export function getReferenceRolesForPath(path: string): TokenReferenceRole[] {
  const set = new Set<TokenReferenceRole>();

  if (path.startsWith('color.menu.')) {
    set.add('menu');
    const leaf = path.split('.').pop() ?? '';
    if (leaf === 'navBackground' || leaf === 'topNavBackground') {
      set.add('background');
    } else if (leaf === 'topNavBorder') {
      set.add('border');
    } else if (leaf === 'itemSlotFill') {
      set.add('fill');
      set.add('background');
    } else if (leaf === 'textSecondaryOnNav') {
      set.add('text');
    } else if (leaf === 'itemHoverOverlayOnNav') {
      set.add('fill');
    }
    return [...set];
  }

  if (path.startsWith('color.neutral.background.')) {
    set.add('background');
    return [...set];
  }
  if (path.startsWith('color.neutral.fill.')) {
    set.add('fill');
    return [...set];
  }
  if (path.startsWith('color.neutral.border.')) {
    set.add('border');
    return [...set];
  }
  if (path.startsWith('color.neutral.text.')) {
    set.add('text');
    if (path.endsWith('.icon') || path.endsWith('.iconHover')) {
      set.add('icon');
    }
    return [...set];
  }

  const m = path.match(/^color\.(primary|success|warning|error|info)\.(.+)$/);
  if (m) {
    const seg = m[2];
    if (seg.startsWith('bg')) {
      set.add('background');
    } else if (seg.startsWith('border')) {
      set.add('border');
    } else if (seg.startsWith('text')) {
      set.add('text');
    } else if (['default', 'hover', 'active', 'textHover', 'textActive'].includes(seg)) {
      if (seg.startsWith('text')) {
        set.add('text');
      } else {
        set.add('fill');
      }
    }
    return [...set];
  }

  if (path.startsWith('size.padding.') || path.startsWith('size.controlHeight.')) {
    set.add('spacing');
    return [...set];
  }
  if (path.startsWith('style.borderRadius.')) {
    set.add('radius');
    return [...set];
  }
  if (path.startsWith('style.font.size.')) {
    set.add('fontSize');
    return [...set];
  }
  if (path.startsWith('style.font.lineHeight.')) {
    set.add('lineHeight');
    return [...set];
  }

  return [...set];
}

/** 将 hex / rgb / rgba 规范为可比较形式（不保证与设计工具字符串完全一致，仅用于相等判断） */
export function normalizeColorValue(input: string): string {
  const s = input.trim();
  if (s.startsWith('#')) {
    let h = s.slice(1).toLowerCase();
    if (h.length === 3) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('');
    }
    if (h.length === 6) {
      return `#${h.toUpperCase()}`;
    }
    return s;
  }
  const rgba = s.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i
  );
  if (rgba) {
    const r = Math.round(Number(rgba[1]));
    const g = Math.round(Number(rgba[2]));
    const b = Math.round(Number(rgba[3]));
    const a = rgba[4] !== undefined ? Number(rgba[4]) : 1;
    return `rgba(${r},${g},${b},${a})`;
  }
  return s;
}

function colorValuesEqual(a: string, b: string): boolean {
  return normalizeColorValue(a) === normalizeColorValue(b);
}

const ALL_FLAT = (): FlatLeaf[] => flattenTokens(vcTokens, '');

let cacheFlat: FlatLeaf[] | null = null;

function getFlatLeaves(): FlatLeaf[] {
  if (!cacheFlat) {
    cacheFlat = ALL_FLAT();
  }
  return cacheFlat;
}

/**
 * 按「引用场景」+ 色值，在 vcTokens 中查找可能对应的 token 路径（同值可能多条）。
 * @param figmaColor Figma 解析出的颜色字符串，如 #FFFFFF、rgba(0,0,0,0.1)
 * @param role 当前节点在设计语义下的用途（fill / stroke / 文本等）
 */
export function resolveColorTokenByValue(
  figmaColor: string,
  role: TokenReferenceRole
): TokenValueMatch[] {
  const out: TokenValueMatch[] = [];
  for (const { path, value } of getFlatLeaves()) {
    if (typeof value !== 'string') continue;
    if (!value.startsWith('#') && !value.startsWith('rgb')) continue;
    if (!tokenPathMatchesRole(path, role)) continue;
    if (!colorValuesEqual(value, figmaColor)) continue;
    out.push({ path: `vcTokens.${path}`, value });
  }
  out.sort((a, b) => a.path.localeCompare(b.path));
  return out;
}

/**
 * 按「引用场景」+ 数值，匹配间距、圆角、字号、行高等数字 token。
 */
export function resolveNumericTokenByValue(
  n: number,
  role: Extract<TokenReferenceRole, 'spacing' | 'radius' | 'fontSize' | 'lineHeight'>
): TokenValueMatch[] {
  const out: TokenValueMatch[] = [];
  for (const { path, value } of getFlatLeaves()) {
    if (typeof value !== 'number') continue;
    if (value !== n) continue;
    if (!tokenPathMatchesRole(path, role)) continue;
    out.push({ path: `vcTokens.${path}`, value });
  }
  out.sort((a, b) => a.path.localeCompare(b.path));
  return out;
}
