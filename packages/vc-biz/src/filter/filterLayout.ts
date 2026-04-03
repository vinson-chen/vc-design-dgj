import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

export const FILTER_GAP = 8;
export const FILTER_ITEM_MIN = 160;
export const FILTER_ITEM_MAX = 328;
/** 小于此宽度时筛选项与按钮分行排布，避免与查询/重置重叠 */
export const FILTER_ROW_STACK_BREAKPOINT = 320;

export function computeFilterGridCols(availableFiltersWidth: number): number {
  const w = Math.max(0, availableFiltersWidth);
  if (w <= FILTER_ITEM_MIN + 0.5) return 1;

  let best = 1;
  for (let n = 1; n <= 20; n++) {
    const colW = (w - FILTER_GAP * (n - 1)) / n;
    if (colW + 0.5 < FILTER_ITEM_MIN) break;
    if (colW - 0.5 <= FILTER_ITEM_MAX) best = n;
  }
  return Math.max(1, best);
}

export function useFilterGroupLayout(fieldsKey: string, fieldCount: number) {
  const rowRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [pinRight, setPinRight] = useState(false);
  const [gridCols, setGridCols] = useState(1);
  const [stackActionsBelow, setStackActionsBelow] = useState(false);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const actionsEl = actionsRef.current;
    if (!row || !actionsEl) return;

    const measure = () => {
      const W = row.clientWidth;
      const B = actionsEl.offsetWidth;
      const nextStack = W < FILTER_ROW_STACK_BREAKPOINT;
      const availableFiltersWidth = nextStack ? W : W - B - FILTER_GAP;
      const requiredMin = fieldCount * FILTER_ITEM_MIN + Math.max(0, fieldCount - 1) * FILTER_GAP;
      const nextPinRight = availableFiltersWidth + 0.5 < requiredMin;

      setStackActionsBelow(nextStack);

      if (!nextPinRight) {
        setPinRight(false);
        setGridCols(1);
        return;
      }
      setPinRight(true);
      setGridCols(computeFilterGridCols(availableFiltersWidth));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    return () => ro.disconnect();
  }, [fieldsKey, fieldCount]);

  return { rowRef, filtersRef, actionsRef, pinRight, gridCols, stackActionsBelow };
}

function measureFilterRows(filtersEl: HTMLDivElement): { rows: number; collapsedMaxH: number | undefined } {
  const children = Array.from(filtersEl.children) as HTMLElement[];
  if (children.length === 0) {
    return { rows: 1, collapsedMaxH: undefined };
  }

  const tops = Array.from(new Set(children.map((c) => Math.round(c.offsetTop)))).sort((a, b) => a - b);
  const rows = tops.length || 1;
  const firstTop = tops[0] ?? 0;
  let bottom = 0;
  children.forEach((c) => {
    if (Math.round(c.offsetTop) === firstTop) {
      bottom = Math.max(bottom, c.offsetTop + c.offsetHeight);
    }
  });
  return { rows, collapsedMaxH: bottom > 0 ? bottom : undefined };
}

export function useFilterRowsMetrics(
  filtersRef: RefObject<HTMLDivElement | null>,
  fieldsKey: string,
  pinRight: boolean,
  gridCols: number,
) {
  const [rows, setRows] = useState(1);
  const [collapsedMaxH, setCollapsedMaxH] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const filtersEl = filtersRef.current;
    if (!filtersEl) return;

    const run = () => {
      const next = measureFilterRows(filtersEl);
      setRows(next.rows);
      setCollapsedMaxH(next.collapsedMaxH);
    };

    run();
    const ro = new ResizeObserver(run);
    ro.observe(filtersEl);
    return () => ro.disconnect();
  }, [filtersRef, fieldsKey, pinRight, gridCols]);

  return { rows, collapsedMaxH };
}
