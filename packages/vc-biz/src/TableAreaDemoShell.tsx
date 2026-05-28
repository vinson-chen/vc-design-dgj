import React, { useRef, useState } from 'react';
import { Dropdown, Slider, Switch, Typography } from 'vc-design';
import type { TableAreaDemoModel } from './TableArea';
import { GRID_MAX_COL, GRID_MAX_ROW, GRID_MIN } from './tableAreaGridLimits';
import { TableFieldConfigPanel } from './table/TableFieldConfigPanel';

/** Demo 专用：导入 Excel、字段配置、行列滑块与表格行为开关（不含表格实例本身） */
export function TableAreaConfigPanel(model: TableAreaDemoModel) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fieldConfigTriggerRef = useRef<HTMLSpanElement>(null);
  const [fieldConfigOpen, setFieldConfigOpen] = useState(false);
  const {
    importExcelFromFile,
    colCount,
    setColCount,
    valueByCell,
    hiddenColSet,
    setColumnHidden,
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
      <div style={{ marginBottom: 12 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) void importExcelFromFile(f);
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 8,
          }}
        >
          <Typography.Link
            style={{ fontSize: 12 }}
            onClick={() => fileInputRef.current?.click()}
          >
            导入数据
          </Typography.Link>
          <Dropdown
            trigger={['click']}
            open={fieldConfigOpen}
            onOpenChange={setFieldConfigOpen}
            overlayClassName="vc-biz-table-field-config-dropdown"
            placement="bottomLeft"
            dropdownRender={() => (
              <TableFieldConfigPanel
                open={fieldConfigOpen}
                triggerRef={fieldConfigTriggerRef}
                colCount={colCount}
                valueByCell={valueByCell}
                hiddenColSet={hiddenColSet}
                setColumnHidden={setColumnHidden}
                enableFreezeLastCol={enableFreezeLastCol}
              />
            )}
          >
            <span ref={fieldConfigTriggerRef} style={{ display: 'inline-flex' }}>
              <Typography.Link style={{ fontSize: 12 }} onClick={(e) => e.preventDefault()}>
                字段配置
              </Typography.Link>
            </span>
          </Dropdown>
        </div>
      </div>
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
        </div>
      </div>
    </div>
  );
}
