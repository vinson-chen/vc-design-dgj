import React from 'react';
import { VcIcon, Dropdown, vcTokens } from 'vc-design';
import { renderSwitchTabIcon } from './iconResolver';
import './SwitchTabs.css';

export interface SwitchTabItemData {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface SwitchTabsProps {
  items: SwitchTabItemData[];
  showIcon?: boolean;
  /** 为 false 时不渲染下方联动面板（仅保留 tab 导航行，适合与操作区同级的工具条场景） */
  showPanel?: boolean;
  activeKey: string;
  onChange: (key: string) => void;
}

function SwitchTabItemLabel({
  label,
  icon,
  showIcon,
}: {
  label: string;
  icon?: string;
  showIcon: boolean;
}) {
  return (
    <span className="biz-switch-tab-item">
      {showIcon ? renderSwitchTabIcon(icon) : null}
      <span>{label}</span>
    </span>
  );
}

export default function SwitchTabs({
  items,
  showIcon = true,
  showPanel = true,
  activeKey,
  onChange,
}: SwitchTabsProps) {
  const navRef = React.useRef<HTMLDivElement | null>(null);
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const moreRef = React.useRef<HTMLButtonElement | null>(null);
  const measureRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const moreMeasureRef = React.useRef<HTMLButtonElement | null>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [itemWidths, setItemWidths] = React.useState<Record<string, number>>({});
  const [moreWidth, setMoreWidth] = React.useState(0);
  const [inkBarStyle, setInkBarStyle] = React.useState<{ left: number; width: number; visible: boolean }>({
    left: 0,
    width: 0,
    visible: false,
  });

  const activeItem = React.useMemo(
    () => items.find((item) => item.key === activeKey) ?? items.find((item) => !item.disabled),
    [items, activeKey],
  );

  const { visibleItems, hiddenItems } = React.useMemo(() => {
    if (items.length === 0) return { visibleItems: [], hiddenItems: [] as SwitchTabItemData[] };
    if (containerWidth <= 0 || moreWidth <= 0) return { visibleItems: items, hiddenItems: [] as SwitchTabItemData[] };

    const widthsReady = items.every((item) => typeof itemWidths[item.key] === 'number' && itemWidths[item.key] > 0);
    if (!widthsReady) return { visibleItems: items, hiddenItems: [] as SwitchTabItemData[] };

    const fullWidth = items.reduce((sum, item) => sum + (itemWidths[item.key] ?? 0), 0);
    if (fullWidth <= containerWidth) return { visibleItems: items, hiddenItems: [] as SwitchTabItemData[] };

    let used = 0;
    const visible: SwitchTabItemData[] = [];
    for (let i = 0; i < items.length; i += 1) {
      const w = itemWidths[items[i].key] ?? 0;
      if (used + w + moreWidth <= containerWidth) {
        visible.push(items[i]);
        used += w;
      } else {
        break;
      }
    }

    // 至少保留一个 tab，避免只剩 more
    if (visible.length === 0) visible.push(items[0]);

    const visibleKeySet = new Set(visible.map((it) => it.key));
    const hidden = items.filter((it) => !visibleKeySet.has(it.key));
    return { visibleItems: visible, hiddenItems: hidden };
  }, [items, containerWidth, moreWidth, itemWidths]);

  const activeInHidden = React.useMemo(
    () => !!activeItem && hiddenItems.some((item) => item.key === activeItem.key),
    [activeItem, hiddenItems],
  );

  const updateInkBar = React.useCallback(() => {
    const nav = navRef.current;
    const activeTab = activeInHidden
      ? moreRef.current
      : (activeItem ? tabRefs.current[activeItem.key] : null);
    if (!nav || !activeTab) {
      setInkBarStyle({ left: 0, width: 0, visible: false });
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    setInkBarStyle({
      left: tabRect.left - navRect.left,
      width: tabRect.width,
      visible: true,
    });
  }, [activeItem, activeInHidden]);

  React.useLayoutEffect(() => {
    const nextWidths: Record<string, number> = {};
    items.forEach((item) => {
      const w = measureRefs.current[item.key]?.offsetWidth ?? 0;
      if (w > 0) nextWidths[item.key] = w;
    });
    const mw = moreMeasureRef.current?.offsetWidth ?? 0;
    setItemWidths(nextWidths);
    setMoreWidth(mw);
    updateInkBar();
  }, [updateInkBar, items, showIcon]);

  const readNavContentWidth = React.useCallback((nav: HTMLDivElement) => {
    const style = getComputedStyle(nav);
    const pl = parseFloat(style.paddingLeft) || 0;
    const pr = parseFloat(style.paddingRight) || 0;
    return nav.clientWidth - pl - pr;
  }, []);

  React.useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(() => {
      setContainerWidth(readNavContentWidth(nav));
      updateInkBar();
    });
    observer.observe(nav);
    setContainerWidth(readNavContentWidth(nav));
    return () => observer.disconnect();
  }, [updateInkBar, readNavContentWidth]);

  React.useEffect(() => {
    const onWindowResize = () => updateInkBar();
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, [updateInkBar]);

  const cssVars = React.useMemo(
    () =>
      ({
        '--switch-tabs-color-text': vcTokens.color.neutral.text.default,
        '--switch-tabs-color-text-disabled': vcTokens.color.neutral.text.disabled,
        '--switch-tabs-color-primary': vcTokens.color.primary.default,
        '--switch-tabs-color-primary-border': vcTokens.color.primary.border,
        '--switch-tabs-color-border': vcTokens.color.neutral.border.default,
        '--switch-tabs-bg-hover': vcTokens.color.neutral.fill.secondary,
        '--switch-tabs-bg-pressed': vcTokens.color.neutral.fill.default,
        '--switch-tabs-nav-min-height': `${48}px`,
        '--switch-tabs-nav-padding-h': `${vcTokens.size.padding.md}px`,
        '--switch-tabs-tab-padding-y': `${vcTokens.size.padding.xs}px`,
        '--switch-tabs-more-margin-left': `${vcTokens.size.padding.xxs}px`,
        '--switch-tabs-item-gap': `${vcTokens.size.padding.xs}px`,
        '--switch-tabs-item-min-height': `${vcTokens.size.controlHeight.md}px`,
        '--switch-tabs-item-padding-v': `${5}px`,
        '--switch-tabs-item-padding-h': `${vcTokens.size.padding.sm}px`,
        '--switch-tabs-item-radius': `${vcTokens.style.borderRadius.md}px`,
        '--switch-tabs-font-size': `${vcTokens.style.font.size.base}px`,
        '--switch-tabs-line-height': `${vcTokens.style.font.lineHeight.base}px`,
        '--switch-tabs-font-weight-default': 400,
        '--switch-tabs-font-weight-active': 500,
        '--switch-tabs-ink-bar-height': `${2}px`,
        '--switch-tabs-panel-min-height': `${40}px`,
      }) as React.CSSProperties,
    [],
  );

  return (
    <div
      className={`biz-switch-tabs${showPanel ? '' : ' biz-switch-tabs--no-panel'}`}
      style={cssVars}
    >
      <div className="biz-switch-tabs-nav" role="tablist" aria-orientation="horizontal" ref={navRef}>
        {visibleItems.map((item) => {
          const active = activeItem?.key === item.key;
          return (
            <button
              key={item.key}
              ref={(el) => {
                tabRefs.current[item.key] = el;
              }}
              className={`biz-switch-tabs-tab${active ? ' is-active' : ''}${item.disabled ? ' is-disabled' : ''}`}
              role="tab"
              type="button"
              aria-selected={active}
              aria-disabled={item.disabled}
              tabIndex={active ? 0 : -1}
              onClick={() => {
                if (!item.disabled) onChange(item.key);
              }}
            >
              <SwitchTabItemLabel label={item.label} icon={item.icon} showIcon={showIcon} />
            </button>
          );
        })}
        {hiddenItems.length > 0 ? (
          <Dropdown
            trigger={['click']}
            menu={{
              items: hiddenItems.map((item) => ({
                key: item.key,
                label: item.label,
                disabled: item.disabled,
              })),
              onClick: ({ key }) => onChange(String(key)),
            }}
          >
            <button
              ref={moreRef}
              className={`biz-switch-tabs-tab biz-switch-tabs-more${activeInHidden ? ' is-active' : ''}`}
              type="button"
            >
              <span className="biz-switch-tab-item">
                <VcIcon type="more" fontSize={16} />
              </span>
            </button>
          </Dropdown>
        ) : null}
        <span
          className="biz-switch-tabs-ink-bar"
          style={{
            width: inkBarStyle.width,
            transform: `translateX(${inkBarStyle.left}px)`,
            opacity: inkBarStyle.visible ? 1 : 0,
          }}
        />
      </div>

      {showPanel ? (
        <div className="biz-switch-tabs-panel" role="tabpanel">
          {activeItem?.children ?? (
            <div style={{ padding: '16px 0', color: vcTokens.color.neutral.text.default }}>
              {activeItem?.label ?? ''} 内容
            </div>
          )}
        </div>
      ) : null}

      <div className="biz-switch-tabs-measure">
        {items.map((item) => (
          <button
            key={`measure-${item.key}`}
            ref={(el) => {
              measureRefs.current[item.key] = el;
            }}
            className="biz-switch-tabs-tab"
            type="button"
          >
            <SwitchTabItemLabel label={item.label} icon={item.icon} showIcon={showIcon} />
          </button>
        ))}
        <button
          ref={moreMeasureRef}
          className="biz-switch-tabs-tab biz-switch-tabs-more"
          type="button"
        >
          <span className="biz-switch-tab-item">
            <VcIcon type="more" fontSize={16} />
          </span>
        </button>
      </div>
    </div>
  );
}
