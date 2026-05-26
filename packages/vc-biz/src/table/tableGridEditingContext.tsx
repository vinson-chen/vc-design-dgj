import { createContext, useContext, useContextSelector } from 'use-context-selector';
import type { MutableRefObject } from 'react';
import type { TableGridEditingState } from './useTableGridEditing';

/**
 * 编辑状态切片：仅包含会驱动单元格展示的数据。
 * 注意：editingDraft 故意不放此处——每键入一字会触发全表订阅者跑 selector，大表极卡。
 */
export type TableGridEditingStateSlice = Readonly<{
  editingCell: { r: number; c: number } | null;
  selectedCell: { r: number; c: number } | null;
  selectedCells: ReadonlySet<string>;
  selectionAnchor: { r: number; c: number } | null;
  valueByCell: Record<string, string>;
  hoverLockedCell: { r: number; c: number } | null;
}>;

/** 合并后的编辑 Context：包含 state slice + dispatchers ref */
export type TableGridEditingContextValue = Readonly<{
  state: TableGridEditingStateSlice;
  dispatchersRef: MutableRefObject<TableGridEditingState | null>;
}>;

export const TableGridEditingContext = createContext<TableGridEditingContextValue | null>(null);

/** 订阅 state slice（避免不必要的重渲染） */
export function useTableGridEditingStateSelector<T>(
  selector: (s: TableGridEditingStateSlice) => T
): T {
  return useContextSelector(TableGridEditingContext, (v) => {
    if (v == null) throw new Error('TableGridEditingContext missing');
    return selector(v.state);
  });
}

/** 获取 dispatchers ref（用于事件处理） */
export function useTableGridEditingDispatchersRef(): MutableRefObject<TableGridEditingState | null> {
  const v = useContext(TableGridEditingContext);
  if (v == null) {
    throw new Error('useTableGridEditingDispatchersRef must be used within TableRows');
  }
  return v.dispatchersRef;
}