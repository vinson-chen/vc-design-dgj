import { useCallback, useState } from 'react';

export function useColumnResize(
  gridMax: number,
  minTextColW: number,
  getMaxWidthForColumn?: (colIndex: number) => number | null
) {
  const [colWidths, setColWidths] = useState<Array<number | null>>(
    () => Array.from({ length: gridMax }, () => null)
  );

  const onColumnResizeStart = useCallback(
    (colIndex: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startW = colWidths[colIndex] ?? 160;

      const onMove = (ev: MouseEvent) => {
        const candidate = Math.max(minTextColW, Math.round(startW + (ev.clientX - startX)));
        const maxW = getMaxWidthForColumn?.(colIndex) ?? null;
        const nextW = maxW != null ? Math.min(candidate, maxW) : candidate;
        setColWidths((prev) => {
          const copy = [...prev];
          copy[colIndex] = nextW;
          return copy;
        });
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [colWidths, getMaxWidthForColumn, minTextColW]
  );

  const removeColumnWidthAt = useCallback(
    (colIndex: number) => {
      setColWidths((prev) => {
        const copy = [...prev];
        for (let i = colIndex; i < gridMax - 1; i += 1) {
          copy[i] = copy[i + 1];
        }
        copy[gridMax - 1] = null;
        return copy;
      });
    },
    [gridMax]
  );

  const insertColumnWidthAt = useCallback(
    (colIndex: number) => {
      setColWidths((prev) => {
        if (colIndex < 0 || colIndex >= gridMax) return prev;
        const copy = [...prev];
        for (let i = gridMax - 1; i > colIndex; i -= 1) {
          copy[i] = copy[i - 1];
        }
        copy[colIndex] = null;
        return copy;
      });
    },
    [gridMax]
  );

  const applyColWidthsSnapshot = useCallback(
    (next: ReadonlyArray<number | null>) => {
      setColWidths(() =>
        Array.from({ length: gridMax }, (_, i) => (i < next.length ? (next[i] ?? null) : null))
      );
    },
    [gridMax]
  );

  return {
    colWidths,
    onColumnResizeStart,
    insertColumnWidthAt,
    removeColumnWidthAt,
    applyColWidthsSnapshot,
  };
}
