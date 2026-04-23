import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  TABLE_GRID_HEADER_ROW_INDEX,
  cellSelectionSetKey,
  cellStorageKey,
  parseCellSelectionSetKey,
} from './headless/tableGridCellAddress';
import { parseClipboardMatrix, serializeSelectionToTsv } from './headless/tableGridClipboard';
import { stepLockedCell } from './headless/tableGridSelectionGeometry';
import {
  remapValueByCellAfterRemoveBodyRow,
  remapValueByCellAfterRemoveColumn,
} from './headless/tableGridSparseRemap';
import {
  editingGridUiReducer,
  initialEditingGridUiState,
} from './tableGridEditingUiReducer';
import { focusBodyEditTextareaWithoutScroll } from './tableGridFocus';

/** 表格编辑/选区维护约定见同目录 `ARCHITECTURE.md`。 */
export type TableGridEditingState = {
  selectedCell: { r: number; c: number } | null;
  setSelectedCell: Dispatch<SetStateAction<{ r: number; c: number } | null>>;
  /** 多选集合：包含 anchor 与其余框选格；key 形如 `${r}:${c}` */
  selectedCells: ReadonlySet<string>;
  setSelectedCells: Dispatch<SetStateAction<Set<string>>>;
  selectionAnchor: { r: number; c: number } | null;
  setSelectionAnchor: Dispatch<SetStateAction<{ r: number; c: number } | null>>;
  isCellMultiSelected: (r: number, c: number) => boolean;
  clearSelection: () => void;
  setRangeSelection: (anchor: { r: number; c: number }, current: { r: number; c: number }) => void;
  hoverLockedCell: { r: number; c: number } | null;
  setHoverLockedCell: Dispatch<SetStateAction<{ r: number; c: number } | null>>;
  editingCell: { r: number; c: number } | null;
  setEditingCell: Dispatch<SetStateAction<{ r: number; c: number } | null>>;
  /** 与 DOM 同步；勿放入 Context，否则每键入一字会扫全表 selector */
  editingDraft: string;
  setEditingDraft: Dispatch<SetStateAction<string>>;
  valueByCell: Record<string, string>;
  setValueByCell: Dispatch<SetStateAction<Record<string, string>>>;
  editTextAreaRef: RefObject<HTMLTextAreaElement | null>;
  /** 表头单行编辑 input ref（当 editingCell.r === -1 时使用） */
  headerEditInputRef: RefObject<HTMLInputElement | null>;
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
  /** 表格快照撤销；输入框聚焦时不拦截，避免覆盖浏览器字级撤销 */
  undoRedo?: Readonly<{
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
  }> | null;
  /** 外部撤销/重做后递增，清空编辑与锁定格 */
  undoRedoNonce?: number;
  /** 表体原生 textarea 在程序化改 value 后同步高度（须与 TableGridTextCell 内 autoSize 参数一致） */
  bodyEditTextareaAutosize?: (el: HTMLTextAreaElement) => void;
}>;

export function useTableGridEditing(
  enableEditMode: boolean,
  options?: UseTableGridEditingOptions
): TableGridEditingState {
  const [ui, dispatchUi] = useReducer(editingGridUiReducer, initialEditingGridUiState);
  const {
    selectedCell,
    selectedCells,
    selectionAnchor,
    hoverLockedCell,
    editingCell,
  } = ui;

  const setSelectedCell = useCallback(
    (update: SetStateAction<{ r: number; c: number } | null>) => {
      dispatchUi({ type: 'setSelectedCell', update });
    },
    []
  );
  const setSelectedCells = useCallback((update: SetStateAction<Set<string>>) => {
    dispatchUi({ type: 'setSelectedCells', update });
  }, []);
  const setSelectionAnchor = useCallback(
    (update: SetStateAction<{ r: number; c: number } | null>) => {
      dispatchUi({ type: 'setSelectionAnchor', update });
    },
    []
  );
  const setHoverLockedCell = useCallback(
    (update: SetStateAction<{ r: number; c: number } | null>) => {
      dispatchUi({ type: 'setHoverLockedCell', update });
    },
    []
  );
  const setEditingCell = useCallback(
    (update: SetStateAction<{ r: number; c: number } | null>) => {
      dispatchUi({ type: 'setEditingCell', update });
    },
    []
  );

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
  const editTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const headerEditInputRef = useRef<HTMLInputElement | null>(null);
  const pendingFocusAfterKeyboardOpenRef = useRef(false);
  const editingDraftRef = useRef('');
  const pendingBlurIgnoreCellKeyRef = useRef<string | null>(null);
  const suppressDuplicatePrevCellClickSaveRef = useRef(false);
  const valueByCellRef = useRef(valueByCell);
  valueByCellRef.current = valueByCell;

  const undoRedoRef = useRef(options?.undoRedo ?? null);
  undoRedoRef.current = options?.undoRedo ?? null;

  const bodyEditTextareaAutosizeRef = useRef(options?.bodyEditTextareaAutosize);
  bodyEditTextareaAutosizeRef.current = options?.bodyEditTextareaAutosize;

  const lastUndoNonceRef = useRef(options?.undoRedoNonce ?? 0);
  useEffect(() => {
    const n = options?.undoRedoNonce;
    if (n === undefined) return;
    if (n === lastUndoNonceRef.current) return;
    lastUndoNonceRef.current = n;
    dispatchUi({ type: 'resetAllForUndoOrDisable' });
    editingDraftRef.current = '';
  }, [options?.undoRedoNonce]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const bridge = undoRedoRef.current;
      if (!bridge) return;
      const mod = (e.ctrlKey || e.metaKey) && !e.altKey;
      if (!mod || e.key.toLowerCase() !== 'z' || e.isComposing) return;

      const ta = editTextAreaRef.current;
      if (ta && document.activeElement === ta) return;

      const activeEl = document.activeElement;
      if (activeEl instanceof HTMLElement && activeEl !== document.body) {
        const tag = activeEl.tagName;
        if (
          (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') &&
          !activeEl.closest('[data-hover-lock-cell]')
        ) {
          return;
        }
        if (activeEl.hasAttribute('contenteditable') && !activeEl.closest('[data-hover-lock-cell]')) {
          return;
        }
      }

      if (e.shiftKey) {
        if (bridge.canRedo()) {
          e.preventDefault();
          bridge.redo();
        }
      } else if (bridge.canUndo()) {
        e.preventDefault();
        bridge.undo();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

  const maxBodyRowIndex = options?.maxBodyRowIndex ?? -1;
  const maxColIndex = options?.maxColIndex ?? -1;

  const isCellMultiSelected = useCallback(
    (r: number, c: number) => selectedCells.has(cellSelectionSetKey(r, c)),
    [selectedCells]
  );

  const clearSelection = useCallback(() => {
    dispatchUi({ type: 'clearSelection' });
  }, []);

  const setRangeSelection = useCallback(
    (anchor: { r: number; c: number }, current: { r: number; c: number }) => {
      dispatchUi({ type: 'applyRangeSelection', anchor, current });
      editingDraftRef.current = '';
    },
    []
  );

  const setEditingDraft = useCallback((action: SetStateAction<string>) => {
    editingDraftRef.current =
      typeof action === 'function'
        ? (action as (prev: string) => string)(editingDraftRef.current)
        : action;
  }, []);

  const getEditingValueForSave = useCallback(() => {
    const ec = editingCellRef.current;
    if (ec?.r === TABLE_GRID_HEADER_ROW_INDEX) {
      return headerEditInputRef.current?.value ?? editingDraftRef.current;
    }
    return editTextAreaRef.current?.value ?? editingDraftRef.current;
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
    const k = cellStorageKey(ec.r, ec.c);
    /** 必须同步读出：updater 若延后执行，此时 ref/草稿可能已被下一格覆盖，会存成空串 */
    const valueToSave = getEditingValueForSave();
    /** 程序化收尾后可能多次 blur，整段窗口内忽略该格的 onBlur 提交 */
    pendingBlurIgnoreCellKeyRef.current = k;
    suppressDuplicatePrevCellClickSaveRef.current = true;
    scheduleClearEditCommitGuards();
    setValueByCell((prev) => ({ ...prev, [k]: valueToSave }));
    dispatchUi({ type: 'commitEditExit', cell: { r: ec.r, c: ec.c } });
    editingDraftRef.current = '';
  }, [getEditingValueForSave, scheduleClearEditCommitGuards, setValueByCell]);

  const removeColumnAt = useCallback((colIndex: number) => {
    const ec = editingCellRef.current;
    if (ec?.c === colIndex) {
      editingDraftRef.current = '';
    }
    setValueByCell((prev) => remapValueByCellAfterRemoveColumn(prev, colIndex));
    dispatchUi({ type: 'afterRemoveColumn', colIndex });
  }, [setValueByCell]);

  const removeBodyRowAt = useCallback((bodyRowIndex: number) => {
    const ec = editingCellRef.current;
    if (ec?.r === bodyRowIndex) {
      editingDraftRef.current = '';
    }
    setValueByCell((prev) => remapValueByCellAfterRemoveBodyRow(prev, bodyRowIndex));
    dispatchUi({ type: 'afterRemoveBodyRow', bodyRowIndex });
  }, [setValueByCell]);

  useEffect(() => {
    if (!enableEditMode) {
      dispatchUi({ type: 'resetAllForUndoOrDisable' });
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
        if (!Number.isNaN(r) && !Number.isNaN(c)) {
          // 命中同一锁定格
          if (r === locked.r && c === locked.c) return;
          // 列选择时（anchor 在 body，点击同列 header），视为仍在当前选择内，不清空
          if (r === TABLE_GRID_HEADER_ROW_INDEX && c === locked.c && locked.r >= 0) return;
        }
      }
      const wasEditing = editingCellRef.current != null;
      if (wasEditing) {
        exitEditingLikeEscape();
      } else {
        dispatchUi({ type: 'pointerDownOutside', wasEditing: false, exitCell: null });
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [hoverLockedCell, exitEditingLikeEscape]);

  useEffect(() => {
    if (!editingCell || !pendingFocusAfterKeyboardOpenRef.current) return;
    pendingFocusAfterKeyboardOpenRef.current = false;
    const id = requestAnimationFrame(() => {
      if (editingCell.r === TABLE_GRID_HEADER_ROW_INDEX) {
        headerEditInputRef.current?.focus({ preventScroll: true });
        headerEditInputRef.current?.select?.();
        return;
      }
      focusBodyEditTextareaWithoutScroll(editTextAreaRef);
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
        const taFocused = editTextAreaRef.current;
        if (taFocused && document.activeElement === taFocused) {
          return;
        }
        const from = editingCell ?? selectedCell ?? hoverLockedCell;
        e.preventDefault();
        if (editingCell) {
          exitEditingLikeEscape();
        }
        const next = stepLockedCell(from.r, from.c, e.key, maxBodyRowIndex, maxColIndex);
        dispatchUi({ type: 'lockedArrowNavigate', next });
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
        const k = cellStorageKey(r, c);
        setValueByCell((prev) => ({ ...prev, [k]: '' }));
        if (editingCell?.r === r && editingCell?.c === c) {
          editingDraftRef.current = '';
          if (r === TABLE_GRID_HEADER_ROW_INDEX) {
            if (headerEditInputRef.current) headerEditInputRef.current.value = '';
          } else {
            const ta = editTextAreaRef.current;
            if (ta) {
              ta.value = '';
              bodyEditTextareaAutosizeRef.current?.(ta);
            }
          }
        }
        return;
      }

      const bodyTa = editTextAreaRef.current;

      if (bodyTa && document.activeElement === bodyTa) {
        return;
      }

      const mod = (e.ctrlKey || e.metaKey) && !e.altKey;
      const keyOne = e.key.length === 1 ? e.key.toLowerCase() : '';
      if (mod && (keyOne === 'c' || keyOne === 'v') && !e.isComposing) {
        const headerInput = headerEditInputRef.current;
        if (headerInput && document.activeElement === headerInput) {
          // 表头单行 input 使用浏览器原生复制/粘贴，避免全局拦截导致连续粘贴失效。
          return;
        }
        const hasCellContext =
          editingCell != null || selectedCell != null || hoverLockedCell != null;
        if (hasCellContext) {
          if (keyOne === 'c') {
            e.preventDefault();
            if (selectedCells.size > 1) {
              void navigator.clipboard.writeText(
                serializeSelectionToTsv(selectedCells, valueByCellRef.current, selectedCell)
              );
            } else if (editingCell != null) {
              void navigator.clipboard.writeText(getEditingValueForSave());
            } else {
              const cell = selectedCell ?? hoverLockedCell;
              if (cell) {
                void navigator.clipboard.writeText(
                  valueByCellRef.current[cellStorageKey(cell.r, cell.c)] ?? ''
                );
              }
            }
            return;
          }
          const pasteTarget = selectedCell ?? hoverLockedCell ?? editingCell;
          if (pasteTarget && keyOne === 'v') {
            e.preventDefault();
            void navigator.clipboard.readText().then((t) => {
              const { matrix, isMatrix } = parseClipboardMatrix(t);
              const anchor = selectedCell ?? pasteTarget;
              const applySingleValueToRange =
                !isMatrix && selectedCells.size > 1 && anchor.r >= 0;
              const isHeaderAnchor = anchor.r === TABLE_GRID_HEADER_ROW_INDEX;

              if (editingCellRef.current && (applySingleValueToRange || isMatrix)) {
                setEditingCell(null);
                editingDraftRef.current = '';
              }

              if (isHeaderAnchor) {
                const ck = cellStorageKey(anchor.r, anchor.c);
                setValueByCell((prev) => ({ ...prev, [ck]: t }));
              } else if (applySingleValueToRange) {
                setValueByCell((prev) => {
                  const next = { ...prev };
                  for (const key of selectedCells) {
                    const p = parseCellSelectionSetKey(key);
                    if (!p) continue;
                    if (p.r < 0 || p.r > maxBodyRowIndex || p.c < 0 || p.c > maxColIndex) continue;
                    next[cellStorageKey(p.r, p.c)] = t;
                  }
                  return next;
                });
              } else if (isMatrix) {
                setValueByCell((prev) => {
                  const next = { ...prev };
                  for (let dr = 0; dr < matrix.length; dr += 1) {
                    const row = matrix[dr]!;
                    for (let dc = 0; dc < row.length; dc += 1) {
                      const r = anchor.r + dr;
                      const c = anchor.c + dc;
                      if (r < 0 || r > maxBodyRowIndex || c < 0 || c > maxColIndex) continue;
                      next[cellStorageKey(r, c)] = row[dc] ?? '';
                    }
                  }
                  return next;
                });
              } else {
                const ck = cellStorageKey(anchor.r, anchor.c);
                setValueByCell((prev) => ({ ...prev, [ck]: t }));
              }

              const ec = editingCellRef.current;
              if (ec?.r === anchor.r && ec?.c === anchor.c) {
                editingDraftRef.current = t;
                if (anchor.r === TABLE_GRID_HEADER_ROW_INDEX) {
                  const ip = headerEditInputRef.current;
                  if (ip) {
                    ip.value = t;
                    requestAnimationFrame(() => {
                      try {
                        const len = ip.value.length;
                        ip.focus({ preventScroll: true });
                        ip.setSelectionRange?.(len, len);
                      } catch {
                        /* 节点未就绪 */
                      }
                    });
                  }
                } else {
                  const ta = editTextAreaRef.current;
                  if (ta) {
                    ta.value = t;
                    bodyEditTextareaAutosizeRef.current?.(ta);
                    requestAnimationFrame(() => {
                      bodyEditTextareaAutosizeRef.current?.(ta);
                      requestAnimationFrame(() => {
                        try {
                          const len = ta.value.length;
                          ta.focus({ preventScroll: true });
                          ta.setSelectionRange(len, len);
                        } catch {
                          /* 节点未就绪 */
                        }
                        bodyEditTextareaAutosizeRef.current?.(ta);
                      });
                    });
                  }
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
        // 表头编辑（单行）不支持“任意按键追加到草稿”的模式，避免与「仅双击进入编辑」冲突。
        if (editingCell.r === TABLE_GRID_HEADER_ROW_INDEX) return;
        if (e.key.length === 1) {
          e.preventDefault();
          const ta = editTextAreaRef.current;
          if (ta) {
            ta.value += e.key;
            editingDraftRef.current = ta.value;
            bodyEditTextareaAutosizeRef.current?.(ta);
            requestAnimationFrame(() => {
              bodyEditTextareaAutosizeRef.current?.(ta);
              requestAnimationFrame(() => {
                const len = ta.value.length;
                ta.focus({ preventScroll: true });
                ta.setSelectionRange(len, len);
                bodyEditTextareaAutosizeRef.current?.(ta);
              });
            });
          } else {
            editingDraftRef.current += e.key;
          }
        }
        return;
      }

      if (selectedCell && e.key.length === 1) {
        // 表头保持“仅双击进入编辑”，不支持键入即编辑。
        if (selectedCell.r === TABLE_GRID_HEADER_ROW_INDEX) return;
        e.preventDefault();
        const k = cellStorageKey(selectedCell.r, selectedCell.c);
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
    selectedCells,
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
      selectedCells,
      setSelectedCells,
      selectionAnchor,
      setSelectionAnchor,
      isCellMultiSelected,
      clearSelection,
      setRangeSelection,
      hoverLockedCell,
      setHoverLockedCell,
      editingCell,
      setEditingCell,
      setEditingDraft,
      valueByCell,
      setValueByCell,
      editTextAreaRef,
      headerEditInputRef,
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
    selectedCells,
    selectionAnchor,
    hoverLockedCell,
    editingCell,
    valueByCell,
    isCellMultiSelected,
    clearSelection,
    setRangeSelection,
    getEditingValueForSave,
    scheduleClearEditCommitGuards,
    consumeDuplicatePrevCellClickSave,
    removeColumnAt,
    removeBodyRowAt,
    setEditingDraft,
    options?.onKeyboardNavigateCell,
  ]);
}
