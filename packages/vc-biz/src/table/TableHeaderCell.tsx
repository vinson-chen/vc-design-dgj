import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MenuProps, InputRef } from 'antd';
import { Button, Dropdown, Input, Select, Space, Tooltip, Typography, VcIcon, vcTokens } from 'vc-design';
import { DropdownMenuSidePanelCombo } from './DropdownMenuSidePanelCombo';
import { VTableCell } from './VTableCell';
import type { TableGridStaticConfig, HeaderCellValue, TableColumnFieldKind } from './tableGridTypes';
import type { TableGridEditingState } from './useTableGridEditing';
import type { TableGridTypographyMetrics } from './tableGridTypography';
import { fitTableHeaderTextWithEllipsis } from './fitTableHeaderTextWithEllipsis';
import { getHeaderTitle, getHeaderGroupId, parseHeaderCellValue, setHeaderGroupId, serializeHeaderCellValue } from './headless/tableGridGroupingId';
import './tableHeaderContextMenu.css';

export const HEADER_COL_FIELD_TYPE_KEY = 'field-type';

const HEADER_COL_TYPE_OPTIONS = [
  { label: '文本列', value: 'text' as const },
  { label: '图片列', value: 'image' as const },
  { label: '链接列', value: 'link' as const },
];

/** 将列索引转换为 A-Z 序号标记 */
export function getColLetterIndex(colIndex: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (colIndex < 26) {
    return letters[colIndex];
  }
  const firstLetterIndex = Math.floor(colIndex / 26) - 1;
  const secondLetterIndex = colIndex % 26;
  return letters[firstLetterIndex] + letters[secondLetterIndex];
}

export type TableHeaderCellProps = Readonly<{
  colIndex: number;
  isInsertColPlaceholder: boolean;
  headerStored: string | undefined;
  isHeaderEditing: boolean;
  isHeaderSelectedLocked: boolean;
  isHeaderFullColumnSelected: boolean;
  cfg: TableGridStaticConfig;
  typography: TableGridTypographyMetrics;
  editingApi: TableGridEditingState;
  canResizeHeaderTextCol: boolean;
  showHeaderColumnMenu: boolean;
  headerContextMenuItems: MenuProps['items'] | undefined;
  onHeaderColumnMenuClick: MenuProps['onClick'];
  /** 菜单打开状态（由父组件管理） */
  headerMenuOpen?: boolean;
  /** 侧面板打开状态（由父组件管理） */
  headerFieldTypeSubOpen?: boolean;
  /** 菜单状态变化回调 */
  onHeaderMenuOpenChange?: (open: boolean) => void;
  /** 侧面板状态变化回调 */
  onHeaderFieldTypeSubOpenChange?: (open: boolean) => void;
}>;

/** 表头单元格：包含标题、编辑态、右键菜单 */
export function TableHeaderCell({
  colIndex,
  isInsertColPlaceholder,
  headerStored,
  isHeaderEditing,
  isHeaderSelectedLocked,
  isHeaderFullColumnSelected,
  cfg,
  typography,
  editingApi,
  canResizeHeaderTextCol,
  showHeaderColumnMenu,
  headerContextMenuItems,
  onHeaderColumnMenuClick,
  headerMenuOpen = false,
  headerFieldTypeSubOpen = false,
  onHeaderMenuOpenChange,
  onHeaderFieldTypeSubOpenChange,
}: TableHeaderCellProps) {
  const m = typography;
  const headerEditKey = `header-${colIndex}`;
  const headerTextRef = useRef<HTMLSpanElement | null>(null);

  const fullHeaderLabel = useMemo(
    () => isInsertColPlaceholder ? '' : (getHeaderTitle(headerStored) ?? `列 ${colIndex + 1}`),
    [isInsertColPlaceholder, headerStored, colIndex]
  );

  const [headerFitLabel, setHeaderFitLabel] = useState(fullHeaderLabel);

  // 文本截断计算
  useLayoutEffect(() => {
    if (isInsertColPlaceholder || isHeaderEditing) {
      setHeaderFitLabel(fullHeaderLabel);
      return;
    }
    const el = headerTextRef.current;
    if (!el) {
      setHeaderFitLabel(fullHeaderLabel);
      return;
    }
    const run = () => {
      const cs = getComputedStyle(el);
      const pl = Number.parseFloat(cs.paddingLeft) || 0;
      const pr = Number.parseFloat(cs.paddingRight) || 0;
      const w = el.clientWidth - pl - pr;
      if (w <= 0) {
        setHeaderFitLabel(fullHeaderLabel);
        return;
      }
      const fontCss = `font-size:${cs.fontSize};font-family:${cs.fontFamily};font-weight:${cs.fontWeight};letter-spacing:${cs.letterSpacing};`;
      setHeaderFitLabel(fitTableHeaderTextWithEllipsis(fullHeaderLabel, w, fontCss));
    };
    run();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => run());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fullHeaderLabel, isInsertColPlaceholder, isHeaderEditing]);

  const headerTextTruncated = fullHeaderLabel.length > 0 && headerFitLabel !== fullHeaderLabel;

  // 编辑态聚焦
  useEffect(() => {
    if (!isHeaderEditing) return;
    const id = requestAnimationFrame(() => {
      const input = editingApi.headerEditInputRef.current;
      if (!input) return;
      input.focus({ preventScroll: true });
      input.select();
    });
    return () => cancelAnimationFrame(id);
  }, [isHeaderEditing, editingApi]);

  // 列编辑面板状态（由父组件管理，通过回调更新）
  const headerFieldTypeSubOpenPrevRef = useRef(false);
  const [headerColEditDraftTitle, setHeaderColEditDraftTitle] = useState('');
  const [headerColEditDraftKind, setHeaderColEditDraftKind] = useState<TableColumnFieldKind>('text');
  const [headerColEditDraftFields, setHeaderColEditDraftFields] = useState<Array<{ name: string }>>([]);
  // 字段拖拽状态
  const [fieldDragState, setFieldDragState] = useState<{ dragIndex: number; dropIndex: number | null } | null>(null);
  const fieldRowRectsRef = useRef<Array<{ top: number; height: number }> | null>(null);
  const headerColumnFieldKind = cfg.columnFieldKindByCol[colIndex] ?? 'text';
  const headerColumnMultiFieldFields = cfg.columnMultiFieldConfigByCol[colIndex]?.fields ?? [];

  useEffect(() => {
    const prev = headerFieldTypeSubOpenPrevRef.current;
    headerFieldTypeSubOpenPrevRef.current = headerFieldTypeSubOpen;
    if (headerFieldTypeSubOpen && !prev) {
      setHeaderColEditDraftTitle(fullHeaderLabel);
      setHeaderColEditDraftKind(headerColumnFieldKind);
      setHeaderColEditDraftFields(headerColumnMultiFieldFields);
    }
  }, [headerFieldTypeSubOpen, fullHeaderLabel, headerColumnFieldKind, headerColumnMultiFieldFields]);

  const headerColEditInputRef = useRef<InputRef | null>(null);

  // 适配 DropdownMenuSidePanelCombo 的 Dispatch 类型
  const setHeaderFieldTypeSubOpen = useCallback(
    (action: React.SetStateAction<boolean>) => {
      const nextOpen = typeof action === 'function' ? action(headerFieldTypeSubOpen) : action;
      onHeaderFieldTypeSubOpenChange?.(nextOpen);
    },
    [headerFieldTypeSubOpen, onHeaderFieldTypeSubOpenChange]
  );

  const setHeaderColumnFieldKind = useCallback(
    (kind: TableColumnFieldKind) => cfg.setColumnFieldKind(colIndex, kind),
    [cfg, colIndex]
  );

  const commitHeaderColumnEditPanel = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const nextTitle = headerColEditDraftTitle.trim();
      // 保留原有的 groupId，使用序列化函数
      const parsed = parseHeaderCellValue(headerStored);
      const newValue: HeaderCellValue = { title: nextTitle, groupId: parsed.groupId };
      editingApi.setValueByCell((prev) => ({ ...prev, [headerEditKey]: serializeHeaderCellValue(newValue) }));
      setHeaderColumnFieldKind(headerColEditDraftKind);
      cfg.setColumnMultiFieldFields(colIndex, headerColEditDraftFields);
      onHeaderFieldTypeSubOpenChange?.(false);
      onHeaderMenuOpenChange?.(false);
    },
    [colIndex, headerColEditDraftKind, headerColEditDraftTitle, headerColEditDraftFields, headerEditKey, editingApi, setHeaderColumnFieldKind, onHeaderFieldTypeSubOpenChange, onHeaderMenuOpenChange, headerStored, cfg]
  );

  const cancelHeaderColumnEditPanel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onHeaderFieldTypeSubOpenChange?.(false);
    onHeaderMenuOpenChange?.(false);
  }, [onHeaderFieldTypeSubOpenChange, onHeaderMenuOpenChange]);

  const onHeaderDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!cfg.enableEditMode || cfg.disabledEditColSet?.has(colIndex) || isInsertColPlaceholder || colIndex >= cfg.colCount) return;
      if (!showHeaderColumnMenu) return;
      e.stopPropagation();
      onHeaderMenuOpenChange?.(false);
      onHeaderFieldTypeSubOpenChange?.(true);
    },
    [cfg.enableEditMode, cfg.disabledEditColSet, colIndex, isInsertColPlaceholder, cfg.colCount, showHeaderColumnMenu, onHeaderMenuOpenChange, onHeaderFieldTypeSubOpenChange]
  );

  useEffect(() => {
    if (!headerFieldTypeSubOpen) return;
    const attemptFocus = (retries: number) => {
      const inputRef = headerColEditInputRef.current;
      if (inputRef?.input) {
        inputRef.input.focus({ preventScroll: true });
        inputRef.input.select();
        return;
      }
      if (retries > 0) {
        requestAnimationFrame(() => attemptFocus(retries - 1));
      }
    };
    const id = requestAnimationFrame(() => attemptFocus(10));
    return () => cancelAnimationFrame(id);
  }, [headerFieldTypeSubOpen]);

  const headerColEditFieldLabelStyle = useMemo(
    (): React.CSSProperties => ({
      color: vcTokens.color.neutral.text.description,
      fontSize: vcTokens.style.font.size.sm,
      lineHeight: `${vcTokens.style.font.lineHeight.sm}px`,
    }),
    []
  );

  // 插入列占位格：显示加号图标
  if (isInsertColPlaceholder) {
    return (
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
    );
  }

  // 编辑态：原生 input
  if (isHeaderEditing) {
    return (
      <div className="vc-biz-table-header-edit-wrap">
        <input
          ref={editingApi.headerEditInputRef}
          key={`header-edit-${colIndex}`}
          className="vc-biz-table-header-edit-native-input"
          type="text"
          defaultValue={editingApi.editingDraftRef.current}
          aria-label="表头名称"
          onChange={(e) => {
            editingApi.editingDraftRef.current = e.target.value;
          }}
          onBlur={() => {
            if (editingApi.pendingBlurIgnoreCellKeyRef.current === headerEditKey) return;
            const newTitle = editingApi.getEditingValueForSave();
            // 保留原有的 groupId，使用序列化函数
            const newHeaderValue = setHeaderGroupId(headerStored, getHeaderGroupId(headerStored));
            // 更新 title
            const parsed = parseHeaderCellValue(headerStored);
            const newValue: HeaderCellValue = { title: newTitle, groupId: parsed.groupId };
            editingApi.setValueByCell((prev) => ({ ...prev, [headerEditKey]: serializeHeaderCellValue(newValue) }));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const newTitle = editingApi.getEditingValueForSave();
              // 保留原有的 groupId
              const parsed = parseHeaderCellValue(headerStored);
              const newValue: HeaderCellValue = { title: newTitle, groupId: parsed.groupId };
              editingApi.setValueByCell((prev) => ({ ...prev, [headerEditKey]: serializeHeaderCellValue(newValue) }));
              editingApi.pendingBlurIgnoreCellKeyRef.current = headerEditKey;
              editingApi.scheduleClearEditCommitGuards();
              editingApi.setEditingCell(null);
              editingApi.editingDraftRef.current = '';
              return;
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              editingApi.pendingBlurIgnoreCellKeyRef.current = headerEditKey;
              editingApi.scheduleClearEditCommitGuards();
              editingApi.setSelectedCell({ r: -1, c: colIndex });
              editingApi.setSelectedCells(new Set([`-1:${colIndex}`]));
              editingApi.setSelectionAnchor({ r: -1, c: colIndex });
              editingApi.setEditingCell(null);
              editingApi.editingDraftRef.current = '';
            }
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            fontSize: m.fontSizePx,
            lineHeight: `${m.lineHeightPx}px`,
            color: vcTokens.color.neutral.text.default,
          }}
        />
      </div>
    );
  }

  // 带菜单的表头格
  if (showHeaderColumnMenu && headerContextMenuItems) {
    const headerMenuCellClassName = [
      'vc-biz-table-header-with-menu',
      headerMenuOpen || headerFieldTypeSubOpen ? 'vc-biz-table-header-with-menu-open' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="vc-biz-table-header-cell-inner" onDoubleClick={onHeaderDoubleClick}>
        {cfg.enableShowRowIndex ? (
          <Typography.Text
            style={{
              color: vcTokens.color.neutral.text.placeholder,
              fontSize: vcTokens.style.font.size.sm,
              lineHeight: 1,
              width: 20,
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            {getColLetterIndex(colIndex)}
          </Typography.Text>
        ) : null}
        <Tooltip
          title={headerTextTruncated ? fullHeaderLabel : undefined}
          placement="top"
          mouseEnterDelay={0.3}
        >
          <Typography.Text
            ref={headerTextRef}
            style={{
              ...m.tableTextStyle,
              fontWeight: 500,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {headerFitLabel}
          </Typography.Text>
        </Tooltip>
        <DropdownMenuSidePanelCombo
          open={headerMenuOpen}
          onOpenChange={(next, info) => {
            onHeaderMenuOpenChange?.(next);
            if (next) onHeaderFieldTypeSubOpenChange?.(false);
            else if (!info?.keepSidePanel) onHeaderFieldTypeSubOpenChange?.(false);
          }}
          placement="bottomRight"
          alignOffsetX={6}
          alignOffsetY={12}
          subMenuTriggerAction="click"
          replacePrimaryWithSidePanel
          closeSidePanelOnOverlayMouseLeave={false}
          overlayClassName="vc-biz-table-header-dropdown"
          primaryMenuClassName="vc-biz-table-header-combo-menu-wrap"
          primaryMenuStyle={{
            borderRadius: vcTokens.style.borderRadius.lg,
            background: vcTokens.color.neutral.background.container,
            boxShadow: vcTokens.style.boxShadowSecondary,
          }}
          menuItems={headerContextMenuItems}
          onMenuClick={onHeaderColumnMenuClick}
          sidePanelTriggerKey={HEADER_COL_FIELD_TYPE_KEY}
          sidePanelOpen={headerFieldTypeSubOpen}
          onSidePanelOpenChange={setHeaderFieldTypeSubOpen}
          showSidePanel
          renderSidePanel={() => (
            <div
              className="vc-biz-table-header-field-type-inner"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="vc-biz-table-header-col-edit-stack">
                {/* 列标题 */}
                <div className="vc-biz-table-header-col-edit-field">
                  <Typography.Text
                    className="vc-biz-table-header-col-edit-field-label"
                    style={headerColEditFieldLabelStyle}
                  >
                    列标题
                  </Typography.Text>
                  <Input
                    ref={headerColEditInputRef}
                    value={headerColEditDraftTitle}
                    onChange={(e) => setHeaderColEditDraftTitle(e.target.value)}
                    style={{ width: 240 }}
                  />
                </div>
                {/* 列类型 */}
                <div className="vc-biz-table-header-col-edit-field">
                  <Typography.Text
                    className="vc-biz-table-header-col-edit-field-label"
                    style={headerColEditFieldLabelStyle}
                  >
                    列类型
                  </Typography.Text>
                  <Select
                    value={headerColEditDraftKind}
                    onChange={(v) => setHeaderColEditDraftKind(v)}
                    options={HEADER_COL_TYPE_OPTIONS}
                    disabled={cfg.disabledEditColSet?.has(colIndex)}
                    style={{ width: 240 }}
                    suffixIcon={
                      <VcIcon
                        type="chevron-down"
                        fontSize={16}
                        style={{
                          lineHeight: 1,
                          display: 'block',
                          color: vcTokens.color.neutral.text.icon,
                        }}
                      />
                    }
                  />
                </div>
                {/* 多字段配置组 */}
                <div className="vc-biz-table-header-col-edit-field">
                  <Typography.Text
                    className="vc-biz-table-header-col-edit-field-label"
                    style={headerColEditFieldLabelStyle}
                  >
                    多字段
                  </Typography.Text>
                  {/* 字段名列表 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {headerColEditDraftFields.map((field, idx) => {
                      const isDraggingThis = fieldDragState?.dragIndex === idx;
                      const dropIndicatorAbove = fieldDragState?.dropIndex === idx && fieldDragState.dragIndex !== idx;
                      const dropIndicatorBelow = fieldDragState?.dropIndex === idx + 1 && fieldDragState.dragIndex !== idx + 1 && idx === headerColEditDraftFields.length - 1;
                      return (
                        <React.Fragment key={idx}>
                          {/* 放置指示线：上方 */}
                          {dropIndicatorAbove ? (
                            <div style={{ height: 2, background: vcTokens.color.primary.default, borderRadius: 1 }} />
                          ) : null}
                          <div
                            className="vc-biz-table-header-field-row"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              opacity: isDraggingThis ? 0.3 : 1,
                            }}
                          >
                            <Button
                              type="text"
                              size="small"
                              icon={<VcIcon type="move" fontSize={14} style={{ lineHeight: 1, color: vcTokens.color.neutral.text.icon }} />}
                              style={{ cursor: 'grab' }}
                              onMouseDown={(e) => {
                                if (e.button !== 0) return;
                                e.preventDefault();
                                // 立即获取所有行位置
                                const fieldRows = document.querySelectorAll('.vc-biz-table-header-field-row');
                                fieldRowRectsRef.current = Array.from(fieldRows).map((row) => {
                                  const rect = row.getBoundingClientRect();
                                  return { top: rect.top, height: rect.height };
                                });
                                setFieldDragState({ dragIndex: idx, dropIndex: null });
                                const onMove = (ev: MouseEvent) => {
                                  const rects = fieldRowRectsRef.current;
                                  if (!rects) return;
                                  // 查找最近的放置位置
                                  let dropIdx: number | null = null;
                                  for (let i = 0; i < rects.length; i++) {
                                    const rect = rects[i];
                                    const midY = rect.top + rect.height / 2;
                                    if (ev.clientY < midY) {
                                      dropIdx = i;
                                      break;
                                    }
                                    if (i === rects.length - 1 && ev.clientY > midY) {
                                      dropIdx = i + 1;
                                    }
                                  }
                                  setFieldDragState((prev) => prev ? { ...prev, dropIndex: dropIdx } : prev);
                                };
                                const onUp = () => {
                                  window.removeEventListener('mousemove', onMove);
                                  window.removeEventListener('mouseup', onUp);
                                  setFieldDragState((prev) => {
                                    if (!prev) return null;
                                    const { dragIndex, dropIndex } = prev;
                                    if (dropIndex !== null && dragIndex !== dropIndex) {
                                      const next = [...headerColEditDraftFields];
                                      const [removed] = next.splice(dragIndex, 1);
                                      const insertIdx = dropIndex > dragIndex ? dropIndex - 1 : dropIndex;
                                      next.splice(insertIdx, 0, removed);
                                      setHeaderColEditDraftFields(next);
                                    }
                                    return null;
                                  });
                                };
                                window.addEventListener('mousemove', onMove);
                                window.addEventListener('mouseup', onUp);
                              }}
                            />
                            <Input
                              placeholder="字段名"
                              value={field.name}
                              onChange={(e) => {
                                const next = [...headerColEditDraftFields];
                                next[idx] = { name: e.target.value };
                                setHeaderColEditDraftFields(next);
                              }}
                              style={{ width: 180 }}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<VcIcon type="delete" fontSize={14} style={{ lineHeight: 1, color: vcTokens.color.neutral.text.icon }} />}
                              onClick={() => {
                                const next = headerColEditDraftFields.filter((_, i) => i !== idx);
                                setHeaderColEditDraftFields(next);
                              }}
                            />
                          </div>
                          {/* 放置指示线：下方（仅最后一行） */}
                          {dropIndicatorBelow ? (
                            <div style={{ height: 2, background: vcTokens.color.primary.default, borderRadius: 1 }} />
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  {/* 添加字段按钮：最多10个字段 */}
                  {headerColEditDraftFields.length < 10 ? (
                    <Button
                      type="text"
                      icon={<VcIcon type="add" fontSize={16} style={{ lineHeight: 1, color: vcTokens.color.neutral.text.icon }} />}
                      onClick={() => setHeaderColEditDraftFields([...headerColEditDraftFields, { name: '' }])}
                      style={{ marginTop: 4 }}
                    >
                      添加字段
                    </Button>
                  ) : null}
                </div>
                {/* 操作按钮 */}
                <div className="vc-biz-table-header-col-edit-actions">
                  <Space size={8}>
                    <Button type="primary" aria-label="保存" onClick={commitHeaderColumnEditPanel}>
                      保存
                    </Button>
                    <Button aria-label="取消" onClick={cancelHeaderColumnEditPanel}>
                      取消
                    </Button>
                  </Space>
                </div>
              </div>
            </div>
          )}
          sidePanelTriggerRowClassName="vc-biz-dropdown-side-panel-trigger-row"
          menuClassName="vc-biz-table-header-combo-menu"
        >
          <Button
            type="text"
            className="vc-biz-table-header-chevron-btn"
            aria-label="列操作"
            aria-expanded={headerMenuOpen || headerFieldTypeSubOpen}
            icon={
              <VcIcon
                type="chevron-down"
                fontSize={16}
                style={{
                  lineHeight: 1,
                  display: 'block',
                  color: vcTokens.color.neutral.text.icon,
                }}
              />
            }
            disabled={isHeaderEditing}
            onClick={(e) => {
              e.stopPropagation();
              // 点击表头下拉菜单按钮时关闭链接面板
              editingApi.closeAllLinkPanels();
            }}
          />
        </DropdownMenuSidePanelCombo>
      </div>
    );
  }

  // 无菜单的普通表头格
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {cfg.enableShowRowIndex ? (
        <Typography.Text
          style={{
            color: vcTokens.color.neutral.text.placeholder,
            fontSize: vcTokens.style.font.size.sm,
            lineHeight: 1,
            width: 20,
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          {getColLetterIndex(colIndex)}
        </Typography.Text>
      ) : null}
      <Tooltip
        title={headerTextTruncated ? fullHeaderLabel : undefined}
        placement="top"
        mouseEnterDelay={0.3}
      >
        <Typography.Text
          ref={headerTextRef}
          onDoubleClick={onHeaderDoubleClick}
          style={{
            ...m.tableTextStyle,
            fontWeight: 500,
            flex: 1,
            minWidth: 0,
            display: 'block',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {headerFitLabel}
        </Typography.Text>
      </Tooltip>
    </div>
  );
}