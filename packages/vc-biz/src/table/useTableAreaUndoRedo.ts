import { useCallback, useRef } from 'react';

export type TableAreaUndoSnapshot = Readonly<{
  valueByCell: Record<string, string>;
  rowCount: number;
  colCount: number;
  colWidths: Array<number | null>;
}>;

const MAX_DEPTH = 50;

function cloneValueByCell(v: Record<string, string>): Record<string, string> {
  try {
    return structuredClone(v);
  } catch {
    return { ...v };
  }
}

/**
 * BizTable / TableArea：快照撤销重做。`getCapture` / `apply` 每帧可更新，内部用 ref 保持回调稳定。
 */
export function useTableAreaUndoRedo(
  getCapture: () => TableAreaUndoSnapshot,
  applySnapshot: (s: TableAreaUndoSnapshot) => void
) {
  const pastRef = useRef<TableAreaUndoSnapshot[]>([]);
  const futureRef = useRef<TableAreaUndoSnapshot[]>([]);
  const batchDepthRef = useRef(0);
  const applyingHistoryRef = useRef(false);
  const getCaptureRef = useRef(getCapture);
  const applyRef = useRef(applySnapshot);
  getCaptureRef.current = getCapture;
  applyRef.current = applySnapshot;

  const recordIfNeeded = useCallback(() => {
    if (applyingHistoryRef.current || batchDepthRef.current > 0) return;
    pastRef.current = [...pastRef.current, getCaptureRef.current()].slice(-MAX_DEPTH);
    futureRef.current = [];
  }, []);

  const startBatch = useCallback(() => {
    if (applyingHistoryRef.current) return;
    if (batchDepthRef.current === 0) {
      pastRef.current = [...pastRef.current, getCaptureRef.current()].slice(-MAX_DEPTH);
      futureRef.current = [];
    }
    batchDepthRef.current += 1;
  }, []);

  const endBatch = useCallback(() => {
    batchDepthRef.current = Math.max(0, batchDepthRef.current - 1);
  }, []);

  const undo = useCallback(() => {
    if (applyingHistoryRef.current) return;
    const stack = pastRef.current;
    if (stack.length === 0) return;
    const prev = stack.pop()!;
    futureRef.current.push(getCaptureRef.current());
    applyingHistoryRef.current = true;
    try {
      applyRef.current(prev);
    } finally {
      applyingHistoryRef.current = false;
    }
  }, []);

  const redo = useCallback(() => {
    if (applyingHistoryRef.current) return;
    const stack = futureRef.current;
    if (stack.length === 0) return;
    const next = stack.pop()!;
    pastRef.current = [...pastRef.current, getCaptureRef.current()].slice(-MAX_DEPTH);
    applyingHistoryRef.current = true;
    try {
      applyRef.current(next);
    } finally {
      applyingHistoryRef.current = false;
    }
  }, []);

  const canUndo = useCallback(() => pastRef.current.length > 0, []);
  const canRedo = useCallback(() => futureRef.current.length > 0, []);

  return { recordIfNeeded, startBatch, endBatch, undo, redo, canUndo, canRedo };
}

export function snapshotTableAreaState(p: {
  valueByCell: Record<string, string>;
  rowCount: number;
  colCount: number;
  colWidths: ReadonlyArray<number | null>;
}): TableAreaUndoSnapshot {
  return {
    valueByCell: cloneValueByCell(p.valueByCell),
    rowCount: p.rowCount,
    colCount: p.colCount,
    colWidths: [...p.colWidths],
  };
}
