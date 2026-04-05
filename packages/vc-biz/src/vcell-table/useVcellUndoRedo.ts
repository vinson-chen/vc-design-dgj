import { useCallback, useRef } from 'react';

function cloneRows<T>(data: T[]): T[] {
  try {
    return structuredClone(data);
  } catch {
    return JSON.parse(JSON.stringify(data)) as T[];
  }
}

export function useVcellUndoRedo<T>(options: {
  maxDepth: number;
  apply: (next: T[]) => void;
  getCurrent: () => T[];
}) {
  const { maxDepth, apply, getCurrent } = options;
  const pastRef = useRef<T[][]>([]);
  const futureRef = useRef<T[][]>([]);

  const recordBeforeMutation = useCallback(() => {
    pastRef.current = [...pastRef.current, cloneRows(getCurrent())].slice(-maxDepth);
    futureRef.current = [];
  }, [getCurrent, maxDepth]);

  const undo = useCallback(() => {
    const stack = pastRef.current;
    if (stack.length === 0) return;
    const prev = stack.pop()!;
    futureRef.current.push(cloneRows(getCurrent()));
    apply(prev);
  }, [apply, getCurrent]);

  const redo = useCallback(() => {
    const stack = futureRef.current;
    if (stack.length === 0) return;
    const next = stack.pop()!;
    pastRef.current = [...pastRef.current, cloneRows(getCurrent())].slice(-maxDepth);
    apply(next);
  }, [apply, getCurrent, maxDepth]);

  const canUndo = () => pastRef.current.length > 0;
  const canRedo = () => futureRef.current.length > 0;

  const resetStacks = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
  }, []);

  return { recordBeforeMutation, undo, redo, canUndo, canRedo, resetStacks };
}
