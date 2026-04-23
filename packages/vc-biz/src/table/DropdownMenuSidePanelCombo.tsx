import type { MenuProps } from 'antd';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Dropdown, Menu } from 'vc-design';
import './dropdownMenuSidePanelCombo.css';

/** 子菜单内承载自定义面板的占位项 key 后缀（避免与业务 key 冲突） */
const SIDE_PANEL_SLOT_KEY_SUFFIX = '__vcSidePanelSlot';

/** 子弹层挂在 body 时，mouseLeave 需识别移入 rc-menu 子浮层（勿误关侧栏） */
const SUBMENU_POPUP_CLOSE_GUARD =
  '.vc-biz-dropdown-side-panel-submenu-popup, .ant-dropdown-menu-submenu-popup, .ant-menu-submenu-popup';
const SUBMENU_TITLE_SELECTOR = '.ant-menu-submenu-title, .ant-dropdown-menu-submenu-title';
const MENU_ITEM_SELECTOR = '.ant-menu-item, .ant-dropdown-menu-item';
const MENU_INTERACTIVE_SELECTOR = `${MENU_ITEM_SELECTOR}, ${SUBMENU_TITLE_SELECTOR}`;

const SIDE_PANEL_SLOT_ITEM_STYLE: React.CSSProperties = {
  height: 'auto',
  minHeight: 0,
  lineHeight: 'normal',
  padding: 0,
  cursor: 'default',
  pointerEvents: 'auto',
};

function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** rc-trigger 传入的 align 信息（antd Dropdown 未在类型中导出，运行时存在；保留导出以兼容既有 API） */
export type RcTriggerAlignInfo = Readonly<{
  points?: readonly [string, string];
}>;

export type DropdownMenuSidePanelPlacement =
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight'
  | 'bottom'
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'top';

/** 与 antd Dropdown `onOpenChange` 第二参对齐，并扩展侧栏替换主菜单时的语义 */
export type DropdownMenuSidePanelOpenChangeInfo = Readonly<{
  source?: 'trigger' | 'menu';
  /** 为 true 时表示仅收起主菜单，侧栏仍保持打开（需父级配合不把侧栏 state 关掉） */
  keepSidePanel?: boolean;
}>;

export type DropdownMenuSidePanelComboProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean, info?: DropdownMenuSidePanelOpenChangeInfo) => void;
  children: React.ReactElement;
  overlayClassName?: string;
  comboClassName?: string;
  menuItems: MenuProps['items'];
  onMenuClick?: MenuProps['onClick'];
  sidePanelTriggerKey: string;
  sidePanelOpen: boolean;
  onSidePanelOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  showSidePanel: boolean;
  renderSidePanel: () => React.ReactNode;
  sidePanelTriggerRowClassName: string;
  primaryMenuStyle?: React.CSSProperties;
  primaryMenuClassName?: string;
  menuClassName?: string;
  sidePanelClassName?: string;
  onSidePanelMouseEnter?: () => void;
  sidePanelMeasureTriggerRef?: React.MutableRefObject<HTMLElement | null>;
  onSidePanelLayoutSignatureChange?: () => void;
  placement?: DropdownMenuSidePanelPlacement;
  subMenuTriggerAction?: 'hover' | 'click';
  /**
   * 为 true 时，指针离开主浮层（且未移入子弹层）会关闭侧栏。
   * 表头「编辑列」等场景应传 false：仅通过点击保存/取消/其它菜单项或点击空白关闭侧栏，不因悬停离开而关。
   */
  closeSidePanelOnOverlayMouseLeave?: boolean;
  /**
   * 为 true 时：打开侧栏后自动收起主菜单，浮层内仅保留侧栏（与主菜单替换而非并列）。
   * 表头「编辑列」等点击展开侧栏的场景建议开启。
   */
  replacePrimaryWithSidePanel?: boolean;
  /**
   * 浮层水平偏移量（正值向右）。用于微调右对齐位置。
   */
  alignOffsetX?: number;
  /**
   * 浮层垂直偏移量（正值向下）。用于微调与触发按钮的间距。
   */
  alignOffsetY?: number;
}>;

type DropdownPassthrough = React.ComponentProps<typeof Dropdown>;

type ItemLike = NonNullable<MenuProps['items']>[number];

function isDivider(it: ItemLike): it is NonNullable<Extract<ItemLike, { type: 'divider' }>> {
  return it != null && 'type' in it && it.type === 'divider';
}

function isGroup(it: ItemLike): it is NonNullable<Extract<ItemLike, { type: 'group' }>> {
  return it != null && 'type' in it && it.type === 'group';
}

function itemKeyStr(it: ItemLike): string | null {
  if (it == null || !('key' in it) || it.key == null) return null;
  return String(it.key);
}

function hasOwnChildren(it: ItemLike): it is Extract<ItemLike, { children: ItemLike[] }> {
  return it != null && 'children' in it && Array.isArray((it as { children?: unknown }).children);
}

type InjectOptions = Readonly<{
  sidePanelTriggerKey: string;
  showSidePanel: boolean;
  renderSidePanel: () => React.ReactNode;
  sidePanelTriggerRowClassName: string;
  sidePanelClassName?: string;
  onSidePanelMouseEnter?: () => void;
  onSubMenuTitleClick?: (info: { key: string; domEvent: React.MouseEvent | React.KeyboardEvent }) => void;
  slotInnerRef: React.RefObject<HTMLDivElement | null>;
}>;

function shouldConvertToSidePanelSubMenu(
  it: ItemLike,
  hasChildren: boolean,
  options: InjectOptions,
): boolean {
  return options.showSidePanel && itemKeyStr(it) === options.sidePanelTriggerKey && !hasChildren;
}

function buildSidePanelSubMenuItem(
  base: Exclude<ItemLike, null> & Record<string, unknown>,
  options: InjectOptions,
): NonNullable<MenuProps['items']>[number] {
  const {
    sidePanelTriggerKey,
    sidePanelTriggerRowClassName,
    sidePanelClassName,
    onSidePanelMouseEnter,
    onSubMenuTitleClick,
    slotInnerRef,
    renderSidePanel,
  } = options;
  const rawLabel = base.label as React.ReactNode;
  const slotKey = `${sidePanelTriggerKey}${SIDE_PANEL_SLOT_KEY_SUFFIX}`;
  return {
    ...base,
    type: 'submenu',
    key: sidePanelTriggerKey,
    /** 侧栏由 hover 打开，不展示 rc-menu 默认右侧箭头（false 不能用 null） */
    expandIcon: false,
    className: joinClassNames(
      'vc-biz-dropdown-side-panel-submenu-trigger',
      (base as { className?: string }).className,
    ),
    label: (
      <span className={sidePanelTriggerRowClassName} onMouseEnter={onSidePanelMouseEnter}>
        {rawLabel}
      </span>
    ),
    popupClassName: joinClassNames('vc-biz-dropdown-side-panel-submenu-popup', sidePanelClassName),
    popupStyle: { padding: 0 },
    onTitleClick: onSubMenuTitleClick,
    children: [
      {
        key: slotKey,
        disabled: true,
        className: 'vc-biz-dropdown-side-panel-submenu-slot-item',
        style: SIDE_PANEL_SLOT_ITEM_STYLE,
        label: (
          <div
            ref={slotInnerRef}
            className="vc-biz-dropdown-side-panel-submenu-slot-inner"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidePanel()}
          </div>
        ),
      },
    ],
  } as NonNullable<MenuProps['items']>[number];
}

function injectSidePanelSubMenu(
  items: MenuProps['items'],
  options: InjectOptions,
): MenuProps['items'] {
  const mapOne = (it: ItemLike): ItemLike => {
    if (it == null) return null;
    if (isDivider(it)) return it;
    if (isGroup(it)) {
      return {
        ...it,
        children: (it.children ?? []).map((c) => mapOne(c)),
      };
    }
    const hasChildren = hasOwnChildren(it) && it.children.length > 0;

    if (shouldConvertToSidePanelSubMenu(it, hasChildren, options)) {
      return buildSidePanelSubMenuItem(
        it as Exclude<ItemLike, null> & Record<string, unknown>,
        options,
      );
    }

    if (hasChildren) {
      return {
        ...it,
        children: it.children.map((c) => mapOne(c)),
      };
    }
    return it;
  };

  return (items ?? []).map((it) => mapOne(it));
}

export function DropdownMenuSidePanelCombo({
  open,
  onOpenChange,
  children,
  overlayClassName,
  comboClassName,
  menuItems,
  onMenuClick,
  sidePanelTriggerKey,
  sidePanelOpen,
  onSidePanelOpenChange,
  showSidePanel,
  renderSidePanel,
  sidePanelTriggerRowClassName,
  primaryMenuStyle,
  primaryMenuClassName,
  menuClassName,
  sidePanelClassName,
  onSidePanelMouseEnter,
  sidePanelMeasureTriggerRef,
  onSidePanelLayoutSignatureChange,
  placement = 'bottomLeft',
  subMenuTriggerAction = 'hover',
  closeSidePanelOnOverlayMouseLeave = true,
  replacePrimaryWithSidePanel = false,
  alignOffsetX = 0,
  alignOffsetY = 0,
}: DropdownMenuSidePanelComboProps) {
  const overlayRootRef = useRef<HTMLDivElement | null>(null);
  const slotInnerRef = useRef<HTMLDivElement | null>(null);
  const skipCloseFromTriggerRef = useRef(false);
  const layoutSigRef = useRef('');
  /** rc-menu 的 onOpenChange 可能晚于父级已把侧栏/主菜单关掉仍带上 trigger key，须与 props 对齐后再写入 openKeys，否则会「关 state 不关 UI」。 */
  const openRef = useRef(open);
  const sidePanelOpenRef = useRef(sidePanelOpen);
  openRef.current = open;
  sidePanelOpenRef.current = sidePanelOpen;

  const handleSubMenuTitleClick = useCallback(
    (info: { key: string; domEvent: React.MouseEvent | React.KeyboardEvent }) => {
      if (String(info.key) !== String(sidePanelTriggerKey)) return;
      info.domEvent.stopPropagation();
      onSidePanelOpenChange(true);
      if (replacePrimaryWithSidePanel) {
        onOpenChange(false, { source: 'menu', keepSidePanel: true });
      } else {
        skipCloseFromTriggerRef.current = true;
      }
    },
    [onOpenChange, onSidePanelOpenChange, replacePrimaryWithSidePanel, sidePanelTriggerKey],
  );

  const mergedMenuItems = useMemo(
    () =>
      injectSidePanelSubMenu(menuItems, {
        sidePanelTriggerKey,
        showSidePanel,
        renderSidePanel,
        sidePanelTriggerRowClassName,
        sidePanelClassName,
        onSidePanelMouseEnter,
        onSubMenuTitleClick: handleSubMenuTitleClick,
        slotInnerRef,
      }),
    [
      menuItems,
      sidePanelTriggerKey,
      showSidePanel,
      renderSidePanel,
      sidePanelTriggerRowClassName,
      sidePanelClassName,
      onSidePanelMouseEnter,
      handleSubMenuTitleClick,
    ],
  );

  /** 本地维护 SubMenu openKeys，避免仅用父级 sidePanelOpen 受控时与 rc-menu hover 打开竞态 */
  const [subOpenKeys, setSubOpenKeys] = useState<string[]>([]);

  const mergedDropdownOpen = replacePrimaryWithSidePanel
    ? open || (!!showSidePanel && sidePanelOpen)
    : open;

  useEffect(() => {
    if (!open) {
      setSubOpenKeys([]);
      /** 父级直接 `open=false`（如保存/取消）不经过 handleOpenChange，须复位 skip，否则空白关层会被短路。 */
      skipCloseFromTriggerRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!sidePanelOpen) {
      skipCloseFromTriggerRef.current = false;
      setSubOpenKeys((prev) => prev.filter((k) => k !== sidePanelTriggerKey));
    }
  }, [sidePanelOpen, sidePanelTriggerKey]);

  useEffect(() => {
    if (sidePanelOpen && showSidePanel) {
      setSubOpenKeys((prev) =>
        prev.includes(sidePanelTriggerKey) ? prev : [...prev, sidePanelTriggerKey],
      );
    }
  }, [sidePanelOpen, showSidePanel, sidePanelTriggerKey]);

  useLayoutEffect(() => {
    if (!sidePanelMeasureTriggerRef || !overlayRootRef.current) return;
    const token = sidePanelTriggerRowClassName.split(/\s+/).find(Boolean);
    if (!token) {
      sidePanelMeasureTriggerRef.current = null;
      return;
    }
    const hit = overlayRootRef.current.querySelector(`.${token}`) as HTMLElement | null;
    const title = (hit?.closest(SUBMENU_TITLE_SELECTOR) as HTMLElement | null) ?? hit;
    sidePanelMeasureTriggerRef.current = title;
    return () => {
      sidePanelMeasureTriggerRef.current = null;
    };
  }, [open, sidePanelOpen, showSidePanel, sidePanelMeasureTriggerRef, sidePanelTriggerRowClassName, mergedMenuItems]);

  useLayoutEffect(() => {
    if (!sidePanelOpen || !showSidePanel) {
      layoutSigRef.current = '';
      return;
    }
    const el = slotInnerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const sig = `${el.offsetWidth}x${el.offsetHeight}`;
      if (sig !== layoutSigRef.current) {
        layoutSigRef.current = sig;
        onSidePanelLayoutSignatureChange?.();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [sidePanelOpen, showSidePanel, onSidePanelLayoutSignatureChange, mergedMenuItems]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean, info?: DropdownMenuSidePanelOpenChangeInfo) => {
      if (!nextOpen && info?.source === 'menu' && skipCloseFromTriggerRef.current) {
        skipCloseFromTriggerRef.current = false;
        return;
      }
      if (!nextOpen) {
        onSidePanelOpenChange(false);
        onOpenChange(false, info);
        return;
      }
      onOpenChange(true, info);
    },
    [onOpenChange, onSidePanelOpenChange],
  );

  const handleMenuOpenChange = useCallback(
    (keys: string[]) => {
      const trigger = String(sidePanelTriggerKey);
      const keyStrs = keys.map((k) => String(k));
      const parentSaysSideClosed = !sidePanelOpenRef.current;
      const parentSaysMenuClosed = !openRef.current;
      const keysSynced =
        (parentSaysSideClosed || parentSaysMenuClosed) && keyStrs.includes(trigger)
          ? keyStrs.filter((k) => k !== trigger)
          : keyStrs;
      setSubOpenKeys(keysSynced);
      const next = keysSynced.includes(trigger);
      // 仅同步「收起」：侧栏打开由 onTitleClick / onSidePanelMouseEnter 驱动。
      if (!next && sidePanelOpenRef.current) {
        onSidePanelOpenChange(false);
      }
    },
    [onSidePanelOpenChange, sidePanelTriggerKey],
  );

  const handleMenuClick = useCallback<NonNullable<MenuProps['onClick']>>(
    (info) => {
      const key = String(info.key);
      if (key.endsWith(SIDE_PANEL_SLOT_KEY_SUFFIX)) {
        info.domEvent.stopPropagation();
        return;
      }
      if (sidePanelTriggerKey && key === sidePanelTriggerKey) {
        return;
      }
      onSidePanelOpenChange(false);
      onMenuClick?.(info);
    },
    [onMenuClick, onSidePanelOpenChange, sidePanelTriggerKey],
  );

  const dropdownProps: DropdownPassthrough = {
    trigger: ['click'],
    open: mergedDropdownOpen,
    onOpenChange: handleOpenChange,
    /** 主浮层关闭时销毁挂载，避免 SubMenu 挂 body 时子弹层残留 */
    destroyOnHidden: true,
    overlayClassName,
    overlayStyle: { overflow: 'visible' },
    placement,
    /** 替换式侧栏常伴随宽度变化；关闭 slide 动画可减少与 rc-align 调整叠加的「先偏一侧再拉回」观感 */
    ...(replacePrimaryWithSidePanel ? { transitionName: '' } : {}),
    ...(alignOffsetX !== 0 || alignOffsetY !== 0 ? { align: { offset: [alignOffsetX, alignOffsetY] } } : {}),
    popupRender: () => (
      <div
        ref={overlayRootRef}
        className={joinClassNames('vc-biz-dropdown-menu-side-panel-root', comboClassName)}
        onMouseDown={(e) => e.preventDefault()}
        onMouseLeave={
          closeSidePanelOnOverlayMouseLeave
            ? (e) => {
                const next = e.relatedTarget as Node | null;
                if (next && e.currentTarget.contains(next)) return;
                if (next instanceof Element && next.closest(SUBMENU_POPUP_CLOSE_GUARD)) return;
                onSidePanelOpenChange(false);
              }
            : undefined
        }
        onClick={(e) => {
          const el = e.target as HTMLElement | null;
          if (!el) return;
          if (el.closest(SUBMENU_POPUP_CLOSE_GUARD)) {
            e.stopPropagation();
            return;
          }
          if (el.closest('.vc-biz-dropdown-menu-side-panel__side-only-root')) {
            e.stopPropagation();
            return;
          }
          if (!el.closest(MENU_INTERACTIVE_SELECTOR)) {
            onSidePanelOpenChange(false);
            handleOpenChange(false, { source: 'menu' });
          }
          e.stopPropagation();
        }}
      >
        {open ? (
          <div
            className={joinClassNames('vc-biz-dropdown-menu-side-panel__menu-wrap', primaryMenuClassName)}
            style={primaryMenuStyle}
          >
            <Menu
              mode="vertical"
              selectable={false}
              className={menuClassName}
              items={mergedMenuItems}
              openKeys={subOpenKeys}
              onOpenChange={handleMenuOpenChange}
              triggerSubMenuAction={subMenuTriggerAction}
              onClick={handleMenuClick}
              forceSubMenuRender
            />
          </div>
        ) : replacePrimaryWithSidePanel && sidePanelOpen && showSidePanel ? (
          <div
            ref={slotInnerRef}
            className={joinClassNames(
              'vc-biz-dropdown-menu-side-panel__side-only-root',
              primaryMenuClassName,
            )}
            style={primaryMenuStyle}
            onMouseDown={(e) => e.preventDefault()}
          >
            {renderSidePanel()}
          </div>
        ) : null}
      </div>
    ),
  };

  return <Dropdown {...dropdownProps}>{children}</Dropdown>;
}
