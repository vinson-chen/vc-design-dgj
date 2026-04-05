import React, { useMemo, useSyncExternalStore } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { useContextSelector } from 'use-context-selector';
import { Checkbox, Typography, VcIcon, vcTokens } from 'vc-design';
import { useBodyRowSelectionStore } from './bodyRowSelectionStoreContext';
import { BizTableCell } from './BizTableCell';
import TableGridTextCell from './TableGridTextCell';
import { TableGridConfigContext, useTableGridConfigContext } from './tableGridConfigContext';
import { useTableRowHoverStore } from './tableRowHoverStoreContext';
import { getFreezeDividerStyle, getTableRowGridTemplateColumns } from './tableGridLayout';
import type { TableGridStaticConfig } from './tableGridTypes';

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
    | 'minTextColWidth'
    | 'colWidths'
    | 'insertLayoutTextColPx'
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
        colCount: cfg.colCount,
        enableInsertRowCol: cfg.enableInsertRowCol,
        minTextColWidth: cfg.minTextColWidth,
        colWidths: cfg.colWidths,
        insertLayoutTextColPx: cfg.insertLayoutTextColPx,
        enableColumnResize: cfg.enableColumnResize,
      }),
    [
      cfg.narrowWidth,
      cfg.colCount,
      cfg.enableInsertRowCol,
      cfg.minTextColWidth,
      cfg.colWidths,
      cfg.insertLayoutTextColPx,
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

function TableGridHeaderRow() {
  const cfg = useTableGridConfigContext();
  const gridTemplateColumns = useRowGridTemplateColumns();
  const hoverStore = useTableRowHoverStore();
  const hovered = useRowHovered(0);
  const selectionStore = useBodyRowSelectionStore();
  const headerFp = useSyncExternalStore(
    (cb) => selectionStore.subscribeHeader(cb),
    () => selectionStore.getHeaderFingerprint(),
    () => 0
  );
  const headerAllChecked = headerFp === 2;
  const headerIndeterminate = headerFp === 3;

  const displayRowCount = cfg.rowCount + 1;
  const displayColCount = cfg.colCount + (cfg.enableInsertRowCol ? 1 : 0);
  const isLastRow = displayRowCount === 1;

  return (
    <div
      role="row"
      onMouseEnter={(e) => {
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
        <BizTableCell
          variant="thead"
          hovered={hovered}
          hoverByCell
          active={false}
          isLastRow={isLastRow}
          isFrozen={cfg.enableFreezeFirstCol}
          showRightBorder={false}
          contentPaddingX={NARROW_COL_PADDING_X}
          contentPaddingY={cfg.typography.headerCellPaddingY}
          contentAlignX="center"
          contentAlignY="center"
          theadMinHeightPx={cfg.typography.theadCellMinHeightPx}
        >
          <Checkbox
            checked={headerAllChecked}
            indeterminate={headerIndeterminate}
            onChange={(e) => {
              e.stopPropagation();
              selectionStore.toggleAll(e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            style={checkboxInCellStyle(cfg.typography.lineHeightPx)}
          />
        </BizTableCell>
        {cfg.enableFreezeFirstCol ? (
          <span aria-hidden="true" style={getFreezeDividerStyle('right')} />
        ) : null}
      </div>

      {Array.from({ length: displayColCount }).map((__, colIndex) => (
        <TableGridTextCell
          key={`r-0-c-${colIndex}`}
          rowIndex={0}
          colIndex={colIndex}
          bodyRowIndex={-1}
          isHeader
          isLastRow={isLastRow}
          hovered={hovered}
          active={false}
          isInsertRowPlaceholder={false}
        />
      ))}
    </div>
  );
}

function TableGridInsertTailRow({ rowIndex }: { rowIndex: number }) {
  const cfg = useTableGridConfigContext();
  const gridTemplateColumns = useRowGridTemplateColumns();
  const store = useTableRowHoverStore();
  const hovered = useRowHovered(rowIndex);

  const displayRowCount = cfg.rowCount + 1;
  const displayColCount = cfg.colCount + (cfg.enableInsertRowCol ? 1 : 0);
  const isLastRow = true;
  const bodyRowIndex = rowIndex - 1;
  const freezeTailBorder = vcTokens.color.neutral.border.default;
  const freezeTailShellTop =
    cfg.enableFreezeLastRow ? { borderTop: `1px solid ${freezeTailBorder}` } : undefined;

  return (
    <div
      role="row"
      data-vc-biz-table-insert-tail-row=""
      style={{
        ...tableBodyRowGridBase(cfg, gridTemplateColumns),
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        if (isEventFromInsertColPlaceholder(e, cfg.enableInsertRowCol)) {
          store.setHoveredRowIndex(null);
          return;
        }
        store.setHoveredRowIndex(rowIndex);
      }}
      onMouseLeave={() => store.setHoveredRowIndex(null)}
    >
      <div
        style={{
          display: 'flex',
          minWidth: 0,
          alignItems: 'stretch',
          position: cfg.enableFreezeFirstCol ? 'sticky' : undefined,
          left: cfg.enableFreezeFirstCol ? 0 : undefined,
          zIndex: cfg.enableFreezeFirstCol ? 4 : undefined,
          boxSizing: 'border-box',
          ...freezeTailShellTop,
        }}
      >
        <BizTableCell
          variant="tbody"
          hovered={hovered}
          hoverByCell={false}
          active={false}
          isLastRow={isLastRow}
          isFrozen={cfg.enableFreezeFirstCol}
          showRightBorder={false}
          contentPaddingX={NARROW_COL_PADDING_X}
          contentPaddingY={cfg.typography.headerCellPaddingY}
          contentAlignX="center"
          contentAlignY="center"
          theadMinHeightPx={cfg.typography.theadCellMinHeightPx}
          style={{ minHeight: cfg.typography.theadCellMinHeightPx }}
        >
          {cfg.enableInsertRowCol ? (
            <VcIcon
              type="add"
              role="button"
              tabIndex={0}
              aria-hidden={false}
              aria-label="插入行"
              fontSize={16}
              style={{
                color: vcTokens.color.neutral.text.icon,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                lineHeight: 1,
                flexShrink: 0,
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
              onClick={(e) => {
                e.stopPropagation();
                cfg.onInsertRow();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  cfg.onInsertRow();
                }
              }}
            />
          ) : null}
        </BizTableCell>
        {cfg.enableFreezeFirstCol ? (
          <span aria-hidden="true" style={getFreezeDividerStyle('right')} />
        ) : null}
      </div>

      {Array.from({ length: displayColCount }).map((__, colIndex) => (
        <TableGridTextCell
          key={`r-${rowIndex}-c-${colIndex}`}
          rowIndex={rowIndex}
          colIndex={colIndex}
          bodyRowIndex={bodyRowIndex}
          isHeader={false}
          isLastRow={isLastRow}
          hovered={hovered}
          active={false}
          isInsertRowPlaceholder
        />
      ))}
    </div>
  );
}

function TableGridBodyRow({ rowIndex }: { rowIndex: number }) {
  const cfg = useTableGridConfigContext();
  const gridTemplateColumns = useRowGridTemplateColumns();
  const store = useTableRowHoverStore();
  const hovered = useRowHovered(rowIndex);
  const bodyRowIndex = rowIndex - 1;
  const selectionStore = useBodyRowSelectionStore();
  const active = useSyncExternalStore(
    (cb) => selectionStore.subscribeRow(bodyRowIndex, cb),
    () => selectionStore.getRow(bodyRowIndex),
    () => false
  );

  const displayRowCount = cfg.rowCount + 1;
  const displayColCount = cfg.colCount + (cfg.enableInsertRowCol ? 1 : 0);
  const isLastRow = rowIndex === displayRowCount - 1;
  const suppressBottomForFrozenTail =
    cfg.enableFreezeLastRow && rowIndex === cfg.rowCount - 1;

  return (
    <div
      role="row"
      style={{
        ...tableBodyRowGridBase(cfg, gridTemplateColumns),
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        if (isEventFromInsertColPlaceholder(e, cfg.enableInsertRowCol)) {
          store.setHoveredRowIndex(null);
          return;
        }
        store.setHoveredRowIndex(rowIndex);
      }}
      onMouseLeave={() => store.setHoveredRowIndex(null)}
      onClick={(e) => {
        if (cfg.enableEditMode) return;
        selectionStore.applyShiftAwareBodyRowSet(bodyRowIndex, e.shiftKey, !active);
      }}
    >
      <div
        onClick={(e) => {
          if (!cfg.enableEditMode) return;
          e.stopPropagation();
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
        <BizTableCell
          variant="tbody"
          hovered={hovered}
          hoverByCell={false}
          active={active}
          isLastRow={isLastRow}
          isFrozen={cfg.enableFreezeFirstCol}
          suppressBottomBorder={suppressBottomForFrozenTail}
          showRightBorder={
            cfg.enableBodyCellRightBorder && !cfg.enableFreezeFirstCol
          }
          contentPaddingX={NARROW_COL_PADDING_X}
          contentPaddingY={cfg.typography.bodyCellPaddingY}
          contentAlignX="center"
          contentAlignY={!cfg.enableVerticalCenter ? 'flex-start' : 'center'}
        >
          {cfg.enableShowRowIndex && !hovered && !active ? (
            <Typography.Text
              type="secondary"
              style={{
                ...cfg.typography.tableTextStyle,
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
                const shiftKey = !!(e.nativeEvent as MouseEvent | KeyboardEvent).shiftKey;
                selectionStore.applyShiftAwareBodyRowSet(
                  bodyRowIndex,
                  shiftKey,
                  e.target.checked
                );
              }}
              onClick={(e) => e.stopPropagation()}
              style={checkboxInCellStyle(cfg.typography.lineHeightPx)}
            />
          )}
        </BizTableCell>
        {cfg.enableFreezeFirstCol ? (
          <span aria-hidden="true" style={getFreezeDividerStyle('right')} />
        ) : null}
      </div>

      {Array.from({ length: displayColCount }).map((__, colIndex) => (
        <TableGridTextCell
          key={`r-${rowIndex}-c-${colIndex}`}
          rowIndex={rowIndex}
          colIndex={colIndex}
          bodyRowIndex={bodyRowIndex}
          isHeader={false}
          isLastRow={isLastRow}
          hovered={hovered}
          active={active}
          isInsertRowPlaceholder={false}
        />
      ))}
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
