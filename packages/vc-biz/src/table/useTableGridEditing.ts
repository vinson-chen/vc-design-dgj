import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cellKey } from './tableGridConstants';
import { focusAntdTextareaWithoutScroll, getNativeTextareaFromAntdRef } from './tableGridFocus';

export type TableGridEditingState = {
  selectedCell: { r: number; c: number } | null;
  setSelectedCell: Dispatch<SetStateAction<{ r: number; c: number } | null>>;
  hoverLockedCell: { r: number; c: number } | null;
  setHoverLockedCell: Dispatch<SetStateAction<{ r: number; c: number } | null>>;
  editingCell: { r: number; c: number } | null;
  setEditingCell: Dispatch<SetStateAction<{ r: number; c: number } | null>>;
  /** 与 DOM 同步；勿放入 Context，否则每键入一字会扫全表 selector */
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
  /**
   * 程序化结束编辑后 blur 可能触发多次；用「格键」忽略期内所有 onBlur 写入，勿用单次 bool（第二次 blur 会误提交空串）。
   */
  pendingBlurIgnoreCellKeyRef: MutableRefObject<string | null>;
  /** 与 pendingBlurIgnoreCellKeyRef 配套，在两次 rAF 后清除忽略键与 duplicate 抑制 */
  scheduleClearEditCommitGuards: () => void;
  /**
   * pointerdown 已 exit 并写入上一格后，同一击的 click 仍会跑「切格前保存」；
   * 此时 getEditingValueForSave 常为空，应用此方法跳过重复写入。
   */
  consumeDuplicatePrevCellClickSave: () => boolean;
  suppressDuplicatePrevCellClickSaveRef: MutableRefObject<boolean>;
  /** 与 useTableGridEditing 的 onKeyboardNavigateCell 一致，供单元格内提交后联动滚动 */
  onKeyboardNavigateCell?: (p: { r: number; c: number; key: string }) => void;
  removeColumnAt: (colIndex: number) => void;
  removeBodyRowAt: (bodyRowIndex: number) => void;
};

export type UseTableGridEditingOptions = Readonly<{
  initialValueByCell?: Record<string, string>;
  valueByCell?: Record<string, string>;
  onValueByCellChange?: Dispatch<SetStateAction<Record<string, string>>>;
  /** 锁定态方向键导航：可编辑区 body 最大行下标（含）；无表体时 -1 */
  maxBodyRowIndex?: number;
  /** 锁定态方向键导航：文本列最大列下标（含）；无列时 -1 */
  maxColIndex?: number;
  /** 方向键切换单元格后回调（如联动滚动条使格完整可见） */
  onKeyboardNavigateCell?: (p: { r: number; c: number; key: string }) => void;
}>;

function stepLockedCell(
  r: number,
  c: number,
  key: string,
  maxR: number,
  maxC: number
): { r: number; c: number } {
  switch (key) {
    case 'ArrowUp':
      return { r: Math.max(0, r - 1), c };
    case 'ArrowDown':
      return { r: Math.min(maxR, r + 1), c };
    case 'ArrowLeft':
      return { r, c: Math.max(0, c - 1) };
    case 'ArrowRight':
      return { r, c: Math.min(maxC, c + 1) };
    default:
      return { r, c };
  }
}

export function useTableGridEditing(
  enableEditMode: boolean,
  options?: UseTableGridEditingOptions
): TableGridEditingState {
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [hoverLockedCell, setHoverLockedCell] = useState<{ r: number; c: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ r: number; c: number } | null>(null);
  const editingCellRef = useRef(editingCell);
  editingCellRef.current = editingCell;
  const isControlled =
    options?.valueByCell !== undefined && options?.onValueByCellChange !== undefined;
  const [internalValueByCell, setInternalValueByCell] = useState<Record<string, string>>(() => ({
    ...(options?.initialValueByCell ?? {}),
  }));
  const valueByCell = isControlled ? options!.valueByCell! : internalValueByCell;
  const setValueByCell = isControlled
    ? options!.onValueByCellChange!
    : setInternalValueByCell;
  const editTextAreaRef = useRef<{
    resizableTextArea?: { textArea?: HTMLTextAreaElement | null };
    focus?: (options?: { preventScroll?: boolean }) => void;
  } | null>(null);
  const pendingFocusAfterKeyboardOpenRef = useRef(false);
  const editingDraftRef = useRef('');
  const pendingBlurIgnoreCellKeyRef = useRef<string | null>(null);
  const suppressDuplicatePrevCellClickSaveRef = useRef(false);
  const valueByCellRef = useRef(valueByCell);
  valueByCellRef.current = valueByCell;

  const maxBodyRowIndex = options?.maxBodyRowIndex ?? -1;
  const maxColIndex = options?.maxColIndex ?? -1;

  const setEditingDraft = useCallback((action: SetStateAction<string>) => {
    editingDraftRef.current =
      typeof action === 'function'
        ? (action as (prev: string) => string)(editingDraftRef.current)
        : action;
  }, []);

  const getEditingValueForSave = useCallback(() => {
    const ta = getNativeTextareaFromAntdRef(editTextAreaRef);
    return ta?.value ?? editingDraftRef.current;
  }, []);

  const consumeDuplicatePrevCellClickSave = useCallback(() => {
    if (suppressDuplicatePrevCellClickSaveRef.current) {
      suppressDuplicatePrevCellClickSaveRef.current = false;
      return true;
    }
    return false;
  }, []);

  const scheduleClearEditCommitGuards = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        pendingBlurIgnoreCellKeyRef.current = null;
        suppressDuplicatePrevCellClickSaveRef.current = false;
      });
    });
  }, []);

  const exitEditingLikeEscape = useCallback(() => {
    const ec = editingCellRef.current;
    if (!ec) return;
    const k = cellKey(ec.r, ec.c);
    /** 必须同步读出：updater 若延后执行，此时 ref/草稿可能已被下一格覆盖，会存成空串 */
    const valueToSave = getEditingValueForSave();
    /** 程序化收尾后可能多次 blur，整段窗口内忽略该格的 onBlur 提交 */
    pendingBlurIgnoreCellKeyRef.current = k;
    suppressDuplicatePrevCellClickSaveRef.current = true;
    scheduleClearEditCommitGuards();
    setValueByCell((prev) => ({ ...prev, [k]: valueToSave }));
    setSelectedCell({ r: ec.r, c: ec.c });
    /** 与选中态一致：表格外 pointerdown 会先清 hover，此处需恢复，否则出现「失焦输入框样式但无锁定悬停高亮」 */
    setHoverLockedCell({ r: ec.r, c: ec.c });
    setEditingCell(null);
    editingDraftRef.current = '';
  }, [getEditingValueForSave, scheduleClearEditCommitGuards]);

  const removeColumnAt = useCallback((colIndex: number) => {
    const ec = editingCellRef.current;
    if (ec?.c === colIndex) {
      editingDraftRef.current = '';
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
      const wasEditing = editingCellRef.current != null;
      setHoverLockedCell(null);
      exitEditingLikeEscape();
      if (!wasEditing) {
        setSelectedCell(null);
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [hoverLockedCell, exitEditingLikeEscape, setSelectedCell]);

  useEffect(() => {
    if (!editingCell || !pendingFocusAfterKeyboardOpenRef.current) return;
    pendingFocusAfterKeyboardOpenRef.current = false;
    const id = requestAnimationFrame(() => {
      focusAntdTextareaWithoutScroll(editTextAreaRef);
    });
    return () => cancelAnimationFrame(id);
  }, [editingCell]);

  useEffect(() => {
    if (!enableEditMode) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const isArrow =
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight';

      if (
        maxBodyRowIndex >= 0 &&
        maxColIndex >= 0 &&
        hoverLockedCell &&
        isArrow &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !e.isComposing
      ) {
        const taFocused = getNativeTextareaFromAntdRef(editTextAreaRef);
        if (taFocused && document.activeElement === taFocused) {
          return;
        }
        const from = editingCell ?? selectedCell ?? hoverLockedCell;
        e.preventDefault();
        if (editingCell) {
          exitEditingLikeEscape();
        }
        const next = stepLockedCell(from.r, from.c, e.key, maxBodyRowIndex, maxColIndex);
        setHoverLockedCell(next);
        setSelectedCell(next);
        options?.onKeyboardNavigateCell?.({ r: next.r, c: next.c, key: e.key });
        return;
      }

      // Mac 笔记本主键盘「删除」多为 Backspace；Fn+Delete 常为 Delete。非编辑态下 Backspace 与 Delete 均整格清空。
      const isClearLockedCellKey =
        e.key === 'Delete' || (e.key === 'Backspace' && !editingCell);
      const activeEl = document.activeElement;
      const clearBlockedByExternalFocus =
        activeEl instanceof HTMLElement &&
        activeEl !== document.body &&
        !activeEl.closest('[data-hover-lock-cell]') &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.hasAttribute('contenteditable'));

      if (
        hoverLockedCell &&
        isClearLockedCellKey &&
        !clearBlockedByExternalFocus &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !e.isComposing
      ) {
        e.preventDefault();
        const { r, c } = hoverLockedCell;
        const k = cellKey(r, c);
        setValueByCell((prev) => ({ ...prev, [k]: '' }));
        if (editingCell?.r === r && editingCell?.c === c) {
          editingDraftRef.current = '';
          const ta = getNativeTextareaFromAntdRef(editTextAreaRef);
          if (ta) {
            ta.value = '';
          }
        }
        return;
      }

      const native = getNativeTextareaFromAntdRef(editTextAreaRef);

      if (native && document.activeElement === native) {
        return;
      }

      const mod = (e.ctrlKey || e.metaKey) && !e.altKey;
      const keyOne = e.key.length === 1 ? e.key.toLowerCase() : '';
      if (mod && (keyOne === 'c' || keyOne === 'v') && !e.isComposing) {
        const hasCellContext =
          editingCell != null || selectedCell != null || hoverLockedCell != null;
        if (hasCellContext) {
          if (keyOne === 'c') {
            e.preventDefault();
            if (editingCell != null) {
              void navigator.clipboard.writeText(getEditingValueForSave());
            } else {
              const cell = selectedCell ?? hoverLockedCell;
              if (cell) {
                void navigator.clipboard.writeText(
                  valueByCellRef.current[cellKey(cell.r, cell.c)] ?? ''
                );
              }
            }
            return;
          }
          const pasteTarget = selectedCell ?? hoverLockedCell ?? editingCell;
          if (pasteTarget && keyOne === 'v') {
            e.preventDefault();
            const ck = cellKey(pasteTarget.r, pasteTarget.c);
            void navigator.clipboard.readText().then((t) => {
              setValueByCell((prev) => ({ ...prev, [ck]: t }));
              const ec = editingCellRef.current;
              if (ec?.r === pasteTarget.r && ec?.c === pasteTarget.c) {
                editingDraftRef.current = t;
                const ta = getNativeTextareaFromAntdRef(editTextAreaRef);
                if (ta) {
                  ta.value = t;
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      try {
                        const len = ta.value.length;
                        ta.focus({ preventScroll: true });
                        ta.setSelectionRange(len, len);
                      } catch {
                        /* 节点未就绪 */
                      }
                    });
                  });
                }
              }
            });
            return;
          }
        }
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
        exitEditingLikeEscape();
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.isComposing) return;

      if (editingCell) {
        if (e.key.length === 1) {
          e.preventDefault();
          const ta = getNativeTextareaFromAntdRef(editTextAreaRef);
          if (ta) {
            ta.value += e.key;
            editingDraftRef.current = ta.value;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const len = ta.value.length;
                ta.focus({ preventScroll: true });
                ta.setSelectionRange(len, len);
              });
            });
          } else {
            editingDraftRef.current += e.key;
          }
        }
        return;
      }

      if (selectedCell && e.key.length === 1) {
        e.preventDefault();
        const k = cellKey(selectedCell.r, selectedCell.c);
        const displayText = valueByCellRef.current[k] ?? '';
        pendingFocusAfterKeyboardOpenRef.current = true;
        const next = displayText + e.key;
        editingDraftRef.current = next;
        setEditingCell({ r: selectedCell.r, c: selectedCell.c });
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [
    enableEditMode,
    selectedCell,
    editingCell,
    hoverLockedCell,
    maxBodyRowIndex,
    maxColIndex,
    getEditingValueForSave,
    setEditingDraft,
    exitEditingLikeEscape,
    options?.onKeyboardNavigateCell,
  ]);

  return useMemo(() => {
    const api = {
      selectedCell,
      setSelectedCell,
      hoverLockedCell,
      setHoverLockedCell,
      editingCell,
      setEditingCell,
      setEditingDraft,
      valueByCell,
      setValueByCell,
      editTextAreaRef,
      editingDraftRef,
      getEditingValueForSave,
      pendingBlurIgnoreCellKeyRef,
      scheduleClearEditCommitGuards,
      consumeDuplicatePrevCellClickSave,
      suppressDuplicatePrevCellClickSaveRef,
      onKeyboardNavigateCell: options?.onKeyboardNavigateCell,
      removeColumnAt,
      removeBodyRowAt,
    };
    Object.defineProperty(api, 'editingDraft', {
      enumerable: true,
      configurable: true,
      get: () => editingDraftRef.current,
    });
    return api as TableGridEditingState;
  }, [
    selectedCell,
    hoverLockedCell,
    editingCell,
    valueByCell,
    getEditingValueForSave,
    scheduleClearEditCommitGuards,
    consumeDuplicatePrevCellClickSave,
    removeColumnAt,
    removeBodyRowAt,
    setEditingDraft,
    options?.onKeyboardNavigateCell,
  ]);
}
