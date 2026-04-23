import { createContext, useContextSelector } from 'use-context-selector';

/**
 * 仅含会驱动单元格展示的编辑状态；与 dispatchers ref 分离。
 * 注意：editingDraft 故意不放此处——每键入一字会触发全表 use-context-selector 订阅者跑 selector，大表极卡。
 */
export type TableGridEditingStateSlice = Readonly<{
  editingCell: { r: number; c: number } | null;
  selectedCell: { r: number; c: number } | null;
  selectedCells: ReadonlySet<string>;
  selectionAnchor: { r: number; c: number } | null;
  valueByCell: Record<string, string>;
  hoverLockedCell: { r: number; c: number } | null;
}>;

export const TableGridEditingStateContext = createContext<TableGridEditingStateSlice | null>(null);

export function useTableGridEditingStateSelector<T>(selector: (s: TableGridEditingStateSlice) => T): T {
  return useContextSelector(TableGridEditingStateContext, (v) => {
    if (v == null) throw new Error('TableGridEditingStateContext missing');
    return selector(v);
  });
}
