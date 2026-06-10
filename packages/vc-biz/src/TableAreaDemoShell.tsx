import React from 'react';
import { Switch, Typography } from 'vc-design';
import type { TableAreaDemoModel } from './TableArea';

/** Demo 专用：表格行为开关 */
export function TableAreaConfigPanel(model: TableAreaDemoModel) {
  const {
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
    enablePagination,
    setEnablePagination,
    enableGrouping,
    setEnableGrouping,
    enableInsertRowCol,
    setEnableInsertRowCol,
    enableEditMode,
    setEnableEditMode,
    enableRegularTableFont,
    setEnableRegularTableFont,
  } = model;

  return (
    <div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>批量选择</Typography.Text>
            <Switch size="small" checked={enableBatchSelection} onChange={setEnableBatchSelection} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>显示分页</Typography.Text>
            <Switch size="small" checked={enablePagination} onChange={setEnablePagination} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>支持分组</Typography.Text>
            <Switch size="small" checked={enableGrouping} onChange={setEnableGrouping} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ fontSize: 12, marginRight: 8 }}>模拟数据</Typography.Text>
            <Switch size="small" checked={model.enableMockData} onChange={model.setEnableMockData} />
          </div>
        </div>
      </div>
    </div>
  );
}