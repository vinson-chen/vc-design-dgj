import * as XLSX from 'xlsx';
import { cellKey } from './tableGridConstants';

export type ExcelImportLimits = Readonly<{
  minCol: number;
  maxCol: number;
  minRowCount: number;
  maxRowCount: number;
}>;

function cellToImportedString(cell: XLSX.CellObject | undefined): string {
  if (cell == null) return '';
  const w = cell.w;
  if (w != null && String(w).trim() !== '') return String(w);
  const v = cell.v;
  if (v == null || v === '') return '';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (v instanceof Date) {
    const iso = v.toISOString();
    return iso.slice(0, 10);
  }
  return String(v);
}

function readCell(
  sheet: XLSX.WorkSheet,
  row: number,
  col: number
): string {
  const addr = XLSX.utils.encode_cell({ r: row, c: col });
  return cellToImportedString(sheet[addr] as XLSX.CellObject | undefined);
}

/**
 * 首个工作表 → BizTable：`header-{c}` + `cellKey(bodyRow,c)`。
 * 空单元格保持空字符串；公式取计算结果（`cell.v` / `cell.w`）。
 */
export function parseExcelFirstSheet(
  arrayBuffer: ArrayBuffer,
  limits: ExcelImportLimits
): { valueByCell: Record<string, string>; colCount: number; rowCount: number } {
  const wb = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: true,
    dense: false,
  });
  const sheetName = wb.SheetNames[0];
  if (sheetName == null || sheetName === '') {
    throw new Error('工作簿中没有工作表');
  }
  const sheet = wb.Sheets[sheetName];
  const ref = sheet['!ref'];
  if (ref == null || ref === '') {
    throw new Error('首个工作表为空');
  }

  const range = XLSX.utils.decode_range(ref);
  const excelColSpan = range.e.c - range.s.c + 1;
  const excelRowSpan = range.e.r - range.s.r + 1;

  if (excelRowSpan < 1) {
    throw new Error('没有可读行');
  }

  let colCount = Math.min(Math.max(excelColSpan, 1), limits.maxCol);
  colCount = Math.max(colCount, limits.minCol);

  const excelBodyRows = excelRowSpan - 1;
  let bodyRows = Math.max(0, excelBodyRows);
  bodyRows = Math.min(bodyRows, limits.maxRowCount - 1);
  let rowCount = 1 + bodyRows;
  rowCount = Math.max(rowCount, limits.minRowCount);
  rowCount = Math.min(rowCount, limits.maxRowCount);

  const valueByCell: Record<string, string> = {};
  const baseRow = range.s.r;
  const baseCol = range.s.c;

  for (let c = 0; c < colCount; c += 1) {
    const ec = baseCol + c;
    if (ec <= range.e.c) {
      valueByCell[`header-${c}`] = readCell(sheet, baseRow, ec);
    } else {
      valueByCell[`header-${c}`] = '';
    }
  }

  for (let b = 0; b < rowCount - 1; b += 1) {
    const er = baseRow + 1 + b;
    for (let c = 0; c < colCount; c += 1) {
      const ec = baseCol + c;
      const key = cellKey(b, c);
      if (er > range.e.r || ec > range.e.c) {
        valueByCell[key] = '';
      } else {
        valueByCell[key] = readCell(sheet, er, ec);
      }
    }
  }

  return { valueByCell, colCount, rowCount };
}
