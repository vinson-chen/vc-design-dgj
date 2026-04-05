import { useCallback, useState } from 'react';

export function useColumnResize(gridMax: number, minTextColW: number) {
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
        const nextW = Math.max(minTextColW, Math.round(startW + (ev.clientX - startX)));
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
    [colWidths, minTextColW]
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

  return { colWidths, onColumnResizeStart, removeColumnWidthAt };
}
