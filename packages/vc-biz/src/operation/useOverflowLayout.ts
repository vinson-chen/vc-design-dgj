import { useMemo } from 'react';

interface UseOverflowLayoutParams {
  itemCount: number;
  containerWidth: number;
  itemWidths: number[];
  moreWidth: number;
  menuOnlyCount: number;
  maxVisibleWithMore?: number;
}

export function useOverflowLayout({
  itemCount,
  containerWidth,
  itemWidths,
  moreWidth,
  menuOnlyCount,
  maxVisibleWithMore,
}: UseOverflowLayoutParams): number {
  return useMemo(() => {
    const n = itemCount;
    if (n === 0) return 0;
    const capDirect = maxVisibleWithMore != null ? Math.max(0, maxVisibleWithMore - 1) : n;
    const forceMoreByCap = n > capDirect;
    const widthsReady = itemWidths.length === n && itemWidths.every((w) => w > 0);
    if (!widthsReady || containerWidth <= 0) {
      if (menuOnlyCount > 0 || forceMoreByCap) return Math.min(capDirect, n);
      return n;
    }

    const widthFor = (k: number, withMore: boolean) => {
      const itemTotal = itemWidths.slice(0, k).reduce((s, w) => s + w, 0);
      const count = k + (withMore ? 1 : 0);
      const gaps = Math.max(0, count - 1) * 8;
      return itemTotal + gaps + (withMore ? moreWidth : 0);
    };

    if (!forceMoreByCap && menuOnlyCount === 0 && widthFor(n, false) <= containerWidth) return n;

    const maxDirect = Math.min(forceMoreByCap ? capDirect : (menuOnlyCount > 0 ? n : n - 1), n);
    for (let k = maxDirect; k >= 0; k -= 1) {
      if (widthFor(k, true) <= containerWidth) return k;
    }
    return 0;
  }, [containerWidth, itemCount, itemWidths, maxVisibleWithMore, menuOnlyCount, moreWidth]);
}
