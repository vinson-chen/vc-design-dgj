import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { snapshotTableAreaState, useTableAreaUndoRedo } from './useTableAreaUndoRedo';

describe('useTableAreaUndoRedo', () => {
  it('undo restores previous snapshot', () => {
    let value = { a: '1' };
    let rowCount = 2;
    const apply = vi.fn((s: { valueByCell: Record<string, string>; rowCount: number }) => {
      value = { ...s.valueByCell };
      rowCount = s.rowCount;
    });

    const { result } = renderHook(() =>
      useTableAreaUndoRedo(
        () =>
          snapshotTableAreaState({
            valueByCell: value,
            rowCount,
            colCount: 3,
            colWidths: [null, null],
          }),
        apply
      )
    );

    act(() => {
      result.current.recordIfNeeded();
      value = { a: '2' };
      rowCount = 5;
    });

    act(() => {
      result.current.undo();
    });

    expect(apply).toHaveBeenCalled();
    expect(value.a).toBe('1');
    expect(rowCount).toBe(2);
    expect(result.current.canRedo()).toBe(true);
  });

  it('startBatch records once for multiple logical updates', () => {
    let v = 0;
    const apply = vi.fn((s: { valueByCell: Record<string, string>; rowCount: number }) => {
      v = Number(s.valueByCell.x ?? 0);
    });

    const { result } = renderHook(() =>
      useTableAreaUndoRedo(
        () =>
          snapshotTableAreaState({
            valueByCell: { x: String(v) },
            rowCount: 2,
            colCount: 2,
            colWidths: [],
          }),
        apply
      )
    );

    act(() => {
      result.current.startBatch();
      try {
        v = 1;
        v = 2;
      } finally {
        result.current.endBatch();
      }
    });

    expect(result.current.canUndo()).toBe(true);
    act(() => result.current.undo());
    expect(v).toBe(0);
  });
});
