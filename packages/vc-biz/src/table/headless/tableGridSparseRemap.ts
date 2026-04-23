import { cellKey } from '../tableGridConstants';
import { cellSelectionSetKey, parseCellSelectionSetKey } from './tableGridCellAddress';

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
