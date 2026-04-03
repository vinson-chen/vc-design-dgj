import React, { useState } from 'react';
import { VcIcon, vcTokens } from 'vc-design';
import BizMenuItem, { type BizMenuItemAlign } from './BizMenuItem';
import { figmaMenuIconNames, resolveMenuIconFromFigma } from './figmaIconResolver';

export interface BizMenuGroupItem {
  key: string;
  label: string;
  iconName?: string;
}

export interface BizMenuGroupProps {
  title: string;
  items?: BizMenuGroupItem[];
  groupIconName?: string;
  opened?: boolean;
  small?: boolean;
  dark?: boolean;
  activeItemKey?: string;
  onToggle?: () => void;
  onSelectItem?: (key: string) => void;
}

export default function BizMenuGroup({
  title,
  items = [],
  groupIconName = figmaMenuIconNames.groupIcon,
  opened = false,
  small = false,
  dark = true,
  activeItemKey,
  onToggle,
  onSelectItem,
}: BizMenuGroupProps) {
  const [headHover, setHeadHover] = useState(false);
  const align: BizMenuItemAlign = small ? 'center' : 'left';
  const solid = vcTokens.color.neutral.text.solid;
  const titleColorBase = dark
    ? opened
      ? solid
      : vcTokens.color.menu.textSecondaryOnNav
    : opened
      ? vcTokens.color.neutral.text.default
      : vcTokens.color.neutral.text.label;
  /** 侧栏收起（small）或分组收起（!opened）时悬停组头：图标与文案用 colorTextSolid（暗色侧栏为 neutral.text.solid） */
  const hoverEmphasis = dark ? solid : vcTokens.color.neutral.text.default;
  const titleColor =
    headHover && (small || !opened) ? hoverEmphasis : titleColorBase;

  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={() => setHeadHover(true)}
        onMouseLeave={() => setHeadHover(false)}
        style={{
          width: small ? 48 : 180,
          height: 48,
          border: 'none',
          background: 'transparent',
          color: titleColor,
          display: 'grid',
          gridTemplateColumns: small ? '1fr' : '16px 1fr 16px',
          alignItems: 'center',
          justifyItems: small ? 'center' : 'stretch',
          gap: small ? 2 : 8,
          padding: small ? '6px 4px' : '0 12px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <VcIcon type={resolveMenuIconFromFigma(groupIconName)} />
        <span
          style={{
            fontSize: small ? 12 : 14,
            lineHeight: small ? '20px' : '22px',
            textAlign: small ? 'center' : 'left',
          }}
        >
          {small ? title.slice(0, 2) : title}
        </span>
        {!small ? (
          <span style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <VcIcon
              type={resolveMenuIconFromFigma(
                opened ? figmaMenuIconNames.groupActionOpen : figmaMenuIconNames.groupActionClose,
              )}
              fontSize={16}
            />
          </span>
        ) : null}
      </button>

      {opened && items.length > 0 ? (
        <div
          style={{
            width: small ? 48 : 180,
            display: 'grid',
            gridTemplateColumns: small ? '40px' : '84px 84px',
            justifyContent: 'center',
            gap: small ? 4 : 4,
            padding: small ? '4px 0 4px' : '4px 4px 4px',
            background: dark ? vcTokens.color.menu.itemSlotFill : undefined,
          }}
        >
          {items.map((item) => (
            <BizMenuItem
              key={item.key}
              label={item.label}
              displayLabel={small ? item.label.slice(0, 2) : item.label}
              align={align}
              dark={dark}
              state={activeItemKey === item.key ? 'active' : undefined}
              onClick={() => onSelectItem?.(item.key)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
