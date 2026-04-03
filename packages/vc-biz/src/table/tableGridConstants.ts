import type React from 'react';

export function cellKey(r: number, c: number) {
  return `${r}-${c}`;
}

export const tableTextStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: '20px',
  height: 20,
  display: 'inline-flex',
  alignItems: 'center',
};

export function tableTextClampNStyle(lines: number): React.CSSProperties {
  return {
    fontSize: 12,
    lineHeight: '20px',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
  };
}

export const EDIT_TEXTAREA_MAX_ROWS = 6;
export const EDIT_TEXTAREA_LINE_HEIGHT_PX = 20;
export const DISPLAY_TEXT_MAX_HEIGHT_PX = EDIT_TEXTAREA_MAX_ROWS * EDIT_TEXTAREA_LINE_HEIGHT_PX;
export const BODY_CELL_PADDING_Y = 8;
export const BODY_CELL_PADDING_X = 12;
export const EDIT_CELL_EDGE_PADDING = 3;
export const DISPLAY_CELL_MAX_HEIGHT_PX = BODY_CELL_PADDING_Y * 2 + DISPLAY_TEXT_MAX_HEIGHT_PX + 2;
export const EDIT_CELL_MAX_HEIGHT_PX = EDIT_CELL_EDGE_PADDING * 2 + DISPLAY_TEXT_MAX_HEIGHT_PX + 18;
