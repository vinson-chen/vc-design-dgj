import type React from 'react';
import {
  EDIT_TEXTAREA_MAX_ROWS,
  TABLE_GRID_TYPOGRAPHY_COMPACT,
  tableTextClampNStyleFromMetrics,
} from './tableGridTypography';

export { EDIT_TEXTAREA_MAX_ROWS } from './tableGridTypography';

const c = TABLE_GRID_TYPOGRAPHY_COMPACT;

export function cellKey(r: number, c: number) {
  return `${r}-${c}`;
}

/** 紧凑态（12px）文案样式；运行时应优先使用 Context 内 typography.tableTextStyle */
export const tableTextStyle: React.CSSProperties = c.tableTextStyle;

export function tableTextClampNStyle(lines: number): React.CSSProperties {
  return tableTextClampNStyleFromMetrics(lines, c);
}

/** 紧凑态行高 px，供单测 */
export const EDIT_TEXTAREA_LINE_HEIGHT_PX = c.lineHeightPx;
export const DISPLAY_TEXT_MAX_HEIGHT_PX = c.displayTextMaxHeightPx;
export const BODY_CELL_PADDING_Y = c.bodyCellPaddingY;
export const BODY_CELL_PADDING_X = c.bodyCellPaddingX;
export const EDIT_CELL_EDGE_PADDING = c.editCellEdgePadding;
export const DISPLAY_CELL_MAX_HEIGHT_PX = c.displayCellMaxHeightPx;
export const EDIT_CELL_MAX_HEIGHT_PX = c.editCellMaxHeightPx;

/** 大表表体行：浏览器可跳过视口外绘制/布局，减轻千行级卡顿（勿与虚拟列表同用） */
export const TABLE_BODY_ROW_PERF_STYLE: React.CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: `auto ${c.displayCellMaxHeightPx}px`,
};

/** 虚拟列表首帧 estimateSize（紧凑态兜底） */
export const TABLE_BODY_VIRTUAL_ROW_ESTIMATE_PX = c.bodyVirtualRowEstimatePx;

/** 表头行虚拟列表首帧估算（紧凑态） */
export const TABLE_HEADER_ROW_ESTIMATE_PX = c.headerVirtualRowEstimatePx;

/**
 * 纵滚虚拟列表在可见区上下的「多渲染行数」。过小会在触控板惯性/快速滚轮下单帧跳过过大，
 * 出现行间空白裂缝；取「约一屏可见行 + 额外缓冲」与下限中的较大值。
 */
export const TABLE_VIRTUAL_OVERSCAN_EXTRA_ROWS = 14;
export const TABLE_VIRTUAL_OVERSCAN_MIN_ROWS = 22;

export function getTableBodyVirtualOverscan(
  viewportMaxHeightPx: number,
  bodyRowEstimatePx: number = TABLE_GRID_TYPOGRAPHY_COMPACT.bodyVirtualRowEstimatePx
): number {
  const h = Math.max(1, viewportMaxHeightPx);
  const visibleRows = Math.ceil(h / bodyRowEstimatePx);
  return Math.max(TABLE_VIRTUAL_OVERSCAN_MIN_ROWS, visibleRows + TABLE_VIRTUAL_OVERSCAN_EXTRA_ROWS);
}

/** 表体默认底色 */
export const TABLE_BODY_BG_DEFAULT = '#FFFFFF';
