import type React from 'react';
import { vcTokens } from 'vc-design';

/** 与 TableGridTextCell 内编辑区 maxRows 一致 */
export const EDIT_TEXTAREA_MAX_ROWS = 6;

export type TableGridTypographyMetrics = Readonly<{
  fontSizePx: number;
  lineHeightPx: number;
  tableTextStyle: React.CSSProperties;
  bodyCellPaddingY: number;
  bodyCellPaddingX: number;
  headerCellPaddingY: number;
  editCellEdgePadding: number;
  displayTextMaxHeightPx: number;
  displayCellMaxHeightPx: number;
  editCellMaxHeightPx: number;
  bodyVirtualRowEstimatePx: number;
  headerVirtualRowEstimatePx: number;
  theadCellMinHeightPx: number;
  editTextareaChromePadPx: number;
  /** 表体编辑/失焦态 TextArea：与展示态文字左缘对齐（扣掉 Ant Input 约 1px 边框） */
  bodyCellTextareaContentPadX: number;
}>;

/** 与 Ant Design Input.TextArea 默认左边框宽度一致，用于与 `bodyCellPaddingX` 对齐 */
const ANT_TEXTAREA_BORDER_W = 1;

/**
 * @param enableRegular true：vc `font.size.base` / `lineHeight.base`（默认 14/22）；false：紧凑 sm（12/20）
 */

export function getTableGridTypographyMetrics(enableRegular: boolean): TableGridTypographyMetrics {
  const smFs = vcTokens.style.font.size.sm;
  const baseFs = vcTokens.style.font.size.base;
  const lhSm = vcTokens.style.font.lineHeight.sm;
  const lhBase = vcTokens.style.font.lineHeight.base;
  const fontSizePx = enableRegular ? baseFs : smFs;
  const lineHeightPx = enableRegular ? lhBase : lhSm;
  const tableTextStyle: React.CSSProperties = {
    fontSize: fontSizePx,
    lineHeight: `${lineHeightPx}px`,
    height: lineHeightPx,
    display: 'inline-flex',
    alignItems: 'center',
  };
  const bodyCellPaddingY = 8;
  const bodyCellPaddingX = vcTokens.size.padding.sm;
  const headerCellPaddingY = vcTokens.size.padding.xs;
  const editCellEdgePadding = 3;
  const editTextareaChromePadPx = enableRegular ? 20 : 18;
  const bodyCellTextareaContentPadX = Math.max(
    0,
    bodyCellPaddingX - editCellEdgePadding - ANT_TEXTAREA_BORDER_W
  );
  const displayTextMaxHeightPx = EDIT_TEXTAREA_MAX_ROWS * lineHeightPx;
  const displayCellMaxHeightPx = bodyCellPaddingY * 2 + displayTextMaxHeightPx + 2;
  const editCellMaxHeightPx =
    editCellEdgePadding * 2 + displayTextMaxHeightPx + editTextareaChromePadPx;
  const theadCellMinHeightPx = enableRegular ? 40 : 36;
  const headerVirtualRowEstimatePx = enableRegular ? 44 : 40;
  const bodyVirtualRowEstimatePx = Math.ceil(displayCellMaxHeightPx);
  return {
    fontSizePx,
    lineHeightPx,
    tableTextStyle,
    bodyCellPaddingY,
    bodyCellPaddingX,
    headerCellPaddingY,
    editCellEdgePadding,
    displayTextMaxHeightPx,
    displayCellMaxHeightPx,
    editCellMaxHeightPx,
    bodyVirtualRowEstimatePx,
    headerVirtualRowEstimatePx,
    theadCellMinHeightPx,
    editTextareaChromePadPx,
    bodyCellTextareaContentPadX,
  };
}

/** 紧凑 12/20，与历史 tableGridConstants 对齐，供单测与默认 overscan 兜底 */
export const TABLE_GRID_TYPOGRAPHY_COMPACT = getTableGridTypographyMetrics(false);

export function tableTextClampNStyleFromMetrics(
  lines: number,
  m: TableGridTypographyMetrics
): React.CSSProperties {
  return {
    fontSize: m.fontSizePx,
    lineHeight: `${m.lineHeightPx}px`,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflow: 'hidden',
    maxHeight: lines * m.lineHeightPx,
  };
}
