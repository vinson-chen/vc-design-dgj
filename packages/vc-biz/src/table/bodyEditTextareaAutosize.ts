export type BodyEditTextareaAutosizeOpts = Readonly<{
  minRows: number;
  maxRows: number;
  lineHeightPx: number;
}>;

/**
 * 表体原生 textarea：按内容增高，高度夹在 minRows～maxRows 对应像素之间（与历史 Ant TextArea autoSize 行为一致）。
 */
export function syncBodyEditTextareaHeight(
  el: HTMLTextAreaElement,
  opts: BodyEditTextareaAutosizeOpts
): void {
  const { minRows, maxRows, lineHeightPx } = opts;
  const minH = minRows * lineHeightPx;
  const maxH = maxRows * lineHeightPx;
  el.style.height = 'auto';
  const sh = el.scrollHeight;
  const next = Math.min(maxH, Math.max(minH, sh));
  el.style.height = `${next}px`;
  el.style.overflowY = sh > maxH ? 'auto' : 'hidden';
}
