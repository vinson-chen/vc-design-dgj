import { describe, expect, it } from 'vitest';
import {
  cellKey,
  DISPLAY_TEXT_MAX_HEIGHT_PX,
  EDIT_TEXTAREA_LINE_HEIGHT_PX,
  EDIT_TEXTAREA_MAX_ROWS,
} from './tableGridConstants';

describe('tableGridConstants', () => {
  it('cellKey joins row and column', () => {
    expect(cellKey(0, 0)).toBe('0-0');
    expect(cellKey(12, 3)).toBe('12-3');
  });

  it('display max height matches 6 lines × line height', () => {
    expect(DISPLAY_TEXT_MAX_HEIGHT_PX).toBe(EDIT_TEXTAREA_MAX_ROWS * EDIT_TEXTAREA_LINE_HEIGHT_PX);
  });
});
