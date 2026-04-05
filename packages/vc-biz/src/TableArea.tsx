import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Slider, Switch, Typography, vcTokens } from 'vc-design';
import { BodyRowSelectionStore } from './table/bodyRowSelectionStore';
import { BIZ_TABLE_EDIT_KEYBOARD_HINT_LINES } from './table/tableEditKeyboardHelp';
import { useColumnResize } from './table/useTableGridState';
import TableRows from './table/TableRows';

const GRID_MIN = 2;
/** 文本列（含表头行内的列数）上限 */
const GRID_MAX_COL = 20;
/** 表格行数（含表头）上限（1001 行时可显示表体序号至 1000） */
const GRID_MAX_ROW = 1001;
const MIN_TEXT_COL_W = 100;
/** checkbox / 序号 / 插入列等窄格统一宽度（与 padding 0 下四位序号对齐，避免开关「显示序号」时列宽抖动） */
const NARROW_W = 40;
/** 开启「插入行列」时：文本列固定默认宽度（不等分总宽）；插入列/checkbox 列仍为 NARROW_W */
const INSERT_MODE_TEXT_COL_PX = 160;

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
  initialEnableInsertRowCol?: boolean;
  initialEnableEditMode?: boolean;
  /** 常规字号（14/22）；默认 true；false 为紧凑 12/20 */
  initialEnableRegularTableFont?: boolean;
  /** 与 TableRows 一致：header-{c} / r-c */
  initialValueByCell?: Record<string, string>;
  /** 表格可视区高度（px），启用垂直虚拟滚动（表头为虚拟第 0 行并 sticky）；缺省 520；传 0 则全量挂载 */
  bodyScrollMaxHeight?: number;
  /** 为 true 时由 TableAreaTableInstance / BizTable 在表格外展示编辑模式快捷键说明 */
  showEditKeyboardHints?: boolean;
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
    options?.initialEnableFreezeLastCol ?? true
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
  const [enableInsertRowCol, setEnableInsertRowCol] = useState(
    options?.initialEnableInsertRowCol ?? true
  );
  const [enableEditMode, setEnableEditMode] = useState(
    options?.initialEnableEditMode ?? true
  );
  const [enableRegularTableFont, setEnableRegularTableFont] = useState(
    options?.initialEnableRegularTableFont ?? true
  );
  const [valueByCell, setValueByCell] = useState<Record<string, string>>(() => ({
    ...(options?.initialValueByCell ?? {}),
  }));

  const colCountRef = useRef(colCount);
  const rowCountRef = useRef(rowCount);
  colCountRef.current = colCount;
  rowCountRef.current = rowCount;

  const { colWidths, onColumnResizeStart, removeColumnWidthAt } = useColumnResize(GRID_MAX_COL, MIN_TEXT_COL_W);
  const bodyRowSelectionStoreRef = useRef<BodyRowSelectionStore | null>(null);
  if (bodyRowSelectionStoreRef.current == null) {
    bodyRowSelectionStoreRef.current = new BodyRowSelectionStore();
  }
  const bodyRowSelectionStore = bodyRowSelectionStoreRef.current;

  useLayoutEffect(() => {
    bodyRowSelectionStore.setBodyRowCount(Math.max(0, rowCount - 1));
  }, [bodyRowSelectionStore, rowCount]);

  const rowMinWidth = useMemo(() => {
    if (!enableInsertRowCol) {
      return NARROW_W + colCount * MIN_TEXT_COL_W;
    }
    let textCols = 0;
    for (let i = 0; i < colCount; i += 1) {
      const w =
        enableColumnResize && colWidths[i] != null
          ? colWidths[i]!
          : INSERT_MODE_TEXT_COL_PX;
      textCols += w;
    }
    return NARROW_W + textCols + NARROW_W;
  }, [colCount, colWidths, enableColumnResize, enableInsertRowCol]);

  const insertRow = useCallback(() => {
    setRowCount((prev) => Math.min(GRID_MAX_ROW, prev + 1));
  }, []);

  const insertColumn = useCallback(() => {
    setColCount((prev) => Math.min(GRID_MAX_COL, prev + 1));
  }, []);

  const deleteColumn = useCallback(
    (colIndex: number) => {
      if (colCountRef.current <= GRID_MIN) return;
      removeColumnWidthAt(colIndex);
      setColCount((c) => c - 1);
    },
    [removeColumnWidthAt]
  );

  const deleteBodyRow = useCallback((bodyRowIndex: number) => {
    if (rowCountRef.current <= GRID_MIN) return;
    bodyRowSelectionStore.remapAfterDeleteBodyRow(bodyRowIndex);
    setRowCount((r) => r - 1);
  }, [bodyRowSelectionStore]);

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
    minTextColWidth: MIN_TEXT_COL_W,
    valueByCell,
    setValueByCell,
    bodyScrollMaxHeight,
    showEditKeyboardHints,
  };
}

export type TableAreaDemoModel = ReturnType<typeof useTableAreaDemoState>;

export function TableAreaConfigPanel(model: TableAreaDemoModel) {
  const {
    colCount,
    setColCount,
    rowCount,
    setRowCount,
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
    enableInsertRowCol,
    setEnableInsertRowCol,
    enableEditMode,
    setEnableEditMode,
    enableRegularTableFont,
    setEnableRegularTableFont,
  } = model;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>列数（文本列） {colCount}</Typography.Text>
        <Slider
          min={GRID_MIN}
          max={GRID_MAX_COL}
          step={1}
          marks={{ 2: '2', 5: '5', 10: '10', 15: '15', 20: '20' }}
          value={colCount}
          onChange={(v) => setColCount(v as number)}
          style={{ maxWidth: 360 }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>行数（含表头） {rowCount}</Typography.Text>
        </div>
        <Slider
          min={GRID_MIN}
          max={GRID_MAX_ROW}
          step={1}
          marks={{
            2: '2',
            250: '250',
            500: '500',
            750: '750',
            1001: '1001',
          }}
          value={rowCount}
          onChange={(v) => setRowCount(v as number)}
          style={{ maxWidth: 360 }}
        />
      </div>

      <div style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>拖拽列宽</Typography.Text>
            <Switch size="small" checked={enableColumnResize} onChange={setEnableColumnResize} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>垂直居中</Typography.Text>
            <Switch size="small" checked={enableVerticalCenter} onChange={setEnableVerticalCenter} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>冻结首列</Typography.Text>
            <Switch size="small" checked={enableFreezeFirstCol} onChange={setEnableFreezeFirstCol} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>冻结末列</Typography.Text>
            <Switch size="small" checked={enableFreezeLastCol} onChange={setEnableFreezeLastCol} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>冻结末行</Typography.Text>
            <Switch size="small" checked={enableFreezeLastRow} onChange={setEnableFreezeLastRow} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>右侧描边</Typography.Text>
            <Switch size="small" checked={enableBodyCellRightBorder} onChange={setEnableBodyCellRightBorder} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>显示序号</Typography.Text>
            <Switch size="small" checked={enableShowRowIndex} onChange={setEnableShowRowIndex} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>插入行列</Typography.Text>
            <Switch size="small" checked={enableInsertRowCol} onChange={setEnableInsertRowCol} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>编辑模式</Typography.Text>
            <Switch size="small" checked={enableEditMode} onChange={setEnableEditMode} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>常规字号</Typography.Text>
            <Switch size="small" checked={enableRegularTableFont} onChange={setEnableRegularTableFont} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableAreaTableInstance(model: TableAreaDemoModel) {
  const {
    rowCount,
    colCount,
    rowMinWidth,
    narrowWidth,
    minTextColWidth,
    enableColumnResize,
    enableVerticalCenter,
    enableFreezeFirstCol,
    enableFreezeLastCol,
    enableFreezeLastRow,
    enableBodyCellRightBorder,
    enableShowRowIndex,
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
  } = model;

  const scrollsInsideTable = bodyScrollMaxHeight != null && bodyScrollMaxHeight > 0;
  const tableOuterScrollRef = useRef<HTMLDivElement | null>(null);

  const rows = (
    <TableRows
      rowCount={rowCount}
      colCount={colCount}
      rowMinWidth={rowMinWidth}
      narrowWidth={narrowWidth}
      minTextColWidth={minTextColWidth}
      enableColumnResize={enableColumnResize}
      enableVerticalCenter={enableVerticalCenter}
      enableFreezeFirstCol={enableFreezeFirstCol}
      enableFreezeLastCol={enableFreezeLastCol}
      enableFreezeLastRow={enableFreezeLastRow}
      enableBodyCellRightBorder={enableBodyCellRightBorder}
      enableShowRowIndex={enableShowRowIndex}
      enableInsertRowCol={enableInsertRowCol}
      enableEditMode={enableEditMode}
      enableRegularTableFont={enableRegularTableFont}
      bodyRowSelectionStore={bodyRowSelectionStore}
      colWidths={colWidths}
      onColumnResizeStart={onColumnResizeStart}
      onInsertRow={insertRow}
      onInsertColumn={insertColumn}
      insertLayoutTextColPx={enableInsertRowCol ? INSERT_MODE_TEXT_COL_PX : null}
      gridMinCount={GRID_MIN}
      onDeleteColumn={deleteColumn}
      onDeleteBodyRow={deleteBodyRow}
      valueByCell={valueByCell}
      onValueByCellChange={setValueByCell}
      bodyScrollMaxHeight={bodyScrollMaxHeight > 0 ? bodyScrollMaxHeight : undefined}
      tableOuterScrollRef={scrollsInsideTable ? undefined : tableOuterScrollRef}
    />
  );

  const frame: React.CSSProperties = {
    boxSizing: 'border-box',
    border: `1px solid ${vcTokens.color.neutral.border.default}`,
    borderRadius: vcTokens.style.borderRadius.md,
    // 虚拟列表时横纵滚只在 TableRows 内层：外层再 overflow 会多一条轴、滚轮容易被拆到两层
    ...(scrollsInsideTable
      ? { overflow: 'hidden' }
      : { overflowX: 'auto' }),
    background: vcTokens.color.neutral.background.container,
  };

  return (
    <div style={{ width: '100%' }}>
      <div
        ref={scrollsInsideTable ? undefined : tableOuterScrollRef}
        className={scrollsInsideTable ? undefined : 'vc-biz-table-scrollport'}
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
            {BIZ_TABLE_EDIT_KEYBOARD_HINT_LINES.map((line) => (
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
