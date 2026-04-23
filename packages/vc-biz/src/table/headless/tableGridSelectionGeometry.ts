import { cellSelectionSetKey, TABLE_GRID_HEADER_ROW_INDEX } from './tableGridCellAddress';

export function buildRectangularSelectionKeys(
  anchor: { r: number; c: number },
  current: { r: number; c: number }
): Set<string> {
  const top = Math.min(anchor.r, current.r);
  const bottom = Math.max(anchor.r, current.r);
  const left = Math.min(anchor.c, current.c);
  const right = Math.max(anchor.c, current.c);
  const next = new Set<string>();
  for (let r = top; r <= bottom; r += 1) {
    for (let c = left; c <= right; c += 1) {
      next.add(cellSelectionSetKey(r, c));
    }
  }
  return next;
}

export function stepLockedCell(
  r: number,
  c: number,
  key: string,
  maxR: number,
  maxC: number
): { r: number; c: number } {
  switch (key) {
    case 'ArrowUp':
      return { r: Math.max(TABLE_GRID_HEADER_ROW_INDEX, r - 1), c };
    case 'ArrowDown':
      return { r: Math.min(maxR, r + 1), c };
    case 'ArrowLeft':
      return { r, c: Math.max(0, c - 1) };
    case 'ArrowRight':
      return { r, c: Math.min(maxC, c + 1) };
    default:
      return { r, c };
  }
}
