import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTableGridEditing } from './useTableGridEditing';

describe('useTableGridEditing', () => {
  it('clears editing state when enableEditMode becomes false', async () => {
    const { result, rerender } = renderHook(({ enabled }: { enabled: boolean }) => useTableGridEditing(enabled), {
      initialProps: { enabled: true },
    });

    act(() => {
      result.current.setEditingCell({ r: 0, c: 1 });
      result.current.setEditingDraft('hello');
    });
    expect(result.current.editingCell).toEqual({ r: 0, c: 1 });
    expect(result.current.editingDraft).toBe('hello');

    rerender({ enabled: false });

    await waitFor(() => {
      expect(result.current.editingCell).toBeNull();
      expect(result.current.editingDraft).toBe('');
    });
  });

  it('exposes stable getEditingValueForSave reading draft ref', () => {
    const { result } = renderHook(() => useTableGridEditing(true));

    act(() => {
      result.current.setEditingDraft('draft');
    });
    expect(result.current.getEditingValueForSave()).toBe('draft');
  });

  it('ArrowLeft moves selection anchor when cell is selected', async () => {
    const { result } = renderHook(() =>
      useTableGridEditing(true, { maxBodyRowIndex: 2, maxColIndex: 2 })
    );

    act(() => {
      result.current.setSelectedCell({ r: 0, c: 1 });
      result.current.setSelectedCells(new Set(['0:1']));
      result.current.setSelectionAnchor({ r: 0, c: 1 });
    });

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
      );
    });

    await waitFor(() => {
      expect(result.current.selectedCell).toEqual({ r: 0, c: 0 });
    });
  });

  it('ArrowUp can navigate from first body row to header row (r=-1)', async () => {
    const { result } = renderHook(() =>
      useTableGridEditing(true, { maxBodyRowIndex: 2, maxColIndex: 2 })
    );

    act(() => {
      result.current.setSelectedCell({ r: 0, c: 1 });
      result.current.setSelectedCells(new Set(['0:1']));
      result.current.setSelectionAnchor({ r: 0, c: 1 });
    });

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
      );
    });

    await waitFor(() => {
      expect(result.current.selectedCell).toEqual({ r: -1, c: 1 });
    });
  });

  it('Delete clears header storage key when selectedCell is on header row', async () => {
    const { result } = renderHook(() =>
      useTableGridEditing(true, { maxBodyRowIndex: 2, maxColIndex: 2 })
    );

    act(() => {
      result.current.setValueByCell({ 'header-1': '列名' });
      result.current.setSelectedCell({ r: -1, c: 1 });
    });

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true })
      );
    });

    await waitFor(() => {
      expect(result.current.valueByCell['header-1']).toBe('');
    });
  });

  it('setRangeSelection replaces by rectangle and keeps anchor as selectedCell', () => {
    const { result } = renderHook(() =>
      useTableGridEditing(true, { maxBodyRowIndex: 10, maxColIndex: 10 })
    );

    act(() => {
      result.current.setRangeSelection({ r: 1, c: 2 }, { r: 3, c: 4 });
    });

    expect(result.current.selectedCell).toEqual({ r: 1, c: 2 });
    expect(result.current.selectionAnchor).toEqual({ r: 1, c: 2 });
    expect(result.current.selectedCells.size).toBe(9);
    expect(result.current.isCellMultiSelected(1, 2)).toBe(true);
    expect(result.current.isCellMultiSelected(3, 4)).toBe(true);
    expect(result.current.isCellMultiSelected(0, 0)).toBe(false);

    act(() => {
      result.current.setRangeSelection({ r: 0, c: 0 }, { r: 0, c: 1 });
    });
    expect(result.current.selectedCells.size).toBe(2);
    expect(result.current.isCellMultiSelected(1, 2)).toBe(false);
  });

  it('clearSelection clears selectedCell/anchor/multi-set', () => {
    const { result } = renderHook(() =>
      useTableGridEditing(true, { maxBodyRowIndex: 10, maxColIndex: 10 })
    );

    act(() => {
      result.current.setRangeSelection({ r: 2, c: 1 }, { r: 4, c: 1 });
    });
    expect(result.current.selectedCells.size).toBeGreaterThan(0);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedCell).toBeNull();
    expect(result.current.selectionAnchor).toBeNull();
    expect(result.current.selectedCells.size).toBe(0);
  });

  it('after pointerdown outside while editing, selectedCell remains', async () => {
    const { result } = renderHook(() => useTableGridEditing(true, { maxBodyRowIndex: 9, maxColIndex: 9 }));

    act(() => {
      result.current.setSelectedCell({ r: 5, c: 1 });
      result.current.setSelectedCells(new Set(['5:1']));
      result.current.setSelectionAnchor({ r: 5, c: 1 });
      result.current.setEditingCell({ r: 5, c: 1 });
    });

    act(() => {
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });

    await waitFor(() => {
      expect(result.current.editingCell).toBeNull();
      expect(result.current.selectedCell).toEqual({ r: 5, c: 1 });
    });
  });

  describe('clipboard', () => {
    let writeText: ReturnType<typeof vi.fn>;
    let readText: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      writeText = vi.fn().mockResolvedValue(undefined);
      readText = vi.fn().mockResolvedValue('pasted-line');
      Object.defineProperty(globalThis.navigator, 'clipboard', {
        configurable: true,
        value: { writeText, readText },
      });
    });

    it('Ctrl+C copies selected cell value to clipboard', async () => {
      const { result } = renderHook(() => useTableGridEditing(true));

      act(() => {
        result.current.setValueByCell({ '1-2': 'cell-a' });
        result.current.setSelectedCell({ r: 1, c: 2 });
      });

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'c',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
          })
        );
      });

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledWith('cell-a');
      });
    });

    it('Ctrl+V pastes clipboard into selected cell', async () => {
      const { result } = renderHook(() => useTableGridEditing(true));

      act(() => {
        result.current.setValueByCell({ '0-0': 'old' });
        result.current.setSelectedCell({ r: 0, c: 0 });
      });

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'v',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
          })
        );
      });

      await waitFor(() => {
        expect(readText).toHaveBeenCalled();
        expect(result.current.valueByCell['0-0']).toBe('pasted-line');
      });
    });

    it('Ctrl+C copies multi-selection as TSV matrix', async () => {
      const { result } = renderHook(() => useTableGridEditing(true, { maxBodyRowIndex: 9, maxColIndex: 9 }));

      act(() => {
        result.current.setValueByCell({
          '0-0': 'A',
          '0-1': 'B',
          '1-0': 'C',
          '1-1': 'D',
        });
        result.current.setRangeSelection({ r: 0, c: 0 }, { r: 1, c: 1 });
      });

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'c',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
          })
        );
      });

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledWith('A\tB\nC\tD');
      });
    });

    it('Ctrl+V pastes TSV matrix from selectedCell anchor', async () => {
      readText.mockResolvedValue('1\t2\n3\t4');
      const { result } = renderHook(() => useTableGridEditing(true, { maxBodyRowIndex: 9, maxColIndex: 9 }));

      act(() => {
        result.current.setSelectedCell({ r: 2, c: 1 });
      });

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'v',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
          })
        );
      });

      await waitFor(() => {
        expect(result.current.valueByCell['2-1']).toBe('1');
        expect(result.current.valueByCell['2-2']).toBe('2');
        expect(result.current.valueByCell['3-1']).toBe('3');
        expect(result.current.valueByCell['3-2']).toBe('4');
      });
    });

    it('Ctrl+V fills multi-selection with single value', async () => {
      readText.mockResolvedValue('X');
      const { result } = renderHook(() => useTableGridEditing(true, { maxBodyRowIndex: 9, maxColIndex: 9 }));

      act(() => {
        result.current.setRangeSelection({ r: 1, c: 1 }, { r: 2, c: 2 });
      });

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'v',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
          })
        );
      });

      await waitFor(() => {
        expect(result.current.valueByCell['1-1']).toBe('X');
        expect(result.current.valueByCell['1-2']).toBe('X');
        expect(result.current.valueByCell['2-1']).toBe('X');
        expect(result.current.valueByCell['2-2']).toBe('X');
      });
    });

    it('Ctrl+V matrix paste clips by bounds without throwing', async () => {
      readText.mockResolvedValue('a\tb\nc\td');
      const { result } = renderHook(() => useTableGridEditing(true, { maxBodyRowIndex: 1, maxColIndex: 1 }));

      act(() => {
        result.current.setSelectedCell({ r: 1, c: 1 });
      });

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'v',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
          })
        );
      });

      await waitFor(() => {
        expect(result.current.valueByCell['1-1']).toBe('a');
        expect(result.current.valueByCell['1-2']).toBeUndefined();
        expect(result.current.valueByCell['2-1']).toBeUndefined();
      });
    });
  });
});
