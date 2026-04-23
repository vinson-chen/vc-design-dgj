import * as XLSX from 'xlsx';
import { describe, expect, it } from 'vitest';
import { parseExcelFirstSheet } from './parseExcelFirstSheet';

const LIMITS = { minCol: 2, maxCol: 40, minRowCount: 2, maxRowCount: 1001 } as const;

describe('parseExcelFirstSheet', () => {
  it('maps header row and body, empty stays empty string', () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['A', 'B'],
      ['1', ''],
      ['', '2'],
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'S1');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
    const { valueByCell, colCount, rowCount } = parseExcelFirstSheet(buf, LIMITS);
    expect(colCount).toBe(2);
    expect(rowCount).toBe(3);
    expect(valueByCell['header-0']).toBe('A');
    expect(valueByCell['header-1']).toBe('B');
    expect(valueByCell['0-0']).toBe('1');
    expect(valueByCell['0-1']).toBe('');
    expect(valueByCell['1-0']).toBe('');
    expect(valueByCell['1-1']).toBe('2');
  });
});
