import { describe, expect, it } from 'vitest';
import { syncBodyEditTextareaHeight } from './bodyEditTextareaAutosize';

describe('syncBodyEditTextareaHeight', () => {
  it('clamps height between min and max row heights', () => {
    document.body.innerHTML = '<textarea id="t"></textarea>';
    const el = document.getElementById('t') as HTMLTextAreaElement;
    el.style.boxSizing = 'border-box';
    el.style.lineHeight = '20px';
    el.style.padding = '0';
    el.style.border = 'none';
    el.value = 'a\nb\nc\nd\ne\nf\ng\nh';

    syncBodyEditTextareaHeight(el, { minRows: 1, maxRows: 3, lineHeightPx: 20 });

    const h = Number.parseFloat(el.style.height);
    expect(h).toBeLessThanOrEqual(60);
    expect(h).toBeGreaterThanOrEqual(20);
  });
});
