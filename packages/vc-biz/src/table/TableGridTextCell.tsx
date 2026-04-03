import React, { useMemo } from 'react';
import type { MenuProps } from 'antd';
import { Dropdown, VcIcon, Input, Typography, vcTokens } from 'vc-design';
import { BizTableCell } from './BizTableCell';
import { useTableGridConfigContext } from './tableGridConfigContext';
import { useTableGridEditingContext } from './tableGridEditingContext';
import {
  BODY_CELL_PADDING_X,
  BODY_CELL_PADDING_Y,
  cellKey,
  DISPLAY_CELL_MAX_HEIGHT_PX,
  DISPLAY_TEXT_MAX_HEIGHT_PX,
  EDIT_CELL_EDGE_PADDING,
  EDIT_CELL_MAX_HEIGHT_PX,
  EDIT_TEXTAREA_MAX_ROWS,
  tableTextClampNStyle,
  tableTextStyle,
} from './tableGridConstants';
import { getFreezeDividerStyle, getTextColWrapStyle } from './tableGridLayout';

export type TableGridTextCellProps = Readonly<{
  rowIndex: number;
  colIndex: number;
  bodyRowIndex: number;
  isHeader: boolean;
  isLastRow: boolean;
  hovered: boolean;
  active: boolean;
  isInsertRowPlaceholder: boolean;
}>;

export default function TableGridTextCell({
  rowIndex,
  colIndex,
  bodyRowIndex,
  isHeader,
  isLastRow,
  hovered,
  active,
  isInsertRowPlaceholder,
}: TableGridTextCellProps) {
  const cfg = useTableGridConfigContext();
  const ed = useTableGridEditingContext();

  const insertColWidth = cfg.narrowWidth;
  const isInsertColPlaceholder = cfg.enableInsertRowCol && colIndex === cfg.colCount;
  const isInsertRowTextClickable =
    isInsertRowPlaceholder && !isInsertColPlaceholder && !isHeader && colIndex < cfg.colCount;

  const storedW = cfg.enableColumnResize ? cfg.colWidths[colIndex] ?? null : null;
  const layoutW: number | null =
    cfg.insertLayoutTextColPx != null
      ? storedW != null
        ? storedW
        : cfg.insertLayoutTextColPx
      : storedW;

  const isLastTextColBeforeInsert =
    cfg.enableInsertRowCol && !isHeader && colIndex === cfg.colCount - 1;

  const shouldHideRightBorderForFrozenLastCol =
    cfg.enableFreezeLastCol && !cfg.enableInsertRowCol && colIndex === cfg.colCount - 1;

  const shouldHideRightBorderForLastUnfrozenBeforeFrozenLast =
    cfg.enableFreezeLastCol &&
    cfg.enableBodyCellRightBorder &&
    cfg.colCount >= 2 &&
    colIndex === cfg.colCount - 2;

  const canResizeHeaderTextCol = isHeader && cfg.enableColumnResize && colIndex < cfg.colCount;

  const showTextColRightBorder =
    !isInsertColPlaceholder &&
    !isHeader &&
    !(cfg.enableFreezeFirstCol && colIndex === 0) &&
    (isLastTextColBeforeInsert
      ? true
      : cfg.enableBodyCellRightBorder &&
        !isInsertRowPlaceholder &&
        !shouldHideRightBorderForFrozenLastCol &&
        !shouldHideRightBorderForLastUnfrozenBeforeFrozenLast);

  const isBody = rowIndex > 0;
  const isEditableBodyCell =
    cfg.enableEditMode &&
    isBody &&
    !isInsertRowPlaceholder &&
    colIndex < cfg.colCount &&
    !isInsertColPlaceholder;
  const isEditing =
    isEditableBodyCell &&
    !!ed.editingCell &&
    ed.editingCell.r === bodyRowIndex &&
    ed.editingCell.c === colIndex;
  const key = cellKey(bodyRowIndex, colIndex);
  const displayText = ed.valueByCell[key] ?? `R${bodyRowIndex + 1} C${colIndex + 1}`;
  const cellActive = isInsertColPlaceholder ? false : active;
  const isEditableBodyDisplayCell =
    isBody && !isInsertRowPlaceholder && !isInsertColPlaceholder && colIndex < cfg.colCount;
  const isHoverLocked =
    cfg.enableEditMode &&
    isBody &&
    !isInsertRowPlaceholder &&
    !isInsertColPlaceholder &&
    colIndex < cfg.colCount &&
    ed.hoverLockedCell?.r === bodyRowIndex &&
    ed.hoverLockedCell?.c === colIndex;

  const gridMin = cfg.gridMinCount ?? 2;
  const insertModeHeaderContextMenu =
    cfg.enableInsertRowCol && isHeader && !isInsertColPlaceholder;
  const insertModeBodyContextMenu =
    cfg.enableInsertRowCol &&
    isBody &&
    !isInsertRowPlaceholder &&
    !isInsertColPlaceholder &&
    colIndex < cfg.colCount;

  const contextMenuItems = useMemo((): MenuProps['items'] | undefined => {
    if (insertModeHeaderContextMenu) {
      return [
        {
          key: 'delete-column',
          label: '删除列',
          danger: true,
          disabled: cfg.colCount <= gridMin,
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            cfg.deleteColumnAt(colIndex);
          },
        },
      ];
    }
    if (insertModeBodyContextMenu) {
      return [
        {
          key: 'delete-row',
          label: '删除行',
          danger: true,
          disabled: cfg.rowCount <= gridMin,
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            cfg.deleteBodyRowAt(bodyRowIndex);
          },
        },
      ];
    }
    return undefined;
  }, [
    insertModeHeaderContextMenu,
    insertModeBodyContextMenu,
    cfg.colCount,
    cfg.rowCount,
    cfg.deleteColumnAt,
    cfg.deleteBodyRowAt,
    colIndex,
    bodyRowIndex,
    gridMin,
  ]);

  const freezeDividers = (
    <>
      {cfg.enableFreezeFirstCol && colIndex === 0 ? (
        <span aria-hidden="true" style={getFreezeDividerStyle('right')} />
      ) : null}
      {cfg.enableFreezeLastCol && colIndex === cfg.colCount - 1 ? (
        <span aria-hidden="true" style={getFreezeDividerStyle('left')} />
      ) : null}
    </>
  );

  const tableCell = (
    <BizTableCell
      variant={isHeader ? 'thead' : 'tbody'}
      hovered={isInsertColPlaceholder && !isHeader ? false : hovered || isHoverLocked}
      hoverByCell={isHeader}
      active={cellActive}
      zoom={canResizeHeaderTextCol}
      onColumnResizeStart={canResizeHeaderTextCol ? cfg.onColumnResizeStart(colIndex) : undefined}
      isLastRow={isLastRow}
      suppressBottomBorder={isInsertColPlaceholder && !isHeader}
      isFrozen={
        (cfg.enableFreezeFirstCol && colIndex === 0) ||
        (cfg.enableFreezeLastCol && colIndex === cfg.colCount - 1) ||
        (cfg.enableFreezeLastCol && cfg.enableInsertRowCol && isInsertColPlaceholder)
      }
      showRightBorder={showTextColRightBorder}
      compactVerticalContent={isInsertColPlaceholder && isHeader}
      contentPaddingY={isHeader ? 8 : isEditing ? EDIT_CELL_EDGE_PADDING : BODY_CELL_PADDING_Y}
      contentPaddingX={isHeader ? 12 : isEditing ? EDIT_CELL_EDGE_PADDING : BODY_CELL_PADDING_X}
      contentAlignY={!isHeader && !cfg.enableVerticalCenter ? 'flex-start' : 'center'}
      style={
        isEditing
          ? {
              maxHeight: EDIT_CELL_MAX_HEIGHT_PX,
              overflow: 'hidden',
            }
          : isEditableBodyDisplayCell
            ? {
                maxHeight: DISPLAY_CELL_MAX_HEIGHT_PX,
                overflow: 'hidden',
              }
            : undefined
      }
    >
      {isHeader ? (
        isInsertColPlaceholder ? (
          <VcIcon
            type="add"
            fontSize={16}
            style={{
              color: vcTokens.color.neutral.text.icon,
              lineHeight: 1,
              display: 'block',
              cursor: 'pointer',
            }}
          />
        ) : (
          <Typography.Text style={{ ...tableTextStyle, fontWeight: 500 }}>
            列 {colIndex + 1}
          </Typography.Text>
        )
      ) : isInsertColPlaceholder ? null : isInsertRowPlaceholder ? null : isEditing ? (
        <Input.TextArea
          ref={ed.editTextAreaRef}
          autoFocus={false}
          autoSize={{ minRows: 1, maxRows: EDIT_TEXTAREA_MAX_ROWS }}
          value={ed.editingDraft}
          onChange={(ev) => {
            const v = ev.target.value;
            ed.editingDraftRef.current = v;
            ed.setEditingDraft(v);
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onBlur={() => {
            ed.setValueByCell((prev) => ({ ...prev, [key]: ed.getEditingValueForSave() }));
          }}
          onKeyDown={(e) => {
            const exit = e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey));
            if (!exit) return;
            e.preventDefault();
            ed.setValueByCell((prev) => ({ ...prev, [key]: ed.getEditingValueForSave() }));
            ed.setSelectedCell({ r: bodyRowIndex, c: colIndex });
            ed.setEditingCell(null);
            ed.editingDraftRef.current = '';
            ed.setEditingDraft('');
          }}
          style={{
            width: '100%',
            resize: 'none',
            transition: 'none',
            borderRadius: 0,
          }}
          styles={{
            affixWrapper: {
              transition: 'none',
              borderRadius: 0,
            },
            textarea: {
              fontSize: 12,
              lineHeight: '20px',
              paddingLeft: 8,
              paddingRight: 8,
              boxSizing: 'border-box',
              transition: 'none',
              borderRadius: 0,
            },
          }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minWidth: 0,
            height: '100%',
            justifyContent: cfg.enableVerticalCenter ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              ...tableTextClampNStyle(EDIT_TEXTAREA_MAX_ROWS),
              maxHeight: DISPLAY_TEXT_MAX_HEIGHT_PX,
            }}
          >
            {displayText}
          </div>
        </div>
      )}
    </BizTableCell>
  );

  return (
    <div
      data-insert-col-placeholder={isInsertColPlaceholder && !isHeader ? 'true' : undefined}
      data-hover-lock-cell={isEditableBodyDisplayCell && cfg.enableEditMode ? '' : undefined}
      data-body-row={isEditableBodyDisplayCell ? bodyRowIndex : undefined}
      data-col={isEditableBodyDisplayCell ? colIndex : undefined}
      onClick={(e) => {
        if (!isHeader && isInsertColPlaceholder) {
          e.stopPropagation();
          return;
        }
        if (isHeader && isInsertColPlaceholder) {
          e.stopPropagation();
          cfg.onInsertColumn();
          return;
        }
        if (
          cfg.enableEditMode &&
          isBody &&
          !isInsertRowPlaceholder &&
          !isInsertColPlaceholder &&
          colIndex < cfg.colCount
        ) {
          ed.setHoverLockedCell({ r: bodyRowIndex, c: colIndex });
        }
        if (isEditableBodyCell) {
          e.stopPropagation();
          ed.setSelectedCell(null);
          if (ed.editingCell?.r === bodyRowIndex && ed.editingCell?.c === colIndex) {
            return;
          }
          if (ed.editingCell && (ed.editingCell.r !== bodyRowIndex || ed.editingCell.c !== colIndex)) {
            const prevKey = cellKey(ed.editingCell.r, ed.editingCell.c);
            ed.setValueByCell((v) => ({ ...v, [prevKey]: ed.getEditingValueForSave() }));
          }
          ed.setEditingCell({ r: bodyRowIndex, c: colIndex });
          ed.editingDraftRef.current = displayText;
          ed.setEditingDraft(displayText);
          return;
        }
        if (!isInsertRowTextClickable) return;
        e.stopPropagation();
        cfg.onInsertRow();
      }}
      style={
        isInsertColPlaceholder
          ? {
              flex: `0 0 ${insertColWidth}px`,
              minWidth: insertColWidth,
              display: 'flex',
              position:
                cfg.enableFreezeLastCol && cfg.enableInsertRowCol
                  ? 'sticky'
                  : cfg.enableFreezeFirstCol && colIndex === 0
                    ? 'sticky'
                    : undefined,
              left: cfg.enableFreezeFirstCol && colIndex === 0 ? cfg.narrowWidth : undefined,
              right: cfg.enableFreezeLastCol && cfg.enableInsertRowCol ? 0 : undefined,
              zIndex: cfg.enableFreezeLastCol && cfg.enableInsertRowCol ? 5 : undefined,
              cursor: isHeader ? 'pointer' : 'default',
            }
          : {
              ...getTextColWrapStyle(
                layoutW,
                cfg.minTextColWidth,
                cfg.narrowWidth,
                colIndex,
                cfg.colCount,
                cfg.enableFreezeFirstCol,
                cfg.enableFreezeLastCol,
                cfg.enableInsertRowCol && cfg.enableFreezeLastCol ? cfg.narrowWidth : 0
              ),
              cursor:
                isInsertRowTextClickable || (isHeader && isInsertColPlaceholder)
                  ? 'pointer'
                  : isEditableBodyCell
                    ? 'default'
                    : undefined,
            }
      }
    >
      {contextMenuItems != null ? (
        <Dropdown menu={{ items: contextMenuItems }} trigger={['contextMenu']}>
          <div
            role="presentation"
            style={{
              display: 'flex',
              flex: 1,
              width: '100%',
              minWidth: 0,
              alignSelf: 'stretch',
              minHeight: '100%',
            }}
          >
            {freezeDividers}
            {tableCell}
          </div>
        </Dropdown>
      ) : (
        <>
          {freezeDividers}
          {tableCell}
        </>
      )}
    </div>
  );
}
