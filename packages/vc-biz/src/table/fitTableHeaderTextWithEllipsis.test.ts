import { describe, expect, it } from 'vitest';
import { fitTableHeaderTextWithEllipsis } from './fitTableHeaderTextWithEllipsis';

describe('fitTableHeaderTextWithEllipsis', () => {
  it('returns full string when document is undefined (SSR)', () => {
    const saved = globalThis.document;
    // @ts-expect-error test stub
    globalThis.document = undefined;
    expect(fitTableHeaderTextWithEllipsis('abcdef', 10, '')).toBe('abcdef');
    globalThis.document = saved;
  });

  it('returns empty as empty', () => {
    expect(fitTableHeaderTextWithEllipsis('', 100, 'font-size:12px;')).toBe('');
  });
});
