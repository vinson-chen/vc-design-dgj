import {
  cellSelectionSetKey,
  cellStorageKey,
  parseCellSelectionSetKey,
} from './tableGridCellAddress';

export function parseClipboardMatrix(text: string): { matrix: string[][]; isMatrix: boolean } {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = normalized.split('\n');
  const matrix = rows.map((row) => row.split('\t'));
  const rowCount = matrix.length;
  const colCount = matrix.reduce((m, row) => Math.max(m, row.length), 0);
  const isMatrix = rowCount >= 2 || colCount >= 2;
  return { matrix, isMatrix };
}

export function serializeSelectionToTsv(
  selectedCells: ReadonlySet<string>,
  valueByCell: Record<string, string>,
  anchor: { r: number; c: number } | null
): string {
  if (selectedCells.size === 0) return '';
  const parsed = Array.from(selectedCells)
    .map(parseCellSelectionSetKey)
    .filter((v): v is { r: number; c: number } => v != null);
  if (parsed.length === 0) return '';
  const minR = Math.min(...parsed.map((p) => p.r));
  const maxR = Math.max(...parsed.map((p) => p.r));
  const minC = Math.min(...parsed.map((p) => p.c));
  const maxC = Math.max(...parsed.map((p) => p.c));
  const set = new Set(parsed.map((p) => cellSelectionSetKey(p.r, p.c)));
  const lines: string[] = [];
  for (let r = minR; r <= maxR; r += 1) {
    const cols: string[] = [];
    for (let c = minC; c <= maxC; c += 1) {
      if (!set.has(cellSelectionSetKey(r, c))) {
        cols.push('');
        continue;
      }
      cols.push(valueByCell[cellStorageKey(r, c)] ?? '');
    }
    lines.push(cols.join('\t'));
  }
  if (anchor && !set.has(cellSelectionSetKey(anchor.r, anchor.c)) && lines.length === 0) {
    return valueByCell[cellStorageKey(anchor.r, anchor.c)] ?? '';
  }
  return lines.join('\n');
}
