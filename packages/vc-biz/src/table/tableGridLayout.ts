import type React from 'react';
import { vcTokens } from 'vc-design';

export function getFreezeDividerStyle(position: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    bottom: 0,
    [position]: position === 'left' ? 0 : -1,
    width: 1,
    background: vcTokens.color.neutral.border.default,
    zIndex: 10,
    pointerEvents: 'none',
  };
}

export function getTextColWrapStyle(
  w: number | null,
  minTextColWidth: number,
  narrowWidth: number,
  colIndex: number,
  colCount: number,
  freezeFirst: boolean,
  freezeLast: boolean,
  freezeLastStickyRightInset: number
): React.CSSProperties {
  const flexValue = w != null ? `0 0 ${w}px` : `1 0 ${minTextColWidth}px`;
  const minW = w != null ? w : minTextColWidth;

  return {
    flex: flexValue,
    minWidth: minW,
    display: 'flex',
    position:
      freezeFirst && colIndex === 0
        ? 'sticky'
        : freezeLast && colIndex === colCount - 1
          ? 'sticky'
          : undefined,
    left: freezeFirst && colIndex === 0 ? narrowWidth : undefined,
    right:
      freezeLast && colIndex === colCount - 1 ? freezeLastStickyRightInset : undefined,
    zIndex:
      freezeFirst && colIndex === 0
        ? 4
        : freezeLast && colIndex === colCount - 1
          ? 3
          : undefined,
  };
}
