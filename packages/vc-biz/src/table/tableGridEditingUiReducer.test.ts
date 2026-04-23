import { describe, expect, it } from 'vitest';
import { cellSelectionSetKey } from './headless/tableGridCellAddress';
import {
  editingGridUiReducer,
  initialEditingGridUiState,
} from './tableGridEditingUiReducer';

describe('editingGridUiReducer', () => {
  it('applyRangeSelection clears editing and sets rectangular keys', () => {
    const s0: typeof initialEditingGridUiState = {
      ...initialEditingGridUiState,
      editingCell: { r: 0, c: 0 },
    };
    const s1 = editingGridUiReducer(s0, {
      type: 'applyRangeSelection',
      anchor: { r: 0, c: 0 },
      current: { r: 1, c: 1 },
    });
    expect(s1.editingCell).toBeNull();
    expect(s1.selectedCells.size).toBe(4);
    expect(s1.selectionAnchor).toEqual({ r: 0, c: 0 });
  });

  it('lockedArrowNavigate syncs hover, selected, anchor', () => {
    const s1 = editingGridUiReducer(initialEditingGridUiState, {
      type: 'lockedArrowNavigate',
      next: { r: 2, c: 3 },
    });
    expect(s1.selectedCell).toEqual({ r: 2, c: 3 });
    expect(s1.hoverLockedCell).toEqual({ r: 2, c: 3 });
    expect(s1.selectedCells.has(cellSelectionSetKey(2, 3))).toBe(true);
  });

  it('pointerDownOutside clears when not editing', () => {
    const s0 = {
      ...initialEditingGridUiState,
      hoverLockedCell: { r: 0, c: 0 } as const,
      selectedCell: { r: 0, c: 0 } as const,
    };
    const s1 = editingGridUiReducer(s0, {
      type: 'pointerDownOutside',
      wasEditing: false,
      exitCell: null,
    });
    expect(s1.hoverLockedCell).toBeNull();
    expect(s1.selectedCell).toBeNull();
    expect(s1.selectedCells.size).toBe(0);
  });
});
