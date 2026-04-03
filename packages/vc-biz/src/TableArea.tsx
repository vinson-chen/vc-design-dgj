import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Slider, Switch, Typography, vcTokens } from 'vc-design';
import { useColumnResize, useRowSelection } from './table/useTableGridState';
import TableRows from './table/TableRows';

const GRID_MIN = 2;
const GRID_MAX = 20;
const MIN_TEXT_COL_W = 100;
const NARROW_W = 40; // 左侧 checkbox 窄格
/** 开启「插入行列」时：文本列固定默认宽度（不等分总宽）；插入列/checkbox 列仍为 NARROW_W */
const INSERT_MODE_TEXT_COL_PX = 160;

export function useTableAreaDemoState() {
  const [rowCount, setRowCount] = useState(20);
  const [colCount, setColCount] = useState(10);
  const [enableColumnResize, setEnableColumnResize] = useState(true);
  const [enableVerticalCenter, setEnableVerticalCenter] = useState(true);
  const [enableFreezeFirstCol, setEnableFreezeFirstCol] = useState(false);
  const [enableFreezeLastCol, setEnableFreezeLastCol] = useState(false);
  const [enableBodyCellRightBorder, setEnableBodyCellRightBorder] = useState(false);
  const [enableShowRowIndex, setEnableShowRowIndex] = useState(false);
  const [enableInsertRowCol, setEnableInsertRowCol] = useState(false);
  const [enableEditMode, setEnableEditMode] = useState(false);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  const colCountRef = useRef(colCount);
  const rowCountRef = useRef(rowCount);
  colCountRef.current = colCount;
  rowCountRef.current = rowCount;

  const { colWidths, onColumnResizeStart, removeColumnWidthAt } = useColumnResize(GRID_MAX, MIN_TEXT_COL_W);
  const bodyRowCount = Math.max(0, rowCount - 1);
  const {
    checkedByBodyRow,
    setCheckedByBodyRow,
    headerAllChecked,
    headerIndeterminate,
    toggleAllHeader,
  } = useRowSelection(bodyRowCount);

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
    setRowCount((prev) => Math.min(GRID_MAX, prev + 1));
  }, []);

  const insertColumn = useCallback(() => {
    setColCount((prev) => Math.min(GRID_MAX, prev + 1));
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
    setRowCount((r) => r - 1);
    setCheckedByBodyRow((prev) => {
      const next: Record<number, boolean> = {};
      for (const [ks, v] of Object.entries(prev)) {
        const i = Number(ks);
        if (Number.isNaN(i)) continue;
        if (i < bodyRowIndex) next[i] = v;
        else if (i > bodyRowIndex) next[i - 1] = v;
      }
      return next;
    });
  }, []);

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
    enableBodyCellRightBorder,
    setEnableBodyCellRightBorder,
    enableShowRowIndex,
    setEnableShowRowIndex,
    enableInsertRowCol,
    setEnableInsertRowCol,
    enableEditMode,
    setEnableEditMode,
    insertRow,
    insertColumn,
    deleteColumn,
    deleteBodyRow,
    hoveredRowIndex,
    setHoveredRowIndex,
    checkedByBodyRow,
    setCheckedByBodyRow,
    headerAllChecked,
    headerIndeterminate,
    toggleAllHeader,
    colWidths,
    onColumnResizeStart,
    rowMinWidth,
    narrowWidth: NARROW_W,
    minTextColWidth: MIN_TEXT_COL_W,
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
    enableBodyCellRightBorder,
    setEnableBodyCellRightBorder,
    enableShowRowIndex,
    setEnableShowRowIndex,
    enableInsertRowCol,
    setEnableInsertRowCol,
    enableEditMode,
    setEnableEditMode,
  } = model;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>列数（文本列） {colCount}</Typography.Text>
        <Slider
          min={GRID_MIN}
          max={GRID_MAX}
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
          max={GRID_MAX}
          step={1}
          marks={{ 2: '2', 5: '5', 10: '10', 15: '15', 20: '20' }}
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
    enableBodyCellRightBorder,
    enableShowRowIndex,
    enableInsertRowCol,
    enableEditMode,
    hoveredRowIndex,
    setHoveredRowIndex,
    checkedByBodyRow,
    setCheckedByBodyRow,
    headerAllChecked,
    headerIndeterminate,
    toggleAllHeader,
    colWidths,
    onColumnResizeStart,
    insertRow,
    insertColumn,
    deleteColumn,
    deleteBodyRow,
  } = model;

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
      enableBodyCellRightBorder={enableBodyCellRightBorder}
      enableShowRowIndex={enableShowRowIndex}
      enableInsertRowCol={enableInsertRowCol}
      enableEditMode={enableEditMode}
      hoveredRowIndex={hoveredRowIndex}
      setHoveredRowIndex={setHoveredRowIndex}
      checkedByBodyRow={checkedByBodyRow}
      setCheckedByBodyRow={setCheckedByBodyRow}
      headerAllChecked={headerAllChecked}
      headerIndeterminate={headerIndeterminate}
      toggleAllHeader={toggleAllHeader}
      colWidths={colWidths}
      onColumnResizeStart={onColumnResizeStart}
      onInsertRow={insertRow}
      onInsertColumn={insertColumn}
      insertLayoutTextColPx={enableInsertRowCol ? INSERT_MODE_TEXT_COL_PX : null}
      gridMinCount={GRID_MIN}
      onDeleteColumn={deleteColumn}
      onDeleteBodyRow={deleteBodyRow}
    />
  );

  const frame: React.CSSProperties = {
    boxSizing: 'border-box',
    border: `1px solid ${vcTokens.color.neutral.border.default}`,
    borderRadius: vcTokens.style.borderRadius.md,
    overflowX: 'auto',
    background: vcTokens.color.neutral.background.container,
  };

  return (
    <div
      style={{
        ...frame,
        ...(enableInsertRowCol
          ? {
              display: 'inline-block',
              verticalAlign: 'top',
              maxWidth: '100%',
            }
          : { width: '100%' }),
      }}
    >
      {enableInsertRowCol ? (
        <div style={{ width: 'max-content', minWidth: rowMinWidth, boxSizing: 'border-box' }}>{rows}</div>
      ) : (
        rows
      )}
    </div>
  );
}
