import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { MenuProps, InputRef } from 'antd';
import {
  Button,
  Dropdown,
  Input,
  Select,
  Space,
  Tooltip,
  Typography,
  VcIcon,
  vcTokens,
} from 'vc-design';
import { DropdownMenuSidePanelCombo } from './DropdownMenuSidePanelCombo';
import { useBodyRowSelectionStore } from './bodyRowSelectionStoreContext';
import { VTableCell } from './VTableCell';
import { useTableGridEditingDispatchersRef, useTableGridEditingStateSelector } from './tableGridEditingContext';
import { useTableGridConfigContext } from './tableGridConfigContext';
import { TableCellEditing, getBodyEditTextareaStyle } from './TableCellEditing';
import { TableCellImage } from './TableCellImage';
import { TableHeaderCell, getColLetterIndex, HEADER_COL_FIELD_TYPE_KEY } from './TableHeaderCell';
import { syncBodyEditTextareaHeight } from './bodyEditTextareaAutosize';
import { cellKey, EDIT_TEXTAREA_MAX_ROWS } from './tableGridConstants';
import { tableTextClampNStyleFromMetrics } from './tableGridTypography';
import { fitTableHeaderTextWithEllipsis } from './fitTableHeaderTextWithEllipsis';
import { getFreezeDividerStyle, getTextColGridItemShellStyle } from './tableGridLayout';
import './tableBodyEditNativeTextarea.css';
import './tableBodyImageCell.css';
import './tableHeaderContextMenu.css';

/** 表体编辑/选中失焦态：VTableCell 描边 + 内层原生 textarea（与表头 wrap+input 同构） */
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
  viewColIndex: number;
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
  viewColIndex,
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
  const bodyRowSelectionStore = useBodyRowSelectionStore();
  const key = cellKey(bodyRowIndex, colIndex);
  const dragSelectingRef = useRef(false);
  const suppressNextClickRef = useRef(false);
  const bodyMouseDownWasSelectedRef = useRef(false);

  /** 内边距由 VTableCell 与默认态一致承担；textarea 无 padding/底，避免与展示态叠出位移 */
  const bodyEditNativeTextareaStyle = useMemo(
    (): React.CSSProperties => ({
      fontSize: m.fontSizePx,
      lineHeight: `${m.lineHeightPx}px`,
      padding: 0,
      boxSizing: 'border-box',
      borderRadius: 0,
      transition: 'none',
      backgroundColor: 'transparent',
      minHeight: m.lineHeightPx,
      color: vcTokens.color.neutral.text.default,
    }),
    [m.fontSizePx, m.lineHeightPx]
  );

  const syncBodyTextareaHeight = useCallback(
    (el: HTMLTextAreaElement) => {
      syncBodyEditTextareaHeight(el, {
        minRows: 1,
        maxRows: EDIT_TEXTAREA_MAX_ROWS,
        lineHeightPx: m.lineHeightPx,
      });
    },
    [m.lineHeightPx]
  );

  const selectedIdleTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  /** 插入行尾行：首列可见格承载「条数据」文案；无首列窄轨时同时承载插入行 + */
  const isInsertTailFirstVisibleCol =
    isInsertRowPlaceholder && !isHeader && viewColIndex === 0;
  const { total: footerTotal, selected: footerSelected } =
    useInsertTailFooterStats(isInsertTailFirstVisibleCol);

  const visibleTextColCount = cfg.visibleColIndexes.length;
  const isInsertColPlaceholder = cfg.enableInsertRowCol && colIndex === cfg.colCount;
  const isFirstVisibleTextCol = !isInsertColPlaceholder && viewColIndex === 0;
  const isLastVisibleTextCol =
    !isInsertColPlaceholder && viewColIndex === visibleTextColCount - 1;
  const isInsertRowTextClickable =
    cfg.enableInsertRowCol &&
    isInsertRowPlaceholder &&
    !isInsertColPlaceholder &&
    !isHeader &&
    colIndex < cfg.colCount;

  const isLastTextColBeforeInsert =
    cfg.enableInsertRowCol && !isHeader && isLastVisibleTextCol;

  const shouldHideRightBorderForFrozenLastCol =
    cfg.enableFreezeLastCol && !cfg.enableInsertRowCol && isLastVisibleTextCol;

  const shouldHideRightBorderForLastUnfrozenBeforeFrozenLast =
    cfg.enableFreezeLastCol &&
    cfg.enableBodyCellRightBorder &&
    visibleTextColCount > 2 &&
    viewColIndex === visibleTextColCount - 2;

  const canResizeHeaderTextCol = isHeader && cfg.enableColumnResize && !isInsertColPlaceholder;

  /** 冻结首列时「列1」右侧分割线：与全局「右侧描边」无关，须始终显示 */
  const freezeFirstTextColRightDivider =
    cfg.enableFreezeFirstCol && isFirstVisibleTextCol && !isInsertColPlaceholder;

  /** 冻结首列文本格仍用单元格 border-right 画分割线；勿再隐藏边框改绝对定位 1px，否则亚像素缝在悬停时易露出下层白底 */
  const showTextColRightBorder =
    !isInsertColPlaceholder &&
    (isInsertRowPlaceholder && !isHeader
      ? isLastVisibleTextCol
      : isLastTextColBeforeInsert
        ? true
        : freezeFirstTextColRightDivider ||
          (cfg.enableBodyCellRightBorder &&
            !shouldHideRightBorderForFrozenLastCol &&
            !shouldHideRightBorderForLastUnfrozenBeforeFrozenLast));

  const strongLastColRightBorder =
    !isInsertColPlaceholder &&
    (isLastVisibleTextCol || isLastTextColBeforeInsert);

  const isBody = rowIndex > 0;
  const columnFieldKind = cfg.columnFieldKindByCol[colIndex] ?? 'text';
  const isImageColumnBodyCell =
    isBody &&
    !isInsertRowPlaceholder &&
    !isInsertColPlaceholder &&
    colIndex < cfg.colCount &&
    columnFieldKind === 'image';
  const isEditableBodyCell =
    cfg.enableEditMode &&
    isBody &&
    !isInsertRowPlaceholder &&
    colIndex < cfg.colCount &&
    !isInsertColPlaceholder &&
    !isImageColumnBodyCell;

  const cellR = isHeader ? -1 : bodyRowIndex;

  // 表头存储值
  const headerStored = useTableGridEditingStateSelector((s) =>
    isHeader && !isInsertColPlaceholder ? s.valueByCell[`header-${colIndex}`] : undefined
  );

  const headerEditKey = `header-${colIndex}`;
  const headerTextRef = useRef<HTMLSpanElement | null>(null);

  const fullHeaderLabel = useMemo(
    () => (isHeader && !isInsertColPlaceholder ? (headerStored ?? `列 ${colIndex + 1}`) : ''),
    [isHeader, isInsertColPlaceholder, headerStored, colIndex]
  );

  const [headerFitLabel, setHeaderFitLabel] = useState(fullHeaderLabel);

  const isEditingAny = useTableGridEditingStateSelector((s) => {
    if (!s.editingCell) return false;
    return s.editingCell.r === cellR && s.editingCell.c === colIndex;
  });

  const isSelectedAny = useTableGridEditingStateSelector((s) => {
    if (!s.selectedCell) return false;
    return s.selectedCell.r === cellR && s.selectedCell.c === colIndex;
  });
  const isMultiSelectedAny = useTableGridEditingStateSelector((s) =>
    s.selectedCells.has(`${cellR}:${colIndex}`)
  );
  const isNonAnchorMultiSelected = isMultiSelectedAny && !isSelectedAny;
  const selectionKind = isSelectedAny ? 'anchor' : isNonAnchorMultiSelected ? 'multi' : undefined;
  const isHeaderFullColumnSelected = useTableGridEditingStateSelector((s) => {
    if (!isHeader || isInsertColPlaceholder || colIndex < 0 || colIndex >= cfg.colCount) return false;
    const bodyRowCount = Math.max(0, cfg.rowCount - 1);
    if (bodyRowCount <= 0) return false;
    for (let r = 0; r < bodyRowCount; r += 1) {
      if (!s.selectedCells.has(`${r}:${colIndex}`)) return false;
    }
    return true;
  });
  const isHeaderSelectedLocked =
    isHeader &&
    cfg.enableEditMode &&
    (isSelectedAny || isHeaderFullColumnSelected);

  const isHeaderEditing = isHeader && cfg.enableEditMode && isEditingAny;

  /** 按单元格宽度用「…」结尾重算展示文案（Unicode U+2026，与 CSS ellipsis 的半字观感区分） */
  useLayoutEffect(() => {
    if (!isHeader || isInsertColPlaceholder || isHeaderEditing) {
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
  }, [fullHeaderLabel, isHeader, isInsertColPlaceholder, isHeaderEditing]);

  const headerTextTruncated = fullHeaderLabel.length > 0 && headerFitLabel !== fullHeaderLabel;

  useEffect(() => {
    if (!isHeaderEditing) return;
    const id = requestAnimationFrame(() => {
      const input = edRef.current?.headerEditInputRef.current;
      if (!input) return;
      input.focus({ preventScroll: true });
      input.select();
    });
    return () => cancelAnimationFrame(id);
  }, [isHeaderEditing, edRef]);

  const isActiveEditCell = useTableGridEditingStateSelector(
    (s) =>
      !!s.editingCell && s.editingCell.r === bodyRowIndex && s.editingCell.c === colIndex
  );
  const isEditing = isEditableBodyCell && isActiveEditCell;

  useEffect(() => {
    if (!isImageColumnBodyCell || !isActiveEditCell) return;
    const api = edRef.current;
    if (!api) return;
    api.setEditingCell(null);
    api.editingDraftRef.current = '';
  }, [isImageColumnBodyCell, isActiveEditCell, edRef]);

  const isSelectedMatch = useTableGridEditingStateSelector((s) => {
    if (!s.selectedCell) return false;
    return s.selectedCell.r === bodyRowIndex && s.selectedCell.c === colIndex;
  });
  /** 单击选中、尚未第二次点击进入编辑：原生 textarea 只读，与编辑态同壳 */
  const isSelectedIdle = isEditableBodyCell && isSelectedMatch && !isEditing;

  const displayText = useTableGridEditingStateSelector((s) =>
    isHeader ? '' : (s.valueByCell[key] ?? '')
  );
  const imagePreviewSize = 32;
  const imageUrls = isImageColumnBodyCell ? (cfg.imageUrlsByCell[key] ?? []) : [];

  const onOpenImageFilePicker = useCallback(
    (e: React.MouseEvent) => {
      if (!cfg.enableEditMode) return;
      e.stopPropagation();
      imageFileInputRef.current?.click();
    },
    [cfg.enableEditMode]
  );
  const onImageFilesSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (!isImageColumnBodyCell) return;
      const files = Array.from(e.currentTarget.files ?? []);
      if (files.length === 0) return;
      cfg.appendImageFilesToCell(bodyRowIndex, colIndex, files);
      e.currentTarget.value = '';
    },
    [isImageColumnBodyCell, cfg, bodyRowIndex, colIndex]
  );
  const onRemoveImageAt = useCallback(
    (imageIndex: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isImageColumnBodyCell) return;
      cfg.removeImageAtCell(bodyRowIndex, colIndex, imageIndex);
    },
    [cfg, bodyRowIndex, colIndex, isImageColumnBodyCell]
  );

  useLayoutEffect(() => {
    if (!isSelectedIdle) return;
    const el = selectedIdleTextareaRef.current;
    if (!el) return;
    syncBodyTextareaHeight(el);
  }, [isSelectedIdle, displayText, syncBodyTextareaHeight]);

  useEffect(() => {
    if (!isEditing) return;
    const id = requestAnimationFrame(() => {
      const ed = edRef.current;
      if (!ed) return;
      const placeCaretEnd = () => {
        const ta = ed.editTextAreaRef.current;
        if (!ta) return;
        syncBodyTextareaHeight(ta);
        ta.focus({ preventScroll: true });
        const len = ta.value.length;
        try {
          ta.setSelectionRange(len, len);
        } catch {
          /* 节点未就绪 */
        }
      };
      placeCaretEnd();
      /** 同步高度后光标可能被重置到开头，再对齐一次到末尾 */
      requestAnimationFrame(placeCaretEnd);
    });
    return () => cancelAnimationFrame(id);
  }, [isEditing, bodyRowIndex, colIndex, syncBodyTextareaHeight]);

  const canLockCell =
    cfg.enableEditMode &&
    !isInsertRowPlaceholder &&
    !isInsertColPlaceholder &&
    colIndex < cfg.colCount &&
    (isBody || isHeader);

  // 锚点格：单击选中/框选锚点（蓝描边 + 白底）
  const isAnchorCell = !isHeader && isSelectedAny;
  const showImageAddButton = isImageColumnBodyCell && isAnchorCell && cfg.enableEditMode;

  // 选中态：多选区域内非锚点格（浅蓝背景）；锚点格不显示浅蓝背景，用 inset panel 蓝描边表示
  const isBodySelectionCell = !isHeader && isNonAnchorMultiSelected;
  const cellActive = isInsertColPlaceholder ? false : active || isBodySelectionCell;
  const IMAGE_ADD_BUTTON_SIZE_PX = 32;
  const LOCKED_TEXT_PANEL_GAP_PX = 0;
  const LOCKED_TEXT_PANEL_CONTENT_GAP_PX = 6;
  const LOCKED_TEXT_PANEL_CONTENT_BOTTOM_GAP_PX = 5;
  const isEditableBodyDisplayCell =
    isBody &&
    !isInsertRowPlaceholder &&
    !isInsertColPlaceholder &&
    colIndex < cfg.colCount &&
    !isImageColumnBodyCell;

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
    insertModeBodyContextMenu,
    cfg.colCount,
    cfg.rowCount,
    cfg.deleteColumnAt,
    cfg.deleteBodyRowAt,
    colIndex,
    bodyRowIndex,
    gridMin,
  ]);

  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [headerFieldTypeSubOpen, setHeaderFieldTypeSubOpen] = useState(false);
  const headerFieldTypeSubOpenPrevRef = useRef(false);
  const [headerColEditDraftTitle, setHeaderColEditDraftTitle] = useState('');
  const [headerColEditDraftKind, setHeaderColEditDraftKind] = useState<'text' | 'image'>('text');
  const headerColumnFieldKind = cfg.columnFieldKindByCol[colIndex] ?? 'text';
  const setHeaderColumnFieldKind = useCallback(
    (kind: 'text' | 'image') => cfg.setColumnFieldKind(colIndex, kind),
    [cfg, colIndex]
  );
  const hiddenCols = cfg.hiddenColSet ?? new Set<number>();
  const canUseHeaderVisibilityMenu =
    insertModeHeaderContextMenu &&
    !isInsertColPlaceholder &&
    cfg.setColumnHidden != null &&
    cfg.setAllColumnsHidden != null;

  const setHeaderColumnHidden = useCallback(
    (targetColIndex: number, hidden: boolean) => {
      if (cfg.setAllColumnsHidden != null) {
        const next = new Set<number>(hiddenCols);
        if (hidden) next.add(targetColIndex);
        else next.delete(targetColIndex);
        cfg.setAllColumnsHidden(next);
      } else if (cfg.setColumnHidden != null) {
        cfg.setColumnHidden(targetColIndex, hidden);
      }
      if (targetColIndex === colIndex && hidden) {
        setHeaderMenuOpen(false);
      }
    },
    [cfg.setAllColumnsHidden, cfg.setColumnHidden, colIndex, hiddenCols]
  );

  useEffect(() => {
    const prev = headerFieldTypeSubOpenPrevRef.current;
    headerFieldTypeSubOpenPrevRef.current = headerFieldTypeSubOpen;
    if (headerFieldTypeSubOpen && !prev) {
      setHeaderColEditDraftTitle(fullHeaderLabel);
      setHeaderColEditDraftKind(headerColumnFieldKind);
    }
  }, [headerFieldTypeSubOpen, fullHeaderLabel, headerColumnFieldKind]);

  const commitHeaderColumnEditPanel = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const api = edRef.current;
      const nextTitle = headerColEditDraftTitle.trim() || `列 ${colIndex + 1}`;
      if (api) {
        api.setValueByCell((prev) => ({ ...prev, [headerEditKey]: nextTitle }));
      }
      setHeaderColumnFieldKind(headerColEditDraftKind);
      setHeaderFieldTypeSubOpen(false);
      setHeaderMenuOpen(false);
    },
    [
      colIndex,
      edRef,
      headerColEditDraftKind,
      headerColEditDraftTitle,
      headerEditKey,
      setHeaderColumnFieldKind,
    ],
  );

  const cancelHeaderColumnEditPanel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setHeaderFieldTypeSubOpen(false);
    setHeaderMenuOpen(false);
  }, []);

  const headerColEditInputRef = useRef<InputRef | null>(null);

  const onHeaderDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!cfg.enableEditMode || !isHeader || isInsertColPlaceholder || colIndex >= cfg.colCount) return;
      if (!canUseHeaderVisibilityMenu) return;
      e.stopPropagation();
      // 直接打开侧面板，不打开一级菜单
      setHeaderMenuOpen(false);
      setHeaderFieldTypeSubOpen(true);
    },
    [cfg.enableEditMode, isHeader, isInsertColPlaceholder, colIndex, cfg.colCount, canUseHeaderVisibilityMenu]
  );

  useEffect(() => {
    if (!headerFieldTypeSubOpen) return;
    // 第一次打开时 Input 尚未渲染，需要等待 DOM 就绪
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

  const headerContextMenuItems = useMemo((): MenuProps['items'] | undefined => {
    if (!canUseHeaderVisibilityMenu) return undefined;
    // 隐藏列：冻结列不允许隐藏
    const lockedByFreezeForHide =
      (cfg.enableFreezeFirstCol && colIndex === 0) ||
      (cfg.enableFreezeLastCol && colIndex === cfg.colCount - 1);
    // 删除列：列数 > 2 时允许删除冻结首列（冻结取消，原 B 列变为首列）
    const lockedByFreezeForDelete =
      (cfg.enableFreezeFirstCol && colIndex === 0 && cfg.colCount <= 2) ||
      (cfg.enableFreezeLastCol && colIndex === cfg.colCount - 1);
    // 分组：是否支持分组，当前列是否已分组
    const canGroupByThisCol = cfg.enableGrouping && colIndex >= 0 && colIndex < cfg.colCount;
    const isCurrentlyGrouped = cfg.groupingConfig?.groupedColIndex === colIndex;

    const items: MenuProps['items'] = [
      {
        key: HEADER_COL_FIELD_TYPE_KEY,
        icon: <VcIcon type="edit" fontSize={16} />,
        label: (
          <span className="vc-biz-table-header-field-type-item-inner">
            <span className="vc-biz-table-header-field-type-item-text">编辑列</span>
          </span>
        ),
        className: [
          'vc-biz-dropdown-side-panel-trigger-row',
          'vc-biz-table-header-field-type-trigger-row',
          headerFieldTypeSubOpen ? 'vc-biz-table-header-field-type-menu-item-active' : '',
        ]
          .filter(Boolean)
          .join(' '),
      },
      // 分组选项（在编辑列下方）
      ...(canGroupByThisCol
        ? [
            {
              key: 'group-by-column',
              icon: <VcIcon type="form" fontSize={16} />,
              label: isCurrentlyGrouped ? '取消分组' : '设为分组',
              className: isCurrentlyGrouped ? 'vc-biz-table-header-menu-item-active' : undefined,
            },
          ]
        : []),
      {
        key: 'hide-column',
        icon: <VcIcon type="browse-off" fontSize={16} />,
        label: '隐藏列',
        disabled: lockedByFreezeForHide,
      },
      {
        key: 'delete-column',
        danger: true,
        icon: <VcIcon type="delete" fontSize={16} />,
        label: '删除列',
        disabled: cfg.colCount <= gridMin || lockedByFreezeForDelete,
      },
    ];
    return items;
  }, [
    canUseHeaderVisibilityMenu,
    cfg.colCount,
    cfg.enableGrouping,
    cfg.groupingConfig?.groupedColIndex,
    colIndex,
    gridMin,
    headerFieldTypeSubOpen,
    cfg.enableFreezeFirstCol,
    cfg.enableFreezeLastCol,
  ]);

  const onHeaderColumnMenuClick = useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key, domEvent }) => {
      domEvent.stopPropagation();
      // 分组处理
      if (key === 'group-by-column') {
        const isCurrentlyGrouped = cfg.groupingConfig?.groupedColIndex === colIndex;
        cfg.onGroupingChange?.(isCurrentlyGrouped ? undefined : colIndex);
        setHeaderMenuOpen(false);
        return;
      }
      // 隐藏列：冻结列不允许隐藏
      const lockedByFreezeForHide =
        (cfg.enableFreezeFirstCol && colIndex === 0) ||
        (cfg.enableFreezeLastCol && colIndex === cfg.colCount - 1);
      // 删除列：列数 > 2 时允许删除冻结首列
      const lockedByFreezeForDelete =
        (cfg.enableFreezeFirstCol && colIndex === 0 && cfg.colCount <= 2) ||
        (cfg.enableFreezeLastCol && colIndex === cfg.colCount - 1);
      if (key === 'hide-column') {
        if (lockedByFreezeForHide) return;
        setHeaderColumnHidden(colIndex, true);
        return;
      }
      if (key === 'delete-column') {
        if (lockedByFreezeForDelete || cfg.colCount <= gridMin) return;
        cfg.deleteColumnAt(colIndex);
        setHeaderMenuOpen(false);
      }
    },
    [
      cfg.colCount,
      cfg.deleteColumnAt,
      cfg.enableFreezeFirstCol,
      cfg.enableFreezeLastCol,
      cfg.groupingConfig?.groupedColIndex,
      cfg.onGroupingChange,
      colIndex,
      gridMin,
      setHeaderColumnHidden,
    ],
  );

  const showHeaderColumnMenu = canUseHeaderVisibilityMenu && headerContextMenuItems != null;

  /** 末行「插入行」占位：冻结列 1px span 与网格线叠出多余描边，本行不渲染 */
  const freezeDividers = (
    <>
      {!isInsertRowPlaceholder &&
      cfg.enableFreezeLastCol &&
      isLastVisibleTextCol &&
      visibleTextColCount > 2 ? (
        <span aria-hidden="true" style={getFreezeDividerStyle('left')} />
      ) : null}
    </>
  );

  /** 冻结末行：顶线在首列外壳 + 各文本格；仅「插入列」开启时跳过最右 + 列，避免与插入区叠线 */
  const freezeTailRowTopBorder =
    isInsertRowPlaceholder &&
    cfg.enableFreezeLastRow &&
    // 注意：这里必须用“是否为插入列占位”判断，不能再用真实 colIndex 与显示列序号比较，
    // 否则隐藏中间列时会漏掉最后可见列的边线。
    (!cfg.enableInsertRowCol || !isInsertColPlaceholder);
  const freezeTailRowTopStyle = freezeTailRowTopBorder
    ? {
        borderTop: `1px solid ${vcTokens.color.neutral.border.default}`,
        boxSizing: 'border-box' as const,
      }
    : undefined;

  const suppressBottomBeforeFrozenTail =
    (cfg.enableFreezeLastRow &&
      !isInsertRowPlaceholder &&
      !isHeader &&
      rowIndex === cfg.rowCount - 1) ||
    (cfg.pageBodyRowEnd != null &&
      !isHeader &&
      bodyRowIndex === cfg.pageBodyRowEnd);

  // 每页最后一行：padding: 0px；非最后一行：padding: 0px 0px 1px
  const LOCKED_TEXT_PANEL_BOTTOM_GAP_PX = suppressBottomBeforeFrozenTail ? 0 : 1;

  const ed = edRef.current;
  if (ed == null) {
    throw new Error('TableGridTextCell: editing dispatchers ref not set');
  }

  const headerColEditFieldLabelStyle = useMemo(
    (): React.CSSProperties => ({
      color: vcTokens.color.neutral.text.description,
      fontSize: vcTokens.style.font.size.sm,
      lineHeight: `${vcTokens.style.font.lineHeight.sm}px`,
    }),
    [],
  );

  /** 编辑态勿带菜单类名，避免主题/样式误伤；且此时不渲染 chevron，无需占位 */
  const headerMenuCellClassName =
    isHeaderEditing
      ? undefined
      : [
          showHeaderColumnMenu ? 'vc-biz-table-header-with-menu' : '',
          showHeaderColumnMenu && (headerMenuOpen || headerFieldTypeSubOpen)
            ? 'vc-biz-table-header-with-menu-open'
            : '',
        ]
          .filter(Boolean)
          .join(' ') || undefined;
  const tableCellClassName =
    [headerMenuCellClassName, isImageColumnBodyCell ? 'vc-biz-table-image-scroll-host' : '']
      .filter(Boolean)
      .join(' ') || undefined;
  // 锚点态：蓝描边 + 白底（文本列和图片列共用）
  const useBodyTextInsetPanel =
    isAnchorCell &&
    isBody &&
    !isInsertRowPlaceholder &&
    !isInsertColPlaceholder &&
    colIndex < cfg.colCount;
  const insetPanelAlignItems: React.CSSProperties['alignItems'] =
    !isHeader && cfg.enableVerticalCenter ? 'center' : 'flex-start';
  const tableCellOverflowStyle: React.CSSProperties | undefined =
    isEditing || isSelectedIdle
      ? {
          maxHeight: m.displayCellMaxHeightPx,
          overflow: 'auto',
        }
      : isImageColumnBodyCell
        ? {
            maxHeight: m.displayCellMaxHeightPx,
            overflow: 'auto',
          }
        : isEditableBodyDisplayCell
          ? {
              maxHeight: m.displayCellMaxHeightPx,
              overflow: 'hidden',
            }
          : undefined;
  const tableCellStyle: React.CSSProperties | undefined =
    useBodyTextInsetPanel
      ? {
          ...(tableCellOverflowStyle ?? {}),
          paddingBottom: LOCKED_TEXT_PANEL_BOTTOM_GAP_PX,
        }
      : tableCellOverflowStyle;
  const wrapBodyTextInsetPanel = (content: React.ReactNode, setImageButtonVars?: boolean): React.ReactNode =>
    useBodyTextInsetPanel ? (
      <div
        style={{
          width: '100%',
          minWidth: 0,
          minHeight: '100%',
          alignSelf: 'stretch',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: insetPanelAlignItems,
          paddingTop: LOCKED_TEXT_PANEL_CONTENT_GAP_PX,
          paddingRight: LOCKED_TEXT_PANEL_CONTENT_GAP_PX,
          paddingBottom: LOCKED_TEXT_PANEL_CONTENT_BOTTOM_GAP_PX,
          paddingLeft: LOCKED_TEXT_PANEL_CONTENT_GAP_PX,
          borderRadius: 0,
          border: `2px solid ${vcTokens.color.primary.default}`,
          background: vcTokens.color.neutral.background.container,
          ...(setImageButtonVars ? {
            '--vc-biz-table-image-hover-mask': vcTokens.color.neutral.background.mask,
            '--vc-biz-table-image-remove-icon': vcTokens.color.menu.textSecondaryOnNav,
            '--vc-biz-table-image-remove-icon-hover': vcTokens.color.neutral.text.solid,
            '--vc-biz-table-image-remove-icon-active': vcTokens.color.menu.textSecondaryOnNav,
            // Add 按钮：遵循 vc-design Button default 规范
            '--vc-biz-table-image-add-bg': 'transparent',
            '--vc-biz-table-image-add-bg-hover': vcTokens.color.neutral.fill.tertiary,
            '--vc-biz-table-image-add-bg-active': vcTokens.color.neutral.fill.secondary,
            '--vc-biz-table-image-add-icon': vcTokens.color.neutral.text.icon,
            '--vc-biz-table-image-add-border-hover': vcTokens.color.neutral.border.default,
            '--vc-biz-table-image-add-icon-hover': vcTokens.color.neutral.text.icon,
            '--vc-biz-table-image-add-border-active': vcTokens.color.neutral.border.default,
            '--vc-biz-table-image-add-icon-active': vcTokens.color.neutral.text.icon,
          } : {}),
        } as React.CSSProperties}
      >
        {content}
      </div>
    ) : (
      content
    );

  // 分组列表头：顶部加 2px 描边（颜色与其他描边一致）
  const isGroupedColHeader = isHeader && !isInsertColPlaceholder && cfg.groupingConfig?.groupedColIndex === colIndex;
  const groupedColTopBorderStyle: React.CSSProperties | undefined = isGroupedColHeader
    ? { borderTop: `2px solid ${vcTokens.color.neutral.border.default}` }
    : undefined;

  const tableCell = (
    <VTableCell
      variant={isHeader ? 'thead' : 'tbody'}
      pointerHoverResetNonce={cfg.pointerHoverResetNonce}
      className={tableCellClassName}
      hovered={
        // 选中列时表头显示悬停态颜色；其他情况按原有逻辑
        isHeader && isHeaderFullColumnSelected
          ? true
          : (isInsertColPlaceholder && !isHeader) || (isHeader && isHeaderFullColumnSelected)
            ? false
            : hovered || isAnchorCell || isHeaderSelectedLocked || isNonAnchorMultiSelected
      }
      hoverByCell={isHeader && !isHeaderSelectedLocked && !isHeaderFullColumnSelected}
      active={cellActive}
      isAnchor={isAnchorCell}
      bodyRowHovered={!isHeader && hovered}
      /** 编辑表头时勿开 zoom：否则 zoom 分支会加大右侧 padding，与展示态不一致 */
      zoom={canResizeHeaderTextCol && !isHeaderEditing}
      onColumnResizeStart={
        canResizeHeaderTextCol && !isHeaderEditing ? cfg.onColumnResizeStart(colIndex) : undefined
      }
      isLastRow={isLastRow}
      suppressBottomBorder={
        ((isInsertColPlaceholder || isInsertRowPlaceholder) && !isHeader) || suppressBottomBeforeFrozenTail
      }
      isFrozen={
        (cfg.enableFreezeFirstCol && isFirstVisibleTextCol) ||
        (cfg.enableFreezeLastCol && isLastVisibleTextCol) ||
        (cfg.enableFreezeLastCol && cfg.enableInsertRowCol && isInsertColPlaceholder)
      }
      showRightBorder={showTextColRightBorder}
      rightBorderColor={
        strongLastColRightBorder ? vcTokens.color.neutral.border.default : undefined
      }
      compactVerticalContent={isInsertColPlaceholder && isHeader}
      theadMinHeightPx={isHeader ? m.theadCellMinHeightPx : undefined}
      tbodyMinHeightPx={!isHeader ? m.theadCellMinHeightPx : undefined}
      contentPaddingY={
        isHeader
          ? isHeaderEditing
            ? 0
            : m.headerCellPaddingY
          : useBodyTextInsetPanel
            ? LOCKED_TEXT_PANEL_GAP_PX
            : m.bodyCellPaddingY
      }
      contentPaddingX={
        isInsertColPlaceholder
          ? 0
          : useBodyTextInsetPanel
            ? LOCKED_TEXT_PANEL_GAP_PX
            : m.bodyCellPaddingX
      }
      contentPaddingLeft={isHeader && cfg.enableShowRowIndex && !isInsertColPlaceholder ? 2 : undefined}
      contentAlignX={isInsertTailFirstVisibleCol ? 'flex-start' : undefined}
      contentAlignY={
        isImageColumnBodyCell
          ? 'flex-start'
          : !isHeader && !cfg.enableVerticalCenter
            ? 'flex-start'
            : 'center'
      }
      style={{ ...tableCellStyle, ...groupedColTopBorderStyle }}
    >
      {isHeader ? (
        <TableHeaderCell
          colIndex={colIndex}
          isInsertColPlaceholder={isInsertColPlaceholder}
          headerStored={headerStored}
          isHeaderEditing={isHeaderEditing}
          isHeaderSelectedLocked={isHeaderSelectedLocked}
          isHeaderFullColumnSelected={isHeaderFullColumnSelected}
          cfg={cfg}
          typography={m}
          editingApi={ed}
          canResizeHeaderTextCol={canResizeHeaderTextCol}
          showHeaderColumnMenu={showHeaderColumnMenu}
          headerContextMenuItems={headerContextMenuItems}
          onHeaderColumnMenuClick={onHeaderColumnMenuClick}
          headerMenuOpen={headerMenuOpen}
          headerFieldTypeSubOpen={headerFieldTypeSubOpen}
          onHeaderMenuOpenChange={setHeaderMenuOpen}
          onHeaderFieldTypeSubOpenChange={setHeaderFieldTypeSubOpen}
        />
      ) : isInsertColPlaceholder ? null : isInsertTailFirstVisibleCol ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            minWidth: 0,
          }}
        >
          {cfg.enableInsertRowCol && cfg.narrowLeadWidth === 0 ? (
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
          <Typography.Text
            type="secondary"
            aria-live="polite"
            style={{
              ...m.tableTextStyle,
              whiteSpace: 'nowrap',
              minWidth: 0,
              flex: 1,
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
        </div>
      ) : isInsertRowPlaceholder ? null : isImageColumnBodyCell ? (
        wrapBodyTextInsetPanel(
          <TableCellImage
            bodyRowIndex={bodyRowIndex}
            colIndex={colIndex}
            imageUrls={imageUrls}
            isAnchor={isAnchorCell}
            enableEditMode={cfg.enableEditMode}
            imagePreviewSize={imagePreviewSize}
            addButtonSize={IMAGE_ADD_BUTTON_SIZE_PX}
            editingApi={ed}
            appendImageFiles={(r, c, files) => cfg.appendImageFilesToCell(r, c, files)}
            removeImageAt={(r, c, idx) => cfg.removeImageAtCell(r, c, idx)}
          />,
          // 图片列锚点态需要设置按钮 CSS 变量
          isAnchorCell
        )
      ) : isEditing ? (
        <TableCellEditing
          bodyRowIndex={bodyRowIndex}
          colIndex={colIndex}
          cellKey={key}
          editingDraft={ed.editingDraftRef.current}
          typography={m}
          editingApi={ed}
          rowCount={cfg.rowCount}
          wrapWithInsetPanel={useBodyTextInsetPanel}
          verticalCenter={cfg.enableVerticalCenter}
          onEnterNavigateDown={(nextR, nextC) => {
            ed.onKeyboardNavigateCell?.({ r: nextR, c: nextC, key: 'ArrowDown' });
          }}
        />
      ) : isSelectedIdle ? (
        wrapBodyTextInsetPanel(
          <div className="vc-biz-table-body-edit-wrap">
            <textarea
              key={`sel-idle-${bodyRowIndex}-${colIndex}`}
              ref={selectedIdleTextareaRef}
              readOnly
              tabIndex={-1}
              value={displayText}
              rows={1}
              className="vc-biz-table-body-edit-native-textarea vc-biz-table-body-edit-native-textarea--readonly-idle"
              style={bodyEditNativeTextareaStyle}
              onMouseDown={(e) => {
                /** 避免抢走焦点，保持「失焦态」描边样式；点击仍会冒泡到单元格以进入编辑 */
                e.preventDefault();
              }}
              onFocus={(e) => e.currentTarget.blur()}
            />
          </div>
        )
      ) : (
        wrapBodyTextInsetPanel(
          <div
            style={{
              ...tableTextClampNStyleFromMetrics(EDIT_TEXTAREA_MAX_ROWS, m),
              width: '100%',
              minWidth: 0,
            }}
          >
            {displayText}
          </div>
        )
      )}
    </VTableCell>
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
        left: cfg.enableFreezeFirstCol && colIndex === 0 ? cfg.narrowLeadWidth : undefined,
        right: cfg.enableFreezeLastCol && cfg.enableInsertRowCol ? 0 : undefined,
        zIndex: cfg.enableFreezeLastCol && cfg.enableInsertRowCol ? 5 : undefined,
        cursor: isHeader ? 'pointer' : 'default',
        ...freezeTailRowTopStyle,
      }
    : {
        ...getTextColGridItemShellStyle(
          cfg.narrowLeadWidth,
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
    contextMenuItems != null || canUseHeaderVisibilityMenu
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
    'data-hover-lock-cell': canLockCell ? ('' as const) : undefined,
    'data-body-row': canLockCell ? cellR : undefined,
    'data-col': canLockCell ? colIndex : undefined,
    'data-selection-kind': canLockCell ? selectionKind : undefined,
    onMouseDown: (e: React.MouseEvent) => {
      if (
        !cfg.enableEditMode ||
        !isBody ||
        isInsertRowPlaceholder ||
        isInsertColPlaceholder ||
        colIndex >= cfg.colCount ||
        e.button !== 0
      ) {
        return;
      }
      const api = edRef.current;
      if (!api) return;
      // 阻止浏览器默认文本选择，让拖拽只针对单元格
      e.preventDefault();
      const anchor = { r: bodyRowIndex, c: colIndex };
      bodyMouseDownWasSelectedRef.current =
        api.selectedCell?.r === anchor.r && api.selectedCell?.c === anchor.c;
      api.setRangeSelection(anchor, anchor);
      // 不在点击时取消选中行/选中列，只在框选拖拽时取消
      dragSelectingRef.current = true;
      let hasDragged = false;
      let pointerX = e.clientX;
      let pointerY = e.clientY;
      let current = anchor;
      const scrollRoot = (e.currentTarget as HTMLElement).closest('.vc-biz-table-scrollport') as
        | HTMLElement
        | null;
      const EDGE_PX = 28;
      const STEP_MAX = 18;
      let rafId: number | null = null;

      const tryUpdateCurrentFromPoint = (x: number, y: number) => {
        if (typeof document.elementFromPoint !== 'function') return;
        const el = document.elementFromPoint(x, y) as HTMLElement | null;
        const cell = el?.closest('[data-hover-lock-cell]') as HTMLElement | null;
        if (!cell) return;
        const r = Number(cell.getAttribute('data-body-row'));
        const c = Number(cell.getAttribute('data-col'));
        if (Number.isNaN(r) || Number.isNaN(c)) return;
        if (r < 0 || r > cfg.rowCount - 2) return;
        if (c < 0 || c >= cfg.colCount) return;
        if (r === current.r && c === current.c) return;
        current = { r, c };
        hasDragged = true;
        // 框选拖拽时取消选中行/选中列
        if (bodyRowSelectionStore.getCheckedCount() > 0) {
          bodyRowSelectionStore.toggleAll(false);
        }
        api.setRangeSelection(anchor, current);
      };

      const tickAutoScroll = () => {
        rafId = null;
        if (!dragSelectingRef.current || !scrollRoot) return;
        const rect = scrollRoot.getBoundingClientRect();
        let dx = 0;
        let dy = 0;
        if (pointerX < rect.left + EDGE_PX) {
          dx = -Math.ceil(((rect.left + EDGE_PX - pointerX) / EDGE_PX) * STEP_MAX);
        } else if (pointerX > rect.right - EDGE_PX) {
          dx = Math.ceil(((pointerX - (rect.right - EDGE_PX)) / EDGE_PX) * STEP_MAX);
        }
        if (pointerY < rect.top + EDGE_PX) {
          dy = -Math.ceil(((rect.top + EDGE_PX - pointerY) / EDGE_PX) * STEP_MAX);
        } else if (pointerY > rect.bottom - EDGE_PX) {
          dy = Math.ceil(((pointerY - (rect.bottom - EDGE_PX)) / EDGE_PX) * STEP_MAX);
        }
        if (dx !== 0 || dy !== 0) {
          scrollRoot.scrollBy({ left: dx, top: dy });
          tryUpdateCurrentFromPoint(pointerX, pointerY);
          rafId = requestAnimationFrame(tickAutoScroll);
        }
      };

      const onMove = (ev: MouseEvent) => {
        pointerX = ev.clientX;
        pointerY = ev.clientY;
        tryUpdateCurrentFromPoint(pointerX, pointerY);
        if (rafId == null && scrollRoot) {
          rafId = requestAnimationFrame(tickAutoScroll);
        }
      };
      const onUp = () => {
        dragSelectingRef.current = false;
        if (rafId != null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        window.removeEventListener('mousemove', onMove, true);
        window.removeEventListener('mouseup', onUp, true);
        if (hasDragged) {
          suppressNextClickRef.current = true;
        }
      };
      window.addEventListener('mousemove', onMove, true);
      window.addEventListener('mouseup', onUp, true);
    },
    onClick: (e: React.MouseEvent) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        e.stopPropagation();
        return;
      }
      if (!isHeader && isInsertColPlaceholder) {
        e.stopPropagation();
        return;
      }
      if (isHeader && isInsertColPlaceholder) {
        e.stopPropagation();
        cfg.onInsertColumn();
        return;
      }
      if (cfg.enableEditMode && isHeader && !isInsertColPlaceholder && colIndex < cfg.colCount) {
        e.stopPropagation();
        const maxBodyR = cfg.rowCount >= 2 ? cfg.rowCount - 2 : -1;
        if (maxBodyR < 0) {
          ed.clearSelection();
          return;
        }
        // 单击已选中列则取消选中
        if (isHeaderFullColumnSelected) {
          ed.clearSelection();
          return;
        }
        // 有选中行时先取消选中行
        if (bodyRowSelectionStore.getCheckedCount() > 0) {
          bodyRowSelectionStore.toggleAll(false);
        }
        ed.setRangeSelection({ r: 0, c: colIndex }, { r: maxBodyR, c: colIndex });
        return;
      }
      if (
        cfg.enableEditMode &&
        isBody &&
        !isInsertRowPlaceholder &&
        !isInsertColPlaceholder &&
        colIndex < cfg.colCount
      ) {
        // 单击锁定单元格：选中该格（锚点态）
        ed.setSelectedCell({ r: bodyRowIndex, c: colIndex });
        ed.setSelectedCells(new Set([`${bodyRowIndex}:${colIndex}`]));
        ed.setSelectionAnchor({ r: bodyRowIndex, c: colIndex });
      }
      if (isImageColumnBodyCell && cfg.enableEditMode) {
        e.stopPropagation();
        const api = edRef.current;
        if (!api) return;
        api.setSelectedCell({ r: bodyRowIndex, c: colIndex });
        api.setSelectedCells(new Set([`${bodyRowIndex}:${colIndex}`]));
        api.setSelectionAnchor({ r: bodyRowIndex, c: colIndex });
        api.setEditingCell(null);
        api.editingDraftRef.current = '';
        return;
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
            const prevKey = api.editingCell.r === -1 ? `header-${api.editingCell.c}` : cellKey(api.editingCell.r, api.editingCell.c);
            const valueToSave = api.getEditingValueForSave();
            api.setValueByCell((v) => ({ ...v, [prevKey]: valueToSave }));
          }
          api.setEditingCell(null);
          api.editingDraftRef.current = '';
        }

        const sameAsSelected =
          api.selectedCell?.r === bodyRowIndex && api.selectedCell?.c === colIndex;

        if (sameAsSelected) {
          if (bodyMouseDownWasSelectedRef.current) {
            api.setEditingCell({ r: bodyRowIndex, c: colIndex });
            api.editingDraftRef.current = displayText;
          }
          bodyMouseDownWasSelectedRef.current = false;
          return;
        }
        bodyMouseDownWasSelectedRef.current = false;

        api.setSelectedCell({ r: bodyRowIndex, c: colIndex });
        api.setSelectedCells(new Set([`${bodyRowIndex}:${colIndex}`]));
        api.setSelectionAnchor({ r: bodyRowIndex, c: colIndex });
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
