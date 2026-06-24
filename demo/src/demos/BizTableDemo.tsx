import React, { useRef, useState } from 'react';
import { Button, Dropdown, InputNumber, Switch, Typography, vcTokens } from 'vc-design';
import {
  TableAreaTableInstance,
  useTableAreaDemoState,
  useTableBodyScrollMaxHeight,
} from 'vc-biz';
import { TableFieldConfigPanel, TableColumnEditModePanel } from 'vc-biz';

const sectionBox: React.CSSProperties = {
  background: vcTokens.color.neutral.background.layout,
  borderRadius: vcTokens.style.borderRadius.lg,
  padding: 24,
};

const GRID_MIN = 2;
const GRID_MAX_COL = 40;
const GRID_MAX_ROW = 1001;

export default function BizTableDemo() {
  const { hostRef, bodyScrollMaxHeight } = useTableBodyScrollMaxHeight({
    borderFudgePx: 34,
  });
  const demo = useTableAreaDemoState({
    bodyScrollMaxHeight,
    showEditKeyboardHints: false,
  });

  const [fieldConfigOpen, setFieldConfigOpen] = useState(false);
  const [editModeConfigOpen, setEditModeConfigOpen] = useState(false);
  const [rowCountConfigOpen, setRowCountConfigOpen] = useState(false);
  const [tableConfigOpen, setTableConfigOpen] = useState(false);
  const fieldConfigTriggerRef = useRef<HTMLSpanElement>(null);
  const editModeConfigTriggerRef = useRef<HTMLSpanElement>(null);
  const rowCountTriggerRef = useRef<HTMLSpanElement>(null);
  const tableConfigTriggerRef = useRef<HTMLSpanElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    importExcelFromFile,
    colCount,
    setColCount,
    rowCount,
    setRowCount,
    valueByCell,
    hiddenColSet,
    setColumnHidden,
    enableFreezeLastCol,
    enableColumnResize,
    setEnableColumnResize,
    enableVerticalCenter,
    setEnableVerticalCenter,
    enableFreezeFirstCol,
    setEnableFreezeFirstCol,
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
    disabledEditColSet,
    setColumnEditDisabled,
    // 保存/恢复功能
    saveTableData,
    resetToInitial,
    hasSavedData,
  } = demo;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
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
          gap: 8,
          ...sectionBox,
          padding: '12px 24px',
        }}
      >
        <h1 style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>VTable 表格区</h1>
        <Dropdown
          trigger={['click']}
          open={tableConfigOpen}
          onOpenChange={setTableConfigOpen}
          placement="bottomLeft"
          popupRender={() => (
            <div
              style={{
                background: '#fff',
                borderRadius: 8,
                padding: 12,
                boxShadow: vcTokens.style.boxShadowSecondary,
                maxWidth: 280,
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>拖拽列宽</Typography.Text>
                <Switch size="small" checked={enableColumnResize} onChange={setEnableColumnResize} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>垂直居中</Typography.Text>
                <Switch size="small" checked={enableVerticalCenter} onChange={setEnableVerticalCenter} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>冻结首列</Typography.Text>
                <Switch size="small" checked={enableFreezeFirstCol} onChange={setEnableFreezeFirstCol} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>冻结末列</Typography.Text>
                <Switch size="small" checked={enableFreezeLastCol} onChange={setEnableFreezeLastCol} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>冻结末行</Typography.Text>
                <Switch size="small" checked={enableFreezeLastRow} onChange={setEnableFreezeLastRow} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>右侧描边</Typography.Text>
                <Switch size="small" checked={enableBodyCellRightBorder} onChange={setEnableBodyCellRightBorder} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>显示序号</Typography.Text>
                <Switch size="small" checked={enableShowRowIndex} onChange={setEnableShowRowIndex} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>插入行列</Typography.Text>
                <Switch size="small" checked={enableInsertRowCol} onChange={setEnableInsertRowCol} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>编辑模式</Typography.Text>
                <Switch size="small" checked={enableEditMode} onChange={setEnableEditMode} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>常规字号</Typography.Text>
                <Switch size="small" checked={enableRegularTableFont} onChange={setEnableRegularTableFont} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>批量选择</Typography.Text>
                <Switch size="small" checked={enableBatchSelection} onChange={setEnableBatchSelection} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>显示分页</Typography.Text>
                <Switch size="small" checked={enablePagination} onChange={setEnablePagination} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Typography.Text style={{ fontSize: 12 }}>支持分组</Typography.Text>
                <Switch size="small" checked={enableGrouping} onChange={setEnableGrouping} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Typography.Text style={{ fontSize: 12 }}>模拟数据</Typography.Text>
                <Switch size="small" checked={demo.enableMockData} onChange={demo.setEnableMockData} />
              </div>
            </div>
          )}
        >
          <span ref={tableConfigTriggerRef} style={{ display: 'inline-flex' }}>
            <Button type="default" onClick={(e) => e.preventDefault()}>
              表格配置
            </Button>
          </span>
        </Dropdown>
        <Button type="default" onClick={() => fileInputRef.current?.click()}>
          导入数据
        </Button>
        <Dropdown
          trigger={['click']}
          open={fieldConfigOpen}
          onOpenChange={setFieldConfigOpen}
          overlayClassName="vc-biz-table-field-config-dropdown"
          placement="bottomLeft"
          popupRender={() => (
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
            <Button type="default" onClick={(e) => e.preventDefault()}>
              显示/隐藏列
            </Button>
          </span>
        </Dropdown>
        <Dropdown
          trigger={['click']}
          open={editModeConfigOpen}
          onOpenChange={setEditModeConfigOpen}
          overlayClassName="vc-biz-table-field-config-dropdown"
          placement="bottomLeft"
          popupRender={() => (
            <TableColumnEditModePanel
              open={editModeConfigOpen}
              triggerRef={editModeConfigTriggerRef}
              colCount={colCount}
              valueByCell={valueByCell}
              disabledEditColSet={disabledEditColSet}
              setColumnEditDisabled={setColumnEditDisabled}
            />
          )}
        >
          <span ref={editModeConfigTriggerRef} style={{ display: 'inline-flex' }}>
            <Button type="default" onClick={(e) => e.preventDefault()}>
              编辑模式
            </Button>
          </span>
        </Dropdown>
        <Dropdown
          trigger={['click']}
          open={rowCountConfigOpen}
          onOpenChange={setRowCountConfigOpen}
          placement="bottomLeft"
          popupRender={() => (
            <div
              style={{
                background: '#fff',
                borderRadius: 8,
                padding: 12,
                boxShadow: vcTokens.style.boxShadowSecondary,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>列数</span>
                <InputNumber
                  min={GRID_MIN}
                  max={GRID_MAX_COL}
                  step={1}
                  value={colCount}
                  onChange={(v) => setColCount(v ?? GRID_MIN)}
                  size="small"
                  style={{ width: 80 }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>行数</span>
                <InputNumber
                  min={GRID_MIN}
                  max={GRID_MAX_ROW}
                  step={1}
                  value={rowCount}
                  onChange={(v) => setRowCount(v ?? GRID_MIN)}
                  size="small"
                  style={{ width: 80 }}
                />
              </div>
            </div>
          )}
        >
          <span ref={rowCountTriggerRef} style={{ display: 'inline-flex' }}>
            <Button type="default" onClick={(e) => e.preventDefault()}>
              行列数
            </Button>
          </span>
        </Dropdown>
        {/* 占位元素，将右侧按钮推向右边 */}
        <div style={{ flex: 1 }} />
        <Button type="primary" onClick={saveTableData}>
          保存数据
        </Button>
        <Button type="default" onClick={resetToInitial}>
          恢复默认
        </Button>
      </div>

      <div
        ref={hostRef}
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          ...sectionBox,
          padding: 16,
        }}
      >
        <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
          <TableAreaTableInstance {...demo} />
        </div>
      </div>
    </div>
  );
}