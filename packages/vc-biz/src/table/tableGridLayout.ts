import type React from 'react';
import { vcTokens } from 'vc-design';

export type TableRowGridColumnsParams = Readonly<{
  narrowWidth: number;
  /** false：不生成首列窄轨（无 checkbox/序号/插入行+ 列） */
  showNarrowLeadColumn: boolean;
  colCount: number;
  visibleColIndexes?: ReadonlyArray<number>;
  enableInsertRowCol: boolean;
  minTextColWidth: number;
  defaultTextColWidth: number;
  colWidths: ReadonlyArray<number | null>;
  enableColumnResize: boolean;
}>;

/**
 * 表头/表体共用同一套列轨道；各列「最终宽度」由本函数生成的 grid 轨道决定，
 * 外行/单元格上的 width:100% 只是铺满轨道，不替代这里的 px / minmax / fr。
 */
export function getTableRowGridTemplateColumns(p: TableRowGridColumnsParams): string {
  const parts: string[] = [];
  if (p.showNarrowLeadColumn) {
    parts.push(`${p.narrowWidth}px`);
  }
  const visible = p.visibleColIndexes ?? Array.from({ length: p.colCount }, (_, i) => i);
  const displayColCount = visible.length + (p.enableInsertRowCol ? 1 : 0);

  for (let viewColIndex = 0; viewColIndex < displayColCount; viewColIndex += 1) {
    if (p.enableInsertRowCol && viewColIndex === visible.length) {
      parts.push(`${p.narrowWidth}px`);
      continue;
    }
    const colIndex = visible[viewColIndex]!;

    const storedW = p.enableColumnResize ? p.colWidths[colIndex] ?? null : null;
    if (storedW != null) {
      parts.push(`${storedW}px`);
      continue;
    }
    parts.push(`${p.defaultTextColWidth}px`);
  }

  // 末列不再自适应；开启插入列时，让“插入列右侧空白区”自适应填充可视区剩余宽度。
  if (p.enableInsertRowCol) {
    parts.push('minmax(0px, 1fr)');
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
  // 仅 2 列时同时冻结首/末列会导致两列分别 sticky 到左右两侧，
  // 在 grid 轨道仍等分的情况下出现“中间空档”的视觉问题。
  // 这里做一个稳定策略：当列数 <= 2 时，只保留冻结首列（更常见的预期）。
  const effectiveFreezeLast = freezeLast && !(freezeFirst && colCount <= 2);
  return {
    display: 'flex',
    minWidth: 0,
    position:
      freezeFirst && colIndex === 0
        ? 'sticky'
        : effectiveFreezeLast && colIndex === colCount - 1
          ? 'sticky'
          : undefined,
    left: freezeFirst && colIndex === 0 ? narrowWidth : undefined,
    right:
      effectiveFreezeLast && colIndex === colCount - 1 ? freezeLastStickyRightInset : undefined,
    zIndex:
      freezeFirst && colIndex === 0
        ? 4
        : effectiveFreezeLast && colIndex === colCount - 1
          ? 3
          : undefined,
  };
}

export function getFreezeDividerStyle(position: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    bottom: 0,
    [position]: position === 'right' ? -1 : 0,
    width: 1,
    background: vcTokens.color.neutral.border.default,
    zIndex: 10,
    pointerEvents: 'none',
  };
}
