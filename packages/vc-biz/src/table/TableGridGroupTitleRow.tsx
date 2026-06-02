import React, { useMemo, useSyncExternalStore, useState, useLayoutEffect, useRef, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Checkbox, Input, Tooltip, Typography, VcIcon, vcTokens } from 'vc-design';
import type { InputRef } from 'antd';
import type { TableGroupTitleRowInfo } from './tableGridTypes';
import { useTableGridConfigContext } from './tableGridConfigContext';
import { useTableGridEditingDispatchersRef } from './tableGridEditingContext';
import { VTableCell } from './VTableCell';
import { useBodyRowSelectionStore } from './bodyRowSelectionStoreContext';
import { useTableRowHoverStore } from './tableRowHoverStoreContext';
import { TABLE_BODY_BG_DEFAULT } from './tableGridConstants';
import './tableHeaderContextMenu.css';

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

  // 多字段编辑态
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [editingFieldDraft, setEditingFieldDraft] = useState('');
  const fieldInputRef = useRef<InputRef | null>(null);
  const fieldTextMeasureRef = useRef<HTMLSpanElement | null>(null);
  const [fieldInputWidth, setFieldInputWidth] = useState(0);

  // 多字段内容截断检测（用于 Tooltip）
  const fieldContentRefs = useRef<HTMLSpanElement[]>([]);
  const [fieldTruncatedMap, setFieldTruncatedMap] = useState<Record<number, boolean>>({});

  const showNarrowLead = cfg.narrowLeadWidth > 0;
  const groupedColIndex = groupInfo.groupedColIndex;

  // 分组列是否配置了多字段（空值组不显示）
  const isGroupColMultiField = !groupInfo.isEmptyGroup && groupedColIndex != null && (cfg.columnMultiFieldConfigByCol[groupedColIndex]?.fields?.length ?? 0) > 0;
  // 分组列的多字段配置（字段名列表）
  const groupColFields = groupedColIndex != null ? cfg.columnMultiFieldConfigByCol[groupedColIndex]?.fields ?? [] : [];
  // 分组列存储的内容（取分组第一行的分组列多字段内容）
  const groupColKey = groupedColIndex != null && groupInfo.bodyRows.length > 0 ? `${groupInfo.bodyRows[0]}-${groupedColIndex}` : null;
  const storedValues = groupColKey != null ? cfg.multiFieldValueByCell[groupColKey] : undefined;
  // 合并数据：字段名从配置读取，内容从存储读取（按索引匹配）
  const groupColValues: Array<{ name: string; content: string }> = groupColFields.map((field, idx) => ({
    name: field.name,
    content: storedValues?.[idx]?.content ?? '',
  }));

  // 计算分组标题行专用的 Grid 模板：窄列 + 第一列 + 合并右侧列 + 插入列（可选）
  const groupTitleRowGridTemplateColumns = useMemo(() => {
    // 第一列宽度
    const firstColRealIndex = cfg.visibleColIndexes[0];
    const firstColWidth = cfg.enableColumnResize && cfg.colWidths[firstColRealIndex] != null
      ? cfg.colWidths[firstColRealIndex]
      : cfg.defaultTextColWidth;

    // 右侧合并列宽度 = 所有其他可见列宽度之和
    let rightSideWidth = 0;
    for (let i = 1; i < cfg.visibleColIndexes.length; i++) {
      const colIndex = cfg.visibleColIndexes[i];
      const colW = cfg.enableColumnResize && cfg.colWidths[colIndex] != null
        ? cfg.colWidths[colIndex]
        : cfg.defaultTextColWidth;
      rightSideWidth += colW;
    }
    // 确保 rightSideWidth 至少为 0，避免布局问题
    rightSideWidth = Math.max(0, rightSideWidth);

    // 插入列宽度
    const insertColW = cfg.enableInsertRowCol ? cfg.narrowWidth : 0;

    // 组合 Grid 模板
    const parts: string[] = [];
    if (showNarrowLead) {
      parts.push(`${cfg.narrowLeadWidth}px`);
    }
    parts.push(`${firstColWidth}px`);
    parts.push(`${rightSideWidth}px`);
    if (insertColW > 0) {
      parts.push(`${insertColW}px`);
    }
    return parts.join(' ');
  }, [
    showNarrowLead,
    cfg.narrowLeadWidth,
    cfg.visibleColIndexes,
    cfg.enableColumnResize,
    cfg.colWidths,
    cfg.defaultTextColWidth,
    cfg.enableInsertRowCol,
  ]);

  const onToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    cfg.onGroupExpansionChange?.(groupInfo.groupValue, !groupInfo.expanded);
  };

  const expandIcon = groupInfo.expanded ? 'chevron-down' : 'chevron-right';

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
  const canEditGroupTitle = !groupInfo.isEmptyGroup && cfg.enableEditMode && groupedColIndex != null;
  const canEditMultiField = !groupInfo.isEmptyGroup && cfg.enableEditMode && groupedColIndex != null;

  // 更新字段内容
  const updateFieldValue = useCallback((idx: number, content: string) => {
    if (groupedColIndex == null || groupInfo.bodyRows.length === 0) return;
    const bodyRowIndex = groupInfo.bodyRows[0];
    cfg.setMultiFieldContentByCell(bodyRowIndex, groupedColIndex, idx, content);
  }, [groupedColIndex, groupInfo.bodyRows, cfg]);

  // 双击分组标题进入编辑态
  const onGroupTitleDoubleClick = (e: React.MouseEvent) => {
    if (!canEditGroupTitle) return;
    e.stopPropagation();
    setGroupTitleDraft(fullGroupLabel);
    setIsEditingGroupTitle(true);
  };

  // 双击字段值进入编辑态
  const onFieldDoubleClick = (idx: number, currentContent: string) => {
    if (!canEditMultiField) return;
    // 同步计算初始宽度（使用 Canvas 测量）
    const textToMeasure = currentContent || '无';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 使用与表格一致的字体大小，字体用系统默认
      ctx.font = `${m.fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
      const textWidth = ctx.measureText(textToMeasure).width;
      const initialWidth = Math.min(240, Math.max(0, textWidth));
      setFieldInputWidth(initialWidth);
    } else {
      // Canvas 不可用时，使用保守的默认宽度
      setFieldInputWidth(40);
    }
    setEditingFieldDraft(currentContent);
    setEditingFieldIndex(idx);
  };

  // 保存分组标题编辑
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

  // 保存字段编辑
  const saveFieldEdit = useCallback(() => {
    if (editingFieldIndex != null) {
      updateFieldValue(editingFieldIndex, editingFieldDraft.trim());
    }
    setEditingFieldIndex(null);
    setEditingFieldDraft('');
  }, [editingFieldIndex, editingFieldDraft, updateFieldValue]);

  // 取消字段编辑
  const cancelFieldEdit = useCallback(() => {
    setEditingFieldIndex(null);
    setEditingFieldDraft('');
  }, []);

  // 分组标题 Input 键盘事件
  const onGroupTitleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      saveGroupTitleEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditingGroupTitle(false);
      setGroupTitleDraft('');
    }
  }, [saveGroupTitleEdit]);

  // 字段 Input 键盘事件
  const onFieldInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      saveFieldEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelFieldEdit();
    }
  }, [saveFieldEdit, cancelFieldEdit]);

  // 分组标题编辑态自动聚焦
  useEffect(() => {
    if (!isEditingGroupTitle) return;
    const inputComponent = groupTitleInputRef.current;
    if (!inputComponent) return;
    requestAnimationFrame(() => {
      inputComponent.focus({ preventScroll: true });
      inputComponent.select();
    });
  }, [isEditingGroupTitle]);

  // 字段编辑态自动聚焦
  useEffect(() => {
    if (editingFieldIndex == null) return;
    const inputComponent = fieldInputRef.current;
    if (!inputComponent) return;
    requestAnimationFrame(() => {
      inputComponent.focus({ preventScroll: true });
      inputComponent.select();
    });
  }, [editingFieldIndex]);

  // 根据字段内容自适应 Input 宽度（同步计算，避免输入时抖动）
  useLayoutEffect(() => {
    const el = fieldTextMeasureRef.current;
    if (!el) return;
    // 测量文本宽度，最大 240px
    // 空值时测量 placeholder "无" 的宽度
    const textWidth = el.scrollWidth;
    const newWidth = Math.min(240, textWidth);
    setFieldInputWidth(newWidth);
  }, [editingFieldDraft]);

  // 检测多字段内容是否被截断（用于 Tooltip）
  useLayoutEffect(() => {
    // 延迟检测，确保 refs 已设置
    const checkTruncated = () => {
      const newMap: Record<number, boolean> = {};
      fieldContentRefs.current.forEach((el, idx) => {
        if (el) {
          newMap[idx] = el.scrollWidth > el.clientWidth;
        }
      });
      setFieldTruncatedMap(newMap);
    };

    // 首次检测
    requestAnimationFrame(() => {
      checkTruncated();
    });

    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => checkTruncated());
    fieldContentRefs.current.forEach((el) => {
      if (el) ro.observe(el);
    });
    return () => ro.disconnect();
  }, [groupColValues]);

  // 分组标题编辑态时，点击外部触发 blur
  useEffect(() => {
    if (!isEditingGroupTitle) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const inputWrapper = target.closest('.ant-input-affix-wrapper, .ant-input');
      if (inputWrapper) return;
      const inputComponent = groupTitleInputRef.current;
      if (inputComponent) {
        inputComponent.blur();
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [isEditingGroupTitle]);

  // 字段编辑态时，点击外部触发 blur
  useEffect(() => {
    if (editingFieldIndex == null) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const inputWrapper = target.closest('.ant-input-affix-wrapper, .ant-input');
      if (inputWrapper) return;
      const inputComponent = fieldInputRef.current;
      if (inputComponent) {
        inputComponent.blur();
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [editingFieldIndex]);

  // 第一列是否需要右描边
  const firstColShowRightBorder = cfg.enableFreezeFirstCol;
  // 合并右侧列是否需要右描边（取决于末列设置）
  const rightSideShowRightBorder = cfg.enableBodyCellRightBorder || cfg.enableFreezeLastCol;

  return (
    <div
      role="row"
      aria-expanded={groupInfo.expanded}
      data-vc-biz-table-group-title-row=""
      onMouseEnter={() => hoverStore.setHoveredRowIndex(rowIndex)}
      onMouseLeave={() => hoverStore.setHoveredRowIndex(null)}
      style={{
        display: 'grid',
        gridTemplateColumns: groupTitleRowGridTemplateColumns,
        width: '100%',
        minWidth: cfg.rowMinWidth,
        alignItems: 'stretch',
        background: TABLE_BODY_BG_DEFAULT,
        marginTop: 12,
      }}
    >
      {/* 隐藏 span 用于测量字段编辑态文本宽度（固定位置，避免切换字段时测量混乱） */}
      {editingFieldIndex != null && (
        <span
          ref={fieldTextMeasureRef}
          aria-hidden
          style={{
            position: 'fixed',
            top: -9999,
            left: -9999,
            visibility: 'hidden',
            whiteSpace: 'pre',
            pointerEvents: 'none',
            ...m.tableTextStyle,
          }}
        >
          {editingFieldDraft || '无'}
        </span>
      )}
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

      {/* 第一列（A列）：分组标题 */}
      <div
        style={{
          display: 'flex',
          minWidth: 0,
          alignItems: 'stretch',
          position: cfg.enableFreezeFirstCol ? 'sticky' : undefined,
          left: cfg.enableFreezeFirstCol ? (showNarrowLead ? cfg.narrowLeadWidth : 0) : undefined,
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
          showRightBorder={firstColShowRightBorder}
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

      {/* 合并右侧列：多字段平铺显示 */}
      <VTableCell
        variant="tbody"
        hovered={rowHovered}
        hoverByCell={false}
        pointerHoverResetNonce={cfg.pointerHoverResetNonce}
        active={false}
        isLastRow={false}
        isFrozen={false}
        showRightBorder={rightSideShowRightBorder}
        contentPaddingX={m.bodyCellPaddingX}
        contentPaddingY={m.headerCellPaddingY}
        contentAlignX="flex-start"
        contentAlignY="center"
        tbodyMinHeightPx={m.theadCellMinHeightPx}
        style={{ borderTop: `1px solid ${vcTokens.color.neutral.border.default}` }}
      >
        {isGroupColMultiField && groupColValues.length > 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              width: '100%',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            {groupColValues.map((field, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 0,
                  flexShrink: 0,
                }}
              >
                <Typography.Text
                  style={{
                    color: vcTokens.color.neutral.text.description,
                    fontSize: m.fontSizePx,
                    lineHeight: `${m.lineHeightPx}px`,
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  {field.name}：
                </Typography.Text>
                {editingFieldIndex === idx ? (
                  <>
                    <Input
                      ref={fieldInputRef}
                      value={editingFieldDraft}
                      placeholder="无"
                      onChange={(e) => setEditingFieldDraft(e.target.value)}
                      onBlur={saveFieldEdit}
                      onKeyDown={onFieldInputKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      variant="borderless"
                      styles={{ input: { padding: 0, borderRadius: 0 } }}
                      style={{
                        width: fieldInputWidth,
                        maxWidth: 240,
                        ...m.tableTextStyle,
                      }}
                      className="vc-biz-table-field-edit-input"
                    />
                  </>
                ) : (
                  <Tooltip
                    title={fieldTruncatedMap[idx] ? field.content : undefined}
                    placement="top"
                    mouseEnterDelay={0.3}
                  >
                    <span
                      ref={(el) => { fieldContentRefs.current[idx] = el; }}
                      onDoubleClick={() => onFieldDoubleClick(idx, field.content)}
                      style={{
                        fontSize: m.fontSizePx,
                        lineHeight: `${m.lineHeightPx}px`,
                        color: field.content
                          ? vcTokens.color.neutral.text.default
                          : vcTokens.color.neutral.text.placeholder,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 240,
                        display: 'inline-block',
                        cursor: canEditMultiField ? 'text' : undefined,
                      }}
                    >
                      {field.content || '无'}
                    </span>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </VTableCell>

      {/* 插入列占位 */}
      {cfg.enableInsertRowCol ? (
        <VTableCell
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