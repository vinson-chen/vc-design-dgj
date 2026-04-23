/** 表头展示用 Unicode 省略号（与中文排版习惯一致） */
export const TABLE_HEADER_ELLIPSIS_CHAR = '\u2026';

/**
 * 在固定宽度内截取表头文案，末尾固定为「…」占位（最后一个可见语义为省略号）。
 * 使用离屏测量 + 二分，避免仅靠 CSS ellipsis 出现半字或与「…」样式不一致。
 */
export function fitTableHeaderTextWithEllipsis(
  full: string,
  maxWidthPx: number,
  fontCssText: string
): string {
  if (!full) return full;
  if (maxWidthPx <= 1) return TABLE_HEADER_ELLIPSIS_CHAR;
  if (typeof document === 'undefined') return full;

  const ell = TABLE_HEADER_ELLIPSIS_CHAR;
  const m = document.createElement('span');
  m.setAttribute('aria-hidden', 'true');
  m.style.cssText = `position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none;white-space:nowrap;${fontCssText}`;
  document.body.appendChild(m);
  try {
    m.textContent = full;
    if (m.getBoundingClientRect().width <= maxWidthPx) return full;

    const chars = [...full];
    const withEll = (n: number) => (n <= 0 ? ell : `${chars.slice(0, n).join('')}${ell}`);

    m.textContent = ell;
    if (m.getBoundingClientRect().width > maxWidthPx) return ell;

    let lo = 0;
    let hi = chars.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      m.textContent = withEll(mid);
      if (m.getBoundingClientRect().width <= maxWidthPx) lo = mid;
      else hi = mid - 1;
    }
    return withEll(lo);
  } finally {
    m.remove();
  }
}
