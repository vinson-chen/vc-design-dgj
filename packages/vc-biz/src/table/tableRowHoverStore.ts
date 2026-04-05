export type TableRowHoverStore = Readonly<{
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => number | null;
  setHoveredRowIndex: (rowIndex: number | null) => void;
}>;

/** 行 hover 用外部 store，避免更新 hoveredRowIndex 时整表 Context 失效、上千行重渲染 */
export function createTableRowHoverStore(): TableRowHoverStore {
  let hovered: number | null = null;
  const listeners = new Set<() => void>();

  return {
    subscribe(onStoreChange) {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    getSnapshot() {
      return hovered;
    },
    setHoveredRowIndex(rowIndex) {
      if (hovered === rowIndex) return;
      hovered = rowIndex;
      listeners.forEach((l) => l());
    },
  };
}
