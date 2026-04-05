import { describe, expect, it } from 'vitest';
import {
  getFreezeDividerStyle,
  getTableRowGridTemplateColumns,
  getTextColGridItemShellStyle,
} from './tableGridLayout';

describe('tableGridLayout', () => {
  it('getTableRowGridTemplateColumns uses minmax 1fr for equal columns', () => {
    const g = getTableRowGridTemplateColumns({
      narrowWidth: 40,
      colCount: 3,
      enableInsertRowCol: false,
      minTextColWidth: 100,
      colWidths: [],
      insertLayoutTextColPx: null,
      enableColumnResize: false,
    });
    expect(g).toBe('40px minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr)');
  });

  it('getTableRowGridTemplateColumns appends narrow insert column', () => {
    const g = getTableRowGridTemplateColumns({
      narrowWidth: 40,
      colCount: 2,
      enableInsertRowCol: true,
      minTextColWidth: 100,
      colWidths: [],
      insertLayoutTextColPx: 160,
      enableColumnResize: false,
    });
    expect(g).toBe('40px minmax(160px, 1fr) minmax(160px, 1fr) 40px');
  });

  it('getTextColGridItemShellStyle sticks first column', () => {
    const s = getTextColGridItemShellStyle(40, 0, 4, true, false, 0);
    expect(s.position).toBe('sticky');
    expect(s.left).toBe(40);
    expect(s.minWidth).toBe(0);
  });

  it('getFreezeDividerStyle sets vertical line', () => {
    const left = getFreezeDividerStyle('left');
    expect(left.position).toBe('absolute');
    expect(left.width).toBe(1);
    expect(left.pointerEvents).toBe('none');
  });
});
