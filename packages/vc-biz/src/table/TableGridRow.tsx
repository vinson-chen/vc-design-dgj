import React, { useMemo, useSyncExternalStore, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { useContextSelector } from 'use-context-selector';
import { Button, Checkbox, Dropdown, Pagination, Typography, VcIcon, vcTokens } from 'vc-design';
import { useBodyRowSelectionStore } from './bodyRowSelectionStoreContext';
import { VTableCell } from './VTableCell';
import TableGridTextCell from './TableGridTextCell';
import { TableGridConfigContext, useTableGridConfigContext } from './tableGridConfigContext';
import { useTableRowHoverStore } from './tableRowHoverStoreContext';
import { getFreezeDividerStyle, getTableRowGridTemplateColumns } from './tableGridLayout';
import type { TableGridStaticConfig } from './tableGridTypes';
import { useTableGridEditingDispatchersRef } from './tableGridEditingContext';

/** 插入行尾统计：SSR 默认值 */
const INSERT_TAIL_STATS_SSR: { total: number; selected: number } = { total: 0, selected: 0 };

/** 插入行尾统计 hook：复用 TableGridTextCell 内逻辑 */
function useInsertTailFooterStats(enabled: boolean) {
  const store = useBodyRowSelectionStore();
  return useSyncExternalStore(
    (cb) => {
      if (!enabled) return () => {};
      const u1 = store.subscribeSelection(cb);
      const u2 = store.subscribeHeader(cb);
      return () => {
        u1();
        u2();
      };
    },
    () => (enabled ? store.getFooterStatsSnapshot() : INSERT_TAIL_STATS_SSR),
    () => INSERT_TAIL_STATS_SSR
  );
}

/** 左侧 checkbox / 序号 / 插入行加号列：收窄列宽，内容水平居中（左右无 padding） */
const NARROW_COL_PADDING_X = 0;

function checkboxInCellStyle(lineHeightPx: number): CSSProperties {
  return {
    margin: 0,
    padding: 0,
    height: lineHeightPx,
    lineHeight: `${lineHeightPx}px`,
  };
}

function isEventFromInsertColPlaceholder(e: MouseEvent<Element>, enableInsertRowCol: boolean) {
  if (!enableInsertRowCol) return false;
  const target = e.target as HTMLElement | null;
  return !!target?.closest('[data-insert-col-placeholder="true"]');
}

function tableBodyRowGridBase(
  cfg: Pick<
    TableGridStaticConfig,
    | 'enableInsertRowCol'
    | 'rowMinWidth'
    | 'bodyVirtualized'
    | 'narrowWidth'
    | 'colCount'
    | 'minResizableTextColWidth'
    | 'colWidths'
    | 'enableColumnResize'
    | 'typography'
  >,
  gridTemplateColumns: string
): CSSProperties {
  const grid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns,
    width: '100%',
    minWidth: cfg.rowMinWidth,
    alignItems: 'stretch',
  };
  if (cfg.bodyVirtualized) return grid;
  const perf: CSSProperties = {
    contentVisibility: 'auto',
    containIntrinsicSize: `auto ${cfg.typography.displayCellMaxHeightPx}px`,
  };
  return { ...perf, ...grid };
}

function useRowGridTemplateColumns(): string {
  const cfg = useTableGridConfigContext();
  return useMemo(
    () =>
      getTableRowGridTemplateColumns({
        narrowWidth: cfg.narrowWidth,
        showNarrowLeadColumn: cfg.narrowLeadWidth > 0,
        colCount: cfg.colCount,
        visibleColIndexes: cfg.visibleColIndexes,
        enableInsertRowCol: cfg.enableInsertRowCol,
        minResizableTextColWidth: cfg.minResizableTextColWidth,
        defaultTextColWidth: cfg.defaultTextColWidth,
        colWidths: cfg.colWidths,
        enableColumnResize: cfg.enableColumnResize,
      }),
    [
      cfg.narrowWidth,
      cfg.narrowLeadWidth,
      cfg.colCount,
      cfg.visibleColIndexes,
      cfg.enableInsertRowCol,
      cfg.minResizableTextColWidth,
      cfg.defaultTextColWidth,
      cfg.colWidths,
      cfg.enableColumnResize,
    ]
  );
}

export type TableGridRowProps = Readonly<{ rowIndex: number }>;

function useRowHovered(rowIndex: number): boolean {
  const store = useTableRowHoverStore();
  return useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot() === rowIndex,
    () => false
  );
}

function isColumnResizeDragging(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('vc-biz-col-resizing');
}

function TableGridHeaderRow() {
  const cfg = useTableGridConfigContext();
  const gridTemplateColumns = useRowGridTemplateColumns();
  const hoverStore = useTableRowHoverStore();
  const hovered = useRowHovered(0);
  const hoverSuppressed = isColumnResizeDragging();
  const rowHovered = !hoverSuppressed && hovered;
  const selectionStore = useBodyRowSelectionStore();

  // 分页模式下使用范围指纹判断当前页全选状态
  const isPaged =
    cfg.enablePagination &&
    cfg.pageBodyRowStart != null &&
    cfg.pageBodyRowEnd != null;

  const headerFp = useSyncExternalStore(
    (cb) => selectionStore.subscribeHeader(cb),
    () =>
      isPaged
        ? selectionStore.getRangeFingerprint(cfg.pageBodyRowStart!, cfg.pageBodyRowEnd!)
        : selectionStore.getHeaderFingerprint(),
    () => 0
  );
  const headerAllChecked = headerFp === 2;
  const headerIndeterminate = headerFp === 3;

  const displayRowCount = cfg.rowCount + 1;
  const visibleTextColCount = cfg.visibleColIndexes.length;
  const displayColCount = visibleTextColCount + (cfg.enableInsertRowCol ? 1 : 0);
  const showNarrowLead = cfg.narrowLeadWidth > 0;
  const showFreezeFirstDivider =
    cfg.enableFreezeFirstCol && visibleTextColCount > 2 && showNarrowLead;
  const isLastRow = displayRowCount === 1;

  return (
    <div
      role="row"
      onMouseEnter={(e) => {
        if (hoverSuppressed) {
          hoverStore.setHoveredRowIndex(null);
          return;
        }
        if (isEventFromInsertColPlaceholder(e, cfg.enableInsertRowCol)) {
          hoverStore.setHoveredRowIndex(null);
          return;
        }
        hoverStore.setHoveredRowIndex(0);
      }}
      onMouseLeave={() => hoverStore.setHoveredRowIndex(null)}
      style={{
        display: 'grid',
        gridTemplateColumns,
        width: '100%',
        minWidth: cfg.rowMinWidth,
        alignItems: 'stretch',
        cursor: 'default',
      }}
    >
      {showNarrowLead ? (
        <div
          style={{
            display: 'flex',
            minWidth: 0,
            alignItems: 'stretch',
            position: cfg.enableFreezeFirstCol ? 'sticky' : undefined,
            left: cfg.enableFreezeFirstCol ? 0 : undefined,
            zIndex: cfg.enableFreezeFirstCol ? 4 : undefined,
            boxSizing: 'border-box',
          }}
        >
          <VTableCell
            variant="thead"
            hovered={rowHovered}
            hoverByCell
            pointerHoverResetNonce={cfg.pointerHoverResetNonce}
            active={false}
            isLastRow={isLastRow}
            isFrozen={cfg.enableFreezeFirstCol}
            showRightBorder={cfg.enableBodyCellRightBorder}
            contentPaddingX={NARROW_COL_PADDING_X}
            contentPaddingY={cfg.typography.headerCellPaddingY}
            contentAlignX="center"
            contentAlignY="center"
            theadMinHeightPx={cfg.typography.theadCellMinHeightPx}
          >
            {cfg.enableBatchSelection ? (
              <Checkbox
                checked={headerAllChecked}
                indeterminate={headerIndeterminate}
                onChange={(e) => {
                  e.stopPropagation();
                  // 分页模式下只全选/取消当前页
                  if (
                    cfg.enablePagination &&
                    cfg.pageBodyRowStart != null &&
                    cfg.pageBodyRowEnd != null
                  ) {
                    selectionStore.toggleAllInRange(
                      e.target.checked,
                      cfg.pageBodyRowStart,
                      cfg.pageBodyRowEnd
                    );
                  } else {
                    selectionStore.toggleAll(e.target.checked);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                style={checkboxInCellStyle(cfg.typography.lineHeightPx)}
              />
            ) : cfg.enableShowRowIndex ? (
              <Typography.Text
                style={{
                  ...cfg.typography.tableTextStyle,
                  color: vcTokens.color.neutral.text.placeholder,
                  whiteSpace: 'nowrap',
                  width: '100%',
                  justifyContent: 'center',
                  userSelect: 'none',
                }}
              >
                #
              </Typography.Text>
            ) : null}
          </VTableCell>
          {showFreezeFirstDivider ? (
            <span aria-hidden="true" style={getFreezeDividerStyle('right')} />
          ) : null}
        </div>
      ) : null}

      {cfg.visibleColIndexes.map((realColIndex, viewColIndex) => (
        <TableGridTextCell
          key={`r-0-c-${realColIndex}`}
          rowIndex={0}
          colIndex={realColIndex}
          viewColIndex={viewColIndex}
          bodyRowIndex={-1}
          isHeader
          isLastRow={isLastRow}
          hovered={rowHovered}
          active={false}
          isInsertRowPlaceholder={false}
        />
      ))}
      {cfg.enableInsertRowCol ? (
        <TableGridTextCell
          key="r-0-c-insert"
          rowIndex={0}
          colIndex={cfg.colCount}
          viewColIndex={displayColCount - 1}
          bodyRowIndex={-1}
          isHeader
          isLastRow={isLastRow}
          hovered={rowHovered}
          active={false}
          isInsertRowPlaceholder={false}
        />
      ) : null}
    </div>
  );
}

function TableGridInsertTailRow({ rowIndex }: { rowIndex: number }) {
  const cfg = useTableGridConfigContext();
  const store = useTableRowHoverStore();
  const hovered = useRowHovered(rowIndex);
  const rowHovered = !isColumnResizeDragging() && hovered;
  const selectionStore = useBodyRowSelectionStore();

  const freezeTailBorder = vcTokens.color.neutral.border.default;
  const freezeTailShellTop =
    cfg.enableFreezeLastRow ? { borderTop: `1px solid ${freezeTailBorder}` } : undefined;

  // 插入行尾统计
  const { total: footerTotal, selected: footerSelected } = useInsertTailFooterStats(true);

  // 统计文本按钮下拉面板状态
  const [statsPanelOpen, setStatsPanelOpen] = useState(false);

  const onAddClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    cfg.onInsertRow();
  };

  // 判断当前页是否已全选
  const currentPageRowCount =
    cfg.pageBodyRowStart != null && cfg.pageBodyRowEnd != null
      ? cfg.pageBodyRowEnd - cfg.pageBodyRowStart + 1
      : 0;
  const isCurrentPageAllSelected =
    cfg.pageBodyRowStart != null &&
    cfg.pageBodyRowEnd != null &&
    selectionStore.getRangeFingerprint(cfg.pageBodyRowStart, cfg.pageBodyRowEnd) === 2;

  // 判断其他页是否有选中（全部选中数 > 当前页行数）
  const hasOtherPageSelected = footerSelected > currentPageRowCount;

  // 判断全部数据是否已全选
  const isAllSelected = selectionStore.getHeaderFingerprint() === 2;

  // 选中当前页数据（切换逻辑）
  const onSelectCurrentPage = () => {
    if (cfg.pageBodyRowStart != null && cfg.pageBodyRowEnd != null) {
      if (isCurrentPageAllSelected && !hasOtherPageSelected) {
        // 已选中当前页，其他页无选中 → 取消当前页选择
        selectionStore.toggleAllInRange(false, cfg.pageBodyRowStart, cfg.pageBodyRowEnd);
      } else {
        // 其他情况（已选中当前页+其他页有选中，或未选中当前页）→ 先取消全部，再选择当前页
        selectionStore.toggleAll(false);
        selectionStore.toggleAllInRange(true, cfg.pageBodyRowStart, cfg.pageBodyRowEnd);
      }
    }
    setStatsPanelOpen(false);
  };

  // 选中全部数据（切换逻辑）
  const onSelectAll = () => {
    if (isAllSelected) {
      // 已选中全部，则取消选择
      selectionStore.toggleAll(false);
    } else {
      // 未选中全部，则选择全部
      selectionStore.toggleAll(true);
    }
    setStatsPanelOpen(false);
  };

  const statsText = footerSelected > 0
    ? `${footerSelected}/${footerTotal} 条数据`
    : `${footerTotal} 条数据`;

  return (
    <div
      role="row"
      data-vc-biz-table-insert-tail-row=""
      style={{
        display: 'flex',
        width: '100%',
        minWidth: 0,
        alignItems: 'stretch',
        cursor: 'default',
      }}
    >
      {/* 区域1：add 按钮区域，宽度与 checkbox 列一致，带右描边，悬停变色 */}
      <div
        onMouseEnter={() => store.setHoveredRowIndex(isColumnResizeDragging() ? null : rowIndex)}
        onMouseLeave={() => store.setHoveredRowIndex(null)}
        onClick={cfg.enableInsertRowCol ? onAddClick : undefined}
        style={{ cursor: cfg.enableInsertRowCol ? 'pointer' : 'default' }}
      >
        <VTableCell
          variant="tbody"
          hovered={rowHovered}
          hoverByCell={false}
          pointerHoverResetNonce={cfg.pointerHoverResetNonce}
          active={false}
          isLastRow
          isFrozen={cfg.enableFreezeFirstCol}
          suppressBottomBorder
          showRightBorder
          contentPaddingX={0}
          contentPaddingY={cfg.typography.headerCellPaddingY}
          contentAlignX="center"
          contentAlignY="center"
          tbodyMinHeightPx={cfg.typography.theadCellMinHeightPx}
          style={{
            width: cfg.narrowLeadWidth > 0 ? cfg.narrowLeadWidth : 40,
            minWidth: cfg.narrowLeadWidth > 0 ? cfg.narrowLeadWidth : 40,
            flexShrink: 0,
            position: cfg.enableFreezeFirstCol ? 'sticky' : undefined,
            left: cfg.enableFreezeFirstCol ? 0 : undefined,
            zIndex: cfg.enableFreezeFirstCol ? 4 : undefined,
            ...freezeTailShellTop,
          }}
        >
        {cfg.enableInsertRowCol ? (
          <VcIcon
            type="add"
            fontSize={16}
            aria-label="插入行"
            style={{
              lineHeight: 1,
              color: vcTokens.color.neutral.text.icon,
            }}
          />
        ) : null}
      </VTableCell>
    </div>

      {/* 区域2：统计文本按钮 + 分页器，不响应悬停变色 */}
      <VTableCell
        variant="tbody"
        hovered={false}
        hoverByCell={false}
        pointerHoverResetNonce={cfg.pointerHoverResetNonce}
        active={false}
        isLastRow
        isFrozen={cfg.enableFreezeFirstCol}
        suppressBottomBorder
        showRightBorder={false}
        contentPaddingX={0}
        contentPaddingY={cfg.typography.headerCellPaddingY}
        contentAlignX="flex-start"
        contentAlignY="center"
        tbodyMinHeightPx={cfg.typography.theadCellMinHeightPx}
        style={{
          flex: 1,
          minWidth: 0,
          ...freezeTailShellTop,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            minWidth: 0,
          }}
        >
          {/* 统计文本按钮：点击展开选择面板 */}
          <Dropdown
            trigger={['click']}
            open={statsPanelOpen}
            onOpenChange={setStatsPanelOpen}
            placement="bottomLeft"
            overlayClassName="vc-biz-table-stats-dropdown"
            dropdownRender={() => (
              <div
                className="vc-biz-table-stats-panel-inner"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="vc-biz-table-stats-panel-scroll">
                  <Button
                    type="text"
                    className="vc-biz-table-stats-panel-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      width: '100%',
                      height: 32,
                      padding: '0 12px',
                      border: 'none',
                      borderRadius: 6,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCurrentPage();
                    }}
                  >
                    <Typography.Text
                      className="vc-biz-table-stats-panel-row-label"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 14,
                        textAlign: 'left',
                      }}
                    >
                      当前页数据
                    </Typography.Text>
                  </Button>
                  <Button
                    type="text"
                    className="vc-biz-table-stats-panel-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      width: '100%',
                      height: 32,
                      padding: '0 12px',
                      border: 'none',
                      borderRadius: 6,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAll();
                    }}
                  >
                    <Typography.Text
                      className="vc-biz-table-stats-panel-row-label"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 14,
                        textAlign: 'left',
                      }}
                    >
                      全部数据
                    </Typography.Text>
                  </Button>
                </div>
              </div>
            )}
          >
            <Button
              type="text"
              size="small"
              aria-live="polite"
              aria-expanded={statsPanelOpen}
              style={{
                marginLeft: cfg.typography.bodyCellPaddingX,
                height: 24,
                minWidth: 24,
                padding: '0 8px',
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              <Typography.Text
                type="secondary"
                style={{
                  ...cfg.typography.tableTextStyle,
                  userSelect: 'none',
                }}
              >
                {statsText}
              </Typography.Text>
              <VcIcon
                type="chevron-down"
                fontSize={16}
                style={{
                  lineHeight: 1,
                  color: vcTokens.color.neutral.text.icon,
                }}
              />
            </Button>
          </Dropdown>

          {/* 分页器：简洁迷你模式，靠右对齐 */}
          {cfg.enablePagination && footerTotal > 0 ? (
            <div
              style={{
                marginLeft: 'auto',
                marginRight: 16,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                height: 24,
              }}
            >
              <Pagination
                simple
                size="small"
                current={cfg.paginationCurrent ?? 1}
                pageSize={cfg.paginationPageSize ?? 20}
                total={footerTotal}
                onChange={(page, pageSize) => {
                  cfg.onPaginationChange?.(page, pageSize);
                  // 翻页后滚动到顶部
                  const scrollport = document.querySelector('.vc-biz-table-scrollport');
                  if (scrollport) scrollport.scrollTop = 0;
                }}
              />
            </div>
          ) : null}
        </div>
      </VTableCell>
    </div>
  );
}

function TableGridBodyRow({ rowIndex }: { rowIndex: number }) {
  const cfg = useTableGridConfigContext();
  const gridTemplateColumns = useRowGridTemplateColumns();
  const store = useTableRowHoverStore();
  const hovered = useRowHovered(rowIndex);
  const hoverSuppressed = isColumnResizeDragging();
  const rowHovered = !hoverSuppressed && hovered;
  const bodyRowIndex = rowIndex - 1;
  const selectionStore = useBodyRowSelectionStore();
  const active = useSyncExternalStore(
    (cb) => selectionStore.subscribeRow(bodyRowIndex, cb),
    () => selectionStore.getRow(bodyRowIndex),
    () => false
  );
  const edRef = useTableGridEditingDispatchersRef();

  const displayRowCount = cfg.rowCount + 1;
  const visibleTextColCount = cfg.visibleColIndexes.length;
  const displayColCount = visibleTextColCount + (cfg.enableInsertRowCol ? 1 : 0);
  const showNarrowLead = cfg.narrowLeadWidth > 0;
  const showFreezeFirstDivider =
    cfg.enableFreezeFirstCol && visibleTextColCount > 2 && showNarrowLead;
  const isLastRow = rowIndex === displayRowCount - 1;
  const suppressBottomForFrozenTail =
    cfg.enableFreezeLastRow && rowIndex === cfg.rowCount - 1;
  // 分页模式下：当前页最后一行隐藏下边框
  const isPaginationPageLastRow =
    cfg.pageBodyRowEnd != null && bodyRowIndex === cfg.pageBodyRowEnd;

  // 有选中列时先取消选中列（选中行、选中列互斥）
  const clearColumnSelectionIfExists = () => {
    const api = edRef.current;
    if (api && api.selectedCells.size > 0) {
      // 检查是否有选中列（key 包含 `-1:` 表示选中列）
      const hasColumnSelection = Array.from(api.selectedCells).some((key) =>
        key.startsWith('-1:')
      );
      if (hasColumnSelection) {
        api.clearSelection();
      }
    }
  };

  return (
    <div
      role="row"
      style={{
        ...tableBodyRowGridBase(cfg, gridTemplateColumns),
        cursor: cfg.enableBatchSelection ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (hoverSuppressed) {
          store.setHoveredRowIndex(null);
          return;
        }
        if (isEventFromInsertColPlaceholder(e, cfg.enableInsertRowCol)) {
          store.setHoveredRowIndex(null);
          return;
        }
        store.setHoveredRowIndex(rowIndex);
      }}
      onMouseLeave={() => store.setHoveredRowIndex(null)}
      onClick={(e) => {
        if (cfg.enableEditMode || !cfg.enableBatchSelection) return;
        // 有选中列时先取消选中列
        clearColumnSelectionIfExists();
        selectionStore.applyShiftAwareBodyRowSet(bodyRowIndex, e.shiftKey, !active);
      }}
    >
      {showNarrowLead ? (
        <div
          onClick={(e) => {
            if (!cfg.enableEditMode || !cfg.enableBatchSelection) return;
            e.stopPropagation();
            // 有选中列时先取消选中列
            clearColumnSelectionIfExists();
            selectionStore.applyShiftAwareBodyRowSet(bodyRowIndex, e.shiftKey, !active);
          }}
          style={{
            display: 'flex',
            minWidth: 0,
            alignItems: 'stretch',
            position: cfg.enableFreezeFirstCol ? 'sticky' : undefined,
            left: cfg.enableFreezeFirstCol ? 0 : undefined,
            zIndex: cfg.enableFreezeFirstCol ? 4 : undefined,
          }}
        >
          <VTableCell
            variant="tbody"
            hovered={rowHovered}
            hoverByCell={false}
            pointerHoverResetNonce={cfg.pointerHoverResetNonce}
            active={cfg.enableBatchSelection ? active : false}
            isLastRow={isLastRow}
            isFrozen={cfg.enableFreezeFirstCol}
            suppressBottomBorder={suppressBottomForFrozenTail || isPaginationPageLastRow}
            showRightBorder={cfg.enableBodyCellRightBorder}
            contentPaddingX={NARROW_COL_PADDING_X}
            contentPaddingY={cfg.typography.bodyCellPaddingY}
            contentAlignX="center"
            contentAlignY={!cfg.enableVerticalCenter ? 'flex-start' : 'center'}
            tbodyMinHeightPx={cfg.typography.theadCellMinHeightPx}
          >
            {cfg.enableBatchSelection ? (
              cfg.enableShowRowIndex && !rowHovered && !active ? (
                <Typography.Text
                  style={{
                    ...cfg.typography.tableTextStyle,
                    color: vcTokens.color.neutral.text.placeholder,
                    whiteSpace: 'nowrap',
                    width: '100%',
                    justifyContent: 'center',
                    userSelect: 'none',
                  }}
                >
                  {bodyRowIndex + 1}
                </Typography.Text>
              ) : (
                <Checkbox
                  checked={active}
                  onChange={(e) => {
                    e.stopPropagation();
                    // 有选中列时先取消选中列
                    clearColumnSelectionIfExists();
                    const shiftKey = (e.nativeEvent as unknown as { shiftKey?: boolean }).shiftKey ?? false;
                    selectionStore.applyShiftAwareBodyRowSet(
                      bodyRowIndex,
                      shiftKey,
                      e.target.checked
                    );
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={checkboxInCellStyle(cfg.typography.lineHeightPx)}
                />
              )
            ) : cfg.enableShowRowIndex ? (
              <Typography.Text
                style={{
                  ...cfg.typography.tableTextStyle,
                  color: vcTokens.color.neutral.text.placeholder,
                  whiteSpace: 'nowrap',
                  width: '100%',
                  justifyContent: 'center',
                  userSelect: 'none',
                }}
              >
                {bodyRowIndex + 1}
              </Typography.Text>
            ) : null}
          </VTableCell>
          {showFreezeFirstDivider ? (
            <span aria-hidden="true" style={getFreezeDividerStyle('right')} />
          ) : null}
        </div>
      ) : null}

      {cfg.visibleColIndexes.map((realColIndex, viewColIndex) => (
        <TableGridTextCell
          key={`r-${rowIndex}-c-${realColIndex}`}
          rowIndex={rowIndex}
          colIndex={realColIndex}
          viewColIndex={viewColIndex}
          bodyRowIndex={bodyRowIndex}
          isHeader={false}
          isLastRow={isLastRow}
          hovered={rowHovered}
          active={active}
          isInsertRowPlaceholder={false}
        />
      ))}
      {cfg.enableInsertRowCol ? (
        <TableGridTextCell
          key={`r-${rowIndex}-c-insert`}
          rowIndex={rowIndex}
          colIndex={cfg.colCount}
          viewColIndex={displayColCount - 1}
          bodyRowIndex={bodyRowIndex}
          isHeader={false}
          isLastRow={isLastRow}
          hovered={rowHovered}
          active={active}
          isInsertRowPlaceholder={false}
        />
      ) : null}
    </div>
  );
}

function TableGridRowInner({ rowIndex }: TableGridRowProps) {
  const rowCount = useContextSelector(TableGridConfigContext, (c) => c!.rowCount);

  if (rowIndex === 0) {
    return <TableGridHeaderRow />;
  }
  if (rowIndex === rowCount) {
    return <TableGridInsertTailRow rowIndex={rowCount} />;
  }
  return <TableGridBodyRow rowIndex={rowIndex} />;
}

export default React.memo(TableGridRowInner);
