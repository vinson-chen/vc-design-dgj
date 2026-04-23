import { describe, expect, it } from 'vitest';
import { buildRectangularSelectionKeys, stepLockedCell } from './tableGridSelectionGeometry';
import { cellSelectionSetKey } from './tableGridCellAddress';

describe('tableGridSelectionGeometry', () => {
  it('buildRectangularSelectionKeys', () => {
    const s = buildRectangularSelectionKeys({ r: 0, c: 0 }, { r: 1, c: 1 });
    expect(s.size).toBe(4);
    expect(s.has(cellSelectionSetKey(0, 0))).toBe(true);
    expect(s.has(cellSelectionSetKey(1, 1))).toBe(true);
  });

  it('stepLockedCell respects bounds', () => {
    expect(stepLockedCell(0, 0, 'ArrowUp', 5, 3)).toEqual({ r: -1, c: 0 });
    expect(stepLockedCell(5, 0, 'ArrowDown', 5, 3)).toEqual({ r: 5, c: 0 });
    expect(stepLockedCell(0, 0, 'ArrowLeft', 5, 3)).toEqual({ r: 0, c: 0 });
  });
});
