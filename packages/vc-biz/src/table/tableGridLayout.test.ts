import { describe, expect, it } from 'vitest';
import {
  getFreezeDividerStyle,
  getTableRowGridTemplateColumns,
  getTextColGridItemShellStyle,
} from './tableGridLayout';

describe('tableGridLayout', () => {
  it('getTableRowGridTemplateColumns uses fixed widths for text columns', () => {
    const g = getTableRowGridTemplateColumns({
      narrowWidth: 40,
      showNarrowLeadColumn: true,
      colCount: 3,
      enableInsertRowCol: false,
      minTextColWidth: 100,
      defaultTextColWidth: 200,
      colWidths: [],
      enableColumnResize: false,
    });
    expect(g).toBe('40px 200px 200px 200px');
  });

  it('getTableRowGridTemplateColumns appends narrow insert column', () => {
    const g = getTableRowGridTemplateColumns({
      narrowWidth: 40,
      showNarrowLeadColumn: true,
      colCount: 2,
      enableInsertRowCol: true,
      minTextColWidth: 100,
      defaultTextColWidth: 200,
      colWidths: [],
      enableColumnResize: false,
    });
    expect(g).toBe('40px 200px 200px 40px minmax(0px, 1fr)');
  });

  it('getTableRowGridTemplateColumns omits lead column when showNarrowLeadColumn is false', () => {
    const g = getTableRowGridTemplateColumns({
      narrowWidth: 40,
      showNarrowLeadColumn: false,
      colCount: 2,
      enableInsertRowCol: false,
      minTextColWidth: 100,
      defaultTextColWidth: 200,
      colWidths: [],
      enableColumnResize: false,
    });
    expect(g).toBe('200px 200px');
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
