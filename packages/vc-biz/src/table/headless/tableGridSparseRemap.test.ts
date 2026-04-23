import { describe, expect, it } from 'vitest';
import {
  adjustCoordAfterRemoveBodyRow,
  adjustCoordAfterRemoveColumn,
  adjustSelectionSetAfterRemoveBodyRow,
  adjustSelectionSetAfterRemoveColumn,
  remapValueByCellAfterRemoveBodyRow,
  remapValueByCellAfterRemoveColumn,
} from './tableGridSparseRemap';
import { cellSelectionSetKey } from './tableGridCellAddress';

describe('tableGridSparseRemap', () => {
  it('remapValueByCellAfterRemoveColumn shifts body and header', () => {
    const prev = {
      'header-0': 'h0',
      'header-1': 'h1',
      '0-0': 'a',
      '0-2': 'c',
    };
    const next = remapValueByCellAfterRemoveColumn(prev, 0);
    expect(next).toEqual({
      'header-0': 'h1',
      '0-1': 'c',
    });
  });

  it('remapValueByCellAfterRemoveBodyRow shifts numeric r-c keys (legacy skips header-*)', () => {
    const prev = {
      'header-0': 'h',
      '0-0': 'a',
      '1-0': 'b',
      '2-0': 'c',
    };
    const next = remapValueByCellAfterRemoveBodyRow(prev, 0);
    // 与历史 useTableGridEditing.removeBodyRowAt 一致：`header-0` 被 `split('-')` 解析为 NaN 行号而丢弃
    expect(next).toEqual({
      '0-0': 'b',
      '1-0': 'c',
    });
  });

  it('adjustCoord and selection sets after remove column', () => {
    expect(adjustCoordAfterRemoveColumn({ r: 0, c: 1 }, 0)).toEqual({ r: 0, c: 0 });
    expect(adjustCoordAfterRemoveColumn({ r: 0, c: 0 }, 0)).toBeNull();
    const set = new Set([cellSelectionSetKey(0, 2)]);
    const adj = adjustSelectionSetAfterRemoveColumn(set, 0);
    expect(adj.has(cellSelectionSetKey(0, 1))).toBe(true);
  });
});
