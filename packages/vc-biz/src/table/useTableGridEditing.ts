import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  TABLE_GRID_HEADER_ROW_INDEX,
  cellSelectionSetKey,
  cellStorageKey,
  parseCellSelectionSetKey,
} from './headless/tableGridCellAddress';
import { stepLockedCell } from './headless/tableGridSelectionGeometry';
import {
  remapValueByCellAfterRemoveBodyRow,
  remapValueByCellAfterRemoveColumn,
} from './headless/tableGridSparseRemap';
import {
  handleArrowNavigation,
  handleClearLockedCell,
  isArrowKey,
  isClearCellKey,
  isExternalFieldFocused,
  shouldAppendToEditDraft,
  shouldEnterEditMode,
} from './headless/tableGridKeyboardHandler';
import {
  handleCopy,
  handlePaste,
  applyPasteToValueByCell,
} from './headless/tableGridClipboardHandler';
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
  /** 添加列到选中集合（支持多列选择） */
  addColumnToSelection: (colIndex: number, maxBodyR: number) => void;
  /** 从选中集合中移除列（支持多列取消） */
  removeColumnFromSelection: (colIndex: number) => void;
  /** 插入行后调整选中区域 */
  insertBodyRowAt: (bodyRowIndex: number, colCount: number) => void;
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

  // 使用 ref 跟踪最新的 selectedCells，避免 stale closure 问题
  const selectedCellsRef = useRef<ReadonlySet<string>>(selectedCells);
  selectedCellsRef.current = selectedCells;

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

  /** 添加列到选中集合（支持多列选择） */
  const addColumnToSelection = useCallback(
    (colIndex: number, maxBodyR: number) => {
      // 使用 ref 获取最新的选中集合，避免 stale closure 问题
      const currentSelectedCells = selectedCellsRef.current;
      // 获取当前已选中的列
      const currentSelectedCols = new Set<number>();
      for (const key of currentSelectedCells) {
        const parsed = parseCellSelectionSetKey(key);
        if (parsed) currentSelectedCols.add(parsed.c);
      }
      // 添加新列
      currentSelectedCols.add(colIndex);
      // 构建新的选中集合
      const newSelectedCells = new Set<string>();
      for (const c of currentSelectedCols) {
        for (let r = 0; r <= maxBodyR; r += 1) {
          newSelectedCells.add(cellSelectionSetKey(r, c));
        }
      }
      setSelectedCells(newSelectedCells);
      setSelectedCell({ r: 0, c: colIndex });
      setSelectionAnchor({ r: 0, c: colIndex });
      // 选中列时清除锁定单元格，避免首行显示锁定样式
      setHoverLockedCell(null);
      editingDraftRef.current = '';
    },
    [setSelectedCells, setSelectedCell, setSelectionAnchor, setHoverLockedCell]
  );

  /** 从选中集合中移除列（支持多列取消） */
  const removeColumnFromSelection = useCallback(
    (colIndex: number) => {
      // 使用 ref 获取最新的选中集合
      const currentSelectedCells = selectedCellsRef.current;
      const newSelectedCells = new Set<string>();
      for (const key of currentSelectedCells) {
        const parsed = parseCellSelectionSetKey(key);
        if (parsed && parsed.c !== colIndex) {
          newSelectedCells.add(key);
        }
      }
      if (newSelectedCells.size === 0) {
        clearSelection();
      } else {
        setSelectedCells(newSelectedCells);
        // 如果移除的是 anchor 所在列，更新 anchor
        if (selectedCell?.c === colIndex) {
          const firstKey = Array.from(newSelectedCells)[0];
          const newAnchor = parseCellSelectionSetKey(firstKey);
          if (newAnchor) {
            setSelectedCell(newAnchor);
            setSelectionAnchor(newAnchor);
          }
        }
      }
      editingDraftRef.current = '';
    },
    [clearSelection, setSelectedCells, setSelectedCell, setSelectionAnchor, selectedCell]
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

  const setRangeSelection = useCallback(
    (anchor: { r: number; c: number }, current: { r: number; c: number }) => {
      // 先保存当前编辑内容（如果有的话）
      const ec = editingCellRef.current;
      if (ec) {
        const k = ec.r === -1 ? `header-${ec.c}` : cellStorageKey(ec.r, ec.c);
        const valueToSave = getEditingValueForSave();
        pendingBlurIgnoreCellKeyRef.current = k;
        scheduleClearEditCommitGuards();
        setValueByCell((prev) => ({ ...prev, [k]: valueToSave }));
      }
      dispatchUi({ type: 'applyRangeSelection', anchor, current });
      editingDraftRef.current = '';
    },
    [getEditingValueForSave, scheduleClearEditCommitGuards, setValueByCell]
  );

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
      // 排除带有 data-keep-table-selection 属性的元素（如 VTell 输入框）
      if (el.closest('[data-keep-table-selection]')) return;
      const cell = el.closest('[data-hover-lock-cell]');
      if (cell) {
        const r = Number(cell.getAttribute('data-body-row'));
        const c = Number(cell.getAttribute('data-col'));
        if (!Number.isNaN(r) && !Number.isNaN(c)) {
          // 命中同一锁定格
          if (r === locked.r && c === locked.c) return;
          // 列选择时（anchor 在 body，点击同列 header），视为仍在当前选择内，不清空
          if (r === TABLE_GRID_HEADER_ROW_INDEX && c === locked.c && locked.r >= 0) return;
          // 点击表格内的任何单元格，都不清除选中区域（保持选中列）
          // 只有框选拖拽或点击表头切换列时才会取消选中列
          return;
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
      const activeEl = document.activeElement;
      const ctx = {
        hoverLockedCell,
        editingCell,
        selectedCell,
        maxBodyRowIndex,
        maxColIndex,
        activeElement: activeEl,
      };

      // 方向键导航
      if (
        isArrowKey(e.key) &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !e.isComposing
      ) {
        const result = handleArrowNavigation(ctx, e.key);
        if (result) {
          e.preventDefault();
          if (editingCell) {
            exitEditingLikeEscape();
          }
          dispatchUi({ type: 'lockedArrowNavigate', next: result.next });
          options?.onKeyboardNavigateCell?.({ r: result.next.r, c: result.next.c, key: result.key });
          return;
        }
      }

      // 清空锁定单元格
      if (
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !e.isComposing
      ) {
        const result = handleClearLockedCell(ctx, e.key);
        if (result) {
          e.preventDefault();
          setValueByCell((prev) => ({ ...prev, [result.cellKey]: '' }));
          if (editingCell?.r === result.r && editingCell?.c === result.c) {
            editingDraftRef.current = '';
            if (result.r === TABLE_GRID_HEADER_ROW_INDEX) {
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
      }

      const bodyTa = editTextAreaRef.current;
      if (bodyTa && document.activeElement === bodyTa) return;

      // 复制/粘贴
      const mod = (e.ctrlKey || e.metaKey) && !e.altKey;
      const keyOne = e.key.length === 1 ? e.key.toLowerCase() : '';
      if (mod && (keyOne === 'c' || keyOne === 'v') && !e.isComposing) {
        const headerInput = headerEditInputRef.current;
        if (headerInput && document.activeElement === headerInput) return;

        const hasCellContext = editingCell != null || selectedCell != null || hoverLockedCell != null;
        if (hasCellContext) {
          if (keyOne === 'c') {
            e.preventDefault();
            const copyResult = handleCopy(
              {
                editingCell,
                selectedCell,
                hoverLockedCell,
                selectedCells,
                valueByCell: valueByCellRef.current,
                maxBodyRowIndex,
                maxColIndex,
              },
              getEditingValueForSave()
            );
            if (copyResult) {
              void navigator.clipboard.writeText(copyResult.text);
            }
            return;
          }
          if (keyOne === 'v') {
            e.preventDefault();
            void navigator.clipboard.readText().then((text) => {
              const pasteInfo = handlePaste(
                {
                  editingCell,
                  selectedCell,
                  hoverLockedCell,
                  selectedCells,
                  valueByCell: valueByCellRef.current,
                  maxBodyRowIndex,
                  maxColIndex,
                },
                text
              );
              if (!pasteInfo) return;

              if (editingCellRef.current && (pasteInfo.applySingleValueToRange || pasteInfo.isMatrix)) {
                setEditingCell(null);
                editingDraftRef.current = '';
              }

              setValueByCell((prev) =>
                applyPasteToValueByCell(prev, pasteInfo, maxBodyRowIndex, maxColIndex)
              );

              const ec = editingCellRef.current;
              if (ec?.r === pasteInfo.anchor.r && ec?.c === pasteInfo.anchor.c) {
                editingDraftRef.current = text;
                if (pasteInfo.anchor.r === TABLE_GRID_HEADER_ROW_INDEX) {
                  const ip = headerEditInputRef.current;
                  if (ip) {
                    ip.value = text;
                    requestAnimationFrame(() => {
                      try {
                        const len = ip.value.length;
                        ip.focus({ preventScroll: true });
                        ip.setSelectionRange?.(len, len);
                      } catch { /* 节点未就绪 */ }
                    });
                  }
                } else {
                  const ta = editTextAreaRef.current;
                  if (ta) {
                    ta.value = text;
                    bodyEditTextareaAutosizeRef.current?.(ta);
                    requestAnimationFrame(() => {
                      bodyEditTextareaAutosizeRef.current?.(ta);
                      requestAnimationFrame(() => {
                        try {
                          const len = ta.value.length;
                          ta.focus({ preventScroll: true });
                          ta.setSelectionRange(len, len);
                        } catch { /* 节点未就绪 */ }
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

      if (isExternalFieldFocused(activeEl)) return;

      if (e.key === 'Escape' && editingCell) {
        e.preventDefault();
        exitEditingLikeEscape();
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.isComposing) return;

      // 编辑态追加字符
      if (shouldAppendToEditDraft(ctx, e.key)) {
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
        return;
      }

      // 进入编辑态
      if (shouldEnterEditMode(ctx, e.key) && selectedCell) {
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
      addColumnToSelection,
      removeColumnFromSelection,
      insertBodyRowAt: (bodyRowIndex: number, colCount: number) => {
        dispatchUi({ type: 'afterInsertBodyRow', bodyRowIndex, colCount });
      },
    };
    Object.defineProperty(api, 'editingDraft', {
      enumerable: true,
      configurable: true,
      get: () => editingDraftRef.current,
    });
    return api as unknown as TableGridEditingState;
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
    addColumnToSelection,
    removeColumnFromSelection,
    setEditingDraft,
    options?.onKeyboardNavigateCell,
  ]);
}
