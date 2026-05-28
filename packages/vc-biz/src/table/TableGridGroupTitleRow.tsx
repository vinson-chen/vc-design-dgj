import React, { useMemo, useSyncExternalStore, useState, useLayoutEffect, useRef, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Checkbox, Input, Tooltip, Typography, VcIcon, vcTokens } from 'vc-design';
import type { InputRef } from 'antd';
import type { TableGroupTitleRowInfo, TableGridStaticConfig } from './tableGridTypes';
import { useTableGridConfigContext } from './tableGridConfigContext';
import { useTableGridEditingDispatchersRef } from './tableGridEditingContext';
import { VTableCell } from './VTableCell';
import { getTableRowGridTemplateColumns } from './tableGridLayout';
import { useBodyRowSelectionStore } from './bodyRowSelectionStoreContext';
import { useTableRowHoverStore } from './tableRowHoverStoreContext';
import { TABLE_BODY_BG_DEFAULT } from './tableGridConstants';

export type TableGridGroupTitleRowProps = Readonly<{
  groupInfo: TableGroupTitleRowInfo;
  rowIndex: number;
}>;

export function TableGridGroupTitleRow({ groupInfo, rowIndex }: TableGridGroupTitleRowProps) {
  const cfg = useTableGridConfigContext();
  const m = cfg.typography;
  const edRef = useTableGridEditingDispatchersRef();
  const selectionStore = useBodyRowSelectionStore();
  const hoverStore = useTableRowHoverStore();
  const rowHovered = useSyncExternalStore(
    hoverStore.subscribe,
    () => hoverStore.getSnapshot() === rowIndex,
    () => false
  );

  // 空值组显示"空值组"文案，非空组只显示组名
  const fullGroupLabel = groupInfo.isEmptyGroup ? '空值组' : groupInfo.groupValue;
  const groupTextRef = useRef<HTMLDivElement | null>(null);
  const [groupLabelTruncated, setGroupLabelTruncated] = useState(false);

  // 分组标题编辑态
  const [isEditingGroupTitle, setIsEditingGroupTitle] = useState(false);
  const [groupTitleDraft, setGroupTitleDraft] = useState('');
  const groupTitleInputRef = useRef<InputRef | null>(null);

  const gridTemplateColumns = useMemo(
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

  const onToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    cfg.onGroupExpansionChange?.(groupInfo.groupValue, !groupInfo.expanded);
  };

  const expandIcon = groupInfo.expanded ? 'chevron-down' : 'chevron-right';

  const showNarrowLead = cfg.narrowLeadWidth > 0;

  // 检查组内所有行的选中状态
  const groupRows = groupInfo.bodyRows;
  const groupSelectionFp = useSyncExternalStore(
    (cb) => selectionStore.subscribeSelection(cb),
    () => selectionStore.getRowsFingerprint(groupRows),
    () => 0
  );
  const groupAllChecked = groupSelectionFp === 2;
  const groupIndeterminate = groupSelectionFp === 3;

  // 组内全选/取消全选
  const onGroupSelectChange = (checked: boolean) => {
    selectionStore.setRowsByIndices(groupRows, checked);
  };

  // 检测标题是否被截断（用于 Tooltip）
  useLayoutEffect(() => {
    const el = groupTextRef.current;
    if (!el) return;
    const checkTruncated = () => {
      setGroupLabelTruncated(el.scrollWidth > el.clientWidth);
    };
    checkTruncated();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => checkTruncated());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fullGroupLabel]);

  // 空值组不允许编辑
  const canEditGroupTitle = !groupInfo.isEmptyGroup && cfg.enableEditMode && cfg.groupingConfig?.groupedColIndex != null;
  const groupedColIndex = cfg.groupingConfig?.groupedColIndex;

  // 双击进入编辑态
  const onGroupTitleDoubleClick = (e: React.MouseEvent) => {
    if (!canEditGroupTitle) return;
    e.stopPropagation();
    setGroupTitleDraft(fullGroupLabel);
    setIsEditingGroupTitle(true);
  };

  // 保存编辑：批量更新该组所有行的分组列值
  const saveGroupTitleEdit = useCallback(() => {
    const newTitle = groupTitleDraft.trim();
    if (newTitle && newTitle !== fullGroupLabel && groupedColIndex != null) {
      const ed = edRef.current;
      if (ed) {
        ed.setValueByCell((prev) => {
          const next = { ...prev };
          for (const bodyRowIndex of groupInfo.bodyRows) {
            next[`${bodyRowIndex}-${groupedColIndex}`] = newTitle;
          }
          return next;
        });
      }
    }
    setIsEditingGroupTitle(false);
    setGroupTitleDraft('');
  }, [groupTitleDraft, fullGroupLabel, groupedColIndex, groupInfo.bodyRows, edRef]);

  // 取消编辑
  const cancelGroupTitleEdit = useCallback(() => {
    setIsEditingGroupTitle(false);
    setGroupTitleDraft('');
  }, []);

  // Input 键盘事件处理
  const onGroupTitleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      saveGroupTitleEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelGroupTitleEdit();
    }
  }, [saveGroupTitleEdit, cancelGroupTitleEdit]);

  // 编辑态自动聚焦并选中文本
  useEffect(() => {
    if (!isEditingGroupTitle) return;
    const inputComponent = groupTitleInputRef.current;
    if (!inputComponent) return;
    requestAnimationFrame(() => {
      inputComponent.focus({ preventScroll: true });
      inputComponent.select();
    });
  }, [isEditingGroupTitle]);

  // 编辑态时，点击外部区域触发 blur 来退出编辑态
  useEffect(() => {
    if (!isEditingGroupTitle) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      // 点击的是 Input 相关元素，不处理
      const inputWrapper = target.closest('.ant-input-affix-wrapper, .ant-input');
      if (inputWrapper) return;
      // 点击其他区域，blur Input（会触发 onBlur -> saveGroupTitleEdit）
      const inputComponent = groupTitleInputRef.current;
      if (inputComponent) {
        inputComponent.blur();
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [isEditingGroupTitle]);

  return (
    <div
      role="row"
      aria-expanded={groupInfo.expanded}
      data-vc-biz-table-group-title-row=""
      onMouseEnter={() => hoverStore.setHoveredRowIndex(rowIndex)}
      onMouseLeave={() => hoverStore.setHoveredRowIndex(null)}
      style={{
        display: 'grid',
        gridTemplateColumns,
        width: '100%',
        minWidth: cfg.rowMinWidth,
        alignItems: 'stretch',
        background: TABLE_BODY_BG_DEFAULT,
        marginTop: 12,
      }}
    >
      {/* 窄列：checkbox 区域 */}
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
            variant="tbody"
            hovered={rowHovered}
            hoverByCell={false}
            pointerHoverResetNonce={cfg.pointerHoverResetNonce}
            active={false}
            isLastRow={false}
            isFrozen={cfg.enableFreezeFirstCol}
            showRightBorder={false}
            contentPaddingX={0}
            contentPaddingY={m.headerCellPaddingY}
            contentAlignX="center"
            contentAlignY="center"
            tbodyMinHeightPx={m.theadCellMinHeightPx}
            style={{ width: cfg.narrowLeadWidth, borderTop: `1px solid ${vcTokens.color.neutral.border.default}` }}
          >
            {cfg.enableBatchSelection ? (
              <Checkbox
                checked={groupAllChecked}
                indeterminate={groupIndeterminate}
                onChange={(e) => {
                  e.stopPropagation();
                  onGroupSelectChange(e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  margin: 0,
                  padding: 0,
                  height: m.lineHeightPx,
                  lineHeight: `${m.lineHeightPx}px`,
                }}
              />
            ) : null}
          </VTableCell>
        </div>
      ) : null}

      {/* 分组标签：第一列冻结，其他列正常 */}
      {cfg.visibleColIndexes.map((realColIndex, viewColIndex) => {
        const isFirstCol = viewColIndex === 0;
        const isLastVisibleTextCol = viewColIndex === cfg.visibleColIndexes.length - 1;
        // 只有冻结首列时的第一列、以及末列显示右描边
        const showRightBorder = isFirstCol
          ? cfg.enableFreezeFirstCol
          : isLastVisibleTextCol;

        return isFirstCol ? (
          // 第一列：用 sticky div 包裹，右侧带展开图标
          <div
            key={`group-${groupInfo.groupValue}-col-${realColIndex}`}
            style={{
              display: 'flex',
              minWidth: 0,
              alignItems: 'stretch',
              position: cfg.enableFreezeFirstCol ? 'sticky' : undefined,
              left: cfg.enableFreezeFirstCol ? cfg.narrowLeadWidth : undefined,
              zIndex: cfg.enableFreezeFirstCol ? 4 : undefined,
              boxSizing: 'border-box',
            }}
          >
            <VTableCell
              variant="tbody"
              hovered={rowHovered}
              hoverByCell={false}
              pointerHoverResetNonce={cfg.pointerHoverResetNonce}
              active={false}
              isLastRow={false}
              isFrozen={cfg.enableFreezeFirstCol}
              showRightBorder={showRightBorder}
              contentPaddingX={m.bodyCellPaddingX}
              contentPaddingY={m.headerCellPaddingY}
              contentAlignX="flex-start"
              contentAlignY="center"
              tbodyMinHeightPx={m.theadCellMinHeightPx}
              style={{ borderTop: `1px solid ${vcTokens.color.neutral.border.default}` }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {isEditingGroupTitle ? (
                  <Input
                    ref={groupTitleInputRef}
                    value={groupTitleDraft}
                    onChange={(e) => setGroupTitleDraft(e.target.value)}
                    onBlur={saveGroupTitleEdit}
                    onKeyDown={onGroupTitleInputKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    variant="borderless"
                    styles={{ input: { padding: 0, borderRadius: 0 } }}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontWeight: 500,
                      ...m.tableTextStyle,
                    }}
                  />
                ) : (
                  <Tooltip
                    title={groupLabelTruncated ? fullGroupLabel : undefined}
                    placement="top"
                    mouseEnterDelay={0.3}
                  >
                    <span
                      ref={groupTextRef}
                      onDoubleClick={onGroupTitleDoubleClick}
                      style={{
                        ...m.tableTextStyle,
                        fontWeight: 500,
                        color: vcTokens.color.neutral.text.default,
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        cursor: canEditGroupTitle ? 'text' : undefined,
                      }}
                    >
                      {fullGroupLabel}
                    </span>
                  </Tooltip>
                )}
                <span
                  style={{
                    ...m.tableTextStyle,
                    color: vcTokens.color.neutral.text.icon,
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    marginLeft: 8,
                  }}
                >
                  {groupInfo.groupCount}
                </span>
                <VcIcon
                  type={expandIcon}
                  fontSize={16}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(e);
                  }}
                  style={{
                    color: vcTokens.color.neutral.text.icon,
                    lineHeight: 1,
                    marginLeft: 8,
                    cursor: 'pointer',
                  }}
                />
              </div>
            </VTableCell>
          </div>
        ) : (
          // 其他列：正常渲染
          <VTableCell
            key={`group-${groupInfo.groupValue}-col-${realColIndex}`}
            variant="tbody"
            hovered={rowHovered}
            hoverByCell={false}
            pointerHoverResetNonce={cfg.pointerHoverResetNonce}
            active={false}
            isLastRow={false}
            isFrozen={false}
            showRightBorder={showRightBorder}
            contentPaddingX={0}
            contentPaddingY={m.headerCellPaddingY}
            contentAlignX="center"
            contentAlignY="center"
            tbodyMinHeightPx={m.theadCellMinHeightPx}
            style={{ borderTop: `1px solid ${vcTokens.color.neutral.border.default}` }}
          >
            {null}
          </VTableCell>
        );
      })}

      {/* 插入列占位 */}
      {cfg.enableInsertRowCol ? (
        <VTableCell
          key={`group-${groupInfo.groupValue}-insert`}
          variant="tbody"
          hovered={false}
          hoverByCell={false}
          pointerHoverResetNonce={cfg.pointerHoverResetNonce}
          active={false}
          isLastRow={false}
          suppressBottomBorder
          showRightBorder={false}
          contentPaddingX={0}
          contentPaddingY={m.headerCellPaddingY}
          contentAlignX="center"
          contentAlignY="center"
          tbodyMinHeightPx={m.theadCellMinHeightPx}
        >
          {null}
        </VTableCell>
      ) : null}
    </div>
  );
}

export default React.memo(TableGridGroupTitleRow);