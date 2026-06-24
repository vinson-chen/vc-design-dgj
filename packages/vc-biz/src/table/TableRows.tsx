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
import { TableGridEditingContext } from './tableGridEditingContext';
import type { TableGridEditingContextValue } from './tableGridEditingContext';
import { TableGridConfigContext } from './tableGridConfigContext';
import TableGridRow from './TableGridRow';
import { TableRowHoverStoreContext } from './tableRowHoverStoreContext';
import { createTableRowHoverStore } from './tableRowHoverStore';
import type { TableGridStaticConfig } from './tableGridTypes';
import type { TableColumnFieldKind, TableRowsProps, ColumnMultiFieldConfig, MultiFieldValueByCell, CellLinkData, InitialImageData } from './tableGridTypes';
import {
  EDIT_TEXTAREA_MAX_ROWS,
  cellKey,
  getTableBodyVirtualOverscan,
  TABLE_BODY_BG_DEFAULT,
} from './tableGridConstants';
import {
  remapImageUrlsByCellAfterRemoveColumn,
  remapImageUrlsByCellAfterRemoveBodyRow,
  remapColumnFieldKindsAfterRemoveColumn,
  remapValueByCellAfterColumnOrderChange,
  remapColumnFieldKindsAfterColumnOrderChange,
  remapImageUrlsByCellAfterColumnOrderChange,
  remapColWidthsAfterColumnOrderChange,
  remapHiddenColSetAfterColumnOrderChange,
  adjustSelectionSetAfterColumnOrderChange,
} from './headless/tableGridSparseRemap';
import { syncBodyEditTextareaHeight } from './bodyEditTextareaAutosize';
import { getTableGridTypographyMetrics } from './tableGridTypography';
import type { TableFrozenScrollConfig } from './tableGridScrollActiveCell';
import './tableBodyScroll.css';
import { scrollTableActiveCellIntoView } from './tableGridScrollActiveCell';
import type { TableGridEditingState } from './useTableGridEditing';
import { useTableGridEditing } from './useTableGridEditing';
import {
  computeGroupTitleRows,
  computeTotalVirtualRows,
  resolveVirtualRow,
} from './headless/tableGridGrouping';
import { findGroupedColIndex } from './headless/tableGridGroupingId';
import type { TableGroupTitleRowInfo, HeaderCellValue } from './tableGridTypes';

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
    props.initialImageData?.columnFieldKindByCol ?? {}
  );
  const [columnMultiFieldConfigByCol, setColumnMultiFieldConfigByCol] = useState<Record<number, ColumnMultiFieldConfig>>(
    props.initialMultiFieldData?.columnMultiFieldConfigByCol ?? {}
  );
  const [multiFieldValueByCell, setMultiFieldValueByCell] = useState<MultiFieldValueByCell>(
    props.initialMultiFieldData?.multiFieldValueByCell ?? {}
  );

  // 同步 props 更新（用于模拟数据加载）
  useLayoutEffect(() => {
    if (props.initialMultiFieldData?.columnMultiFieldConfigByCol) {
      setColumnMultiFieldConfigByCol(props.initialMultiFieldData.columnMultiFieldConfigByCol);
    }
    if (props.initialMultiFieldData?.multiFieldValueByCell) {
      setMultiFieldValueByCell(props.initialMultiFieldData.multiFieldValueByCell);
    }
  }, [props.initialMultiFieldData]);

  const [imageUrlsByCell, setImageUrlsByCell] = useState<Record<string, ReadonlyArray<string>>>(
    props.initialImageData?.imageUrlsByCell ?? {}
  );

  // 同步图片列初始数据（用于模拟数据加载）
  useLayoutEffect(() => {
    if (props.initialImageData) {
      if (props.initialImageData.columnFieldKindByCol) {
        setColumnFieldKindByCol(props.initialImageData.columnFieldKindByCol);
      }
      if (props.initialImageData.imageUrlsByCell) {
        setImageUrlsByCell(props.initialImageData.imageUrlsByCell);
      }
    }
  }, [props.initialImageData]);

  // 图片列数据变化时传出给父组件
  useEffect(() => {
    if (props.onImageDataChange) {
      props.onImageDataChange({
        columnFieldKindByCol,
        imageUrlsByCell,
      });
    }
  }, [columnFieldKindByCol, imageUrlsByCell, props.onImageDataChange]);

  // 多字段数据变化时传出给父组件
  useEffect(() => {
    if (props.onMultiFieldDataChange) {
      props.onMultiFieldDataChange({
        columnMultiFieldConfigByCol,
        multiFieldValueByCell,
      });
    }
  }, [columnMultiFieldConfigByCol, multiFieldValueByCell, props.onMultiFieldDataChange]);

  // 追踪 blob URL，用于区分本地上传和外部链接，正确清理内存
  const blobUrlSetRef = useRef<Set<string>>(new Set());
  const [linkDataByCell, setLinkDataByCell] = useState<Record<string, ReadonlyArray<CellLinkData>>>({});
  const effectiveMinResizableTextColWidth = props.minResizableTextColWidth;

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

  const setColumnMultiFieldFields = useCallback((colIndex: number, fields: Array<{ name: string }>) => {
    if (colIndex < 0) return;
    setColumnMultiFieldConfigByCol((prev) => {
      const next = { ...prev };
      if (fields.length > 0) {
        next[colIndex] = { fields };
      } else {
        delete next[colIndex];
      }
      return next;
    });
  }, []);

  const setMultiFieldContentByCell = useCallback((bodyRowIndex: number, colIndex: number, fieldIndex: number, content: string) => {
    if (bodyRowIndex < 0 || colIndex < 0) return;
    const key = `${bodyRowIndex}-${colIndex}`;
    setMultiFieldValueByCell((prev) => {
      const current = prev[key] ?? [];
      const next = [...current];
      next[fieldIndex] = { ...next[fieldIndex], name: next[fieldIndex]?.name ?? '', content };
      return { ...prev, [key]: next };
    });
  }, []);

  const appendImageFilesToCell = useCallback(
    (bodyRowIndex: number, colIndex: number, files: readonly File[]) => {
      if (bodyRowIndex < 0 || colIndex < 0) return;
      if (!files.length) return;
      const urls = files.map((f) => createObjectUrlSafe(f)).filter((u): u is string => !!u);
      if (!urls.length) return;
      // 标记为 blob URL
      urls.forEach((url) => blobUrlSetRef.current.add(url));
      setImageUrlsByCell((prev) => {
        const key = cellKey(bodyRowIndex, colIndex);
        const existing = prev[key] ?? [];
        return { ...prev, [key]: [...existing, ...urls] };
      });
    },
    []
  );

  // 新增：追加外部图片 URL
  const appendImageUrls = useCallback(
    (bodyRowIndex: number, colIndex: number, urls: readonly string[]) => {
      if (bodyRowIndex < 0 || colIndex < 0) return;
      if (!urls.length) return;
      // 过滤空字符串，去除首尾空格
      const validUrls = urls.map((u) => u.trim()).filter(Boolean);
      if (!validUrls.length) return;
      // 外部 URL 不加入 blobUrlSet
      setImageUrlsByCell((prev) => {
        const key = cellKey(bodyRowIndex, colIndex);
        const existing = prev[key] ?? [];
        return { ...prev, [key]: [...existing, ...validUrls] };
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
      // 仅 revoke blob URL，外部链接不需要清理
      if (toRevoke && blobUrlSetRef.current.has(toRevoke)) {
        revokeObjectUrlSafe(toRevoke);
        blobUrlSetRef.current.delete(toRevoke);
      }
      const nextList = existing.filter((_, i) => i !== imageIndex);
      if (nextList.length === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: nextList };
    });
  }, []);

  const appendLinkToCell = useCallback(
    (bodyRowIndex: number, colIndex: number, data: CellLinkData) => {
      if (bodyRowIndex < 0 || colIndex < 0) return;
      setLinkDataByCell((prev) => {
        const key = cellKey(bodyRowIndex, colIndex);
        const existing = prev[key] ?? [];
        return { ...prev, [key]: [...existing, data] };
      });
    },
    []
  );

  const updateLinkAtCell = useCallback(
    (bodyRowIndex: number, colIndex: number, linkIndex: number, data: CellLinkData) => {
      if (bodyRowIndex < 0 || colIndex < 0 || linkIndex < 0) return;
      setLinkDataByCell((prev) => {
        const key = cellKey(bodyRowIndex, colIndex);
        const existing = prev[key] ?? [];
        if (linkIndex >= existing.length) return prev;
        const nextList = [...existing];
        nextList[linkIndex] = data;
        return { ...prev, [key]: nextList };
      });
    },
    []
  );

  const removeLinkAtCell = useCallback((bodyRowIndex: number, colIndex: number, linkIndex: number) => {
    if (bodyRowIndex < 0 || colIndex < 0 || linkIndex < 0) return;
    const key = cellKey(bodyRowIndex, colIndex);
    setLinkDataByCell((prev) => {
      const existing = prev[key] ?? [];
      if (linkIndex >= existing.length) return prev;
      const nextList = existing.filter((_, i) => i !== linkIndex);
      if (nextList.length === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: nextList };
    });
  }, []);

  const imageUrlsByCellRef = useRef({} as Record<string, ReadonlyArray<string>>);
  useLayoutEffect(() => {
    const prev = imageUrlsByCellRef.current;
    const nextUrlSet = new Set<string>();
    for (const list of Object.values(imageUrlsByCell)) {
      for (const url of list) nextUrlSet.add(url);
    }
    // 只 revoke blob URL，外部链接不需要清理
    for (const list of Object.values(prev)) {
      for (const url of list) {
        if (!nextUrlSet.has(url) && blobUrlSetRef.current.has(url)) {
          revokeObjectUrlSafe(url);
          blobUrlSetRef.current.delete(url);
        }
      }
    }
    imageUrlsByCellRef.current = imageUrlsByCell;
  }, [imageUrlsByCell]);

  useLayoutEffect(
    () => () => {
      // 只清理 blob URL
      for (const url of blobUrlSetRef.current) {
        revokeObjectUrlSafe(url);
      }
      blobUrlSetRef.current.clear();
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

  // 标记当前选区来源：'editing' | 'checkbox' | 'external'
  const selectionSourceRef = useRef<'editing' | 'checkbox' | 'external'>('editing');

  // 初始化/更新行列数
  useEffect(() => {
    cellSelectionStore.setDimensions(props.rowCount, props.colCount);
  }, [cellSelectionStore, props.rowCount, props.colCount]);

  // 同步 editing.selectedCells 到 store（仅当来源是 editing 时）
  useEffect(() => {
    if (selectionSourceRef.current === 'editing') {
      cellSelectionStore.setSelectedCells(editing.selectedCells);
    }
  }, [cellSelectionStore, editing.selectedCells]);

  // 反向同步：外部（如 Vtell）通过 store.setExternalSelection 更新表格编辑状态
  useEffect(() => {
    cellSelectionStore.externalSelectionHandler = (cells) => {
      selectionSourceRef.current = 'external';
      editing.setSelectedCells(new Set(cells));
      // 同步完成后恢复为 editing 模式
      setTimeout(() => {
        selectionSourceRef.current = 'editing';
      }, 0);
    };
    return () => {
      cellSelectionStore.externalSelectionHandler = undefined;
    };
  }, [cellSelectionStore, editing.setSelectedCells]);

  // 传出 store 给父组件
  useEffect(() => {
    if (props.onCellSelectionStore) {
      props.onCellSelectionStore(cellSelectionStore);
    }
  }, [cellSelectionStore, props.onCellSelectionStore]);

  // 监听 BodyRowSelectionStore（checkbox 行选择），同步到 CellSelectionStore
  useEffect(() => {
    const bodyRowStore = props.bodyRowSelectionStore;
    if (!bodyRowStore) return;

    const syncBodyRowToCellSelection = () => {
      // 获取所有选中的行
      const checkedRows: number[] = [];
      const bodyRowCount = bodyRowStore.getBodyRowCount();
      for (let r = 0; r < bodyRowCount; r++) {
        if (bodyRowStore.getRow(r)) {
          checkedRows.push(r);
        }
      }

      // 如果有选中的行，转换为单元格选中集合
      if (checkedRows.length > 0) {
        // 标记来源为 checkbox，避免 editing.selectedCells 的 useEffect 覆盖
        selectionSourceRef.current = 'checkbox';

        const cells = new Set<string>();
        for (const r of checkedRows) {
          // 整行选中：该行所有列都选中
          for (let c = 0; c < props.colCount; c++) {
            cells.add(`${r}:${c}`);
          }
        }
        cellSelectionStore.setSelectedCells(cells);
        // 同步到 editing.selectedCells
        editing.setSelectedCells(cells);
      } else {
        // 取消 checkbox 选择时，清空选区
        // 注意：不立即同步，等待下一个选区来源（如列选择）
        cellSelectionStore.setSelectedCells(new Set());
        editing.setSelectedCells(new Set());
        // 立即恢复为 editing 模式，让后续选区变化能同步
        selectionSourceRef.current = 'editing';
      }
    };

    // 订阅行选择变化
    const unsubscribe = bodyRowStore.subscribeSelection(syncBodyRowToCellSelection);
    return unsubscribe;
  }, [cellSelectionStore, props.bodyRowSelectionStore, props.colCount, editing.setSelectedCells]);

  const editingStateSlice = useMemo((): TableGridEditingContextValue => {
    return {
      state: {
        editingCell: editing.editingCell,
        selectedCell: editing.selectedCell,
        selectedCells: editing.selectedCells,
        selectionAnchor: editing.selectionAnchor,
        valueByCell: editing.valueByCell,
        hoverLockedCell: editing.hoverLockedCell,
      },
      dispatchersRef: editingDispatchersRef,
    };
  }, [
    editing.editingCell,
    editing.selectedCell,
    editing.selectedCells,
    editing.selectionAnchor,
    editing.valueByCell,
    editing.hoverLockedCell,
    editingDispatchersRef,
  ]);

  // 分页逻辑：计算当前页显示的表体行范围
  const pageSize = props.paginationPageSize ?? 20;
  const paginationEnabled = props.enablePagination && pageSize > 0;
  const bodyRowCount = props.rowCount - 1; // 表体行数（不含表头）
  const currentPage = props.paginationCurrent ?? 1;

  // 计算当前页应该显示的表体行索引范围（0-based bodyRowIndex）
  // 第1页显示 bodyRowIndex 0-19，第2页显示 20-39...
  const pageBodyStart = paginationEnabled ? (currentPage - 1) * pageSize : 0;
  const pageBodyEnd = paginationEnabled
    ? Math.min(currentPage * pageSize - 1, bodyRowCount - 1)
    : bodyRowCount - 1;

  /** 末行（插入行占位）始终渲染；「插入行列」只控制是否出现 + 与插入能力 */
  const displayRowCount = props.rowCount + 1;

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

  // 分组逻辑：分组与分页互斥
  const groupingEnabled = props.enableGrouping && props.groupingConfig?.groupedColId != null;
  const groupedColId = props.groupingConfig?.groupedColId;

  const groupTitleRows = useMemo(() => {
    if (!groupingEnabled || paginationEnabled) return [];
    if (groupedColId == null) return [];
    return computeGroupTitleRows(
      editing.valueByCell,
      groupedColId,
      props.colCount,
      bodyRowCount,
      props.groupingConfig?.expandedGroupKeys ?? new Set(),
      columnFieldKindByCol,
      imageUrlsByCell,
      linkDataByCell
    );
  }, [
    groupingEnabled,
    paginationEnabled,
    groupedColId,
    editing.valueByCell,
    props.colCount,
    bodyRowCount,
    props.groupingConfig?.expandedGroupKeys,
    columnFieldKindByCol,
    imageUrlsByCell,
    linkDataByCell,
  ]);

  const estimatedScrollContentHeight = useMemo(() => {
    const rowMinHeight = typography.theadCellMinHeightPx;
    if (paginationEnabled) {
      const pageBodyRows = Math.max(0, pageBodyEnd - pageBodyStart + 1);
      return (
        rowMinHeight +
        pageBodyRows * rowMinHeight +
        rowMinHeight
      );
    }
    if (groupingEnabled && groupTitleRows.length > 0) {
      let h = rowMinHeight;
      for (const group of groupTitleRows) {
        h += rowMinHeight;
        if (group.expanded) {
          h += group.groupCount * rowMinHeight;
          h += rowMinHeight;
        }
      }
      return h + rowMinHeight;
    }
    return (
      rowMinHeight +
      bodyRowCount * rowMinHeight +
      rowMinHeight
    );
  }, [
    bodyRowCount,
    groupTitleRows,
    groupingEnabled,
    pageBodyEnd,
    pageBodyStart,
    paginationEnabled,
    typography.theadCellMinHeightPx,
  ]);

  const scrollMaxHeight = props.bodyScrollMaxHeight;
  const shouldClampToScrollMax =
    scrollMaxHeight != null &&
    scrollMaxHeight > 0 &&
    estimatedScrollContentHeight > scrollMaxHeight;

  const shouldFillScrollport = shouldClampToScrollMax;

  // 虚拟列表：仅在内容超过可用高度后启用；少量行先自然撑高到 maxHeight。
  const useVirtualList =
    !paginationEnabled &&
    shouldClampToScrollMax &&
    displayRowCount > 0;

  const syncMultiFieldToGroup = useCallback((groupValue: string, colIndex: number, fieldsContent: Array<{ name: string; content: string }>) => {
    if (colIndex < 0) return;
    // 从 groupTitleRows 找到分组内的所有 bodyRowIndex
    const groupInfo = groupTitleRows.find((g) => g.groupValue === groupValue);
    if (!groupInfo || groupInfo.bodyRows.length === 0) return;
    setMultiFieldValueByCell((prev) => {
      const next = { ...prev };
      for (const bodyRowIndex of groupInfo.bodyRows) {
        const key = `${bodyRowIndex}-${colIndex}`;
        next[key] = fieldsContent;
      }
      return next;
    });
  }, [groupTitleRows]);

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
  // 总虚拟行数（包含 insert-tail）
  const virtualRowCount = groupingEnabled
    ? computeTotalVirtualRows(props.rowCount, groupTitleRows)
    : props.rowCount + 1;
  // 拟列表使用的行数（不含 insert-tail）
  const virtualRowCountForVirtualizer = groupingEnabled
    ? virtualRowCount - 1
    : props.rowCount;

  /** 触控板惯性 / 自定义 wheel 单帧位移大时，固定小 overscan 易出现行间空白裂缝 */
  const virtualListOverscan = useMemo(() => {
    if (!useVirtualList) return 8;
    const h = props.bodyScrollMaxHeight ?? 520;
    return getTableBodyVirtualOverscan(h, typography.bodyVirtualRowEstimatePx);
  }, [useVirtualList, props.bodyScrollMaxHeight, typography.bodyVirtualRowEstimatePx]);

  const rowVirtualizer = useVirtualizer({
    count: useVirtualList ? virtualRowCountForVirtualizer : 0,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: (index) => {
      if (index === 0) return typography.headerVirtualRowEstimatePx;
      if (groupingEnabled) {
        // 分组模式下需要判断是分组标题行还是数据行
        const resolved = resolveVirtualRow(index, props.rowCount, groupTitleRows);
        if (resolved.type === 'group-title' || resolved.type === 'group-insert-tail') {
          return typography.headerVirtualRowEstimatePx; // 分组标题行/组内插入行高度与表头类似
        }
      }
      return typography.bodyVirtualRowEstimatePx;
    },
    overscan: virtualListOverscan,
    enabled: useVirtualList,
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
      minResizableTextColWidth: effectiveMinResizableTextColWidth,
      defaultTextColWidth: props.defaultTextColWidth,
      frozenFooterRowEstimatePx: typography.bodyVirtualRowEstimatePx,
    };
    keyboardNavigateScrollRef.current = (bodyRow, col, key) => {
      scrollTableActiveCellIntoView({
        scrollRoot: scrollParentRef.current,
        bodyRow,
        col,
        key,
        useVirtual: useVirtualList,
        scrollToVirtualRow: useVirtualList
          ? (virtualIndex, opts) => rowVirtualizerRef.current.scrollToIndex(virtualIndex, opts)
          : undefined,
        frozen,
      });
    };
  }, [
    useVirtualList,
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
  }, [displayRowCount, useVirtualList]);

  const deleteColumnAt = useCallback(
    (colIndex: number) => {
      if (!props.enableInsertRowCol || colIndex < 0 || colIndex >= props.colCount) return;
      // 冻结首列时：列数 > 2 允许删除首列（冻结取消，原 B 列变为首列）；列数 = 2 禁止删除
      if (props.enableFreezeFirstCol && colIndex === 0 && props.colCount <= 2) return;
      if (props.enableFreezeLastCol && colIndex === props.colCount - 1) return;
      const minC = props.gridMinCount ?? 2;
      if (props.colCount <= minC) return;
      props.startUndoBatch?.();
      try {
        editing.removeColumnAt(colIndex);
        setColumnFieldKindByCol((prev) => remapColumnFieldKindsAfterRemoveColumn(prev, colIndex));
        setImageUrlsByCell((prev) => remapImageUrlsByCellAfterRemoveColumn(prev, colIndex));
        props.onDeleteColumn?.(colIndex);

        // 新方案：groupId 嵌入数据中，删除列时 groupId 随数据移动或消失
        // 如果删除的是分组列，groupId 会被删除，分组自然消失
        // 不需要显式处理 groupedColIndex 重映射
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

  const onColumnOrderChange = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= props.colCount || toIndex >= props.colCount) return;
      // 冻结列互斥检查
      if (props.enableFreezeFirstCol) {
        if (fromIndex === 0 || toIndex === 0) return;
      }
      if (props.enableFreezeLastCol) {
        const lastCol = props.colCount - 1;
        if (fromIndex === lastCol || toIndex === lastCol) return;
      }
      props.startUndoBatch?.();
      try {
        // 重映射单元格值
        editing.setValueByCell((prev) =>
          remapValueByCellAfterColumnOrderChange(prev, fromIndex, toIndex)
        );
        // 重映射列字段类型
        setColumnFieldKindByCol((prev) =>
          remapColumnFieldKindsAfterColumnOrderChange(prev, fromIndex, toIndex)
        );
        // 重映射图片 URL
        setImageUrlsByCell((prev) =>
          remapImageUrlsByCellAfterColumnOrderChange(prev, fromIndex, toIndex)
        );
        // 重映射列宽
        if (props.colWidths) {
          const newColWidths = remapColWidthsAfterColumnOrderChange(props.colWidths, fromIndex, toIndex);
          // 需要通过外部回调更新列宽（如果有）
          // props.onColWidthsChange?.(newColWidths);
        }
        // 重映射隐藏列
        if (props.hiddenColSet && props.setAllColumnsHidden) {
          const newHiddenSet = remapHiddenColSetAfterColumnOrderChange(props.hiddenColSet, fromIndex, toIndex);
          props.setAllColumnsHidden(newHiddenSet);
        }
        // 重映射选中集合
        editing.setSelectedCells((prev) =>
          adjustSelectionSetAfterColumnOrderChange(prev, fromIndex, toIndex)
        );
        // 更新选中单元格坐标
        if (editing.selectedCell) {
          const newC = editing.selectedCell.c === fromIndex
            ? toIndex
            : editing.selectedCell.c > fromIndex && editing.selectedCell.c <= toIndex
              ? editing.selectedCell.c - 1
              : editing.selectedCell.c >= toIndex && editing.selectedCell.c < fromIndex
                ? editing.selectedCell.c + 1
                : editing.selectedCell.c;
          editing.setSelectedCell({ r: editing.selectedCell.r, c: newC });
        }
        // 新方案：groupId 嵌入数据中，列顺序调整时 groupId 随数据移动
        // 不需要显式处理 groupedColIndex 重映射
        // 通知外部
        props.onColumnOrderChange?.(fromIndex, toIndex);
      } finally {
        props.endUndoBatch?.();
      }
    },
    [
      editing,
      props.colCount,
      props.enableFreezeFirstCol,
      props.enableFreezeLastCol,
      props.colWidths,
      props.hiddenColSet,
      props.setAllColumnsHidden,
      props.onColumnOrderChange,
      props.startUndoBatch,
      props.endUndoBatch,
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

  // 包装组内插入行回调：插入后自动复制组内第一行的多字段内容到新行
  const onInsertRowWithGroupValueWrapped = useCallback((groupValue: string) => {
    // 先调用原回调插入行
    props.onInsertRowWithGroupValue?.(groupValue);

    // 找到该分组的信息
    const groupInfo = groupTitleRows.find((g) => g.groupValue === groupValue);
    if (!groupInfo || groupInfo.bodyRows.length === 0 || groupInfo.groupedColIndex == null) return;

    // 分组列是否配置了多字段
    const groupedColIndex = groupInfo.groupedColIndex;
    const hasMultiField = (columnMultiFieldConfigByCol[groupedColIndex]?.fields?.length ?? 0) > 0;
    if (!hasMultiField) return;

    // 组内第一行的多字段内容
    const firstBodyRowIndex = groupInfo.bodyRows[0];
    const sourceKey = `${firstBodyRowIndex}-${groupedColIndex}`;
    const sourceValues = multiFieldValueByCell[sourceKey];
    if (!sourceValues || sourceValues.length === 0) return;

    // 计算新行的 bodyRowIndex（组内最后一行之后）
    const lastBodyRowIndex = Math.max(...groupInfo.bodyRows);
    const newBodyRowIndex = lastBodyRowIndex + 1;

    // 复制多字段内容到新行
    const targetKey = `${newBodyRowIndex}-${groupedColIndex}`;
    setMultiFieldValueByCell((prev) => {
      const next = { ...prev };
      next[targetKey] = sourceValues.map((v) => ({ ...v }));
      return next;
    });
  }, [props.onInsertRowWithGroupValue, groupTitleRows, columnMultiFieldConfigByCol, multiFieldValueByCell, setMultiFieldValueByCell]);

  const onInsertRowWrapped = useCallback(() => {
    props.onInsertRow();
    scrollTableViewportToBottom();
    // 插入行后调整选中区域
    const currentBodyRowCount = props.rowCount - 1; // 当前表体行数（不含表头）
    const insertAtBodyRow = currentBodyRowCount > 0 ? currentBodyRowCount - 1 : 0;
    editing.insertBodyRowAt(insertAtBodyRow, props.colCount);
  }, [props.onInsertRow, scrollTableViewportToBottom, editing, props.rowCount, props.colCount]);

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

  /** 分组场景：同步图片数据到分组内所有行 */
  const syncImageUrlsToGroup = useCallback((groupValue: string, colIndex: number, imageUrls: ReadonlyArray<string>) => {
    const groupInfo = groupTitleRows.find((g) => g.groupValue === groupValue);
    if (!groupInfo || groupInfo.bodyRows.length === 0) return;
    setImageUrlsByCell((prev) => {
      const next = { ...prev };
      for (const bodyRowIndex of groupInfo.bodyRows) {
        const key = `${bodyRowIndex}-${colIndex}`;
        next[key] = imageUrls;
      }
      return next;
    });
  }, [groupTitleRows]);

  /** 分组场景：同步链接数据到分组内所有行 */
  const syncLinkDataToGroup = useCallback((groupValue: string, colIndex: number, linkData: ReadonlyArray<CellLinkData>) => {
    const groupInfo = groupTitleRows.find((g) => g.groupValue === groupValue);
    if (!groupInfo || groupInfo.bodyRows.length === 0) return;
    setLinkDataByCell((prev) => {
      const next = { ...prev };
      for (const bodyRowIndex of groupInfo.bodyRows) {
        const key = `${bodyRowIndex}-${colIndex}`;
        next[key] = linkData;
      }
      return next;
    });
  }, [groupTitleRows]);

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
      columnMultiFieldConfigByCol,
      setColumnMultiFieldFields,
      multiFieldValueByCell,
      setMultiFieldContentByCell,
      syncMultiFieldToGroup,
      imageUrlsByCell,
      appendImageFilesToCell,
      appendImageUrls,
      removeImageAtCell,
      linkDataByCell,
      appendLinkToCell,
      updateLinkAtCell,
      removeLinkAtCell,
      // 让表头/表体每一行都用”可见列 minWidth”，否则只改 scroll 容器无效
      rowMinWidth: effectiveRowMinWidth,
      onInsertRow: onInsertRowWrapped,
      onInsertColumn: onInsertColumnWrapped,
      deleteColumnAt,
      deleteBodyRowAt,
      bodyVirtualized: useVirtualList,
      typography,
      visibleColIndexes,
      // 分页模式下当前页表体行范围（0-based bodyRowIndex）
      pageBodyRowStart: paginationEnabled ? pageBodyStart : undefined,
      pageBodyRowEnd: paginationEnabled ? pageBodyEnd : undefined,
      // 分组标题行信息
      groupTitleRows,
      // 组内插入行回调（包装后自动复制多字段内容）
      onInsertRowWithGroupValue: onInsertRowWithGroupValueWrapped,
      // 批量展开/收起分组回调
      onToggleAllGroupExpansion: props.onToggleAllGroupExpansion,
      // 列顺序变更回调
      onColumnOrderChange,
      // 分组场景：同步图片/链接数据到组内所有行
      syncImageUrlsToGroup,
      syncLinkDataToGroup,
    };
  }, [
    typography,
    visibleColIndexes,
    effectiveRowMinWidth,
    useVirtualList,
    props.rowCount,
    props.colCount,
    props.enableInsertRowCol,
    props.enableEditMode,
    props.rowMinWidth,
    props.narrowWidth,
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
    columnMultiFieldConfigByCol,
    setColumnMultiFieldFields,
    multiFieldValueByCell,
    setMultiFieldContentByCell,
    syncMultiFieldToGroup,
    imageUrlsByCell,
    appendImageFilesToCell,
    appendImageUrls,
    removeImageAtCell,
    linkDataByCell,
    appendLinkToCell,
    updateLinkAtCell,
    removeLinkAtCell,
    props.enablePagination,
    props.paginationCurrent,
    props.paginationPageSize,
    props.onPaginationChange,
    groupTitleRows,
    onInsertRowWithGroupValueWrapped,
    props.onInsertRowWithGroupValue,
    props.onToggleAllGroupExpansion,
    onColumnOrderChange,
    syncImageUrlsToGroup,
    syncLinkDataToGroup,
  ]);

  return (
    <BodyRowSelectionStoreContext.Provider value={props.bodyRowSelectionStore}>
      <TableRowHoverStoreContext.Provider value={hoverStore}>
        <TableGridConfigContext.Provider value={staticConfig}>
          <TableGridEditingContext.Provider value={editingStateSlice}>
            {/**
             * 虚拟与非虚拟共用同一 scrollport：横纵滚与 sticky 冻结参照一致。
             * maxHeight：限制表格最多吃满剩余空间；少量行先自然撑高，超过后滚动。
             * minHeight：内容已超过剩余空间后撑满可视区，让底部插入行在布局动画中稳定钉底。
             */}
            <div
                ref={scrollParentRef}
                className="vc-biz-table-scrollport"
                onScroll={onBodyScroll}
                style={{
                  width: '100%',
                  minHeight: shouldFillScrollport ? scrollMaxHeight : undefined,
                  maxHeight: scrollMaxHeight,
                  overflow: 'auto',
                  scrollbarGutter: 'stable',
                  boxSizing: 'border-box',
                }}
              >
                {useVirtualList ? (
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
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      minWidth: effectiveRowMinWidth,
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* 表头：sticky 钉顶 */}
                    <div
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 6,
                        width: '100%',
                        isolation: 'isolate',
                        background: vcTokens.color.neutral.background.layout,
                        boxShadow: `inset 0 -1px 0 ${vcTokens.color.neutral.border.default}`,
                      }}
                      data-vc-biz-table-frozen-header=""
                    >
                      <TableGridRow key="row-0" rowIndex={0} />
                    </div>
                    {/* 表体行：分组模式、分页模式、普通模式 */}
                    {groupingEnabled
                      ? // 分组模式：按分组结构遍历
                        (() => {
                          const rows: React.ReactNode[] = [];
                          let virtualIdx = 1; // 表头是 0，表体从 1 开始
                          for (const groupInfo of groupTitleRows) {
                            // 分组标题行
                            rows.push(
                              <TableGridRow
                                key={`group-title-${groupInfo.groupValue}`}
                                rowIndex={virtualIdx}
                              />
                            );
                            virtualIdx += 1;
                            // 组内数据行（仅展开状态）
                            if (groupInfo.expanded) {
                              for (let i = 0; i < groupInfo.groupCount; i++) {
                                const bodyRowIndex = groupInfo.bodyRows[i];
                                rows.push(
                                  <TableGridRow
                                    key={`body-${bodyRowIndex}`}
                                    rowIndex={virtualIdx}
                                  />
                                );
                                virtualIdx += 1;
                              }
                              // 组内插入行
                              rows.push(
                                <TableGridRow
                                  key={`group-insert-${groupInfo.groupValue}`}
                                  rowIndex={virtualIdx}
                                />
                              );
                              virtualIdx += 1;
                            }
                          }
                          return rows;
                        })()
                      : paginationEnabled
                        ? // 分页模式：只显示当前页范围
                          Array.from({ length: pageBodyEnd - pageBodyStart + 1 }).map((_, idx) => {
                            const bodyRowIndex = pageBodyStart + idx; // 0-based
                            const rowIndex = bodyRowIndex + 1; // rowIndex: bodyRowIndex + 1
                            return <TableGridRow key={`row-${rowIndex}`} rowIndex={rowIndex} />;
                          })
                        : // 普通模式：显示所有表体行
                          Array.from({ length: props.rowCount - 1 }).map((_, idx) => {
                            const rowIndex = idx + 1;
                            return <TableGridRow key={`row-${rowIndex}`} rowIndex={rowIndex} />;
                          })}
                  </div>
                )}
                {/* 插入行：独立于表体横向滚动内容，sticky 定位 */}
                <div
                  style={{
                    position: 'sticky',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: '100%',
                    zIndex: 5,
                    background: TABLE_BODY_BG_DEFAULT,
                    boxSizing: 'border-box',
                    // 分组模式下：最后一个分组与固定底部插入行之间保持 12px 间距
                    marginTop: groupingEnabled && groupTitleRows.length > 0 ? vcTokens.size.padding.sm : 0,
                  }}
                  data-vc-biz-table-frozen-footer=""
                >
                  <TableGridRow rowIndex={groupingEnabled ? virtualRowCount - 1 : props.rowCount} />
                </div>
              </div>
            </TableGridEditingContext.Provider>
          </TableGridConfigContext.Provider>
        </TableRowHoverStoreContext.Provider>
      </BodyRowSelectionStoreContext.Provider>
    );
  }
