import React, { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { MenuProps } from 'antd';
import { Dropdown, Input, Typography, VcIcon, vcTokens } from 'vc-design';
import { useBodyRowSelectionStore } from './bodyRowSelectionStoreContext';
import { BizTableCell } from './BizTableCell';
import { useTableGridEditingDispatchersRef } from './tableGridEditingDispatchersRefContext';
import { useTableGridEditingStateSelector } from './tableGridEditingStateContext';
import { useTableGridConfigContext } from './tableGridConfigContext';
import { cellKey, EDIT_TEXTAREA_MAX_ROWS } from './tableGridConstants';
import { tableTextClampNStyleFromMetrics } from './tableGridTypography';
import { focusAntdTextareaWithoutScroll, getNativeTextareaFromAntdRef } from './tableGridFocus';
import { getFreezeDividerStyle, getTextColGridItemShellStyle } from './tableGridLayout';

/** 表体编辑/选中失焦态共用：白底 + 与 Ant Input 一致的描边（由组件默认边框呈现） */
const INSERT_TAIL_STATS_SSR: { total: number; selected: number } = { total: 0, selected: 0 };

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

function TableGridTextCellInner({
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
  const m = cfg.typography;
  const edRef = useTableGridEditingDispatchersRef();
  const key = cellKey(bodyRowIndex, colIndex);

  const bodyCellTextareaStyles = useMemo(
    () => ({
      affixWrapper: {
        transition: 'none' as const,
        borderRadius: 0,
      },
      textarea: {
        fontSize: m.fontSizePx,
        lineHeight: `${m.lineHeightPx}px` as const,
        paddingLeft: m.bodyCellTextareaContentPadX,
        paddingRight: m.bodyCellTextareaContentPadX,
        boxSizing: 'border-box' as const,
        transition: 'none' as const,
        borderRadius: 0,
        backgroundColor: vcTokens.color.neutral.background.container,
      },
    }),
    [m.bodyCellTextareaContentPadX, m.fontSizePx, m.lineHeightPx]
  );

  const isInsertTailCol1Footer =
    isInsertRowPlaceholder && !isHeader && colIndex === 0;
  const { total: footerTotal, selected: footerSelected } =
    useInsertTailFooterStats(isInsertTailCol1Footer);

  const isInsertColPlaceholder = cfg.enableInsertRowCol && colIndex === cfg.colCount;
  const isInsertRowTextClickable =
    cfg.enableInsertRowCol &&
    isInsertRowPlaceholder &&
    !isInsertColPlaceholder &&
    !isHeader &&
    colIndex < cfg.colCount;

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

  const isActiveEditCell = useTableGridEditingStateSelector(
    (s) =>
      !!s.editingCell && s.editingCell.r === bodyRowIndex && s.editingCell.c === colIndex
  );
  const isEditing = isEditableBodyCell && isActiveEditCell;

  const isSelectedMatch = useTableGridEditingStateSelector((s) => {
    if (!s.selectedCell) return false;
    return s.selectedCell.r === bodyRowIndex && s.selectedCell.c === colIndex;
  });
  /** 单击选中、尚未第二次点击进入编辑：用真实 Input 呈现失焦输入框样式 */
  const isSelectedIdle = isEditableBodyCell && isSelectedMatch && !isEditing;

  useEffect(() => {
    if (!isEditing) return;
    const id = requestAnimationFrame(() => {
      const ed = edRef.current;
      if (!ed) return;
      const placeCaretEnd = () => {
        const ta = getNativeTextareaFromAntdRef(ed.editTextAreaRef);
        if (!ta) return;
        ta.focus({ preventScroll: true });
        const len = ta.value.length;
        try {
          ta.setSelectionRange(len, len);
        } catch {
          /* 节点未就绪 */
        }
      };
      placeCaretEnd();
      /** autoSize 布局后光标可能被重置到开头，再对齐一次到末尾 */
      requestAnimationFrame(placeCaretEnd);
    });
    return () => cancelAnimationFrame(id);
  }, [isEditing, bodyRowIndex, colIndex]);

  const displayText = useTableGridEditingStateSelector((s) =>
    isHeader ? '' : (s.valueByCell[key] ?? '')
  );

  const headerStored = useTableGridEditingStateSelector((s) =>
    isHeader && !isInsertColPlaceholder ? s.valueByCell[`header-${colIndex}`] : undefined
  );

  const isHoverLocked = useTableGridEditingStateSelector((s) => {
    if (
      !cfg.enableEditMode ||
      !isBody ||
      isInsertRowPlaceholder ||
      isInsertColPlaceholder ||
      colIndex >= cfg.colCount
    ) {
      return false;
    }
    return s.hoverLockedCell?.r === bodyRowIndex && s.hoverLockedCell?.c === colIndex;
  });

  const cellActive = isInsertColPlaceholder ? false : active;
  const isEditableBodyDisplayCell =
    isBody && !isInsertRowPlaceholder && !isInsertColPlaceholder && colIndex < cfg.colCount;

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

  /** 末行「插入行」占位：冻结列 1px span 与网格线叠出多余描边，本行不渲染 */
  const freezeDividers = (
    <>
      {!isInsertRowPlaceholder && cfg.enableFreezeFirstCol && colIndex === 0 ? (
        <span aria-hidden="true" style={getFreezeDividerStyle('right')} />
      ) : null}
      {!isInsertRowPlaceholder && cfg.enableFreezeLastCol && colIndex === cfg.colCount - 1 ? (
        <span aria-hidden="true" style={getFreezeDividerStyle('left')} />
      ) : null}
    </>
  );

  const displayColCount = cfg.colCount + (cfg.enableInsertRowCol ? 1 : 0);
  /** 冻结末行：顶线在首列外壳 + 各文本格；仅「插入列」开启时跳过最右 + 列，避免与插入区叠线 */
  const freezeTailRowTopBorder =
    isInsertRowPlaceholder &&
    cfg.enableFreezeLastRow &&
    (!cfg.enableInsertRowCol || colIndex < displayColCount - 1);
  const freezeTailRowTopStyle = freezeTailRowTopBorder
    ? {
        borderTop: `1px solid ${vcTokens.color.neutral.border.default}`,
        boxSizing: 'border-box' as const,
      }
    : undefined;

  const suppressBottomBeforeFrozenTail =
    cfg.enableFreezeLastRow &&
    !isInsertRowPlaceholder &&
    !isHeader &&
    rowIndex === cfg.rowCount - 1;

  const ed = edRef.current;
  if (ed == null) {
    throw new Error('TableGridTextCell: editing dispatchers ref not set');
  }

  const tableCell = (
    <BizTableCell
      variant={isHeader ? 'thead' : 'tbody'}
      hovered={isInsertColPlaceholder && !isHeader ? false : hovered || isHoverLocked}
      hoverByCell={isHeader}
      active={cellActive}
      zoom={canResizeHeaderTextCol}
      onColumnResizeStart={canResizeHeaderTextCol ? cfg.onColumnResizeStart(colIndex) : undefined}
      isLastRow={isLastRow}
      suppressBottomBorder={
        (isInsertColPlaceholder && !isHeader) || suppressBottomBeforeFrozenTail
      }
      isFrozen={
        (cfg.enableFreezeFirstCol && colIndex === 0) ||
        (cfg.enableFreezeLastCol && colIndex === cfg.colCount - 1) ||
        (cfg.enableFreezeLastCol && cfg.enableInsertRowCol && isInsertColPlaceholder)
      }
      showRightBorder={showTextColRightBorder}
      compactVerticalContent={isInsertColPlaceholder && isHeader}
      theadMinHeightPx={isHeader ? m.theadCellMinHeightPx : undefined}
      contentPaddingY={
        isHeader
          ? m.headerCellPaddingY
          : isEditing || isSelectedIdle
            ? m.editCellEdgePadding
            : m.bodyCellPaddingY
      }
      contentPaddingX={
        isInsertColPlaceholder
          ? 0
          : isHeader
            ? m.bodyCellPaddingX
            : isEditing || isSelectedIdle
              ? m.editCellEdgePadding
              : m.bodyCellPaddingX
      }
      contentAlignX={isInsertTailCol1Footer ? 'flex-start' : undefined}
      contentAlignY={!isHeader && !cfg.enableVerticalCenter ? 'flex-start' : 'center'}
      style={
        isEditing || isSelectedIdle
          ? {
              maxHeight: m.editCellMaxHeightPx,
              overflow: 'auto',
            }
          : isEditableBodyDisplayCell
            ? {
                maxHeight: m.displayCellMaxHeightPx,
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
          <Typography.Text style={{ ...m.tableTextStyle, fontWeight: 500 }}>
            {headerStored ?? `列 ${colIndex + 1}`}
          </Typography.Text>
        )
      ) : isInsertColPlaceholder ? null : isInsertTailCol1Footer ? (
        <Typography.Text
          type="secondary"
          aria-live="polite"
          style={{
            ...m.tableTextStyle,
            whiteSpace: 'nowrap',
            width: '100%',
            justifyContent: 'flex-start',
            userSelect: 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {footerSelected > 0
            ? `${footerSelected}/${footerTotal} 条数据`
            : `${footerTotal} 条数据`}
        </Typography.Text>
      ) : isInsertRowPlaceholder ? null : isEditing ? (
        <Input.TextArea
          key={`edit-${bodyRowIndex}-${colIndex}`}
          ref={ed.editTextAreaRef}
          autoFocus={false}
          autoSize={{ minRows: 1, maxRows: EDIT_TEXTAREA_MAX_ROWS }}
          defaultValue={ed.editingDraftRef.current}
          onChange={(ev) => {
            ed.editingDraftRef.current = ev.target.value;
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onBlur={() => {
            const api = edRef.current;
            if (!api) return;
            if (api.pendingBlurIgnoreCellKeyRef.current === key) {
              return;
            }
            const v = api.getEditingValueForSave();
            api.setValueByCell((prev) => ({ ...prev, [key]: v }));
          }}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !e.shiftKey &&
              !e.ctrlKey &&
              !e.metaKey &&
              !e.altKey &&
              !(e.nativeEvent as KeyboardEvent & { isComposing?: boolean }).isComposing
            ) {
              e.preventDefault();
              const v = ed.getEditingValueForSave();
              ed.setValueByCell((prev) => ({ ...prev, [key]: v }));
              ed.pendingBlurIgnoreCellKeyRef.current = key;
              ed.suppressDuplicatePrevCellClickSaveRef.current = true;
              ed.scheduleClearEditCommitGuards();
              ed.setEditingCell(null);
              ed.editingDraftRef.current = '';

              const maxBodyR = cfg.rowCount >= 2 ? cfg.rowCount - 2 : 0;
              const nextR = Math.min(maxBodyR, bodyRowIndex + 1);
              const next = { r: nextR, c: colIndex };
              ed.setSelectedCell(next);
              ed.setHoverLockedCell(next);
              ed.onKeyboardNavigateCell?.({ r: next.r, c: next.c, key: 'ArrowDown' });
              return;
            }

            const exit = e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey));
            if (!exit) return;
            e.preventDefault();
            const v = ed.getEditingValueForSave();
            ed.setValueByCell((prev) => ({ ...prev, [key]: v }));
            ed.pendingBlurIgnoreCellKeyRef.current = key;
            ed.scheduleClearEditCommitGuards();
            ed.setSelectedCell({ r: bodyRowIndex, c: colIndex });
            ed.setEditingCell(null);
            ed.editingDraftRef.current = '';
          }}
          style={{
            width: '100%',
            resize: 'none',
            transition: 'none',
            borderRadius: 0,
          }}
          styles={bodyCellTextareaStyles}
        />
      ) : isSelectedIdle ? (
        <Input.TextArea
          key={`sel-idle-${bodyRowIndex}-${colIndex}`}
          readOnly
          tabIndex={-1}
          value={displayText}
          autoSize={{ minRows: 1, maxRows: EDIT_TEXTAREA_MAX_ROWS }}
          onMouseDown={(e) => {
            /** 避免抢走焦点，保持「失焦态」描边样式；点击仍会冒泡到单元格以进入编辑 */
            e.preventDefault();
          }}
          onFocus={(e) => e.currentTarget.blur()}
          style={{
            width: '100%',
            resize: 'none',
            cursor: 'default',
            transition: 'none',
            borderRadius: 0,
          }}
          styles={bodyCellTextareaStyles}
        />
      ) : (
        <div
          style={{
            ...tableTextClampNStyleFromMetrics(EDIT_TEXTAREA_MAX_ROWS, m),
            width: '100%',
            minWidth: 0,
          }}
        >
          {displayText}
        </div>
      )}
    </BizTableCell>
  );

  const shellBaseStyle: React.CSSProperties = isInsertColPlaceholder
    ? {
        display: 'flex',
        minWidth: 0,
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
        ...freezeTailRowTopStyle,
      }
    : {
        ...getTextColGridItemShellStyle(
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
        ...freezeTailRowTopStyle,
      };

  /** 右键菜单时 Dropdown 需要单一子节点；原先多一层 presentation，现与外壳合并 */
  const shellStyle: React.CSSProperties =
    contextMenuItems != null
      ? {
          ...shellBaseStyle,
          flex: 1,
          width: '100%',
          alignSelf: 'stretch',
          minHeight: '100%',
        }
      : shellBaseStyle;

  const shellProps = {
    'data-insert-col-placeholder':
      isInsertColPlaceholder && !isHeader ? ('true' as const) : undefined,
    'data-hover-lock-cell': isEditableBodyDisplayCell && cfg.enableEditMode ? ('' as const) : undefined,
    'data-body-row': isEditableBodyDisplayCell ? bodyRowIndex : undefined,
    'data-col': isEditableBodyDisplayCell ? colIndex : undefined,
    onClick: (e: React.MouseEvent) => {
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
        const api = edRef.current;
        if (!api) return;

        if (api.editingCell?.r === bodyRowIndex && api.editingCell?.c === colIndex) {
          return;
        }

        if (
          api.editingCell &&
          (api.editingCell.r !== bodyRowIndex || api.editingCell.c !== colIndex)
        ) {
          if (!api.consumeDuplicatePrevCellClickSave()) {
            const prevKey = cellKey(api.editingCell.r, api.editingCell.c);
            const valueToSave = api.getEditingValueForSave();
            api.setValueByCell((v) => ({ ...v, [prevKey]: valueToSave }));
          }
          api.setEditingCell(null);
          api.editingDraftRef.current = '';
        }

        const sameAsSelected =
          api.selectedCell?.r === bodyRowIndex && api.selectedCell?.c === colIndex;

        if (sameAsSelected) {
          api.setEditingCell({ r: bodyRowIndex, c: colIndex });
          api.editingDraftRef.current = displayText;
          return;
        }

        api.setSelectedCell({ r: bodyRowIndex, c: colIndex });
        api.setEditingCell(null);
        api.editingDraftRef.current = '';
        return;
      }
      if (!isInsertRowTextClickable) return;
      e.stopPropagation();
      cfg.onInsertRow();
    },
    style: shellStyle,
  };

  const shellInner = (
    <>
      {freezeDividers}
      {tableCell}
    </>
  );

  return contextMenuItems != null ? (
    <Dropdown menu={{ items: contextMenuItems }} trigger={['contextMenu']}>
      <div {...shellProps}>{shellInner}</div>
    </Dropdown>
  ) : (
    <div {...shellProps}>{shellInner}</div>
  );
}

const TableGridTextCell = React.memo(TableGridTextCellInner);
export default TableGridTextCell;
