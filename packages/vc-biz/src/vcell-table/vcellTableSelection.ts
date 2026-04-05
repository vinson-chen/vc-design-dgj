import type { VcellCellAddress } from './vcellTableTypes';

export type VcellSelectionRange = {
  rowStart: number;
  rowEnd: number;
  colStartIndex: number;
  colEndIndex: number;
};

export function compareAddrInTableOrder(
  a: VcellCellAddress,
  b: VcellCellAddress,
  columnIds: string[],
): number {
  const ai = columnIds.indexOf(a.columnId);
  const bi = columnIds.indexOf(b.columnId);
  if (a.rowIndex !== b.rowIndex) return a.rowIndex - b.rowIndex;
  return ai - bi;
}

export function normalizeSelectionRange(
  anchor: VcellCellAddress,
  focus: VcellCellAddress,
  columnIds: string[],
  rowCount: number,
): VcellSelectionRange | null {
  if (rowCount <= 0 || columnIds.length === 0) return null;
  const ai = columnIds.indexOf(anchor.columnId);
  const fi = columnIds.indexOf(focus.columnId);
  if (ai < 0 || fi < 0) return null;
  const rowStart = Math.max(0, Math.min(anchor.rowIndex, focus.rowIndex));
  const rowEnd = Math.min(rowCount - 1, Math.max(anchor.rowIndex, focus.rowIndex));
  const colStartIndex = Math.max(0, Math.min(ai, fi));
  const colEndIndex = Math.min(columnIds.length - 1, Math.max(ai, fi));
  return { rowStart, rowEnd, colStartIndex, colEndIndex };
}

export function isCellInRange(
  rowIndex: number,
  columnId: string,
  range: VcellSelectionRange | null,
  columnIds: string[],
): boolean {
  if (!range) return false;
  const ci = columnIds.indexOf(columnId);
  if (ci < 0) return false;
  return (
    rowIndex >= range.rowStart &&
    rowIndex <= range.rowEnd &&
    ci >= range.colStartIndex &&
    ci <= range.colEndIndex
  );
}

export function rangeToTsv<TData>(
  range: VcellSelectionRange,
  columnIds: string[],
  visibleRows: { original: TData }[],
  getCellString: (row: TData, columnId: string) => string,
): string {
  const lines: string[] = [];
  for (let r = range.rowStart; r <= range.rowEnd; r += 1) {
    const row = visibleRows[r]?.original;
    if (!row) continue;
    const cells: string[] = [];
    for (let c = range.colStartIndex; c <= range.colEndIndex; c += 1) {
      const id = columnIds[c];
      if (!id) continue;
      const raw = getCellString(row, id);
      cells.push(escapeTsvCell(raw));
    }
    lines.push(cells.join('\t'));
  }
  return lines.join('\n');
}

function escapeTsvCell(s: string): string {
  if (s.includes('\n') || s.includes('\t') || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function parseTsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === '\t') {
      row.push(cur);
      cur = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cur);
      cur = '';
      rows.push(row);
      row = [];
    } else {
      cur += ch;
    }
  }
  row.push(cur);
  rows.push(row);
  while (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
    rows.pop();
  }
  return rows;
}
