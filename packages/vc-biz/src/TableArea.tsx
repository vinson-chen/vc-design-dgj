import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { message, Typography, vcTokens } from 'vc-design';
import './table/tableHeaderContextMenu.css';
import { BodyRowSelectionStore } from './table/bodyRowSelectionStore';
import { parseExcelFirstSheet } from './table/parseExcelFirstSheet';
import { V_TABLE_EDIT_KEYBOARD_HINT_LINES } from './table/tableEditKeyboardHelp';
import type { TableAreaUndoSnapshot } from './table/useTableAreaUndoRedo';
import { snapshotTableAreaState, useTableAreaUndoRedo } from './table/useTableAreaUndoRedo';
import { useColumnResize } from './table/useTableGridState';
import TableRows from './table/TableRows';
import type { CellSelectionStore } from './table/cellSelectionStore';
import { GRID_MAX_COL, GRID_MAX_ROW, GRID_MIN } from './tableAreaGridLimits';
import { generateGroupId, findGroupedColIndex, getHeaderGroupId } from './table/headless/tableGridGroupingId';
const MIN_RESIZABLE_TEXT_COL_W = 100;
const DEFAULT_TEXT_COL_W = 200;
/** checkbox / 序号 / 插入列等窄格统一宽度（与 padding 0 下四位序号对齐，避免开关「显示序号」时列宽抖动） */
const NARROW_W = 40;

export type TableAreaDemoOptions = Readonly<{
  initialRowCount?: number;
  initialColCount?: number;
  initialEnableColumnResize?: boolean;
  initialEnableVerticalCenter?: boolean;
  initialEnableFreezeFirstCol?: boolean;
  initialEnableFreezeLastCol?: boolean;
  initialEnableFreezeLastRow?: boolean;
  initialEnableBodyCellRightBorder?: boolean;
  initialEnableShowRowIndex?: boolean;
  /** 批量选择（checkbox 列）；默认开启 */
  initialEnableBatchSelection?: boolean;
  initialEnableInsertRowCol?: boolean;
  initialEnableEditMode?: boolean;
  /** 常规字号（14/22）；默认 true；false 为紧凑 12/20 */
  initialEnableRegularTableFont?: boolean;
  /** 与 TableRows 一致：header-{c} / r-c */
  initialValueByCell?: Record<string, string>;
  /** 表格可视区高度（px），启用垂直虚拟滚动（表头为虚拟第 0 行并 sticky）；缺省 520；传 0 则全量挂载 */
  bodyScrollMaxHeight?: number;
  /** 为 true 时由 TableAreaTableInstance / VTable 在表格外展示编辑模式快捷键说明 */
  showEditKeyboardHints?: boolean;
  /** 单元格选中状态 store 回调 */
  onCellSelectionStore?: (store: CellSelectionStore) => void;
  /** 显示分页：默认关闭 */
  initialEnablePagination?: boolean;
  /** 初始页码（1-based），默认 1 */
  initialPaginationCurrent?: number;
  /** 每页条数，默认 20 */
  initialPaginationPageSize?: number;
  /** 支持分组：默认开启 */
  initialEnableGrouping?: boolean;
}>;

export function useTableAreaDemoState(options?: TableAreaDemoOptions) {
  const bodyScrollMaxHeight =
    options?.bodyScrollMaxHeight === undefined ? 520 : options.bodyScrollMaxHeight;
  const showEditKeyboardHints = options?.showEditKeyboardHints ?? false;

  const [rowCount, setRowCount] = useState(options?.initialRowCount ?? 20);
  const [colCount, setColCount] = useState(options?.initialColCount ?? 10);
  const [enableColumnResize, setEnableColumnResize] = useState(
    options?.initialEnableColumnResize ?? true
  );
  const [enableVerticalCenter, setEnableVerticalCenter] = useState(
    options?.initialEnableVerticalCenter ?? true
  );
  const [enableFreezeFirstCol, setEnableFreezeFirstCol] = useState(
    options?.initialEnableFreezeFirstCol ?? true
  );
  const [enableFreezeLastCol, setEnableFreezeLastCol] = useState(
    options?.initialEnableFreezeLastCol ?? false
  );
  const [enableFreezeLastRow, setEnableFreezeLastRow] = useState(
    options?.initialEnableFreezeLastRow ?? true
  );
  const [enableBodyCellRightBorder, setEnableBodyCellRightBorder] = useState(
    options?.initialEnableBodyCellRightBorder ?? true
  );
  const [enableShowRowIndex, setEnableShowRowIndex] = useState(
    options?.initialEnableShowRowIndex ?? true
  );
  const [enableBatchSelection, setEnableBatchSelection] = useState(
    options?.initialEnableBatchSelection ?? true
  );
  const [enableInsertRowCol, setEnableInsertRowCol] = useState(
    options?.initialEnableInsertRowCol ?? true
  );
  const [enableEditMode, setEnableEditMode] = useState(
    options?.initialEnableEditMode ?? true
  );
  const [enableRegularTableFont, setEnableRegularTableFont] = useState(
    options?.initialEnableRegularTableFont ?? true
  );
  const [valueByCell, setValueByCellBase] = useState<Record<string, string>>(() => ({
    ...(options?.initialValueByCell ?? {}),
  }));
  const [hiddenColSet, setHiddenColSet] = useState<Set<number>>(() => new Set());
  const [undoRedoNonce, setUndoRedoNonce] = useState(0);
  const [tableViewportClientWidth, setTableViewportClientWidth] = useState<number>(0);

  // 分页状态
  const [enablePagination, setEnablePagination] = useState(
    options?.initialEnablePagination ?? true
  );
  const [paginationCurrent, setPaginationCurrent] = useState(
    options?.initialPaginationCurrent ?? 1
  );
  const [paginationPageSize, setPaginationPageSize] = useState(
    options?.initialPaginationPageSize ?? 50
  );

  // 分组状态
  const [enableGrouping, setEnableGrouping] = useState(
    options?.initialEnableGrouping ?? true
  );
  const [groupedColId, setGroupedColId] = useState<string | undefined>(undefined);
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(() => new Set());

  const colCountRef = useRef(colCount);
  const rowCountRef = useRef(rowCount);
  colCountRef.current = colCount;
  rowCountRef.current = rowCount;
  const valueByCellRef = useRef(valueByCell);
  valueByCellRef.current = valueByCell;

  const narrowLeadW = enableBatchSelection || enableShowRowIndex ? NARROW_W : 0;

  const getResizeMaxWidthForColumn = useCallback(
    (colIndex: number): number | null => {
      // 冻结首列时，防止首列被拖到吞没整个可视区，导致横向滚动“失效感”。
      if (!enableFreezeFirstCol || colIndex !== 0 || tableViewportClientWidth <= 0) return null;
      const reserved = narrowLeadW + MIN_RESIZABLE_TEXT_COL_W;
      return Math.max(MIN_RESIZABLE_TEXT_COL_W, tableViewportClientWidth - reserved);
    },
    [enableFreezeFirstCol, narrowLeadW, tableViewportClientWidth]
  );

  const {
    colWidths,
    onColumnResizeStart,
    insertColumnWidthAt,
    removeColumnWidthAt,
    applyColWidthsSnapshot,
  } = useColumnResize(
    GRID_MAX_COL,
    MIN_RESIZABLE_TEXT_COL_W,
    getResizeMaxWidthForColumn
  );
  const colWidthsRef = useRef(colWidths);
  colWidthsRef.current = colWidths;
  const bodyRowSelectionStoreRef = useRef<BodyRowSelectionStore | null>(null);
  if (bodyRowSelectionStoreRef.current == null) {
    bodyRowSelectionStoreRef.current = new BodyRowSelectionStore();
  }
  const bodyRowSelectionStore = bodyRowSelectionStoreRef.current;

  useLayoutEffect(() => {
    bodyRowSelectionStore.setBodyRowCount(Math.max(0, rowCount - 1));
  }, [bodyRowSelectionStore, rowCount]);

  useLayoutEffect(() => {
    if (!enableBatchSelection) {
      bodyRowSelectionStore.toggleAll(false);
    }
  }, [enableBatchSelection, bodyRowSelectionStore]);

  useLayoutEffect(() => {
    setHiddenColSet((prev) => {
      let changed = false;
      const next = new Set<number>();
      prev.forEach((idx) => {
        if (idx >= 0 && idx < colCount) {
          next.add(idx);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [colCount]);

  const applySnapshot = useCallback(
    (s: TableAreaUndoSnapshot) => {
      setValueByCellBase(s.valueByCell);
      setRowCount(s.rowCount);
      setColCount(s.colCount);
      applyColWidthsSnapshot(s.colWidths);
      setUndoRedoNonce((n) => n + 1);
      bodyRowSelectionStore.toggleAll(false);
    },
    [applyColWidthsSnapshot, bodyRowSelectionStore]
  );

  const { recordIfNeeded, startBatch, endBatch, undo, redo, canUndo, canRedo } =
    useTableAreaUndoRedo(
      () =>
        snapshotTableAreaState({
          valueByCell: valueByCellRef.current,
          rowCount: rowCountRef.current,
          colCount: colCountRef.current,
          colWidths: colWidthsRef.current,
        }),
      applySnapshot
    );

  const setValueByCell = useCallback(
    (action: React.SetStateAction<Record<string, string>>) => {
      recordIfNeeded();
      setValueByCellBase(action);
    },
    [recordIfNeeded]
  );

  const tableUndoRedo = useMemo(
    () => ({ undo, redo, canUndo, canRedo }),
    [undo, redo, canUndo, canRedo]
  );

  const rowMinWidth = useMemo(() => {
    const insertColW = enableInsertRowCol ? NARROW_W : 0;
    let sum = 0;
    for (let i = 0; i < colCount; i += 1) {
      const storedW = enableColumnResize ? colWidths[i] ?? null : null;
      sum += storedW != null ? storedW : DEFAULT_TEXT_COL_W;
    }
    return narrowLeadW + sum + insertColW;
  }, [colCount, colWidths, enableColumnResize, enableInsertRowCol, narrowLeadW]);

  const insertRow = useCallback(() => {
    recordIfNeeded();
    const currentBodyRowCount = rowCountRef.current - 1; // 当前表体行数（不含表头）
    const newRowTotalCount = Math.min(GRID_MAX_ROW, rowCountRef.current + 1);

    // 分页开启时：新行作为当前页最后一行，原数据从该位置开始下移
    if (enablePagination && paginationPageSize > 0) {
      // 当前页的 bodyRowIndex 范围（0-based）
      const pageBodyStart = (paginationCurrent - 1) * paginationPageSize;
      const pageBodyEnd = Math.min(pageBodyStart + paginationPageSize - 1, currentBodyRowCount - 1);

      // 新行插入位置：当前页最后一行位置（原最后一行数据下移到下一页第一行）
      const insertAtBodyRow = pageBodyEnd >= 0 ? pageBodyEnd : 0;

      // 数据重排：从 insertAtBodyRow 开始的所有行数据向下移动一行
      setValueByCellBase((prev) => {
        const next: Record<string, string> = {};
        for (const [key, value] of Object.entries(prev)) {
          if (key.startsWith('header-')) {
            next[key] = value;
            continue;
          }
          const m = /^(\d+)-(\d+)$/.exec(key);
          if (!m) {
            next[key] = value;
            continue;
          }
          const r = Number(m[1]); // bodyRowIndex (0-based)
          const c = Number(m[2]);
          if (!Number.isFinite(r) || !Number.isFinite(c)) {
            next[key] = value;
            continue;
          }
          // 从 insertAtBodyRow 开始，所有行数据向下移动
          if (r >= insertAtBodyRow) {
            next[`${r + 1}-${c}`] = value;
          } else {
            next[key] = value;
          }
        }
        return next;
      });

      setRowCount(newRowTotalCount);
    } else {
      setRowCount(newRowTotalCount);
    }
  }, [recordIfNeeded, enablePagination, paginationCurrent, paginationPageSize]);

  const insertColumn = useCallback(() => {
    recordIfNeeded();
    const currColCount = colCountRef.current;
    if (currColCount >= GRID_MAX_COL) return;
    const insertAt = enableFreezeLastCol && currColCount > 0 ? currColCount - 1 : currColCount;
    if (insertAt < currColCount) {
      setValueByCellBase((prev) => {
        const next: Record<string, string> = {};
        for (const [key, value] of Object.entries(prev)) {
          if (key.startsWith('header-')) {
            const c = Number(key.slice(7));
            if (Number.isFinite(c) && c >= insertAt) {
              next[`header-${c + 1}`] = value;
            } else {
              next[key] = value;
            }
            continue;
          }
          const m = /^(\d+)-(\d+)$/.exec(key);
          if (!m) {
            next[key] = value;
            continue;
          }
          const r = Number(m[1]);
          const c = Number(m[2]);
          if (!Number.isFinite(r) || !Number.isFinite(c)) {
            next[key] = value;
            continue;
          }
          if (c >= insertAt) next[`${r}-${c + 1}`] = value;
          else next[key] = value;
        }
        return next;
      });
      insertColumnWidthAt(insertAt);
      setHiddenColSet((prev) => {
        if (prev.size === 0) return prev;
        const next = new Set<number>();
        prev.forEach((idx) => next.add(idx >= insertAt ? idx + 1 : idx));
        return next;
      });
    }
    setColCount((prev) => Math.min(GRID_MAX_COL, prev + 1));
  }, [enableFreezeLastCol, insertColumnWidthAt, recordIfNeeded]);

  const deleteColumn = useCallback(
    (colIndex: number) => {
      if (colCountRef.current <= GRID_MIN) return;
      removeColumnWidthAt(colIndex);
      setColCount((c) => c - 1);
      // 注意：valueByCell 数据重排已由 TableRows.editing.removeColumnAt 调用 remapValueByCellAfterRemoveColumn 处理
      // 此处仅需处理元数据：列宽、列数、隐藏列集合
      setHiddenColSet((prev) => {
        const next = new Set<number>();
        prev.forEach((idx) => {
          if (idx === colIndex) return;
          next.add(idx > colIndex ? idx - 1 : idx);
        });
        return next;
      });
    },
    [removeColumnWidthAt]
  );

  const deleteBodyRow = useCallback((bodyRowIndex: number) => {
    if (rowCountRef.current <= GRID_MIN) return;
    bodyRowSelectionStore.remapAfterDeleteBodyRow(bodyRowIndex);
    setRowCount((r) => r - 1);
  }, [bodyRowSelectionStore]);

  const importExcelFromFile = useCallback(
    async (file: File) => {
      const name = file.name.toLowerCase();
      if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
        message.warning('请选择 .xlsx 或 .xls 文件');
        return;
      }
      try {
        const buf = await file.arrayBuffer();
        const { valueByCell: nextV, colCount: nextC, rowCount: nextR } = parseExcelFirstSheet(buf, {
          minCol: GRID_MIN,
          maxCol: GRID_MAX_COL,
          minRowCount: GRID_MIN,
          maxRowCount: GRID_MAX_ROW,
        });
        startBatch();
        try {
          applyColWidthsSnapshot(Array.from({ length: GRID_MAX_COL }, () => null));
          setColCount(nextC);
          setRowCount(nextR);
          setValueByCellBase(nextV);
          setHiddenColSet(new Set());
          setUndoRedoNonce((n) => n + 1);
          bodyRowSelectionStore.toggleAll(false);
        } finally {
          endBatch();
        }
        message.success(`已导入 ${nextC} 列 × ${nextR} 行（含表头）`);
      } catch (err) {
        const text = err instanceof Error ? err.message : '导入失败';
        message.error(text);
      }
    },
    [applyColWidthsSnapshot, bodyRowSelectionStore, endBatch, startBatch]
  );

  return {
    rowCount,
    setRowCount,
    colCount,
    setColCount,
    enableColumnResize,
    setEnableColumnResize,
    enableVerticalCenter,
    setEnableVerticalCenter,
    enableFreezeFirstCol,
    setEnableFreezeFirstCol,
    enableFreezeLastCol,
    setEnableFreezeLastCol,
    enableFreezeLastRow,
    setEnableFreezeLastRow,
    enableBodyCellRightBorder,
    setEnableBodyCellRightBorder,
    enableShowRowIndex,
    setEnableShowRowIndex,
    enableBatchSelection,
    setEnableBatchSelection,
    enableInsertRowCol,
    setEnableInsertRowCol,
    enableEditMode,
    setEnableEditMode,
    enableRegularTableFont,
    setEnableRegularTableFont,
    insertRow,
    insertColumn,
    deleteColumn,
    deleteBodyRow,
    bodyRowSelectionStore,
    colWidths,
    onColumnResizeStart,
    rowMinWidth,
    narrowWidth: NARROW_W,
    minResizableTextColWidth: MIN_RESIZABLE_TEXT_COL_W,
    defaultTextColWidth: DEFAULT_TEXT_COL_W,
    valueByCell,
    setValueByCell,
    bodyScrollMaxHeight,
    showEditKeyboardHints,
    startUndoBatch: startBatch,
    endUndoBatch: endBatch,
    undoRedoNonce,
    tableUndoRedo,
    importExcelFromFile,
    hiddenColSet,
    setColumnHidden: (colIndex: number, hidden: boolean) => {
      setHiddenColSet((prev) => {
        const next = new Set(prev);
        if (hidden) {
          next.add(colIndex);
        } else {
          next.delete(colIndex);
        }
        return next;
      });
    },
    setAllColumnsHidden: (nextHiddenCols: ReadonlySet<number>) => {
      setHiddenColSet(new Set(nextHiddenCols));
    },
    setTableViewportClientWidth,
    onCellSelectionStore: options?.onCellSelectionStore,
    // 分页
    enablePagination,
    setEnablePagination,
    paginationCurrent,
    setPaginationCurrent,
    paginationPageSize,
    setPaginationPageSize,
    onPaginationChange: (page: number, pageSize: number) => {
      setPaginationCurrent(page);
      setPaginationPageSize(pageSize);
    },
    // 分组
    enableGrouping,
    setEnableGrouping,
    groupedColId,
    setGroupedColId,
    expandedGroupKeys,
    setExpandedGroupKeys,
    groupingConfig: {
      groupedColId,
      expandedGroupKeys: expandedGroupKeys as ReadonlySet<string>,
    },
    onGroupingChange: (groupId: string | undefined) => {
      setGroupedColId(groupId);
      // 切换分组列时，默认展开所有分组
      if (groupId != null) {
        // 分组与分页互斥：选择分组时自动关闭分页
        if (enablePagination) {
          setEnablePagination(false);
        }
        // 根据 groupId 查找分组列索引
        const groupedColIndex = findGroupedColIndex(valueByCellRef.current, groupId, colCount);
        if (groupedColIndex != null) {
          const newExpanded = new Set<string>();
          // 遍历该列所有值，添加到展开集合
          for (let r = 0; r < rowCount - 1; r++) {
            const val = valueByCellRef.current[`${r}-${groupedColIndex}`];
            if (val) newExpanded.add(val);
          }
          setExpandedGroupKeys(newExpanded);
        }
      } else {
        setExpandedGroupKeys(new Set());
      }
    },
    onGroupExpansionChange: (groupKey: string, expanded: boolean) => {
      setExpandedGroupKeys((prev) => {
        const next = new Set(prev);
        if (expanded) next.add(groupKey);
        else next.delete(groupKey);
        return next;
      });
    },
    onInsertRowWithGroupValue: (groupValue: string) => {
      // 组内插入：找到该组最后一行，在其后插入新行，并自动填入分组值
      recordIfNeeded();

      // 根据 groupId 查找分组列索引
      const groupedColIndex = findGroupedColIndex(valueByCellRef.current, groupedColId!, colCount);
      if (groupedColIndex == null) return;

      // 计算该组最后一行的 bodyRowIndex
      const groups = new Map<string, Array<number>>();
      for (let r = 0; r < rowCountRef.current - 1; r++) {
        const val = valueByCellRef.current[`${r}-${groupedColIndex}`] ?? '(空)';
        if (!groups.has(val)) groups.set(val, []);
        groups.get(val)!.push(r);
      }

      const groupRows = groups.get(groupValue) ?? [];
      const insertAtBodyRow = groupRows.length > 0
        ? Math.max(...groupRows) + 1  // 该组最后一行之后
        : rowCountRef.current - 1;    // 末尾

      // 数据重排：从 insertAtBodyRow 开始的所有行数据向下移动一行
      setValueByCellBase((prev) => {
        const next: Record<string, string> = {};
        for (const [key, value] of Object.entries(prev)) {
          if (key.startsWith('header-')) {
            next[key] = value;
            continue;
          }
          const m = /^(\d+)-(\d+)$/.exec(key);
          if (!m) {
            next[key] = value;
            continue;
          }
          const r = Number(m[1]);
          const c = Number(m[2]);
          if (!Number.isFinite(r) || !Number.isFinite(c)) {
            next[key] = value;
            continue;
          }
          if (r >= insertAtBodyRow) {
            next[`${r + 1}-${c}`] = value;
          } else {
            next[key] = value;
          }
        }
        // 设置新行的分组值
        next[`${insertAtBodyRow}-${groupedColIndex}`] = groupValue;
        return next;
      });

      setRowCount(Math.min(GRID_MAX_ROW, rowCountRef.current + 1));

      // 滚动到新插入行位置（空值组通常在末尾，不需要特殊滚动处理）
      // 非空值组：滚动到该组标题行附近
      if (groupValue) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const scrollport = document.querySelector('.vc-biz-table-scrollport');
            if (scrollport) {
              const groupTitleRows = scrollport.querySelectorAll('[data-vc-biz-table-group-title-row]');
              for (const row of groupTitleRows) {
                const label = row.querySelector('span');
                if (label?.textContent?.includes(groupValue)) {
                  row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                  break;
                }
              }
            }
          });
        });
      }
    },
  };
}

export type TableAreaDemoModel = ReturnType<typeof useTableAreaDemoState>;

export function TableAreaTableInstance(model: TableAreaDemoModel) {
  const {
    rowCount,
    colCount,
    rowMinWidth,
    narrowWidth,
    minResizableTextColWidth,
    defaultTextColWidth,
    enableColumnResize,
    enableVerticalCenter,
    enableFreezeFirstCol,
    enableFreezeLastCol,
    enableFreezeLastRow,
    enableBodyCellRightBorder,
    enableShowRowIndex,
    enableBatchSelection,
    enableInsertRowCol,
    enableEditMode,
    enableRegularTableFont,
    bodyRowSelectionStore,
    colWidths,
    onColumnResizeStart,
    insertRow,
    insertColumn,
    deleteColumn,
    deleteBodyRow,
    valueByCell,
    setValueByCell,
    bodyScrollMaxHeight,
    showEditKeyboardHints,
    startUndoBatch,
    endUndoBatch,
    undoRedoNonce,
    tableUndoRedo,
    hiddenColSet,
    setColumnHidden,
    setAllColumnsHidden,
    setTableViewportClientWidth,
    onCellSelectionStore,
    enablePagination,
    paginationCurrent,
    paginationPageSize,
    onPaginationChange,
    enableGrouping,
    groupedColId,
    expandedGroupKeys,
    groupingConfig,
    onGroupingChange,
    onGroupExpansionChange,
    onInsertRowWithGroupValue,
  } = model;

  const rows = (
    <TableRows
      rowCount={rowCount}
      colCount={colCount}
      rowMinWidth={rowMinWidth}
      narrowWidth={narrowWidth}
      minResizableTextColWidth={minResizableTextColWidth}
      defaultTextColWidth={defaultTextColWidth}
      enableColumnResize={enableColumnResize}
      enableVerticalCenter={enableVerticalCenter}
      enableFreezeFirstCol={enableFreezeFirstCol}
      enableFreezeLastCol={enableFreezeLastCol}
      enableFreezeLastRow={enableFreezeLastRow}
      enableBodyCellRightBorder={enableBodyCellRightBorder}
      enableBatchSelection={enableBatchSelection}
      enableShowRowIndex={enableShowRowIndex}
      enableInsertRowCol={enableInsertRowCol}
      enableEditMode={enableEditMode}
      enableRegularTableFont={enableRegularTableFont}
      bodyRowSelectionStore={bodyRowSelectionStore}
      colWidths={colWidths}
      onColumnResizeStart={onColumnResizeStart}
      onInsertRow={insertRow}
      onInsertColumn={insertColumn}
      gridMinCount={GRID_MIN}
      onDeleteColumn={deleteColumn}
      onDeleteBodyRow={deleteBodyRow}
      valueByCell={valueByCell}
      onValueByCellChange={setValueByCell}
      bodyScrollMaxHeight={bodyScrollMaxHeight > 0 ? bodyScrollMaxHeight : undefined}
      startUndoBatch={startUndoBatch}
      endUndoBatch={endUndoBatch}
      undoRedoNonce={undoRedoNonce}
      tableUndoRedo={tableUndoRedo}
      hiddenColSet={hiddenColSet}
      setColumnHidden={setColumnHidden}
      setAllColumnsHidden={setAllColumnsHidden}
      onViewportClientWidthChange={setTableViewportClientWidth}
      onCellSelectionStore={onCellSelectionStore}
      enablePagination={enablePagination}
      paginationCurrent={paginationCurrent}
      paginationPageSize={paginationPageSize}
      onPaginationChange={onPaginationChange}
      enableGrouping={enableGrouping}
      groupingConfig={groupingConfig}
      onGroupingChange={onGroupingChange}
      onGroupExpansionChange={onGroupExpansionChange}
      onInsertRowWithGroupValue={onInsertRowWithGroupValue}
    />
  );

  const frame: React.CSSProperties = {
    boxSizing: 'border-box',
    border: `1px solid ${vcTokens.color.neutral.border.default}`,
    borderRadius: vcTokens.style.borderRadius.lg,
    // 横纵滚统一在 TableRows 内 scrollport，外层避免第二套 overflow 轴
    overflow: 'hidden',
    background: vcTokens.color.neutral.background.container,
  };

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          ...frame,
          width: '100%',
        }}
      >
        {rows}
      </div>
      {enableEditMode && showEditKeyboardHints ? (
        <div style={{ marginTop: 10, paddingLeft: 2, paddingRight: 2 }}>
          <Typography.Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
            编辑快捷键
          </Typography.Text>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: 12,
              color: vcTokens.color.neutral.text.description,
              lineHeight: 1.55,
            }}
          >
            {V_TABLE_EDIT_KEYBOARD_HINT_LINES.map((line) => (
              <li key={line} style={{ marginBottom: 4 }}>
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export { TableAreaConfigPanel } from './TableAreaDemoShell';
