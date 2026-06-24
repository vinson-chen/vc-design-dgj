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
import type { InitialImageData } from './table/tableGridTypes';
import { GRID_MAX_COL, GRID_MAX_ROW, GRID_MIN } from './tableAreaGridLimits';
import { generateGroupId, findGroupedColIndex, getHeaderGroupId } from './table/headless/tableGridGroupingId';
const MIN_RESIZABLE_TEXT_COL_W = 100;
const DEFAULT_TEXT_COL_W = 200;
/** checkbox / 序号 / 插入列等窄格统一宽度（与 padding 0 下四位序号对齐，避免开关「显示序号」时列宽抖动） */
const NARROW_W = 40;

/** localStorage key for saved table data */
const TABLE_DATA_STORAGE_KEY = 'vc-biz-table-demo-data';

/** Saved table data structure */
type SavedTableData = {
  // 表格尺寸
  rowCount: number;
  colCount: number;
  // 单元格内容
  valueByCell: Record<string, string>;
  // 列配置
  hiddenColSet: number[];
  disabledEditColSet: number[];
  colWidths: Array<number | null>;
  // 表格配置项
  enableColumnResize: boolean;
  enableVerticalCenter: boolean;
  enableFreezeFirstCol: boolean;
  enableFreezeLastCol: boolean;
  enableFreezeLastRow: boolean;
  enableBodyCellRightBorder: boolean;
  enableShowRowIndex: boolean;
  enableBatchSelection: boolean;
  enableInsertRowCol: boolean;
  enableEditMode: boolean;
  enableRegularTableFont: boolean;
  enablePagination: boolean;
  enableGrouping: boolean;
};

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
  /** 模拟数据：默认关闭 */
  initialEnableMockData?: boolean;
}>;

export function useTableAreaDemoState(options?: TableAreaDemoOptions) {
  const bodyScrollMaxHeight =
    options?.bodyScrollMaxHeight === undefined ? 520 : options.bodyScrollMaxHeight;
  const showEditKeyboardHints = options?.showEditKeyboardHints ?? false;

  // 尝试从 localStorage 加载保存的数据
  const getSavedData = useCallback(() => {
    try {
      const saved = localStorage.getItem(TABLE_DATA_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as SavedTableData;
      }
    } catch {
      // ignore parse errors
    }
    return null;
  }, []);

  const savedData = getSavedData();
  const hasSavedData = savedData !== null;

  const [rowCount, setRowCount] = useState(savedData?.rowCount ?? options?.initialRowCount ?? 20);
  const [colCount, setColCount] = useState(savedData?.colCount ?? options?.initialColCount ?? 10);
  const [enableColumnResize, setEnableColumnResize] = useState(
    savedData?.enableColumnResize ?? options?.initialEnableColumnResize ?? true
  );
  const [enableVerticalCenter, setEnableVerticalCenter] = useState(
    savedData?.enableVerticalCenter ?? options?.initialEnableVerticalCenter ?? true
  );
  const [enableFreezeFirstCol, setEnableFreezeFirstCol] = useState(
    savedData?.enableFreezeFirstCol ?? options?.initialEnableFreezeFirstCol ?? true
  );
  const [enableFreezeLastCol, setEnableFreezeLastCol] = useState(
    savedData?.enableFreezeLastCol ?? options?.initialEnableFreezeLastCol ?? false
  );
  const [enableFreezeLastRow, setEnableFreezeLastRow] = useState(
    savedData?.enableFreezeLastRow ?? options?.initialEnableFreezeLastRow ?? true
  );
  const [enableBodyCellRightBorder, setEnableBodyCellRightBorder] = useState(
    savedData?.enableBodyCellRightBorder ?? options?.initialEnableBodyCellRightBorder ?? true
  );
  const [enableShowRowIndex, setEnableShowRowIndex] = useState(
    savedData?.enableShowRowIndex ?? options?.initialEnableShowRowIndex ?? true
  );
  const [enableBatchSelection, setEnableBatchSelection] = useState(
    savedData?.enableBatchSelection ?? options?.initialEnableBatchSelection ?? true
  );
  const [enableInsertRowCol, setEnableInsertRowCol] = useState(
    savedData?.enableInsertRowCol ?? options?.initialEnableInsertRowCol ?? true
  );
  const [enableEditMode, setEnableEditMode] = useState(
    savedData?.enableEditMode ?? options?.initialEnableEditMode ?? true
  );
  const [enableRegularTableFont, setEnableRegularTableFont] = useState(
    savedData?.enableRegularTableFont ?? options?.initialEnableRegularTableFont ?? true
  );
  const [valueByCell, setValueByCellBase] = useState<Record<string, string>>(() => ({
    ...(savedData?.valueByCell ?? options?.initialValueByCell ?? {}),
  }));
  const [hiddenColSet, setHiddenColSet] = useState<Set<number>>(() =>
    new Set(savedData?.hiddenColSet ?? [])
  );
  const [disabledEditColSet, setDisabledEditColSet] = useState<Set<number>>(() =>
    new Set(savedData?.disabledEditColSet ?? [])
  );
  const [undoRedoNonce, setUndoRedoNonce] = useState(0);
  // 表格重置 nonce：用于强制重新挂载 TableRows，彻底清空所有内部状态
  const [tableResetNonce, setTableResetNonce] = useState(0);
  const [tableViewportClientWidth, setTableViewportClientWidth] = useState<number>(0);

  // 分页状态
  const [enablePagination, setEnablePagination] = useState(
    savedData?.enablePagination ?? options?.initialEnablePagination ?? true
  );
  const [paginationCurrent, setPaginationCurrent] = useState(
    options?.initialPaginationCurrent ?? 1
  );
  const [paginationPageSize, setPaginationPageSize] = useState(
    options?.initialPaginationPageSize ?? 50
  );

  // 分组状态
  const [enableGrouping, setEnableGrouping] = useState(
    savedData?.enableGrouping ?? options?.initialEnableGrouping ?? true
  );
  const [groupedColId, setGroupedColId] = useState<string | undefined>(undefined);
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(() => new Set());

  // 模拟数据状态
  const [enableMockData, setEnableMockData] = useState(
    options?.initialEnableMockData ?? false
  );
  // 多字段数据状态（用于传递给 TableRows）
  const [initialMultiFieldData, setInitialMultiFieldData] = useState<
    import('./table/tableGridTypes').InitialMultiFieldData | undefined
  >(undefined);
  // 图片列数据状态（用于传递给 TableRows）
  const [initialImageData, setInitialImageData] = useState<InitialImageData | undefined>(undefined);

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
    getResizeMaxWidthForColumn,
    savedData?.colWidths
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
    setDisabledEditColSet((prev) => {
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
      setDisabledEditColSet((prev) => {
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
      // 此处仅需处理元数据：列宽、列数、隐藏列集合、不可编辑列集合
      setHiddenColSet((prev) => {
        const next = new Set<number>();
        prev.forEach((idx) => {
          if (idx === colIndex) return;
          next.add(idx > colIndex ? idx - 1 : idx);
        });
        return next;
      });
      setDisabledEditColSet((prev) => {
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

  // 模拟数据：1688采购商品数据（含规格扩展）
  const MOCK_DATA: Record<string, string> = {
    // 表头
    'header-0': '规格名称',
    'header-1': '商品标题',
    'header-2': '宝贝ID',
    'header-3': '宝贝链接',
    'header-4': '图片地址',
    'header-5': '价格',
    'header-6': '类目',
    // 商品1: 打气筒 (4个规格)
    '0-0': '有线款',
    '0-1': '脚踩打气筒自行车用通用高压充气泵电动车摩托车',
    '0-2': '1027654025046',
    '0-3': 'https://detail.1688.com/offer/1027654025046.html',
    '0-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01pH7Jts1VCdcVqpxaF_!!2218707872617-0-cib.310x310.jpg',
    '0-5': '4.99',
    '0-6': '车载充气泵',
    '1-0': '无线款',
    '1-1': '脚踩打气筒自行车用通用高压充气泵电动车摩托车',
    '1-2': '1027654025047',
    '1-3': 'https://detail.1688.com/offer/1027654025046.html',
    '1-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01pH7Jts1VCdcVqpxaF_!!2218707872617-0-cib.310x310.jpg',
    '1-5': '8.99',
    '1-6': '车载充气泵',
    '2-0': '双缸高压款',
    '2-1': '脚踩打气筒自行车用通用高压充气泵电动车摩托车',
    '2-2': '1027654025048',
    '2-3': 'https://detail.1688.com/offer/1027654025046.html',
    '2-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01pH7Jts1VCdcVqpxaF_!!2218707872617-0-cib.310x310.jpg',
    '2-5': '15.99',
    '2-6': '车载充气泵',
    '3-0': '迷你便携款',
    '3-1': '脚踩打气筒自行车用通用高压充气泵电动车摩托车',
    '3-2': '1027654025049',
    '3-3': 'https://detail.1688.com/offer/1027654025046.html',
    '3-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01pH7Jts1VCdcVqpxaF_!!2218707872617-0-cib.310x310.jpg',
    '3-5': '6.99',
    '3-6': '车载充气泵',
    // 商品2: 指甲刀套装 (5个规格)
    '4-0': '5件套',
    '4-1': '现货剪指甲刀套装指甲剪套盒指甲钳修脚工具美容套7件套挖耳勺器',
    '4-2': '986772999967',
    '4-3': 'https://detail.1688.com/offer/986772999967.html',
    '4-4': 'https://cbu01.alicdn.com/img/ibank/O1CN016ke6v92KE37JF8gWC_!!2218421799524-0-cib.310x310.jpg',
    '4-5': '4.98',
    '4-6': '指甲剪、钳、刀',
    '5-0': '7件套',
    '5-1': '现货剪指甲刀套装指甲剪套盒指甲钳修脚工具美容套7件套挖耳勺器',
    '5-2': '986772999968',
    '5-3': 'https://detail.1688.com/offer/986772999967.html',
    '5-4': 'https://cbu01.alicdn.com/img/ibank/O1CN016ke6v92KE37JF8gWC_!!2218421799524-0-cib.310x310.jpg',
    '5-5': '6.98',
    '5-6': '指甲剪、钳、刀',
    '6-0': '10件套豪华款',
    '6-1': '现货剪指甲刀套装指甲剪套盒指甲钳修脚工具美容套7件套挖耳勺器',
    '6-2': '986772999969',
    '6-3': 'https://detail.1688.com/offer/986772999967.html',
    '6-4': 'https://cbu01.alicdn.com/img/ibank/O1CN016ke6v92KE37JF8gWC_!!2218421799524-0-cib.310x310.jpg',
    '6-5': '12.98',
    '6-6': '指甲剪、钳、刀',
    '7-0': '不锈钢款',
    '7-1': '现货剪指甲刀套装指甲剪套盒指甲钳修脚工具美容套7件套挖耳勺器',
    '7-2': '986772999970',
    '7-3': 'https://detail.1688.com/offer/986772999967.html',
    '7-4': 'https://cbu01.alicdn.com/img/ibank/O1CN016ke6v92KE37JF8gWC_!!2218421799524-0-cib.310x310.jpg',
    '7-5': '8.98',
    '7-6': '指甲剪、钳、刀',
    '8-0': '防锈抗菌款',
    '8-1': '现货剪指甲刀套装指甲剪套盒指甲钳修脚工具美容套7件套挖耳勺器',
    '8-2': '986772999971',
    '8-3': 'https://detail.1688.com/offer/986772999967.html',
    '8-4': 'https://cbu01.alicdn.com/img/ibank/O1CN016ke6v92KE37JF8gWC_!!2218421799524-0-cib.310x310.jpg',
    '8-5': '9.98',
    '8-6': '指甲剪、钳、刀',
    // 商品3: 手电筒1 (6个规格)
    '9-0': '单只装',
    '9-1': '新款强光远射手电筒迷你便携小手电户外多功能夹帽灯手电',
    '9-2': '976542280732',
    '9-3': 'https://detail.1688.com/offer/976542280732.html',
    '9-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01RohE3p2KE3BLLfiCl_!!2218421799524-0-cib.310x310.jpg',
    '9-5': '5.01',
    '9-6': '其他夏季电器',
    '10-0': '双只装',
    '10-1': '新款强光远射手电筒迷你便携小手电户外多功能夹帽灯手电',
    '10-2': '976542280733',
    '10-3': 'https://detail.1688.com/offer/976542280732.html',
    '10-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01RohE3p2KE3BLLfiCl_!!2218421799524-0-cib.310x310.jpg',
    '10-5': '9.01',
    '10-6': '其他夏季电器',
    '11-0': '礼盒装',
    '11-1': '新款强光远射手电筒迷你便携小手电户外多功能夹帽灯手电',
    '11-2': '976542280734',
    '11-3': 'https://detail.1688.com/offer/976542280732.html',
    '11-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01RohE3p2KE3BLLfiCl_!!2218421799524-0-cib.310x310.jpg',
    '11-5': '18.01',
    '11-6': '其他夏季电器',
    '12-0': '充电款',
    '12-1': '新款强光远射手电筒迷你便携小手电户外多功能夹帽灯手电',
    '12-2': '976542280735',
    '12-3': 'https://detail.1688.com/offer/976542280732.html',
    '12-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01RohE3p2KE3BLLfiCl_!!2218421799524-0-cib.310x310.jpg',
    '12-5': '12.01',
    '12-6': '其他夏季电器',
    '13-0': '防水款',
    '13-1': '新款强光远射手电筒迷你便携小手电户外多功能夹帽灯手电',
    '13-2': '976542280736',
    '13-3': 'https://detail.1688.com/offer/976542280732.html',
    '13-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01RohE3p2KE3BLLfiCl_!!2218421799524-0-cib.310x310.jpg',
    '13-5': '8.01',
    '13-6': '其他夏季电器',
    '14-0': '战术款',
    '14-1': '新款强光远射手电筒迷你便携小手电户外多功能夹帽灯手电',
    '14-2': '976542280737',
    '14-3': 'https://detail.1688.com/offer/976542280732.html',
    '14-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01RohE3p2KE3BLLfiCl_!!2218421799524-0-cib.310x310.jpg',
    '14-5': '25.01',
    '14-6': '其他夏季电器',
    // 商品4: 打气筒2 (5个规格)
    '15-0': '迷你款',
    '15-1': '打气筒自行车汽车家用多功能高压充气泵电动电动车摩托车篮球便携',
    '15-2': '1030799403770',
    '15-3': 'https://detail.1688.com/offer/1030799403770.html',
    '15-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01LaiDsZ1LEKwRuHDtq_!!2219363761267-0-cib.310x310.jpg',
    '15-5': '5.01',
    '15-6': '打气筒',
    '16-0': '家用款',
    '16-1': '打气筒自行车汽车家用多功能高压充气泵电动电动车摩托车篮球便携',
    '16-2': '1030799403771',
    '16-3': 'https://detail.1688.com/offer/1030799403770.html',
    '16-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01LaiDsZ1LEKwRuHDtq_!!2219363761267-0-cib.310x310.jpg',
    '16-5': '8.01',
    '16-6': '打气筒',
    '17-0': '商用高压款',
    '17-1': '打气筒自行车汽车家用多功能高压充气泵电动电动车摩托车篮球便携',
    '17-2': '1030799403772',
    '17-3': 'https://detail.1688.com/offer/1030799403770.html',
    '17-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01LaiDsZ1LEKwRuHDtq_!!2219363761267-0-cib.310x310.jpg',
    '17-5': '15.01',
    '17-6': '打气筒',
    '18-0': '电动款',
    '18-1': '打气筒自行车汽车家用多功能高压充气泵电动电动车摩托车篮球便携',
    '18-2': '1030799403773',
    '18-3': 'https://detail.1688.com/offer/1030799403770.html',
    '18-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01LaiDsZ1LEKwRuHDtq_!!2219363761267-0-cib.310x310.jpg',
    '18-5': '25.01',
    '18-6': '打气筒',
    '19-0': '静音款',
    '19-1': '打气筒自行车汽车家用多功能高压充气泵电动电动车摩托车篮球便携',
    '19-2': '1030799403774',
    '19-3': 'https://detail.1688.com/offer/1030799403770.html',
    '19-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01LaiDsZ1LEKwRuHDtq_!!2219363761267-0-cib.310x310.jpg',
    '19-5': '18.01',
    '19-6': '打气筒',
    // 商品5: 衣架1 (7个规格)
    '20-0': '10个装',
    '20-1': '10个装防滑无痕衣架简约晾衣服防肩角衣架',
    '20-2': '974110832422',
    '20-3': 'https://detail.1688.com/offer/974110832422.html',
    '20-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01dueH0222LglGjjfTN_!!6000000007104-0-tps-800-800.310x310.jpg',
    '20-5': '5.21',
    '20-6': '衣架',
    '21-0': '20个装',
    '21-1': '10个装防滑无痕衣架简约晾衣服防肩角衣架',
    '21-2': '974110832423',
    '21-3': 'https://detail.1688.com/offer/974110832422.html',
    '21-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01dueH0222LglGjjfTN_!!6000000007104-0-tps-800-800.310x310.jpg',
    '21-5': '9.21',
    '21-6': '衣架',
    '22-0': '50个装',
    '22-1': '10个装防滑无痕衣架简约晾衣服防肩角衣架',
    '22-2': '974110832424',
    '22-3': 'https://detail.1688.com/offer/974110832422.html',
    '22-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01dueH0222LglGjjfTN_!!6000000007104-0-tps-800-800.310x310.jpg',
    '22-5': '20.21',
    '22-6': '衣架',
    '23-0': '加厚款10个',
    '23-1': '10个装防滑无痕衣架简约晾衣服防肩角衣架',
    '23-2': '974110832425',
    '23-3': 'https://detail.1688.com/offer/974110832422.html',
    '23-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01dueH0222LglGjjfTN_!!6000000007104-0-tps-800-800.310x310.jpg',
    '23-5': '7.21',
    '23-6': '衣架',
    '24-0': '防滑款10个',
    '24-1': '10个装防滑无痕衣架简约晾衣服防肩角衣架',
    '24-2': '974110832426',
    '24-3': 'https://detail.1688.com/offer/974110832422.html',
    '24-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01dueH0222LglGjjfTN_!!6000000007104-0-tps-800-800.310x310.jpg',
    '24-5': '6.21',
    '24-6': '衣架',
    '25-0': '彩色款10个',
    '25-1': '10个装防滑无痕衣架简约晾衣服防肩角衣架',
    '25-2': '974110832427',
    '25-3': 'https://detail.1688.com/offer/974110832422.html',
    '25-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01dueH0222LglGjjfTN_!!6000000007104-0-tps-800-800.310x310.jpg',
    '25-5': '8.21',
    '25-6': '衣架',
    '26-0': '豪华款20个',
    '26-1': '10个装防滑无痕衣架简约晾衣服防肩角衣架',
    '26-2': '974110832428',
    '26-3': 'https://detail.1688.com/offer/974110832422.html',
    '26-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01dueH0222LglGjjfTN_!!6000000007104-0-tps-800-800.310x310.jpg',
    '26-5': '15.21',
    '26-6': '衣架',
    // 商品6: 一次性筷子 (6个规格)
    '27-0': '50双装',
    '27-1': '特惠100双一次性筷子方便家用竹筷独立包装商用',
    '27-2': '980059042827',
    '27-3': 'https://detail.1688.com/offer/980059042827.html',
    '27-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01Nmrapb22vPbBsboYx_!!2219389497182-0-cib.310x310.jpg',
    '27-5': '3.01',
    '27-6': '一次性筷子',
    '28-0': '100双装',
    '28-1': '特惠100双一次性筷子方便家用竹筷独立包装商用',
    '28-2': '980059042828',
    '28-3': 'https://detail.1688.com/offer/980059042827.html',
    '28-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01Nmrapb22vPbBsboYx_!!2219389497182-0-cib.310x310.jpg',
    '28-5': '5.01',
    '28-6': '一次性筷子',
    '29-0': '200双装',
    '29-1': '特惠100双一次性筷子方便家用竹筷独立包装商用',
    '29-2': '980059042829',
    '29-3': 'https://detail.1688.com/offer/980059042827.html',
    '29-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01Nmrapb22vPbBsboYx_!!2219389497182-0-cib.310x310.jpg',
    '29-5': '8.01',
    '29-6': '一次性筷子',
    '30-0': '竹制款',
    '30-1': '特惠100双一次性筷子方便家用竹筷独立包装商用',
    '30-2': '980059042830',
    '30-3': 'https://detail.1688.com/offer/980059042827.html',
    '30-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01Nmrapb22vPbBsboYx_!!2219389497182-0-cib.310x310.jpg',
    '30-5': '5.51',
    '30-6': '一次性筷子',
    '31-0': '木制款',
    '31-1': '特惠100双一次性筷子方便家用竹筷独立包装商用',
    '31-2': '980059042831',
    '31-3': 'https://detail.1688.com/offer/980059042827.html',
    '31-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01Nmrapb22vPbBsboYx_!!2219389497182-0-cib.310x310.jpg',
    '31-5': '6.01',
    '31-6': '一次性筷子',
    '32-0': '环保可降解款',
    '32-1': '特惠100双一次性筷子方便家用竹筷独立包装商用',
    '32-2': '980059042832',
    '32-3': 'https://detail.1688.com/offer/980059042827.html',
    '32-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01Nmrapb22vPbBsboYx_!!2219389497182-0-cib.310x310.jpg',
    '32-5': '12.01',
    '32-6': '一次性筷子',
    // 商品7: 手电筒2 (5个规格)
    '33-0': '基础款',
    '33-1': '【商超中文包装+69码可入仓】五档三眼怪超长续航强光手电筒',
    '33-2': '987835582762',
    '33-3': 'https://detail.1688.com/offer/987835582762.html',
    '33-4': 'https://cbu01.alicdn.com/img/ibank/O1CN015rnPyD1VCdYH25GFw_!!2218707872617-0-cib.310x310.jpg',
    '33-5': '5.01',
    '33-6': '手电筒',
    '34-0': '升级款',
    '34-1': '【商超中文包装+69码可入仓】五档三眼怪超长续航强光手电筒',
    '34-2': '987835582763',
    '34-3': 'https://detail.1688.com/offer/987835582762.html',
    '34-4': 'https://cbu01.alicdn.com/img/ibank/O1CN015rnPyD1VCdYH25GFw_!!2218707872617-0-cib.310x310.jpg',
    '34-5': '12.01',
    '34-6': '手电筒',
    '35-0': '防水款',
    '35-1': '【商超中文包装+69码可入仓】五档三眼怪超长续航强光手电筒',
    '35-2': '987835582764',
    '35-3': 'https://detail.1688.com/offer/987835582762.html',
    '35-4': 'https://cbu01.alicdn.com/img/ibank/O1CN015rnPyD1VCdYH25GFw_!!2218707872617-0-cib.310x310.jpg',
    '35-5': '18.01',
    '35-6': '手电筒',
    '36-0': '战术款',
    '36-1': '【商超中文包装+69码可入仓】五档三眼怪超长续航强光手电筒',
    '36-2': '987835582765',
    '36-3': 'https://detail.1688.com/offer/987835582762.html',
    '36-4': 'https://cbu01.alicdn.com/img/ibank/O1CN015rnPyD1VCdYH25GFw_!!2218707872617-0-cib.310x310.jpg',
    '36-5': '25.01',
    '36-6': '手电筒',
    '37-0': '超长续航款',
    '37-1': '【商超中文包装+69码可入仓】五档三眼怪超长续航强光手电筒',
    '37-2': '987835582766',
    '37-3': 'https://detail.1688.com/offer/987835582762.html',
    '37-4': 'https://cbu01.alicdn.com/img/ibank/O1CN015rnPyD1VCdYH25GFw_!!2218707872617-0-cib.310x310.jpg',
    '37-5': '35.01',
    '37-6': '手电筒',
    // 商品8: 衣架2 (6个规格)
    '38-0': '成人款10个',
    '38-1': '衣架家用无痕加粗款成人款衣架子居家防滑晾晒晾衣撑衣服撑子',
    '38-2': '987297583041',
    '38-3': 'https://detail.1688.com/offer/987297583041.html',
    '38-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01GCc68r20DKJu7DCAF_!!2220828846815-0-cib.310x310.jpg',
    '38-5': '5',
    '38-6': '衣架',
    '39-0': '儿童款10个',
    '39-1': '衣架家用无痕加粗款成人款衣架子居家防滑晾晒晾衣撑衣服撑子',
    '39-2': '987297583042',
    '39-3': 'https://detail.1688.com/offer/987297583041.html',
    '39-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01GCc68r20DKJu7DCAF_!!2220828846815-0-cib.310x310.jpg',
    '39-5': '4',
    '39-6': '衣架',
    '40-0': '多功能款',
    '40-1': '衣架家用无痕加粗款成人款衣架子居家防滑晾晒晾衣撑衣服撑子',
    '40-2': '987297583043',
    '40-3': 'https://detail.1688.com/offer/987297583041.html',
    '40-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01GCc68r20DKJu7DCAF_!!2220828846815-0-cib.310x310.jpg',
    '40-5': '8',
    '40-6': '衣架',
    '41-0': '无痕款',
    '41-1': '衣架家用无痕加粗款成人款衣架子居家防滑晾晒晾衣撑衣服撑子',
    '41-2': '987297583044',
    '41-3': 'https://detail.1688.com/offer/987297583041.html',
    '41-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01GCc68r20DKJu7DCAF_!!2220828846815-0-cib.310x310.jpg',
    '41-5': '6',
    '41-6': '衣架',
    '42-0': '浸塑款',
    '42-1': '衣架家用无痕加粗款成人款衣架子居家防滑晾晒晾衣撑衣服撑子',
    '42-2': '987297583045',
    '42-3': 'https://detail.1688.com/offer/987297583041.html',
    '42-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01GCc68r20DKJu7DCAF_!!2220828846815-0-cib.310x310.jpg',
    '42-5': '7',
    '42-6': '衣架',
    '43-0': '豪华套装20个',
    '43-1': '衣架家用无痕加粗款成人款衣架子居家防滑晾晒晾衣撑衣服撑子',
    '43-2': '987297583046',
    '43-3': 'https://detail.1688.com/offer/987297583041.html',
    '43-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01GCc68r20DKJu7DCAF_!!2220828846815-0-cib.310x310.jpg',
    '43-5': '15',
    '43-6': '衣架',
    // 商品9: 泡泡水 (7个规格)
    '44-0': '小瓶100ml',
    '44-1': '泡泡水补充液泡泡枪泡泡机吹泡泡七彩泡泡液浓缩液直销',
    '44-2': '892484974071',
    '44-3': 'https://detail.1688.com/offer/892484974071.html',
    '44-4': 'https://cbu01.alicdn.com/img/ibank/O1CN011UGZ0k1n3clM0NS8q_!!3644355034-0-cib.310x310.jpg',
    '44-5': '4.47',
    '44-6': '泡泡玩具',
    '45-0': '中瓶250ml',
    '45-1': '泡泡水补充液泡泡枪泡泡机吹泡泡七彩泡泡液浓缩液直销',
    '45-2': '892484974072',
    '45-3': 'https://detail.1688.com/offer/892484974071.html',
    '45-4': 'https://cbu01.alicdn.com/img/ibank/O1CN011UGZ0k1n3clM0NS8q_!!3644355034-0-cib.310x310.jpg',
    '45-5': '6.47',
    '45-6': '泡泡玩具',
    '46-0': '大瓶500ml',
    '46-1': '泡泡水补充液泡泡枪泡泡机吹泡泡七彩泡泡液浓缩液直销',
    '46-2': '892484974073',
    '46-3': 'https://detail.1688.com/offer/892484974071.html',
    '46-4': 'https://cbu01.alicdn.com/img/ibank/O1CN011UGZ0k1n3clM0NS8q_!!3644355034-0-cib.310x310.jpg',
    '46-5': '9.47',
    '46-6': '泡泡玩具',
    '47-0': '补充液套装',
    '47-1': '泡泡水补充液泡泡枪泡泡机吹泡泡七彩泡泡液浓缩液直销',
    '47-2': '892484974074',
    '47-3': 'https://detail.1688.com/offer/892484974071.html',
    '47-4': 'https://cbu01.alicdn.com/img/ibank/O1CN011UGZ0k1n3clM0NS8q_!!3644355034-0-cib.310x310.jpg',
    '47-5': '12.47',
    '47-6': '泡泡玩具',
    '48-0': '浓缩液',
    '48-1': '泡泡水补充液泡泡枪泡泡机吹泡泡七彩泡泡液浓缩液直销',
    '48-2': '892484974075',
    '48-3': 'https://detail.1688.com/offer/892484974071.html',
    '48-4': 'https://cbu01.alicdn.com/img/ibank/O1CN011UGZ0k1n3clM0NS8q_!!3644355034-0-cib.310x310.jpg',
    '48-5': '7.47',
    '48-6': '泡泡玩具',
    '49-0': '香薰泡泡液',
    '49-1': '泡泡水补充液泡泡枪泡泡机吹泡泡七彩泡泡液浓缩液直销',
    '49-2': '892484974076',
    '49-3': 'https://detail.1688.com/offer/892484974071.html',
    '49-4': 'https://cbu01.alicdn.com/img/ibank/O1CN011UGZ0k1n3clM0NS8q_!!3644355034-0-cib.310x310.jpg',
    '49-5': '10.47',
    '49-6': '泡泡玩具',
    '50-0': '无毒儿童款',
    '50-1': '泡泡水补充液泡泡枪泡泡机吹泡泡七彩泡泡液浓缩液直销',
    '50-2': '892484974077',
    '50-3': 'https://detail.1688.com/offer/892484974071.html',
    '50-4': 'https://cbu01.alicdn.com/img/ibank/O1CN011UGZ0k1n3clM0NS8q_!!3644355034-0-cib.310x310.jpg',
    '50-5': '11.47',
    '50-6': '泡泡玩具',
    // 商品10: 手提秤 (5个规格)
    '51-0': '1kg量程',
    '51-1': '手提电子秤精准迷你厨房小型便携式吊秤弹簧秤',
    '51-2': '988603973189',
    '51-3': 'https://detail.1688.com/offer/988603973189.html',
    '51-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01qGA7GD1XyqWLxV952_!!2217588662993-0-cib.310x310.jpg',
    '51-5': '5.01',
    '51-6': '手提秤',
    '52-0': '5kg量程',
    '52-1': '手提电子秤精准迷你厨房小型便携式吊秤弹簧秤',
    '52-2': '988603973190',
    '52-3': 'https://detail.1688.com/offer/988603973189.html',
    '52-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01qGA7GD1XyqWLxV952_!!2217588662993-0-cib.310x310.jpg',
    '52-5': '8.01',
    '52-6': '手提秤',
    '53-0': '10kg量程',
    '53-1': '手提电子秤精准迷你厨房小型便携式吊秤弹簧秤',
    '53-2': '988603973191',
    '53-3': 'https://detail.1688.com/offer/988603973189.html',
    '53-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01qGA7GD1XyqWLxV952_!!2217588662993-0-cib.310x310.jpg',
    '53-5': '12.01',
    '53-6': '手提秤',
    '54-0': '精准款0.1g',
    '54-1': '手提电子秤精准迷你厨房小型便携式吊秤弹簧秤',
    '54-2': '988603973192',
    '54-3': 'https://detail.1688.com/offer/988603973189.html',
    '54-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01qGA7GD1XyqWLxV952_!!2217588662993-0-cib.310x310.jpg',
    '54-5': '18.01',
    '54-6': '手提秤',
    '55-0': '背光显示款',
    '55-1': '手提电子秤精准迷你厨房小型便携式吊秤弹簧秤',
    '55-2': '988603973193',
    '55-3': 'https://detail.1688.com/offer/988603973189.html',
    '55-4': 'https://cbu01.alicdn.com/img/ibank/O1CN01qGA7GD1XyqWLxV952_!!2217588662993-0-cib.310x310.jpg',
    '55-5': '10.01',
    '55-6': '手提秤',
  };
  const MOCK_COL_COUNT = 7;
  const MOCK_ROW_COUNT = 57; // 1 header + 56 data rows (10商品 × 平均5.6规格)

  // 多字段配置：商品标题列（列1）配置两个多字段
  const MOCK_MULTI_FIELD_CONFIG: Record<number, import('./table/tableGridTypes').ColumnMultiFieldConfig> = {
    1: { fields: [{ name: '商品简称' }, { name: '商品货号' }] },
  };

  // 商品简称和货号映射（按商品标题）
  const PRODUCT_INFO_MAP: Record<string, { shortName: string; productCode: string }> = {
    '脚踩打气筒自行车用通用高压充气泵电动车摩托车': { shortName: '打气筒', productCode: 'DQT-001' },
    '现货剪指甲刀套装指甲剪套盒指甲钳修脚工具美容套7件套挖耳勺器': { shortName: '指甲刀套装', productCode: 'ZJD-002' },
    '新款强光远射手电筒迷你便携小手电户外多功能夹帽灯手电': { shortName: '手电筒', productCode: 'SDT-003' },
    '打气筒自行车汽车家用多功能高压充气泵电动电动车摩托车篮球便携': { shortName: '打气筒(电动)', productCode: 'DQT-004' },
    '10个装防滑无痕衣架简约晾衣服防肩角衣架': { shortName: '衣架', productCode: 'YJ-005' },
    '特惠100双一次性筷子方便家用竹筷独立包装商用': { shortName: '一次性筷子', productCode: 'YCK-006' },
    '【商超中文包装+69码可入仓】五档三眼怪超长续航强光手电筒': { shortName: '手电筒(三眼怪)', productCode: 'SDT-007' },
    '衣架家用无痕加粗款成人款衣架子居家防滑晾晒晾衣撑衣服撑子': { shortName: '衣架(无痕)', productCode: 'YJ-008' },
    '泡泡水补充液泡泡枪泡泡机吹泡泡七彩泡泡液浓缩液直销': { shortName: '泡泡水', productCode: 'PPW-009' },
    '手提电子秤精准迷你厨房小型便携式吊秤弹簧秤': { shortName: '手提秤', productCode: 'STC-010' },
  };

  // 生成多字段内容（每个商品标题行的多字段值）
  const MOCK_MULTI_FIELD_VALUES: import('./table/tableGridTypes').MultiFieldValueByCell = {};
  for (let r = 0; r < MOCK_ROW_COUNT - 1; r++) {
    const title = MOCK_DATA[`${r}-1`];
    if (title && PRODUCT_INFO_MAP[title]) {
      const info = PRODUCT_INFO_MAP[title];
      MOCK_MULTI_FIELD_VALUES[`${r}-1`] = [
        { name: '商品简称', content: info.shortName },
        { name: '商品货号', content: info.productCode },
      ];
    }
  }

  const loadMockData = useCallback((silent?: boolean) => {
    startBatch();
    try {
      applyColWidthsSnapshot(Array.from({ length: GRID_MAX_COL }, () => null));
      setColCount(MOCK_COL_COUNT);
      setRowCount(MOCK_ROW_COUNT);
      // 关闭垂直居中（图片列需要顶部对齐）
      setEnableVerticalCenter(false);

      // 列重映射：将图片列（原列 4）移到商品标题（原列 1）右侧
      // 原始：0=规格名称, 1=商品标题, 2=宝贝ID, 3=宝贝链接, 4=图片地址, 5=价格, 6=类目
      // 目标：0=规格名称, 1=商品标题, 2=产品图, 3=宝贝ID, 4=宝贝链接, 5=价格, 6=类目
      // 映射：原列 4→新列 2, 原列 2→新列 3, 原列 3→新列 4, 其他不变
      const colRemap: Record<number, number> = { 0: 0, 1: 1, 2: 3, 3: 4, 4: 2, 5: 5, 6: 6 };
      const IMAGE_NEW_COL = 2; // 图片列重映射后的新列号

      const imageUrlsByCell: Record<string, ReadonlyArray<string>> = {};
      const cleanedValueByCell: Record<string, string> = {};

      for (const [key, value] of Object.entries(MOCK_DATA)) {
        // 处理表头
        const headerMatch = key.match(/^header-(\d+)$/);
        if (headerMatch) {
          const oldCol = Number(headerMatch[1]);
          const newCol = colRemap[oldCol] ?? oldCol;
          const newTitle = oldCol === 4 ? '产品图' : value;
          cleanedValueByCell[`header-${newCol}`] = newTitle;
          continue;
        }
        // 处理表体单元格
        const bodyMatch = key.match(/^(\d+)-(\d+)$/);
        if (bodyMatch) {
          const row = bodyMatch[1];
          const oldCol = Number(bodyMatch[2]);
          const newCol = colRemap[oldCol] ?? oldCol;
          const newKey = `${row}-${newCol}`;
          // 图片列的 URL 存入 imageUrlsByCell，不放入文本值
          if (oldCol === 4 && value.startsWith('http')) {
            imageUrlsByCell[newKey] = [value];
          } else {
            cleanedValueByCell[newKey] = value;
          }
          continue;
        }
        // 其他 key 原样保留
        cleanedValueByCell[key] = value;
      }

      setValueByCellBase(cleanedValueByCell);
      setHiddenColSet(new Set());
      setDisabledEditColSet(new Set());
      setUndoRedoNonce((n) => n + 1);
      bodyRowSelectionStore.toggleAll(false);
      // 加载多字段配置和数据
      setInitialMultiFieldData({
        columnMultiFieldConfigByCol: MOCK_MULTI_FIELD_CONFIG,
        multiFieldValueByCell: MOCK_MULTI_FIELD_VALUES,
      });
      // 加载图片列数据
      setInitialImageData({
        columnFieldKindByCol: { [IMAGE_NEW_COL]: 'image' },
        imageUrlsByCell,
      });
    } finally {
      endBatch();
    }
    if (!silent) {
      message.success('已加载模拟数据');
    }
  }, [applyColWidthsSnapshot, bodyRowSelectionStore, endBatch, setEnableVerticalCenter, startBatch]);

  // 重置为初始状态
  const resetToInitial = useCallback((silent?: boolean) => {
    startBatch();
    try {
      applyColWidthsSnapshot(Array.from({ length: GRID_MAX_COL }, () => null));
      setColCount(options?.initialColCount ?? 10);
      setRowCount(options?.initialRowCount ?? 20);
      setValueByCellBase({});
      setHiddenColSet(new Set());
      setDisabledEditColSet(new Set());
      setUndoRedoNonce((n) => n + 1);
      bodyRowSelectionStore.toggleAll(false);
      // 恢复所有配置项为默认值
      setEnableColumnResize(options?.initialEnableColumnResize ?? true);
      setEnableVerticalCenter(options?.initialEnableVerticalCenter ?? true);
      setEnableFreezeFirstCol(options?.initialEnableFreezeFirstCol ?? true);
      setEnableFreezeLastCol(options?.initialEnableFreezeLastCol ?? false);
      setEnableFreezeLastRow(options?.initialEnableFreezeLastRow ?? true);
      setEnableBodyCellRightBorder(options?.initialEnableBodyCellRightBorder ?? true);
      setEnableShowRowIndex(options?.initialEnableShowRowIndex ?? true);
      setEnableBatchSelection(options?.initialEnableBatchSelection ?? true);
      setEnableInsertRowCol(options?.initialEnableInsertRowCol ?? true);
      setEnableEditMode(options?.initialEnableEditMode ?? true);
      setEnableRegularTableFont(options?.initialEnableRegularTableFont ?? true);
      setEnablePagination(options?.initialEnablePagination ?? true);
      setEnableGrouping(options?.initialEnableGrouping ?? true);
      // 重置分组状态
      setGroupedColId(undefined);
      setExpandedGroupKeys(new Set());
      // 清空多字段数据
      setInitialMultiFieldData(undefined);
      // 清空图片列数据
      setInitialImageData(undefined);
      // 强制重新挂载 TableRows，彻底清空内部状态
      setTableResetNonce((n) => n + 1);
      // 清除 localStorage 保存的数据
      localStorage.removeItem(TABLE_DATA_STORAGE_KEY);
    } finally {
      endBatch();
    }
    if (!silent) {
      message.success('已恢复为默认配置');
    }
  }, [applyColWidthsSnapshot, bodyRowSelectionStore, endBatch, setEnableVerticalCenter, startBatch, options?.initialColCount, options?.initialRowCount]);

  // 保存当前数据到 localStorage
  const saveTableData = useCallback(() => {
    const dataToSave: SavedTableData = {
      rowCount: rowCountRef.current,
      colCount: colCountRef.current,
      valueByCell: valueByCellRef.current,
      hiddenColSet: Array.from(hiddenColSet),
      disabledEditColSet: Array.from(disabledEditColSet),
      colWidths: colWidthsRef.current,
      // 表格配置项
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
      enablePagination,
      enableGrouping,
    };
    try {
      localStorage.setItem(TABLE_DATA_STORAGE_KEY, JSON.stringify(dataToSave));
      message.success('数据已保存');
    } catch {
      message.error('保存失败，请检查浏览器存储空间');
    }
  }, [
    hiddenColSet,
    disabledEditColSet,
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
    enablePagination,
    enableGrouping,
  ]);

  // 模拟数据开关状态 ref，用于判断是用户主动切换还是初始加载
  const prevEnableMockDataRef = useRef(enableMockData);

  // 当模拟数据开关变化时，加载或重置数据（仅在用户主动切换时执行）
  useLayoutEffect(() => {
    // 仅在用户主动切换模拟数据开关时才执行（跳过初始加载）
    if (prevEnableMockDataRef.current !== enableMockData) {
      prevEnableMockDataRef.current = enableMockData;
      if (enableMockData) {
        loadMockData(true);
      } else {
        resetToInitial(true);
      }
    }
  }, [enableMockData, loadMockData, resetToInitial]);

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
          setDisabledEditColSet(new Set());
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
    tableResetNonce,
    tableUndoRedo,
    importExcelFromFile,
    // 保存/恢复功能
    saveTableData,
    resetToInitial,
    hasSavedData,
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
    disabledEditColSet,
    setColumnEditDisabled: (colIndex: number, disabled: boolean) => {
      setDisabledEditColSet((prev) => {
        const next = new Set(prev);
        if (disabled) {
          next.add(colIndex);
        } else {
          next.delete(colIndex);
        }
        return next;
      });
    },
    setAllColumnsEditDisabled: (nextDisabledCols: ReadonlySet<number>) => {
      setDisabledEditColSet(new Set(nextDisabledCols));
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
    // 模拟数据
    enableMockData,
    setEnableMockData,
    initialMultiFieldData,
    initialImageData,
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
    onToggleAllGroupExpansion: (expandAll: boolean) => {
      if (expandAll) {
        // 展开所有分组：添加所有 groupValue
        const groupedColIndex = findGroupedColIndex(valueByCellRef.current, groupedColId!, colCount);
        if (groupedColIndex == null) return;
        const allGroupKeys = new Set<string>();
        for (let r = 0; r < rowCountRef.current - 1; r++) {
          const val = valueByCellRef.current[`${r}-${groupedColIndex}`] ?? '';
          allGroupKeys.add(val);
        }
        setExpandedGroupKeys(allGroupKeys);
      } else {
        // 收起所有分组
        setExpandedGroupKeys(new Set());
      }
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
    tableResetNonce,
    tableUndoRedo,
    hiddenColSet,
    setColumnHidden,
    setAllColumnsHidden,
    disabledEditColSet,
    setColumnEditDisabled,
    setAllColumnsEditDisabled,
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
    onToggleAllGroupExpansion,
    onInsertRowWithGroupValue,
    initialMultiFieldData,
    initialImageData,
  } = model;

  const rows = (
    <TableRows
      key={tableResetNonce}
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
      disabledEditColSet={disabledEditColSet}
      setColumnEditDisabled={setColumnEditDisabled}
      setAllColumnsEditDisabled={setAllColumnsEditDisabled}
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
      onToggleAllGroupExpansion={onToggleAllGroupExpansion}
      onInsertRowWithGroupValue={onInsertRowWithGroupValue}
      initialMultiFieldData={initialMultiFieldData}
      initialImageData={initialImageData}
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
