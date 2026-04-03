import { describe, expect, it } from 'vitest';
import { getFreezeDividerStyle, getTextColWrapStyle } from './tableGridLayout';

describe('tableGridLayout', () => {
  it('getTextColWrapStyle uses equal-split flex when width unset', () => {
    const s = getTextColWrapStyle(null, 100, 40, 2, 8, false, false, 0);
    expect(s.flex).toBe('1 0 100px');
    expect(s.minWidth).toBe(100);
    expect(s.display).toBe('flex');
  });

  it('getTextColWrapStyle uses fixed flex when width set', () => {
    const s = getTextColWrapStyle(160, 100, 40, 0, 5, false, false, 0);
    expect(s.flex).toBe('0 0 160px');
    expect(s.minWidth).toBe(160);
  });

  it('getTextColWrapStyle sticks first column', () => {
    const s = getTextColWrapStyle(120, 100, 40, 0, 4, true, false, 0);
    expect(s.position).toBe('sticky');
    expect(s.left).toBe(40);
  });

  it('getFreezeDividerStyle sets vertical line', () => {
    const left = getFreezeDividerStyle('left');
    expect(left.position).toBe('absolute');
    expect(left.width).toBe(1);
    expect(left.pointerEvents).toBe('none');
  });
});
