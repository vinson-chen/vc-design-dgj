import type { InputRef, MenuProps } from 'antd';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, Dropdown, Input, Popconfirm, VcIcon, vcTokens } from 'vc-design';
import { DropdownMenuSidePanelCombo } from '../table/DropdownMenuSidePanelCombo';
import { TableFieldConfigPanel } from '../table/TableFieldConfigPanel';
import { renderSwitchTabIcon } from './iconResolver';
import './VCustomTabs.css';

export type VCustomTabKind = 'custom' | 'goods' | 'order';
/** @deprecated Use VCustomTabKind instead */
export type CustomTabKind = VCustomTabKind;

export type VCustomTabItem = Readonly<{
  key: string;
  label: string;
  kind: VCustomTabKind;
  /** 覆盖 kind 默认图标（与 VSwitchTabs 相同规则：svg 名或图片文件名） */
  icon?: string;
}>;
/** @deprecated Use VCustomTabItem instead */
export type CustomTabItem = VCustomTabItem;

function newTabKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function defaultIconForKind(kind: CustomTabKind): string | undefined {
  if (kind === 'custom') return 'v-cell';
  if (kind === 'goods') return 'control-platform';
  if (kind === 'order') return 'form';
  return undefined;
}

export function useVCustomTabsState(options?: { initialLabel?: string }) {
  const initialKey = useMemo(() => newTabKey(), []);
  const [items, setItems] = useState<VCustomTabItem[]>([
    {
      key: initialKey,
      label: options?.initialLabel ?? '未命名',
      kind: 'custom',
    },
  ]);
  const [activeKey, setActiveKey] = useState(initialKey);
  return { items, setItems, activeKey, setActiveKey };
}
/** @deprecated Use useVCustomTabsState instead */
export const useCustomTabsState = useVCustomTabsState;

/** 当前选中标签对应表格的列显隐数据（与 VTable / useTableAreaDemoState 对齐） */
export type VCustomTabsActiveTabFieldConfig = Readonly<{
  colCount: number;
  valueByCell: Record<string, string>;
  hiddenColSet: ReadonlySet<number>;
  setColumnHidden: (colIndex: number, hidden: boolean) => void;
  enableFreezeLastCol: boolean;
}>;
/** @deprecated Use VCustomTabsActiveTabFieldConfig instead */
export type CustomTabsActiveTabFieldConfig = VCustomTabsActiveTabFieldConfig;

export type VCustomTabsProps = Readonly<{
  items: VCustomTabItem[];
  onItemsChange: (next: VCustomTabItem[]) => void;
  activeKey: string;
  onActiveKeyChange: (key: string) => void;
  showIcon?: boolean;
  /** 有值时显示「字段配置」并在右侧打开列显隐面板 */
  activeTabFieldConfig?: VCustomTabsActiveTabFieldConfig | null;
  /**
   * 若提供：在添加菜单中于「自定义」下展示「导入表格」，选 .xlsx/.xls 后回调（宿主按新建表格再导入处理，与聊天附件导入一致）。
   */
  onAddMenuImportTableFile?: (file: File) => void | Promise<void>;
  rightSlot?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}>;
/** @deprecated Use VCustomTabsProps instead */
export type CustomTabsProps = VCustomTabsProps;

export default function VCustomTabs({
  items,
  onItemsChange,
  activeKey,
  onActiveKeyChange,
  showIcon = true,
  activeTabFieldConfig = null,
  onAddMenuImportTableFile,
  rightSlot,
  className,
  style,
}: VCustomTabsProps) {
  const navRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});
  const measureRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const moreMeasureRef = useRef<HTMLButtonElement | null>(null);
  const moreRef = useRef<HTMLButtonElement | null>(null);
  const addRef = useRef<HTMLButtonElement | null>(null);
  const addImportFileInputRef = useRef<HTMLInputElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const editInputRef = useRef<InputRef | null>(null);

  const [containerWidth, setContainerWidth] = useState(0);
  const [itemWidths, setItemWidths] = useState<Record<string, number>>({});
  const [moreWidth, setMoreWidth] = useState(0);

  const [addOpen, setAddOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [fieldConfigSubOpen, setFieldConfigSubOpen] = useState(false);
  /** 供 TableFieldConfigPanel 计算 max-height：与「字段配置」行对齐时用该行底边 */
  const fieldConfigMeasureTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!activeTabFieldConfig) setFieldConfigSubOpen(false);
  }, [activeTabFieldConfig]);
  const fieldConfigLayoutEpochRef = useRef(0);
  const [fieldConfigLayoutEpoch, setFieldConfigLayoutEpoch] = useState(0);
  const [overflowOpen, setOverflowOpen] = useState(false);
  /** 仅当从收纳菜单选中 tab 时为 true：选中项固定在外层最右；外层点击切换时为 false：从左向右自然铺满 */
  const [pinActiveRight, setPinActiveRight] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const renameBaselineRef = useRef('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAnchor, setDeleteAnchor] = useState<{ left: number; top: number } | null>(null);

  const [inkBar, setInkBar] = useState({ left: 0, width: 0, visible: false });

  const activeItem = useMemo(
    () => items.find((t) => t.key === activeKey) ?? items[0],
    [items, activeKey],
  );

  const readNavContentWidth = useCallback((nav: HTMLDivElement) => {
    const style = getComputedStyle(nav);
    const pl = parseFloat(style.paddingLeft) || 0;
    const pr = parseFloat(style.paddingRight) || 0;
    return nav.clientWidth - pl - pr;
  }, []);

  /**
   * 溢出规则：
   * - 收纳列表顺序保持 items 原始顺序；
   * - 从收纳选中（pinActiveRight）：选中项固定在外层最右，左侧从左到右尽量塞入，空间不足等价于从右往左回收；
   * - 外层切换（!pinActiveRight）：与 SwitchTabs 一致从左到右铺满，选中项不强制到最右。
   */
  const { visibleItems, hiddenItems } = useMemo(() => {
    if (items.length === 0) {
      return { visibleItems: [] as CustomTabItem[], hiddenItems: [] as CustomTabItem[] };
    }
    const budget = containerWidth;
    if (budget <= 0 || moreWidth <= 0) {
      return { visibleItems: items, hiddenItems: [] as CustomTabItem[] };
    }

    const widthOf = (it: CustomTabItem) => itemWidths[it.key] ?? 0;
    const widthsReady = items.every(
      (it) => typeof itemWidths[it.key] === 'number' && widthOf(it) > 0,
    );
    if (!widthsReady) {
      return { visibleItems: items, hiddenItems: [] as CustomTabItem[] };
    }

    const fullWidth = items.reduce((sum, it) => sum + widthOf(it), 0);
    if (fullWidth <= budget) {
      return { visibleItems: items, hiddenItems: [] as CustomTabItem[] };
    }

    if (!pinActiveRight) {
      let used = 0;
      const visible: CustomTabItem[] = [];
      for (let i = 0; i < items.length; i += 1) {
        const it = items[i]!;
        const w = widthOf(it);
        if (used + w + moreWidth <= budget) {
          visible.push(it);
          used += w;
        } else {
          break;
        }
      }
      if (visible.length === 0) {
        visible.push(items[0]!);
      }
      const visibleKeySet = new Set(visible.map((it) => it.key));
      const hidden = items.filter((it) => !visibleKeySet.has(it.key));
      return { visibleItems: visible, hiddenItems: hidden };
    }

    const active = items.find((t) => t.key === activeKey) ?? items[0]!;
    const activeWidth = widthOf(active);
    const availableForTabs = Math.max(0, budget - moreWidth);
    const remain = availableForTabs - activeWidth;

    if (remain <= 0) {
      const hiddenFallback = items.filter((it) => it.key !== active.key);
      return { visibleItems: [active], hiddenItems: hiddenFallback };
    }

    const leftVisible: CustomTabItem[] = [];
    let used = 0;
    for (let i = 0; i < items.length; i += 1) {
      const it = items[i]!;
      if (it.key === active.key) continue;
      const w = widthOf(it);
      if (used + w <= remain) {
        leftVisible.push(it);
        used += w;
      } else {
        break;
      }
    }

    const visible = [...leftVisible, active];
    const visibleKeySet = new Set(visible.map((it) => it.key));
    const hidden = items.filter((it) => !visibleKeySet.has(it.key));
    return { visibleItems: visible, hiddenItems: hidden };
  }, [items, activeKey, containerWidth, moreWidth, itemWidths, pinActiveRight]);

  const updateInkBar = useCallback(() => {
    const nav = navRef.current;
    const tabEl = activeItem ? tabRefs.current[activeItem.key] : null;
    if (!nav || !tabEl) {
      setInkBar({ left: 0, width: 0, visible: false });
      return;
    }
    const nr = nav.getBoundingClientRect();
    const tr = tabEl.getBoundingClientRect();
    setInkBar({
      left: tr.left - nr.left,
      width: tr.width,
      visible: true,
    });
  }, [activeItem]);

  useLayoutEffect(() => {
    const nextWidths: Record<string, number> = {};
    items.forEach((item) => {
      const w = measureRefs.current[item.key]?.offsetWidth ?? 0;
      if (w > 0) nextWidths[item.key] = w;
    });
    const mw = moreMeasureRef.current?.offsetWidth ?? 0;
    setItemWidths(nextWidths);
    setMoreWidth(mw);
    updateInkBar();
  }, [updateInkBar, items, showIcon, editingKey]);

  useLayoutEffect(() => {
    updateInkBar();
  }, [updateInkBar, items, activeKey, editingKey, configOpen, showIcon, overflowOpen, visibleItems, hiddenItems]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(() => {
      const inner = readNavContentWidth(nav);
      const aw = addRef.current?.offsetWidth ?? 0;
      const rw = rightRef.current?.offsetWidth ?? 0;
      setContainerWidth(Math.max(0, inner - aw - rw));
      updateInkBar();
    });
    observer.observe(nav);
    const inner = readNavContentWidth(nav);
    const aw = addRef.current?.offsetWidth ?? 0;
    const rw = rightRef.current?.offsetWidth ?? 0;
    setContainerWidth(Math.max(0, inner - aw - rw));
    return () => observer.disconnect();
  }, [readNavContentWidth, updateInkBar]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const inner = readNavContentWidth(nav);
    const aw = addRef.current?.offsetWidth ?? 0;
    const rw = rightRef.current?.offsetWidth ?? 0;
    setContainerWidth(Math.max(0, inner - aw - rw));
    updateInkBar();
  }, [readNavContentWidth, updateInkBar, addOpen, hiddenItems.length, rightSlot]);

  useEffect(() => {
    const onResize = () => updateInkBar();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateInkBar]);

  useLayoutEffect(() => {
    const el = activeItem ? tabRefs.current[activeItem.key] : null;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      updateInkBar();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeItem?.key, editingKey, updateInkBar]);

  /** 与表头「字段配置」子卡一致：主菜单区独立浮层圆角与阴影 */
  const configComboPrimarySurfaceStyle = useMemo(
    () =>
      ({
        borderRadius: vcTokens.style.borderRadius.lg,
        background: vcTokens.color.neutral.background.container,
        boxShadow: vcTokens.style.boxShadowSecondary,
      }) as React.CSSProperties,
    [],
  );

  const bumpFieldConfigLayoutEpoch = useCallback(() => {
    fieldConfigLayoutEpochRef.current += 1;
    setFieldConfigLayoutEpoch(fieldConfigLayoutEpochRef.current);
  }, []);

  const cssVars = useMemo(
    () =>
      ({
        '--custom-tabs-bg-bar': vcTokens.color.neutral.background.container,
        '--custom-tabs-color-text': vcTokens.color.neutral.text.default,
        '--custom-tabs-color-primary': vcTokens.color.primary.default,
        '--custom-tabs-color-primary-border': vcTokens.color.primary.border,
        '--custom-tabs-color-border': vcTokens.color.neutral.border.default,
        '--custom-tabs-bg-hover': vcTokens.color.neutral.fill.secondary,
        '--custom-tabs-bg-pressed': vcTokens.color.neutral.fill.default,
        '--custom-tabs-item-gap': `${vcTokens.size.padding.xs}px`,
        '--custom-tabs-item-min-height': `${vcTokens.size.controlHeight.md}px`,
        '--custom-tabs-item-padding-v': '5px',
        '--custom-tabs-item-padding-h': `${vcTokens.size.padding.sm}px`,
        '--custom-tabs-item-radius': `${vcTokens.style.borderRadius.md}px`,
        '--custom-tabs-font-size': `${vcTokens.style.font.size.base}px`,
        '--custom-tabs-line-height': `${vcTokens.style.font.lineHeight.base}px`,
        '--custom-tabs-font-weight-default': 400,
        '--custom-tabs-font-weight-active': 500,
        '--custom-tabs-right-gap': `${16}px`,
      }) as React.CSSProperties,
    [],
  );

  const commitRename = useCallback(() => {
    if (!editingKey) return;
    const nextLabel = editDraft.trim() || renameBaselineRef.current;
    onItemsChange(
      items.map((it) => (it.key === editingKey ? { ...it, label: nextLabel } : it)),
    );
    setEditingKey(null);
  }, [editDraft, editingKey, items, onItemsChange]);

  const onAddKind = useCallback(
    (kind: CustomTabKind) => {
      if (kind !== 'custom') return;
      const tab: CustomTabItem = { key: newTabKey(), label: '未命名', kind: 'custom' };
      onItemsChange([...items, tab]);
      setPinActiveRight(false);
      onActiveKeyChange(tab.key);
      setAddOpen(false);
    },
    [items, onActiveKeyChange, onItemsChange],
  );

  const onCopyActive = useCallback(() => {
    const idx = items.findIndex((t) => t.key === activeKey);
    if (idx < 0) return;
    const cur = items[idx]!;
    const dup: CustomTabItem = {
      ...cur,
      key: newTabKey(),
      label: `${cur.label}副本`,
    };
    onItemsChange([...items.slice(0, idx + 1), dup, ...items.slice(idx + 1)]);
    setPinActiveRight(false);
    onActiveKeyChange(dup.key);
    setConfigOpen(false);
    setOverflowOpen(false);
  }, [activeKey, items, onActiveKeyChange, onItemsChange]);

  const openDeleteConfirm = useCallback(() => {
    if (items.length <= 1) return;
    setConfigOpen(false);
    setOverflowOpen(false);
    const el = tabRefs.current[activeKey];
    const r = el?.getBoundingClientRect();
    if (r) {
      setDeleteAnchor({ left: r.left + r.width / 2, top: r.bottom });
    } else {
      setDeleteAnchor({ left: window.innerWidth / 2, top: window.innerHeight / 2 });
    }
    setDeleteOpen(true);
  }, [activeKey, items.length]);

  const confirmDelete = useCallback(() => {
    const rest = items.filter((t) => t.key !== activeKey);
    if (rest.length === 0) return;
    onItemsChange(rest);
    setPinActiveRight(false);
    onActiveKeyChange(rest[0]!.key);
    setDeleteOpen(false);
    setDeleteAnchor(null);
  }, [activeKey, items, onActiveKeyChange, onItemsChange]);

  const beginRename = useCallback(
    (item: CustomTabItem) => {
      setConfigOpen(false);
      renameBaselineRef.current = item.label;
      setEditDraft(item.label);
      setEditingKey(item.key);
      queueMicrotask(() => {
        editInputRef.current?.focus();
        editInputRef.current?.select();
      });
    },
    [],
  );

  const addMenuItems: MenuProps['items'] = useMemo(() => {
    const rows: MenuProps['items'] = [
      {
        key: 'custom',
        label: '自定义',
        icon: <VcIcon type="v-cell" fontSize={16} />,
      },
    ];
    if (onAddMenuImportTableFile) {
      rows.push({
        key: 'custom:import',
        label: '导入表格',
        icon: <VcIcon type="upload" fontSize={16} />,
        className: 'biz-custom-tabs-add-import-item',
      });
    }
    rows.push(
      {
        key: 'goods',
        label: '商品',
        disabled: true,
        icon: <VcIcon type="control-platform" fontSize={16} />,
      },
      {
        key: 'order',
        label: '订单',
        disabled: true,
        icon: <VcIcon type="form" fontSize={16} />,
      },
    );
    return rows;
  }, [onAddMenuImportTableFile]);

  const openAddMenuImportFilePicker = useCallback(() => {
    setAddOpen(false);
    queueMicrotask(() => addImportFileInputRef.current?.click());
  }, []);

  const onAddImportFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !onAddMenuImportTableFile) return;
      void Promise.resolve(onAddMenuImportTableFile(file));
    },
    [onAddMenuImportTableFile],
  );

  const onAddMenuClick = useCallback<NonNullable<MenuProps['onClick']>>(
    (info) => {
      const k = String(info.key);
      if (k === 'custom') onAddKind('custom');
      else if (k === 'custom:import') openAddMenuImportFilePicker();
    },
    [onAddKind, openAddMenuImportFilePicker],
  );

  const closeFieldConfigSub = useCallback(() => {
    setFieldConfigSubOpen(false);
  }, []);

  const openFieldConfigSub = useCallback(() => {
    setFieldConfigSubOpen(true);
  }, []);

  const configMenuItems: MenuProps['items'] = useMemo(() => {
    const blurOtherItems = (node: React.ReactNode) => (
      <span className="biz-custom-tabs-config-menu-item-label" onMouseEnter={closeFieldConfigSub}>
        {node}
      </span>
    );
    const rows: MenuProps['items'] = [
      {
        key: 'rename',
        label: blurOtherItems('重命名'),
        icon: <VcIcon type="edit" fontSize={16} />,
      },
      {
        key: 'copy',
        label: blurOtherItems('复制'),
        icon: <VcIcon type="file-copy" fontSize={16} />,
      },
    ];
    if (activeTabFieldConfig) {
      rows.push({
        key: 'fieldConfig',
        label: (
          <span className="biz-custom-tabs-field-config-item-inner" onMouseEnter={openFieldConfigSub}>
            <span className="biz-custom-tabs-field-config-item-text">字段配置</span>
          </span>
        ),
        icon: <VcIcon type="catalog" fontSize={16} />,
        className: [
          'vc-biz-dropdown-side-panel-trigger-row',
          'biz-custom-tabs-field-config-trigger-row',
          fieldConfigSubOpen ? 'biz-custom-tabs-field-config-menu-item-active' : '',
        ]
          .filter(Boolean)
          .join(' '),
      });
    }
    if (items.length > 1) {
      rows.push({
        key: 'delete',
        label: blurOtherItems('删除表格'),
        danger: true,
        icon: <VcIcon type="delete" fontSize={16} />,
      });
    }
    return rows;
  }, [
    items.length,
    activeTabFieldConfig,
    fieldConfigSubOpen,
    closeFieldConfigSub,
    openFieldConfigSub,
  ]);

  const onConfigMenuClick = useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key, domEvent }) => {
      domEvent.stopPropagation();
      if (key === 'rename') {
        setFieldConfigSubOpen(false);
        const cur = items.find((t) => t.key === activeKey);
        if (!cur) return;
        beginRename(cur);
        setConfigOpen(false);
        return;
      }
      if (key === 'copy') {
        setFieldConfigSubOpen(false);
        onCopyActive();
        setConfigOpen(false);
        return;
      }
      if (key === 'delete') {
        setFieldConfigSubOpen(false);
        openDeleteConfirm();
        setConfigOpen(false);
      }
    },
    [activeKey, beginRename, items, onCopyActive, openDeleteConfirm],
  );

  const overflowMenuItems: MenuProps['items'] = useMemo(() => {
    return hiddenItems.map((item) => {
      const resolved = item.icon ?? defaultIconForKind(item.kind);
      if (showIcon && resolved) {
        return {
          key: `tab:${item.key}`,
          label: item.label,
          icon: renderSwitchTabIcon(resolved),
        };
      }
      return {
        key: `tab:${item.key}`,
        label: item.label,
      };
    });
  }, [hiddenItems, showIcon]);

  const onOverflowMenuClick = useCallback<NonNullable<MenuProps['onClick']>>(
    (info) => {
      info.domEvent.stopPropagation();
      const k = String(info.key);
      if (!k.startsWith('tab:')) return;
      setConfigOpen(false);
      setPinActiveRight(true);
      onActiveKeyChange(k.slice(4));
    },
    [onActiveKeyChange],
  );

  const renderTabIcon = (item: CustomTabItem, isActive: boolean) => {
    if (!showIcon) return null;
    const resolved = item.icon ?? defaultIconForKind(item.kind);
    if (!resolved) return null;
    const tabIcon = renderSwitchTabIcon(resolved);
    if (!tabIcon) return null;
    const useMore =
      isActive &&
      (hoveredKey === item.key || configOpen) &&
      (editingKey !== item.key);
    if (useMore) {
      return <VcIcon type="chevron-down-circle" fontSize={16} />;
    }
    return tabIcon;
  };

  const renderEditingSurface = (item: CustomTabItem) => {
    const iconName = item.icon ?? defaultIconForKind(item.kind);
    return (
      <span className="biz-custom-tabs--surface is-input">
        {showIcon && iconName ? renderSwitchTabIcon(iconName) : null}
        <Input
          ref={editInputRef}
          className="biz-custom-tabs--input"
          size="small"
          value={editDraft}
          onChange={(e) => setEditDraft(e.target.value)}
          onBlur={commitRename}
          onPressEnter={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditDraft(renameBaselineRef.current);
              setEditingKey(null);
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </span>
    );
  };

  return (
    <div className={`biz-custom-tabs${className ? ` ${className}` : ''}`} style={{ ...cssVars, ...style }}>
      <div className="biz-custom-tabs--bar">
        <div className="biz-custom-tabs--nav" ref={navRef} role="tablist" aria-orientation="horizontal">
          {visibleItems.map((item) => {
            const isActive = activeItem?.key === item.key;
            const isEditing = editingKey === item.key;

            if (isEditing) {
              return (
                <div
                  key={item.key}
                  className="biz-custom-tabs--tab is-active"
                  ref={(el) => {
                    tabRefs.current[item.key] = el;
                  }}
                  role="tab"
                  aria-selected
                  onMouseEnter={() => setHoveredKey(item.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                >
                  {renderEditingSurface(item)}
                </div>
              );
            }

            if (isActive) {
              return (
                <DropdownMenuSidePanelCombo
                  key={item.key}
                  open={configOpen}
                  onOpenChange={(nextOpen) => {
                    if (editingKey) return;
                    if (nextOpen) {
                      setOverflowOpen(false);
                      setFieldConfigSubOpen(false);
                      setConfigOpen(true);
                      return;
                    }
                    setConfigOpen(false);
                  }}
                  overlayClassName="biz-custom-tabs-dropdown"
                  comboClassName="biz-custom-tabs-config-combo"
                  primaryMenuClassName="biz-custom-tabs-config-combo-menu"
                  primaryMenuStyle={configComboPrimarySurfaceStyle}
                  menuItems={configMenuItems}
                  onMenuClick={onConfigMenuClick}
                  sidePanelTriggerKey="fieldConfig"
                  sidePanelOpen={fieldConfigSubOpen}
                  onSidePanelOpenChange={setFieldConfigSubOpen}
                  showSidePanel={Boolean(activeTabFieldConfig)}
                  renderSidePanel={() =>
                    activeTabFieldConfig ? (
                      <TableFieldConfigPanel
                        open
                        triggerRef={fieldConfigMeasureTriggerRef}
                        layoutMeasureKey={fieldConfigLayoutEpoch}
                        colCount={activeTabFieldConfig.colCount}
                        valueByCell={activeTabFieldConfig.valueByCell}
                        hiddenColSet={activeTabFieldConfig.hiddenColSet}
                        setColumnHidden={activeTabFieldConfig.setColumnHidden}
                        enableFreezeLastCol={activeTabFieldConfig.enableFreezeLastCol}
                      />
                    ) : null
                  }
                  sidePanelTriggerRowClassName="vc-biz-dropdown-side-panel-trigger-row"
                  menuClassName="biz-custom-tabs-config-primary-menu"
                  sidePanelClassName="vc-biz-table-field-config-dropdown biz-custom-tabs-field-config-side"
                  onSidePanelMouseEnter={openFieldConfigSub}
                  sidePanelMeasureTriggerRef={fieldConfigMeasureTriggerRef}
                  onSidePanelLayoutSignatureChange={bumpFieldConfigLayoutEpoch}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected
                    aria-expanded={configOpen}
                    aria-haspopup="menu"
                    className={`biz-custom-tabs--tab is-active${configOpen ? ' is-menu-open' : ''}`}
                    ref={(el) => {
                      tabRefs.current[item.key] = el;
                    }}
                    onMouseEnter={() => setHoveredKey(item.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                  >
                    <span className="biz-custom-tabs--surface">
                      {showIcon ? renderTabIcon(item, true) : null}
                      <span className="biz-custom-tabs--label">{item.label}</span>
                    </span>
                  </button>
                </DropdownMenuSidePanelCombo>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={false}
                className="biz-custom-tabs--tab"
                ref={(el) => {
                  tabRefs.current[item.key] = el;
                }}
                onClick={() => {
                  setConfigOpen(false);
                  setOverflowOpen(false);
                  setPinActiveRight(false);
                  onActiveKeyChange(item.key);
                }}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <span className="biz-custom-tabs--surface">
                  {renderTabIcon(item, false)}
                  <span className="biz-custom-tabs--label">{item.label}</span>
                </span>
              </button>
            );
          })}

          {hiddenItems.length > 0 ? (
            <Dropdown
              trigger={['click']}
              open={overflowOpen}
              onOpenChange={(o) => {
                if (o) setConfigOpen(false);
                setOverflowOpen(o);
              }}
              menu={{ items: overflowMenuItems, onClick: onOverflowMenuClick }}
              overlayClassName="biz-custom-tabs-dropdown"
            >
              <button
                type="button"
                ref={moreRef}
                className={`biz-custom-tabs--nav-icon-btn${overflowOpen ? ' is-menu-open' : ''}`}
                aria-label="更多选项"
                aria-expanded={overflowOpen}
                aria-haspopup="menu"
              >
                <VcIcon type="ellipsis" fontSize={16} />
              </button>
            </Dropdown>
          ) : null}

          <Dropdown
            trigger={['click']}
            open={addOpen}
            onOpenChange={(o) => {
              if (o) setOverflowOpen(false);
              setAddOpen(o);
            }}
            menu={{ items: addMenuItems, onClick: onAddMenuClick }}
            overlayClassName="biz-custom-tabs-dropdown"
          >
            <button
              ref={addRef}
              type="button"
              className={`biz-custom-tabs--nav-icon-btn${addOpen ? ' is-menu-open' : ''}`}
              aria-label="添加选项"
            >
              <VcIcon type="add" fontSize={16} />
            </button>
          </Dropdown>
          {onAddMenuImportTableFile ? (
            <input
              ref={addImportFileInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              style={{ display: 'none' }}
              aria-hidden
              tabIndex={-1}
              onChange={onAddImportFileInputChange}
            />
          ) : null}

          <div
            className={`biz-custom-tabs--ink${inkBar.visible ? ' is-visible' : ''}`}
            style={{
              transform: `translateX(${inkBar.left}px)`,
              width: inkBar.width,
            }}
          />
          <div className="biz-custom-tabs--right" ref={rightRef}>
            {rightSlot ?? (
              <Button
                type="text"
                icon={<VcIcon type="user" fontSize={16} />}
                className="biz-custom-tabs--right-default-btn"
                aria-label="用户"
              />
            )}
          </div>
        </div>
      </div>

      <Popconfirm
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setDeleteAnchor(null);
        }}
        title="确定要删除该表格吗？"
        okText="确定"
        cancelText="取消"
        onConfirm={confirmDelete}
      >
        <span
          aria-hidden
          style={{
            position: 'fixed',
            width: 1,
            height: 1,
            left: deleteAnchor?.left ?? -9999,
            top: deleteAnchor?.top ?? -9999,
            overflow: 'hidden',
            clipPath: 'inset(50%)',
          }}
        />
      </Popconfirm>

      <div className="biz-custom-tabs--measure" aria-hidden>
        {items.map((item) => {
          const resolved = item.icon ?? defaultIconForKind(item.kind);
          return (
            <button
              key={`measure-${item.key}`}
              ref={(el) => {
                measureRefs.current[item.key] = el;
              }}
              type="button"
              className="biz-custom-tabs--tab"
            >
              <span className="biz-custom-tabs--surface">
                {showIcon && resolved ? renderSwitchTabIcon(resolved) : null}
                <span className="biz-custom-tabs--label">{item.label}</span>
              </span>
            </button>
          );
        })}
        <button ref={moreMeasureRef} type="button" className="biz-custom-tabs--nav-icon-btn">
          <VcIcon type="ellipsis" fontSize={16} />
        </button>
      </div>
    </div>
  );
}
