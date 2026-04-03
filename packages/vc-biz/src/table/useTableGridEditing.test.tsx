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
});
