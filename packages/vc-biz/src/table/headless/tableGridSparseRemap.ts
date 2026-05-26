import { cellKey } from '../tableGridConstants';
import { cellSelectionSetKey, parseCellSelectionSetKey } from './tableGridCellAddress';
import type { TableColumnFieldKind } from '../tableGridTypes';

export type GridCellCoord = Readonly<{ r: number; c: number }>;

export function remapValueByCellAfterRemoveColumn(
  prev: Record<string, string>,
  colIndex: number
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const [k, v] of Object.entries(prev)) {
    if (k.startsWith('header-')) {
      const c = Number(k.slice('header-'.length));
      if (Number.isNaN(c)) continue;
      if (c === colIndex) continue;
      const nk = c > colIndex ? `header-${c - 1}` : k;
      next[nk] = v;
      continue;
    }
    const parts = k.split('-');
    if (parts.length !== 2) continue;
    const r = Number(parts[0]);
    const c = Number(parts[1]);
    if (Number.isNaN(r) || Number.isNaN(c)) continue;
    if (c === colIndex) continue;
    const nk = c > colIndex ? cellKey(r, c - 1) : k;
    next[nk] = v;
  }
  return next;
}

export function remapValueByCellAfterRemoveBodyRow(
  prev: Record<string, string>,
  bodyRowIndex: number
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const [k, v] of Object.entries(prev)) {
    const parts = k.split('-');
    if (parts.length !== 2) continue;
    const r = Number(parts[0]);
    const c = Number(parts[1]);
    if (Number.isNaN(r) || Number.isNaN(c)) continue;
    if (r === bodyRowIndex) continue;
    const nk = r > bodyRowIndex ? cellKey(r - 1, c) : k;
    next[nk] = v;
  }
  return next;
}

export function adjustCoordAfterRemoveColumn(
  coord: GridCellCoord | null,
  colIndex: number
): GridCellCoord | null {
  if (!coord) return null;
  if (coord.c === colIndex) return null;
  if (coord.c > colIndex) return { r: coord.r, c: coord.c - 1 };
  return coord;
}

export function adjustCoordAfterRemoveBodyRow(
  coord: GridCellCoord | null,
  bodyRowIndex: number
): GridCellCoord | null {
  if (!coord) return null;
  if (coord.r === bodyRowIndex) return null;
  if (coord.r > bodyRowIndex) return { r: coord.r - 1, c: coord.c };
  return coord;
}

export function adjustSelectionSetAfterRemoveColumn(
  prev: ReadonlySet<string>,
  colIndex: number
): Set<string> {
  const next = new Set<string>();
  for (const k of prev) {
    const p = parseCellSelectionSetKey(k);
    if (!p) continue;
    if (p.c === colIndex) continue;
    next.add(cellSelectionSetKey(p.r, p.c > colIndex ? p.c - 1 : p.c));
  }
  return next;
}

export function adjustSelectionSetAfterRemoveBodyRow(
  prev: ReadonlySet<string>,
  bodyRowIndex: number
): Set<string> {
  const next = new Set<string>();
  for (const k of prev) {
    const p = parseCellSelectionSetKey(k);
    if (!p) continue;
    if (p.r === bodyRowIndex) continue;
    next.add(cellSelectionSetKey(p.r > bodyRowIndex ? p.r - 1 : p.r, p.c));
  }
  return next;
}

/** 插入行后调整选中集合：插入位置之后的行号+1，且新行也需要被选中（保持选中列） */
export function adjustSelectionSetAfterInsertBodyRow(
  prev: ReadonlySet<string>,
  bodyRowIndex: number,
  colCount: number
): Set<string> {
  const next = new Set<string>();
  for (const k of prev) {
    const p = parseCellSelectionSetKey(k);
    if (!p) continue;
    // 插入位置之后的行号+1
    const newR = p.r >= bodyRowIndex ? p.r + 1 : p.r;
    next.add(cellSelectionSetKey(newR, p.c));
  }
  // 如果是选中列模式（所有选中的列都有完整的行），则新行该列也需要被选中
  // 检查是否为选中列模式：每列都有相同的行数且覆盖所有可见行
  const rowCountBeforeInsert = Math.max(...Array.from(prev).map(k => parseCellSelectionSetKey(k)?.r ?? 0)) + 1;
  const colSet = new Set<number>();
  for (const k of prev) {
    const p = parseCellSelectionSetKey(k);
    if (p) colSet.add(p.c);
  }
  // 如果每列都有 rowCountBeforeInsert 个选中格，说明是选中列模式
  let isFullColumnSelection = true;
  for (const c of colSet) {
    let count = 0;
    for (const k of prev) {
      const p = parseCellSelectionSetKey(k);
      if (p && p.c === c) count++;
    }
    if (count !== rowCountBeforeInsert) {
      isFullColumnSelection = false;
      break;
    }
  }
  // 如果是选中列模式，为新行添加选中格
  if (isFullColumnSelection && rowCountBeforeInsert > 0) {
    for (const c of colSet) {
      next.add(cellSelectionSetKey(bodyRowIndex, c));
    }
  }
  return next;
}

/** 插入行后调整坐标：插入位置之后的行号+1 */
export function adjustCoordAfterInsertBodyRow(
  coord: GridCellCoord | null,
  bodyRowIndex: number
): GridCellCoord | null {
  if (!coord) return null;
  if (coord.r >= bodyRowIndex) return { r: coord.r + 1, c: coord.c };
  return coord;
}

/** 图片列：删除列后重映射图片 URL 集合 */
export function remapImageUrlsByCellAfterRemoveColumn(
  prev: Readonly<Record<string, ReadonlyArray<string>>>,
  colIndex: number
): Record<string, ReadonlyArray<string>> {
  const next: Record<string, ReadonlyArray<string>> = {};
  for (const [k, list] of Object.entries(prev)) {
    const [rRaw, cRaw] = k.split('-');
    const r = Number(rRaw);
    const c = Number(cRaw);
    if (Number.isNaN(r) || Number.isNaN(c)) continue;
    if (c === colIndex) continue;
    const nk = c > colIndex ? cellKey(r, c - 1) : k;
    next[nk] = list;
  }
  return next;
}

/** 图片列：删除行后重映射图片 URL 集合 */
export function remapImageUrlsByCellAfterRemoveBodyRow(
  prev: Readonly<Record<string, ReadonlyArray<string>>>,
  bodyRowIndex: number
): Record<string, ReadonlyArray<string>> {
  const next: Record<string, ReadonlyArray<string>> = {};
  for (const [k, list] of Object.entries(prev)) {
    const [rRaw, cRaw] = k.split('-');
    const r = Number(rRaw);
    const c = Number(cRaw);
    if (Number.isNaN(r) || Number.isNaN(c)) continue;
    if (r === bodyRowIndex) continue;
    const nk = r > bodyRowIndex ? cellKey(r - 1, c) : k;
    next[nk] = list;
  }
  return next;
}

/** 删除列后重映射列字段类型 */
export function remapColumnFieldKindsAfterRemoveColumn(
  prev: Readonly<Record<number, TableColumnFieldKind>>,
  colIndex: number
): Record<number, TableColumnFieldKind> {
  const next: Record<number, TableColumnFieldKind> = {};
  for (const [kRaw, kind] of Object.entries(prev)) {
    const c = Number(kRaw);
    if (Number.isNaN(c)) continue;
    if (c === colIndex) continue;
    const nk = c > colIndex ? c - 1 : c;
    next[nk] = kind;
  }
  return next;
}
