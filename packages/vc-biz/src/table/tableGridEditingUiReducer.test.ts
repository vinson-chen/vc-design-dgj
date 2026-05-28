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

  it('lockedArrowNavigate syncs selected and anchor', () => {
    const s1 = editingGridUiReducer(initialEditingGridUiState, {
      type: 'lockedArrowNavigate',
      next: { r: 2, c: 3 },
    });
    expect(s1.selectedCell).toEqual({ r: 2, c: 3 });
    expect(s1.selectedCells.has(cellSelectionSetKey(2, 3))).toBe(true);
    expect(s1.selectionAnchor).toEqual({ r: 2, c: 3 });
  });

  it('pointerDownOutside clears selection when not editing', () => {
    const s0 = {
      ...initialEditingGridUiState,
      selectedCell: { r: 0, c: 0 } as const,
      selectedCells: new Set([cellSelectionSetKey(0, 0)]),
      selectionAnchor: { r: 0, c: 0 } as const,
    };
    const s1 = editingGridUiReducer(s0, {
      type: 'pointerDownOutside',
      wasEditing: false,
      exitCell: null,
    });
    // 点击表格外部或其他单元格（非编辑状态）：清空选中状态
    expect(s1.selectedCell).toBeNull();
    expect(s1.selectedCells.size).toBe(0);
    expect(s1.selectionAnchor).toBeNull();
  });
});
