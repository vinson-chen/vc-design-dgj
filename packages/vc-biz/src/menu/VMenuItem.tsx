import React from 'react';
import { vcTokens } from 'vc-design';

export type VMenuItemAlign = 'left' | 'center';
/** @deprecated Use VMenuItemAlign instead */
export type BizMenuItemAlign = VMenuItemAlign;

export type VMenuItemState = 'default' | 'hover' | 'active';
/** @deprecated Use VMenuItemState instead */
export type BizMenuItemState = VMenuItemState;

export interface VMenuItemProps {
  label: string;
  displayLabel?: string;
  align?: VMenuItemAlign;
  state?: VMenuItemState | undefined;
  dark?: boolean;
  onClick?: () => void;
}

/** @deprecated Use VMenuItemProps instead */
export type BizMenuItemProps = VMenuItemProps;

export default function VMenuItem({
  label,
  displayLabel,
  align = 'left',
  state,
  dark = true,
  onClick,
}: VMenuItemProps) {
  const [isHovering, setIsHovering] = React.useState(false);
  const finalState: VMenuItemState =
    state ?? (isHovering ? 'hover' : 'default');
  const isActive = finalState === 'active';
  const isHover = finalState === 'hover';

  const background = isActive
    ? vcTokens.color.primary.default
    : isHover
      ? dark
        ? vcTokens.color.menu.itemHoverOverlayOnNav
        : vcTokens.color.neutral.fill.secondary
      : 'transparent';

  const color = isActive
    ? vcTokens.color.neutral.text.solid
    : dark
      ? isHover
        ? vcTokens.color.neutral.text.solid
        : vcTokens.color.menu.textSecondaryOnNav
      : isHover
        ? vcTokens.color.neutral.text.default
        : vcTokens.color.neutral.text.label;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        width: align === 'left' ? 84 : 40,
        height: 28,
        border: 'none',
        borderRadius: vcTokens.style.borderRadius.sm,
        background,
        color,
        textAlign: align === 'left' ? 'left' : 'center',
        fontSize: 12,
        lineHeight: '20px',
        padding: align === 'left' ? '4px 8px' : '4px 0',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {displayLabel ?? label}
    </button>
  );
}