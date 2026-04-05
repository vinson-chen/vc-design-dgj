import type React from 'react';
import { vcTokens } from 'vc-design';

export type TableRowGridColumnsParams = Readonly<{
  narrowWidth: number;
  colCount: number;
  enableInsertRowCol: boolean;
  minTextColWidth: number;
  colWidths: ReadonlyArray<number | null>;
  insertLayoutTextColPx: number | null;
  enableColumnResize: boolean;
}>;

/**
 * 表头/表体共用同一套列轨道；各列「最终宽度」由本函数生成的 grid 轨道决定，
 * 外行/单元格上的 width:100% 只是铺满轨道，不替代这里的 px / minmax / fr。
 */
export function getTableRowGridTemplateColumns(p: TableRowGridColumnsParams): string {
  const parts: string[] = [`${p.narrowWidth}px`];
  const displayColCount = p.colCount + (p.enableInsertRowCol ? 1 : 0);

  for (let colIndex = 0; colIndex < displayColCount; colIndex += 1) {
    if (p.enableInsertRowCol && colIndex === p.colCount) {
      parts.push(`${p.narrowWidth}px`);
      continue;
    }

    const storedW = p.enableColumnResize ? p.colWidths[colIndex] ?? null : null;
    const layoutW: number | null =
      p.insertLayoutTextColPx != null
        ? storedW != null
          ? storedW
          : p.insertLayoutTextColPx
        : storedW;

    if (layoutW != null) {
      parts.push(
        p.insertLayoutTextColPx != null
          ? `minmax(${layoutW}px, 1fr)`
          : `${layoutW}px`
      );
    } else {
      parts.push(`minmax(${p.minTextColWidth}px, 1fr)`);
    }
  }

  return parts.join(' ');
}

/** 行容器已用 grid 定义列宽时，文本列外壳只保留 sticky，不再用 flex 定宽 */
export function getTextColGridItemShellStyle(
  narrowWidth: number,
  colIndex: number,
  colCount: number,
  freezeFirst: boolean,
  freezeLast: boolean,
  freezeLastStickyRightInset: number
): React.CSSProperties {
  return {
    display: 'flex',
    minWidth: 0,
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
