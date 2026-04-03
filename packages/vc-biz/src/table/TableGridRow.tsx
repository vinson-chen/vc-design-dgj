import React from 'react';
import { Checkbox, VcIcon, Typography, vcTokens } from 'vc-design';
import { BizTableCell } from './BizTableCell';
import TableGridTextCell from './TableGridTextCell';
import { useTableGridConfigContext } from './tableGridConfigContext';
import { tableTextStyle } from './tableGridConstants';

export type TableGridRowProps = Readonly<{ rowIndex: number }>;

export default function TableGridRow({ rowIndex }: TableGridRowProps) {
  const cfg = useTableGridConfigContext();

  const displayRowCount = cfg.rowCount + (cfg.enableInsertRowCol ? 1 : 0);
  const displayColCount = cfg.colCount + (cfg.enableInsertRowCol ? 1 : 0);
  const isInsertRowPlaceholderIndex = (r: number) => cfg.enableInsertRowCol && r === cfg.rowCount;

  const isHeader = rowIndex === 0;
  const isLastRow = rowIndex === displayRowCount - 1;
  const hovered = cfg.hoveredRowIndex === rowIndex;
  const bodyRowIndex = rowIndex - 1;
  const isInsertRowPlaceholder = isInsertRowPlaceholderIndex(rowIndex);
  const active = !isHeader && !isInsertRowPlaceholder && !!cfg.checkedByBodyRow[bodyRowIndex];

  return (
    <div
      role="row"
      onMouseEnter={(e) => {
        const target = e.target as HTMLElement | null;
        const enteredInsertCol =
          cfg.enableInsertRowCol &&
          rowIndex > 0 &&
          !!target?.closest('[data-insert-col-placeholder="true"]');
        if (enteredInsertCol) {
          cfg.setHoveredRowIndex(null);
          return;
        }
        cfg.setHoveredRowIndex(rowIndex);
      }}
      onMouseLeave={() => cfg.setHoveredRowIndex(null)}
      onClick={() => {
        if (cfg.enableEditMode) return;
        if (!isHeader && !isInsertRowPlaceholder) {
          cfg.setCheckedByBodyRow((prev) => ({
            ...prev,
            [bodyRowIndex]: !prev[bodyRowIndex],
          }));
        }
      }}
      style={{
        display: 'flex',
        width: cfg.enableInsertRowCol ? 'max-content' : '100%',
        minWidth: cfg.rowMinWidth,
        alignItems: 'stretch',
        cursor: isHeader || isInsertRowPlaceholder ? 'default' : 'pointer',
      }}
    >
      <div
        onClick={(e) => {
          if (!cfg.enableEditMode) return;
          if (isHeader || isInsertRowPlaceholder) return;
          e.stopPropagation();
          cfg.setCheckedByBodyRow((prev) => ({
            ...prev,
            [bodyRowIndex]: !prev[bodyRowIndex],
          }));
        }}
        style={{
          flex: `0 0 ${cfg.narrowWidth}px`,
          minWidth: cfg.narrowWidth,
          display: 'flex',
          alignItems: 'stretch',
          position: cfg.enableFreezeFirstCol ? 'sticky' : undefined,
          left: cfg.enableFreezeFirstCol ? 0 : undefined,
          zIndex: cfg.enableFreezeFirstCol ? 4 : undefined,
        }}
      >
        <BizTableCell
          variant={isHeader ? 'thead' : 'tbody'}
          hovered={hovered}
          hoverByCell={isHeader}
          active={active}
          isLastRow={isLastRow}
          isFrozen={cfg.enableFreezeFirstCol}
          showRightBorder={
            !isHeader &&
            cfg.enableBodyCellRightBorder &&
            !cfg.enableFreezeFirstCol &&
            !isInsertRowPlaceholder
          }
          contentPaddingY={8}
          contentAlignY={!isHeader && !cfg.enableVerticalCenter ? 'flex-start' : 'center'}
        >
          {isHeader ? (
            <Checkbox
              checked={cfg.headerAllChecked}
              indeterminate={cfg.headerIndeterminate}
              onChange={(e) => {
                e.stopPropagation();
                cfg.toggleAllHeader(e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{ margin: 0, padding: 0, height: 20, lineHeight: '20px' }}
            />
          ) : isInsertRowPlaceholder ? (
            <div
              role="button"
              tabIndex={0}
              style={{ display: 'flex', justifyContent: 'center', width: '100%', cursor: 'pointer' }}
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
            >
              <VcIcon type="add" fontSize={16} style={{ color: vcTokens.color.neutral.text.icon }} />
            </div>
          ) : cfg.enableShowRowIndex && !hovered && !active ? (
            <Typography.Text
              type="secondary"
              style={{
                ...tableTextStyle,
                width: '100%',
                justifyContent: 'center',
                userSelect: 'none',
              }}
            >
              {bodyRowIndex + 1}
            </Typography.Text>
          ) : (
            <Checkbox
              checked={!!cfg.checkedByBodyRow[bodyRowIndex]}
              onChange={(e) => {
                e.stopPropagation();
                cfg.setCheckedByBodyRow((prev) => ({ ...prev, [bodyRowIndex]: e.target.checked }));
              }}
              onClick={(e) => e.stopPropagation()}
              style={{ margin: 0, padding: 0, height: 20, lineHeight: '20px' }}
            />
          )}
        </BizTableCell>
      </div>

      {Array.from({ length: displayColCount }).map((__, colIndex) => (
        <TableGridTextCell
          key={`r-${rowIndex}-c-${colIndex}`}
          rowIndex={rowIndex}
          colIndex={colIndex}
          bodyRowIndex={bodyRowIndex}
          isHeader={isHeader}
          isLastRow={isLastRow}
          hovered={hovered}
          active={active}
          isInsertRowPlaceholder={isInsertRowPlaceholder}
        />
      ))}
    </div>
  );
}
