import {
  useVirtualizer,
  type Virtualizer,
  type Range,
  type Rect,
  defaultRangeExtractor,
  observeElementRect as observeElementRectBase,
} from '@tanstack/react-virtual';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { vcTokens } from 'vc-design';
import { BodyRowSelectionStoreContext } from './bodyRowSelectionStoreContext';
import { CellSelectionStore } from './cellSelectionStore';
import { TableGridEditingDispatchersRefContext } from './tableGridEditingDispatchersRefContext';
import { TableGridEditingStateContext } from './tableGridEditingStateContext';
import type { TableGridEditingStateSlice } from './tableGridEditingStateContext';
import { TableGridConfigContext } from './tableGridConfigContext';
import TableGridRow from './TableGridRow';
import { TableRowHoverStoreContext } from './tableRowHoverStoreContext';
import { createTableRowHoverStore } from './tableRowHoverStore';
import type { TableGridStaticConfig } from './tableGridTypes';
import type { TableColumnFieldKind, TableRowsProps } from './tableGridTypes';
import {
  EDIT_TEXTAREA_MAX_ROWS,
  cellKey,
  getTableBodyVirtualOverscan,
  TABLE_BODY_BG_DEFAULT,
} from './tableGridConstants';
import { syncBodyEditTextareaHeight } from './bodyEditTextareaAutosize';
import { getTableGridTypographyMetrics } from './tableGridTypography';
import type { TableFrozenScrollConfig } from './tableGridScrollActiveCell';
import './tableBodyScroll.css';
import { scrollTableActiveCellIntoView } from './tableGridScrollActiveCell';
import type { TableGridEditingState } from './useTableGridEditing';
import { useTableGridEditing } from './useTableGridEditing';

export type { TableRowsProps } from './tableGridTypes';

/** 冻结末行占位外层：虚拟列表与非虚拟列表共用，避免两处样式漂移 */
const FROZEN_FOOTER_WRAP_STYLE: React.CSSProperties = {
  position: 'sticky',
  bottom: 0,
  zIndex: 5,
  width: '100%',
  boxSizing: 'border-box',
  background: TABLE_BODY_BG_DEFAULT,
  isolation: 'isolate',
};

/** 虚拟列表始终包含第 0 行（表头），以便 sticky 钉顶时仍参与测量与渲染 */
function rangeExtractorPinHeader(range: Range) {
  const base = defaultRangeExtractor(range);
  if (base.includes(0)) return base;
  return [0, ...base].sort((a, b) => a - b);
}

function remapImageUrlsByCellAfterRemoveColumn(
  prev: Readonly<Record<string, ReadonlyArray<string>>>,
  colIndex: number
): Record<string, ReadonlyArray<string>> {
  const next: Record<string, ReadonlyArray<string>> = {};
  for (const [k, list] of Object.entries(prev)) {
    const [rRaw, cRaw] = k.split('-');
    const r = Number(rRaw);
    const c = Number(cRaw);
    if (Number.isNaN(r) || Number.isNaN(c)) continue;
    if (c === colIndex) continue;
    const nk = c > colIndex ? cellKey(r, c - 1) : k;
    next[nk] = list;
  }
  return next;
}

function remapImageUrlsByCellAfterRemoveBodyRow(
  prev: Readonly<Record<string, ReadonlyArray<string>>>,
  bodyRowIndex: number
): Record<string, ReadonlyArray<string>> {
  const next: Record<string, ReadonlyArray<string>> = {};
  for (const [k, list] of Object.entries(prev)) {
    const [rRaw, cRaw] = k.split('-');
    const r = Number(rRaw);
    const c = Number(cRaw);
    if (Number.isNaN(r) || Number.isNaN(c)) continue;
    if (r === bodyRowIndex) continue;
    const nk = r > bodyRowIndex ? cellKey(r - 1, c) : k;
    next[nk] = list;
  }
  return next;
}

function remapColumnFieldKindsAfterRemoveColumn(
  prev: Readonly<Record<number, TableColumnFieldKind>>,
  colIndex: number
): Record<number, TableColumnFieldKind> {
  const next: Record<number, TableColumnFieldKind> = {};
  for (const [kRaw, kind] of Object.entries(prev)) {
    const c = Number(kRaw);
    if (Number.isNaN(c)) continue;
    if (c === colIndex) continue;
    const nk = c > colIndex ? c - 1 : c;
    next[nk] = kind;
  }
  return next;
}

function canScrollElementByDelta(el: HTMLElement, dX: number, dY: number): boolean {
  const maxX = Math.max(0, el.scrollWidth - el.clientWidth);
  const maxY = Math.max(0, el.scrollHeight - el.clientHeight);
  const nextX = Math.min(maxX, Math.max(0, el.scrollLeft + dX));
  const nextY = Math.min(maxY, Math.max(0, el.scrollTop + dY));
  return nextX !== el.scrollLeft || nextY !== el.scrollTop;
}

function createObjectUrlSafe(file: File): string | null {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return null;
  return URL.createObjectURL(file);
}

function revokeObjectUrlSafe(url: string): void {
  if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') return;
  URL.revokeObjectURL(url);
}

export default function TableRows(props: TableRowsProps) {
  const regularTableFont = props.enableRegularTableFont !== false;
  const enableBatchSelection = props.enableBatchSelection !== false;
  const hoverStoreRef = useRef<ReturnType<typeof createTableRowHoverStore> | null>(null);
  if (hoverStoreRef.current == null) {
    hoverStoreRef.current = createTableRowHoverStore();
  }
  const hoverStore = hoverStoreRef.current;
  const [pointerHoverResetNonce, setPointerHoverResetNonce] = useState(0);
  const [columnFieldKindByCol, setColumnFieldKindByCol] = useState<Record<number, TableColumnFieldKind>>(
    {}
  );
  const [imageUrlsByCell, setImageUrlsByCell] = useState<Record<string, ReadonlyArray<string>>>({});
  const effectiveMinResizableTextColWidth =
    props.minResizableTextColWidth ?? props.minTextColWidth;

  const gridNavMaxBodyRowIndex = props.rowCount >= 2 ? props.rowCount - 2 : -1;
  const gridNavMaxColIndex = props.colCount > 0 ? props.colCount - 1 : -1;

  const keyboardNavigateScrollRef = useRef<(bodyRow: number, col: number, key: string) => void>(
    () => {}
  );
  const onKeyboardNavigateCell = useCallback(
    (p: { r: number; c: number; key: string }) => {
      keyboardNavigateScrollRef.current(p.r, p.c, p.key);
    },
    []
  );

  const typography = useMemo(
    () => getTableGridTypographyMetrics(regularTableFont),
    [regularTableFont]
  );

  const bodyEditTextareaAutosize = useCallback(
    (el: HTMLTextAreaElement) => {
      syncBodyEditTextareaHeight(el, {
        minRows: 1,
        maxRows: EDIT_TEXTAREA_MAX_ROWS,
        lineHeightPx: typography.lineHeightPx,
      });
    },
    [typography.lineHeightPx]
  );

  const setColumnFieldKind = useCallback((colIndex: number, kind: TableColumnFieldKind) => {
    if (colIndex < 0) return;
    setColumnFieldKindByCol((prev) => {
      const next = { ...prev };
      if (kind === 'text') {
        delete next[colIndex];
      } else {
        next[colIndex] = kind;
      }
      return next;
    });
  }, []);

  const appendImageFilesToCell = useCallback(
    (bodyRowIndex: number, colIndex: number, files: readonly File[]) => {
      if (bodyRowIndex < 0 || colIndex < 0) return;
      if (!files.length) return;
      const urls = files.map((f) => createObjectUrlSafe(f)).filter((u): u is string => !!u);
      if (!urls.length) return;
      setImageUrlsByCell((prev) => {
        const key = cellKey(bodyRowIndex, colIndex);
        const existing = prev[key] ?? [];
        return { ...prev, [key]: [...existing, ...urls] };
      });
    },
    []
  );

  const removeImageAtCell = useCallback((bodyRowIndex: number, colIndex: number, imageIndex: number) => {
    if (bodyRowIndex < 0 || colIndex < 0 || imageIndex < 0) return;
    const key = cellKey(bodyRowIndex, colIndex);
    setImageUrlsByCell((prev) => {
      const existing = prev[key] ?? [];
      if (imageIndex >= existing.length) return prev;
      const toRevoke = existing[imageIndex];
      if (toRevoke) revokeObjectUrlSafe(toRevoke);
      const nextList = existing.filter((_, i) => i !== imageIndex);
      if (nextList.length === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: nextList };
    });
  }, []);

  const imageUrlsByCellRef = useRef<Record<string, ReadonlyArray<string>>>({});
  useLayoutEffect(() => {
    const prev = imageUrlsByCellRef.current;
    const nextUrlSet = new Set<string>();
    for (const list of Object.values(imageUrlsByCell)) {
      for (const url of list) nextUrlSet.add(url);
    }
    for (const list of Object.values(prev)) {
      for (const url of list) {
        if (!nextUrlSet.has(url)) revokeObjectUrlSafe(url);
      }
    }
    imageUrlsByCellRef.current = imageUrlsByCell;
  }, [imageUrlsByCell]);

  useLayoutEffect(
    () => () => {
      for (const list of Object.values(imageUrlsByCellRef.current)) {
        for (const url of list) revokeObjectUrlSafe(url);
      }
    },
    []
  );

  const editing = useTableGridEditing(props.enableEditMode, {
    initialValueByCell:
      props.valueByCell === undefined ? props.initialValueByCell : undefined,
    valueByCell: props.valueByCell,
    onValueByCellChange: props.onValueByCellChange,
    maxBodyRowIndex: gridNavMaxBodyRowIndex,
    maxColIndex: gridNavMaxColIndex,
    onKeyboardNavigateCell,
    undoRedo: props.tableUndoRedo ?? null,
    undoRedoNonce: props.undoRedoNonce,
    bodyEditTextareaAutosize,
  });

  const editingDispatchersRef = useRef<TableGridEditingState | null>(null);
  editingDispatchersRef.current = editing;

  // ===== CellSelectionStore：暴露单元格选中状态给外部 =====
  const cellSelectionStoreRef = useRef<CellSelectionStore | null>(null);
  if (cellSelectionStoreRef.current == null) {
    cellSelectionStoreRef.current = new CellSelectionStore();
  }
  const cellSelectionStore = cellSelectionStoreRef.current;

  // 初始化/更新行列数
  useEffect(() => {
    cellSelectionStore.setDimensions(props.rowCount, props.colCount);
  }, [cellSelectionStore, props.rowCount, props.colCount]);

  // 同步选中集合到 store
  useEffect(() => {
    cellSelectionStore.setSelectedCells(editing.selectedCells);
  }, [cellSelectionStore, editing.selectedCells]);

  // 传出 store 给父组件
  useEffect(() => {
    if (props.onCellSelectionStore) {
      props.onCellSelectionStore(cellSelectionStore);
    }
  }, [cellSelectionStore, props.onCellSelectionStore]);

  const editingStateSlice = useMemo((): TableGridEditingStateSlice => {
    return {
      editingCell: editing.editingCell,
      selectedCell: editing.selectedCell,
      selectedCells: editing.selectedCells,
      selectionAnchor: editing.selectionAnchor,
      valueByCell: editing.valueByCell,
      hoverLockedCell: editing.hoverLockedCell,
    };
  }, [
    editing.editingCell,
    editing.selectedCell,
    editing.selectedCells,
    editing.selectionAnchor,
    editing.valueByCell,
    editing.hoverLockedCell,
  ]);

  /** 末行（插入行占位）始终渲染；「插入行列」只控制是否出现 + 与插入能力 */
  const displayRowCount = props.rowCount + 1;
  const useBodyVirtual =
    props.bodyScrollMaxHeight != null &&
    props.bodyScrollMaxHeight > 0 &&
    displayRowCount > 0;

  const visibleColIndexes = useMemo(() => {
    const hidden = props.hiddenColSet;
    const list: number[] = [];
    for (let c = 0; c < props.colCount; c += 1) {
      if (!hidden?.has(c)) list.push(c);
    }
    return list;
  }, [props.colCount, props.hiddenColSet]);

  const narrowLeadWidth = useMemo(() => {
    if (enableBatchSelection || props.enableShowRowIndex) {
      return props.narrowWidth;
    }
    return 0;
  }, [enableBatchSelection, props.enableShowRowIndex, props.narrowWidth]);

  const effectiveRowMinWidth = useMemo(() => {
    // 关键：隐藏列后行的 minWidth 必须随“可见列”收缩，否则可视区足够也会残留横向滚动条，
    // 并引发表头/末列视觉错位（cell 轨道与强制 minWidth 的横滚叠加）。
    const insertColW = props.enableInsertRowCol ? props.narrowWidth : 0;
    let sum = 0;
    for (const realColIndex of visibleColIndexes) {
      const storedW = props.enableColumnResize ? props.colWidths[realColIndex] ?? null : null;
      sum += storedW != null ? storedW : props.defaultTextColWidth;
    }
    return narrowLeadWidth + sum + insertColW;
  }, [
    narrowLeadWidth,
    props.defaultTextColWidth,
    props.enableInsertRowCol,
    props.enableColumnResize,
    props.colWidths,
    visibleColIndexes,
  ]);

  /** 纵滚 + 横滚同一容器，冻结列 left/right sticky 才能与表头 top 参照同一 scrollport */
  const scrollParentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const report = props.onViewportClientWidthChange;
    if (!report) return;
    const target = scrollParentRef.current;
    if (!target) return;
    const emit = () => report(Math.max(0, Math.round(target.clientWidth)));
    emit();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => emit());
    ro.observe(target);
    return () => ro.disconnect();
  }, [props.onViewportClientWidthChange]);

  const observeElementRectPatched = useMemo(() => {
    const maxH = props.bodyScrollMaxHeight ?? 0;
    return (instance: Virtualizer<HTMLDivElement, Element>, cb: (rect: Rect) => void) =>
      observeElementRectBase(instance, (rect) => {
        /** jsdom / 首帧未布局时常为 0，用配置高度兜底以便算出可见 range */
        cb({
          width: rect.width > 0 ? rect.width : 320,
          height: rect.height > 0 ? rect.height : maxH > 0 ? maxH : rect.height,
        });
      });
  }, [props.bodyScrollMaxHeight]);

  /** 虚拟化不含末行：末行若在 absolute 子树内做 sticky bottom，浏览器无法相对外层 scrollport 粘底 */
  const virtualRowCount = props.rowCount;

  /** 触控板惯性 / 自定义 wheel 单帧位移大时，固定小 overscan 易出现行间空白裂缝 */
  const virtualListOverscan = useMemo(() => {
    if (!useBodyVirtual) return 8;
    const h = props.bodyScrollMaxHeight ?? 520;
    return getTableBodyVirtualOverscan(h, typography.bodyVirtualRowEstimatePx);
  }, [useBodyVirtual, props.bodyScrollMaxHeight, typography.bodyVirtualRowEstimatePx]);

  const rowVirtualizer = useVirtualizer({
    count: useBodyVirtual ? virtualRowCount : 0,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: (index) =>
      index === 0
        ? typography.headerVirtualRowEstimatePx
        : typography.bodyVirtualRowEstimatePx,
    overscan: virtualListOverscan,
    enabled: useBodyVirtual,
    rangeExtractor: rangeExtractorPinHeader,
    observeElementRect: observeElementRectPatched,
    /** 将 RO 回调合并到 rAF，减轻与 scroll 同帧竞态导致的测量抖动 */
    useAnimationFrameWithResizeObserver: true,
  });

  // 默认会在「行高与 estimate 不一致」时修正 scrollTop；编辑态 TextArea autoSize / ResizeObserver
  // 会触发行高变化，在部分 scrollOffset 下会错误修正，整表跳到最后一屏并导致 hover/编辑行错位。
  const rv = rowVirtualizer as Virtualizer<HTMLDivElement, Element>;
  rv.shouldAdjustScrollPositionOnItemSizeChange = () => false;

  const rowVirtualizerRef = useRef(rowVirtualizer);
  rowVirtualizerRef.current = rowVirtualizer;

  useLayoutEffect(() => {
    const frozen: TableFrozenScrollConfig = {
      colCount: props.colCount,
      enableInsertRowCol: props.enableInsertRowCol,
      enableFreezeFirstCol: props.enableFreezeFirstCol,
      enableFreezeLastCol: props.enableFreezeLastCol,
      enableFreezeLastRow: props.enableFreezeLastRow,
      displayRowCount,
      narrowWidth: props.narrowWidth,
      narrowLeadWidth,
      minTextColWidth: effectiveMinResizableTextColWidth,
      defaultTextColWidth: props.defaultTextColWidth,
      frozenFooterRowEstimatePx: typography.bodyVirtualRowEstimatePx,
    };
    keyboardNavigateScrollRef.current = (bodyRow, col, key) => {
      scrollTableActiveCellIntoView({
        scrollRoot: scrollParentRef.current,
        bodyRow,
        col,
        key,
        useVirtual: useBodyVirtual,
        scrollToVirtualRow: useBodyVirtual
          ? (virtualIndex, opts) => rowVirtualizerRef.current.scrollToIndex(virtualIndex, opts)
          : undefined,
        frozen,
      });
    };
  }, [
    useBodyVirtual,
    displayRowCount,
    props.colCount,
    props.enableInsertRowCol,
    props.enableFreezeFirstCol,
    props.enableFreezeLastCol,
    props.enableFreezeLastRow,
    props.narrowWidth,
    narrowLeadWidth,
    effectiveMinResizableTextColWidth,
    props.defaultTextColWidth,
    typography.bodyVirtualRowEstimatePx,
  ]);

  /** 进入编辑或表体滚动时清除行 hover：避免滚动/虚拟列表下移时鼠标未动却误触发别行的 mouseEnter，造成「编辑第 8 行但灰底在第 15 行」 */
  useLayoutEffect(() => {
    if (editing.editingCell != null) {
      hoverStore.setHoveredRowIndex(null);
    }
  }, [editing.editingCell, hoverStore]);

  const onBodyScroll = useCallback(() => {
    hoverStore.setHoveredRowIndex(null);
  }, [hoverStore]);

  /** 非 passive wheel：双轴 delta 一次写入 scrollLeft/scrollTop；编辑区与 Ctrl/⌘+滚轮不拦截 */
  useLayoutEffect(() => {
    const el = scrollParentRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;

      const target = e.target as HTMLElement | null;
      if (target?.closest('textarea, input, [contenteditable="true"]')) return;

      let dX = e.deltaX;
      let dY = e.deltaY;
      if (e.shiftKey && dX === 0 && dY !== 0) {
        dX = dY;
        dY = 0;
      }

      const innerImageScrollHost = target?.closest('.vc-biz-table-image-scroll-host') as
        | HTMLElement
        | null;
      if (innerImageScrollHost && innerImageScrollHost !== el) {
        const lockedCellShell = innerImageScrollHost.closest(
          '[data-hover-lock-cell][data-selection-kind="anchor"], [data-hover-lock-cell][data-selection-kind="multi"]'
        ) as HTMLElement | null;
        if (lockedCellShell) {
          // 锁定态图片格：滚轮只服务于内层，不向表格外层冒泡接管（边界也不接管）
          return;
        }
        if (canScrollElementByDelta(innerImageScrollHost, dX, dY)) {
          // 内层可滚时交给图片单元格，避免外层表格优先滚动
          return;
        }
      }

      const {
        scrollLeft,
        scrollTop,
        scrollWidth,
        clientWidth,
        scrollHeight,
        clientHeight,
      } = el;
      const maxX = Math.max(0, scrollWidth - clientWidth);
      const maxY = Math.max(0, scrollHeight - clientHeight);

      const nextX = Math.min(maxX, Math.max(0, scrollLeft + dX));
      const nextY = Math.min(maxY, Math.max(0, scrollTop + dY));

      if (nextX !== scrollLeft || nextY !== scrollTop) {
        el.scrollLeft = nextX;
        el.scrollTop = nextY;
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [displayRowCount, useBodyVirtual]);

  const deleteColumnAt = useCallback(
    (colIndex: number) => {
      if (!props.enableInsertRowCol || colIndex < 0 || colIndex >= props.colCount) return;
      if (props.enableFreezeFirstCol && colIndex === 0) return;
      if (props.enableFreezeLastCol && colIndex === props.colCount - 1) return;
      const minC = props.gridMinCount ?? 2;
      if (props.colCount <= minC) return;
      props.startUndoBatch?.();
      try {
        editing.removeColumnAt(colIndex);
        setColumnFieldKindByCol((prev) => remapColumnFieldKindsAfterRemoveColumn(prev, colIndex));
        setImageUrlsByCell((prev) => remapImageUrlsByCellAfterRemoveColumn(prev, colIndex));
        props.onDeleteColumn?.(colIndex);
      } finally {
        props.endUndoBatch?.();
      }
    },
    [
      editing.removeColumnAt,
      props.colCount,
      props.enableInsertRowCol,
      props.enableFreezeFirstCol,
      props.enableFreezeLastCol,
      props.endUndoBatch,
      props.gridMinCount,
      props.onDeleteColumn,
      props.startUndoBatch,
    ]
  );

  const deleteBodyRowAt = useCallback(
    (bodyRowIndex: number) => {
      if (!props.enableInsertRowCol) return;
      const minR = props.gridMinCount ?? 2;
      if (props.rowCount <= minR) return;
      props.startUndoBatch?.();
      try {
        editing.removeBodyRowAt(bodyRowIndex);
        setImageUrlsByCell((prev) => remapImageUrlsByCellAfterRemoveBodyRow(prev, bodyRowIndex));
        props.onDeleteBodyRow?.(bodyRowIndex);
      } finally {
        props.endUndoBatch?.();
      }
    },
    [
      editing.removeBodyRowAt,
      props.enableInsertRowCol,
      props.endUndoBatch,
      props.gridMinCount,
      props.onDeleteBodyRow,
      props.rowCount,
      props.startUndoBatch,
    ]
  );

  const scrollTableViewportToBottom = useCallback(() => {
    const run = () => {
      const el = scrollParentRef.current;
      if (el) {
        el.scrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
        return;
      }
      if (typeof document !== 'undefined') {
        document
          .querySelector<HTMLElement>('[data-vc-biz-table-insert-tail-row]')
          ?.scrollIntoView({ block: 'end', behavior: 'auto' });
      }
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  }, []);

  /**
   * 无回调时保持双 rAF（等 React 提交后再滚）。
   * 有回调时再多一帧再执行：虚拟列表/列宽变化后 scrollWidth 与 hit-test 往往在下一帧才稳定，
   * 否则易出现「滚完仍误挂邻格悬停」的闪动。
   */
  const scrollTableViewportToRight = useCallback((onAfterScroll?: () => void) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = scrollParentRef.current;
        if (el) {
          el.scrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
        }
        if (onAfterScroll) {
          requestAnimationFrame(onAfterScroll);
        }
      });
    });
  }, []);

  const onInsertRowWrapped = useCallback(() => {
    props.onInsertRow();
    scrollTableViewportToBottom();
  }, [props.onInsertRow, scrollTableViewportToBottom]);

  const onInsertColumnWrapped = useCallback(() => {
    const scrollEl = scrollParentRef.current;
    const blockPointerUntilDone =
      scrollEl != null && !props.enableFreezeLastCol ? scrollEl : null;

    if (blockPointerUntilDone) {
      blockPointerUntilDone.style.pointerEvents = 'none';
    }

    props.onInsertColumn();
    hoverStore.setHoveredRowIndex(null);

    scrollTableViewportToRight(() => {
      const el = scrollParentRef.current;
      if (el) {
        el.scrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
      }
      setPointerHoverResetNonce((n) => n + 1);
      if (blockPointerUntilDone) {
        requestAnimationFrame(() => {
          blockPointerUntilDone.style.pointerEvents = '';
          setPointerHoverResetNonce((n) => n + 1);
        });
      }
    });
  }, [props.onInsertColumn, props.enableFreezeLastCol, scrollTableViewportToRight, hoverStore]);

  const staticConfig = useMemo((): TableGridStaticConfig => {
    const {
      bodyRowSelectionStore: _bs,
      initialValueByCell: _iv,
      valueByCell: _v,
      onValueByCellChange: _ov,
      bodyScrollMaxHeight: _bh,
      tableOuterScrollRef: _tor,
      onViewportClientWidthChange: _ovw,
      enableRegularTableFont: _erf,
      startUndoBatch: _sub,
      endUndoBatch: _eub,
      undoRedoNonce: _urn,
      tableUndoRedo: _tur,
      onInsertRow: _oir,
      onInsertColumn: _oic,
      ...rest
    } = props;
    return {
      ...rest,
      enableBatchSelection,
      pointerHoverResetNonce,
      narrowLeadWidth,
      regularTableFont,
      columnFieldKindByCol,
      setColumnFieldKind,
      imageUrlsByCell,
      appendImageFilesToCell,
      removeImageAtCell,
      // 让表头/表体每一行都用“可见列 minWidth”，否则只改 scroll 容器无效
      rowMinWidth: effectiveRowMinWidth,
      onInsertRow: onInsertRowWrapped,
      onInsertColumn: onInsertColumnWrapped,
      deleteColumnAt,
      deleteBodyRowAt,
      bodyVirtualized: useBodyVirtual,
      typography,
      visibleColIndexes,
    };
  }, [
    typography,
    visibleColIndexes,
    effectiveRowMinWidth,
    useBodyVirtual,
    props.rowCount,
    props.colCount,
    props.enableInsertRowCol,
    props.enableEditMode,
    props.rowMinWidth,
    props.narrowWidth,
    props.minTextColWidth,
    props.minResizableTextColWidth,
    props.enableColumnResize,
    props.enableVerticalCenter,
    props.enableFreezeFirstCol,
    props.enableFreezeLastCol,
    props.enableFreezeLastRow,
    props.enableBodyCellRightBorder,
    enableBatchSelection,
    props.enableShowRowIndex,
    props.gridMinCount,
    props.colWidths,
    props.onColumnResizeStart,
    props.onDeleteColumn,
    props.onDeleteBodyRow,
    props.hiddenColSet,
    props.setColumnHidden,
    props.setAllColumnsHidden,
    deleteColumnAt,
    deleteBodyRowAt,
    onInsertRowWrapped,
    onInsertColumnWrapped,
    pointerHoverResetNonce,
    narrowLeadWidth,
    regularTableFont,
    columnFieldKindByCol,
    setColumnFieldKind,
    imageUrlsByCell,
    appendImageFilesToCell,
    removeImageAtCell,
  ]);

  return (
    <BodyRowSelectionStoreContext.Provider value={props.bodyRowSelectionStore}>
      <TableRowHoverStoreContext.Provider value={hoverStore}>
        <TableGridConfigContext.Provider value={staticConfig}>
          <TableGridEditingDispatchersRefContext.Provider value={editingDispatchersRef}>
            <TableGridEditingStateContext.Provider value={editingStateSlice}>
              {/**
               * 虚拟与非虚拟共用同一 scrollport：横纵滚与 sticky 冻结参照一致；仅虚拟模式加 maxHeight。
               */}
              <div
                ref={scrollParentRef}
                className="vc-biz-table-scrollport"
                onScroll={onBodyScroll}
                style={{
                  width: '100%',
                  minHeight: 0,
                  maxHeight: useBodyVirtual ? props.bodyScrollMaxHeight : undefined,
                  overflow: 'auto',
                  scrollbarGutter: 'stable',
                  boxSizing: 'border-box',
                }}
              >
                {useBodyVirtual ? (
                  <div
                    style={{
                      width: '100%',
                      minWidth: effectiveRowMinWidth,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        height: rowVirtualizer.getTotalSize(),
                        width: '100%',
                        position: 'relative',
                        background: TABLE_BODY_BG_DEFAULT,
                      }}
                    >
                      {rowVirtualizer.getVirtualItems().map((vi) => {
                        const rowIndex = vi.index;
                        const isHeaderRow = rowIndex === 0;
                        return (
                          <div
                            key={vi.key}
                            data-index={vi.index}
                            ref={rowVirtualizer.measureElement}
                            style={
                              isHeaderRow
                                ? {
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 6,
                                    width: '100%',
                                    isolation: 'isolate',
                                    background: vcTokens.color.neutral.background.layout,
                                    // 覆盖表头右侧（插入列后/滚动条前）无单元格区域的下分割线
                                    boxShadow: `inset 0 -1px 0 ${vcTokens.color.neutral.border.default}`,
                                  }
                                : {
                                    position: 'absolute',
                                    top: vi.start,
                                    left: 0,
                                    width: '100%',
                                    zIndex: 1,
                                  }
                            }
                            {...(isHeaderRow ? { 'data-vc-biz-table-frozen-header': '' } : {})}
                          >
                            <TableGridRow rowIndex={rowIndex} />
                          </div>
                        );
                      })}
                    </div>
                    <div
                      style={
                        props.enableFreezeLastRow && displayRowCount > 1
                          ? FROZEN_FOOTER_WRAP_STYLE
                          : { width: '100%', boxSizing: 'border-box' }
                      }
                      {...(props.enableFreezeLastRow && displayRowCount > 1
                        ? { 'data-vc-biz-table-frozen-footer': '' }
                        : {})}
                    >
                      <TableGridRow rowIndex={props.rowCount} />
                    </div>
                  </div>
                ) : (
                  Array.from({ length: displayRowCount }).map((_, rowIndex) => {
                    const isTailRow = rowIndex === props.rowCount;
                    const freezeFooter =
                      props.enableFreezeLastRow && isTailRow && displayRowCount > 1;
                    if (!freezeFooter) {
                      return <TableGridRow key={`row-${rowIndex}`} rowIndex={rowIndex} />;
                    }
                    return (
                      <div
                        key={`row-${rowIndex}`}
                        data-vc-biz-table-frozen-footer=""
                        style={FROZEN_FOOTER_WRAP_STYLE}
                      >
                        <TableGridRow rowIndex={rowIndex} />
                      </div>
                    );
                  })
                )}
              </div>
            </TableGridEditingStateContext.Provider>
          </TableGridEditingDispatchersRefContext.Provider>
        </TableGridConfigContext.Provider>
      </TableRowHoverStoreContext.Provider>
    </BodyRowSelectionStoreContext.Provider>
  );
}
