import { describe, expect, it } from 'vitest';
import {
  TABLE_GRID_HEADER_ROW_INDEX,
  cellSelectionSetKey,
  cellStorageKey,
  parseCellSelectionSetKey,
} from './tableGridCellAddress';

describe('tableGridCellAddress', () => {
  it('cellStorageKey', () => {
    expect(cellStorageKey(TABLE_GRID_HEADER_ROW_INDEX, 2)).toBe('header-2');
    expect(cellStorageKey(0, 1)).toBe('0-1');
  });

  it('cellSelectionSetKey / parseCellSelectionSetKey round-trip', () => {
    expect(parseCellSelectionSetKey(cellSelectionSetKey(-1, 0))).toEqual({ r: -1, c: 0 });
    expect(parseCellSelectionSetKey('bad')).toBeNull();
  });
});
