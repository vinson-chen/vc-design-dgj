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

  it('ArrowLeft moves hover lock and selection when cell is locked', async () => {
    const { result } = renderHook(() =>
      useTableGridEditing(true, { maxBodyRowIndex: 2, maxColIndex: 2 })
    );

    act(() => {
      result.current.setHoverLockedCell({ r: 0, c: 1 });
      result.current.setSelectedCell({ r: 0, c: 1 });
    });

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
      );
    });

    await waitFor(() => {
      expect(result.current.hoverLockedCell).toEqual({ r: 0, c: 0 });
      expect(result.current.selectedCell).toEqual({ r: 0, c: 0 });
    });
  });

  it('after pointerdown outside while editing, hover lock matches selected idle cell', async () => {
    const { result } = renderHook(() => useTableGridEditing(true, { maxBodyRowIndex: 9, maxColIndex: 9 }));

    act(() => {
      result.current.setHoverLockedCell({ r: 5, c: 1 });
      result.current.setSelectedCell({ r: 5, c: 1 });
      result.current.setEditingCell({ r: 5, c: 1 });
    });

    act(() => {
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });

    await waitFor(() => {
      expect(result.current.editingCell).toBeNull();
      expect(result.current.selectedCell).toEqual({ r: 5, c: 1 });
      expect(result.current.hoverLockedCell).toEqual({ r: 5, c: 1 });
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

    it('Ctrl+C copies locked cell value to clipboard', async () => {
      const { result } = renderHook(() => useTableGridEditing(true));

      act(() => {
        result.current.setValueByCell({ '1-2': 'cell-a' });
        result.current.setHoverLockedCell({ r: 1, c: 2 });
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

    it('Ctrl+V pastes clipboard into locked cell', async () => {
      const { result } = renderHook(() => useTableGridEditing(true));

      act(() => {
        result.current.setValueByCell({ '0-0': 'old' });
        result.current.setHoverLockedCell({ r: 0, c: 0 });
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
  });
});
