import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cellKey } from './tableGridConstants';

function getNativeTextareaFromAntdRef(
  ref: RefObject<{
    resizableTextArea?: { textArea?: HTMLTextAreaElement | null };
  } | null>
): HTMLTextAreaElement | null {
  return ref.current?.resizableTextArea?.textArea ?? null;
}

export type TableGridEditingState = {
  selectedCell: { r: number; c: number } | null;
  setSelectedCell: Dispatch<SetStateAction<{ r: number; c: number } | null>>;
  hoverLockedCell: { r: number; c: number } | null;
  setHoverLockedCell: Dispatch<SetStateAction<{ r: number; c: number } | null>>;
  editingCell: { r: number; c: number } | null;
  setEditingCell: Dispatch<SetStateAction<{ r: number; c: number } | null>>;
  editingDraft: string;
  setEditingDraft: Dispatch<SetStateAction<string>>;
  valueByCell: Record<string, string>;
  setValueByCell: Dispatch<SetStateAction<Record<string, string>>>;
  editTextAreaRef: RefObject<{
    resizableTextArea?: { textArea?: HTMLTextAreaElement | null };
    focus?: (options?: { preventScroll?: boolean }) => void;
  } | null>;
  editingDraftRef: MutableRefObject<string>;
  getEditingValueForSave: () => string;
  removeColumnAt: (colIndex: number) => void;
  removeBodyRowAt: (bodyRowIndex: number) => void;
};

export function useTableGridEditing(enableEditMode: boolean): TableGridEditingState {
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [hoverLockedCell, setHoverLockedCell] = useState<{ r: number; c: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ r: number; c: number } | null>(null);
  const editingCellRef = useRef(editingCell);
  editingCellRef.current = editingCell;
  const [editingDraft, setEditingDraft] = useState('');
  const [valueByCell, setValueByCell] = useState<Record<string, string>>({});
  const editTextAreaRef = useRef<{
    resizableTextArea?: { textArea?: HTMLTextAreaElement | null };
    focus?: (options?: { preventScroll?: boolean }) => void;
  } | null>(null);
  const pendingFocusAfterKeyboardOpenRef = useRef(false);
  const editingDraftRef = useRef('');
  const valueByCellRef = useRef(valueByCell);
  editingDraftRef.current = editingDraft;
  valueByCellRef.current = valueByCell;

  const getEditingValueForSave = useCallback(() => {
    const ta = getNativeTextareaFromAntdRef(editTextAreaRef);
    return ta?.value ?? editingDraftRef.current;
  }, []);

  const exitEditingLikeEscape = useCallback(() => {
    const ec = editingCellRef.current;
    if (!ec) return;
    const k = cellKey(ec.r, ec.c);
    setValueByCell((prev) => ({ ...prev, [k]: getEditingValueForSave() }));
    setSelectedCell({ r: ec.r, c: ec.c });
    setEditingCell(null);
    editingDraftRef.current = '';
    setEditingDraft('');
  }, [getEditingValueForSave]);

  const removeColumnAt = useCallback((colIndex: number) => {
    const ec = editingCellRef.current;
    if (ec?.c === colIndex) {
      editingDraftRef.current = '';
      setEditingDraft('');
    }
    setValueByCell((prev) => {
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(prev)) {
        const parts = k.split('-');
        if (parts.length !== 2) continue;
        const r = Number(parts[0]);
        const c = Number(parts[1]);
        if (Number.isNaN(r) || Number.isNaN(c)) continue;
        if (c === colIndex) continue;
        const nk = c > colIndex ? cellKey(r, c - 1) : k;
        next[nk] = v;
      }
      return next;
    });
    setEditingCell((current) => {
      if (!current) return null;
      if (current.c === colIndex) return null;
      if (current.c > colIndex) return { r: current.r, c: current.c - 1 };
      return current;
    });
    setSelectedCell((sc) => {
      if (!sc) return null;
      if (sc.c === colIndex) return null;
      if (sc.c > colIndex) return { r: sc.r, c: sc.c - 1 };
      return sc;
    });
    setHoverLockedCell((hl) => {
      if (!hl) return null;
      if (hl.c === colIndex) return null;
      if (hl.c > colIndex) return { r: hl.r, c: hl.c - 1 };
      return hl;
    });
  }, []);

  const removeBodyRowAt = useCallback((bodyRowIndex: number) => {
    const ec = editingCellRef.current;
    if (ec?.r === bodyRowIndex) {
      editingDraftRef.current = '';
      setEditingDraft('');
    }
    setValueByCell((prev) => {
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(prev)) {
        const parts = k.split('-');
        if (parts.length !== 2) continue;
        const r = Number(parts[0]);
        const c = Number(parts[1]);
        if (Number.isNaN(r) || Number.isNaN(c)) continue;
        if (r === bodyRowIndex) continue;
        const nk = r > bodyRowIndex ? cellKey(r - 1, c) : k;
        next[nk] = v;
      }
      return next;
    });
    setEditingCell((current) => {
      if (!current) return null;
      if (current.r === bodyRowIndex) return null;
      if (current.r > bodyRowIndex) return { r: current.r - 1, c: current.c };
      return current;
    });
    setSelectedCell((sc) => {
      if (!sc) return null;
      if (sc.r === bodyRowIndex) return null;
      if (sc.r > bodyRowIndex) return { r: sc.r - 1, c: sc.c };
      return sc;
    });
    setHoverLockedCell((hl) => {
      if (!hl) return null;
      if (hl.r === bodyRowIndex) return null;
      if (hl.r > bodyRowIndex) return { r: hl.r - 1, c: hl.c };
      return hl;
    });
  }, []);

  useEffect(() => {
    if (!enableEditMode) {
      setSelectedCell(null);
      setEditingCell(null);
      setHoverLockedCell(null);
      editingDraftRef.current = '';
      setEditingDraft('');
    }
  }, [enableEditMode]);

  useEffect(() => {
    if (!hoverLockedCell) return;
    const locked = hoverLockedCell;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      const el = target instanceof Element ? target : target.parentElement;
      if (!el) return;
      const cell = el.closest('[data-hover-lock-cell]');
      if (cell) {
        const r = Number(cell.getAttribute('data-body-row'));
        const c = Number(cell.getAttribute('data-col'));
        if (!Number.isNaN(r) && !Number.isNaN(c) && r === locked.r && c === locked.c) return;
      }
      setHoverLockedCell(null);
      exitEditingLikeEscape();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [hoverLockedCell, exitEditingLikeEscape]);

  useEffect(() => {
    if (!editingCell || !pendingFocusAfterKeyboardOpenRef.current) return;
    pendingFocusAfterKeyboardOpenRef.current = false;
    const id = requestAnimationFrame(() => {
      editTextAreaRef.current?.focus?.({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [editingCell]);

  useEffect(() => {
    if (!enableEditMode) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const native = getNativeTextareaFromAntdRef(editTextAreaRef);

      if (native && document.activeElement === native) {
        return;
      }

      const isOtherFieldFocused = () => {
        const el = document.activeElement;
        if (!el || el === document.body) return false;
        const tag = el.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
        return el.hasAttribute('contenteditable');
      };

      if (isOtherFieldFocused()) {
        return;
      }

      if (e.key === 'Escape' && editingCell) {
        e.preventDefault();
        const k = cellKey(editingCell.r, editingCell.c);
        setValueByCell((prev) => ({ ...prev, [k]: getEditingValueForSave() }));
        setSelectedCell({ r: editingCell.r, c: editingCell.c });
        setEditingCell(null);
        editingDraftRef.current = '';
        setEditingDraft('');
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.isComposing) return;

      if (editingCell) {
        if (e.key.length === 1) {
          e.preventDefault();
          setEditingDraft((prev) => {
            const next = prev + e.key;
            editingDraftRef.current = next;
            return next;
          });
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const ta = getNativeTextareaFromAntdRef(editTextAreaRef);
              const len = ta?.value.length ?? 0;
              ta?.focus({ preventScroll: true });
              ta?.setSelectionRange(len, len);
            });
          });
        }
        return;
      }

      if (selectedCell && e.key.length === 1) {
        e.preventDefault();
        const k = cellKey(selectedCell.r, selectedCell.c);
        const displayText =
          valueByCellRef.current[k] ?? `R${selectedCell.r + 1} C${selectedCell.c + 1}`;
        pendingFocusAfterKeyboardOpenRef.current = true;
        setEditingCell({ r: selectedCell.r, c: selectedCell.c });
        const next = displayText + e.key;
        editingDraftRef.current = next;
        setEditingDraft(next);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [enableEditMode, selectedCell, editingCell, getEditingValueForSave]);

  return useMemo(
    () => ({
      selectedCell,
      setSelectedCell,
      hoverLockedCell,
      setHoverLockedCell,
      editingCell,
      setEditingCell,
      editingDraft,
      setEditingDraft,
      valueByCell,
      setValueByCell,
      editTextAreaRef,
      editingDraftRef,
      getEditingValueForSave,
      removeColumnAt,
      removeBodyRowAt,
    }),
    [
      selectedCell,
      hoverLockedCell,
      editingCell,
      editingDraft,
      valueByCell,
      getEditingValueForSave,
      removeColumnAt,
      removeBodyRowAt,
    ]
  );
}
