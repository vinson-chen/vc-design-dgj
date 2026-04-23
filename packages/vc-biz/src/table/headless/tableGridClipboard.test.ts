import { describe, expect, it } from 'vitest';
import { parseClipboardMatrix, serializeSelectionToTsv } from './tableGridClipboard';
import { cellSelectionSetKey } from './tableGridCellAddress';

describe('tableGridClipboard', () => {
  it('parseClipboardMatrix detects matrix vs single cell', () => {
    expect(parseClipboardMatrix('a\tb').isMatrix).toBe(true);
    expect(parseClipboardMatrix('a\nb').isMatrix).toBe(true);
    expect(parseClipboardMatrix('only').isMatrix).toBe(false);
  });

  it('serializeSelectionToTsv fills rectangle with blanks', () => {
    const keys = new Set([cellSelectionSetKey(0, 0), cellSelectionSetKey(1, 1)]);
    const tsv = serializeSelectionToTsv(keys, { '0-0': 'A', '1-1': 'B' }, { r: 0, c: 0 });
    expect(tsv).toBe('A\t\n\tB');
  });
});
