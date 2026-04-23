import { cellKey } from '../tableGridConstants';

/** 表头行在选区/编辑坐标中的 r 下标 */
export const TABLE_GRID_HEADER_ROW_INDEX = -1;

/** 稀疏存储键：`header-{c}` 或 `{r}-{c}`（与 `cellKey` 一致） */
export function cellStorageKey(r: number, c: number): string {
  return r === TABLE_GRID_HEADER_ROW_INDEX ? `header-${c}` : cellKey(r, c);
}

/** 选区 Set 内使用的键：`${r}:${c}` */
export function cellSelectionSetKey(r: number, c: number): string {
  return `${r}:${c}`;
}

export function parseCellSelectionSetKey(k: string): { r: number; c: number } | null {
  const [rs, cs] = k.split(':');
  const r = Number(rs);
  const c = Number(cs);
  if (Number.isNaN(r) || Number.isNaN(c)) return null;
  return { r, c };
}
