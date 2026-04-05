import type {
  ColumnDef,
  ColumnOrderState,
  ColumnPinningState,
  VisibilityState,
} from '@tanstack/react-table';

/** 列元信息：单元格类型与可编辑性（供 TanStack ColumnDef.meta 使用） */
export type VcellColumnMeta<TData = unknown> = {
  /** 展示/编辑控件类型 */
  cellType?: 'text' | 'number' | 'select';
  /** `cellType === 'select'` 时的选项 */
  selectOptions?: ReadonlyArray<{ label: string; value: string }>;
  /** 默认 true；为 false 时不可进入编辑 */
  editable?: boolean;
  /** 无 `accessorKey` 时用于写回单元格（粘贴/编辑） */
  patchRow?: (row: TData, value: unknown) => TData;
};

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    vcell?: VcellColumnMeta<TData>;
  }
}

export type VcellRowId = string;

export type VcellCellAddress = {
  rowIndex: number;
  columnId: string;
};

export type VcellTableStateSnapshot = {
  columnOrder: ColumnOrderState;
  columnVisibility: VisibilityState;
  columnPinning: ColumnPinningState;
  columnSizing: Record<string, number>;
};

export type VcellTableHandle<TData> = {
  /** 当前 props.data 引用（与受控父组件同步） */
  getData: () => TData[];
  undo: () => void;
  redo: () => void;
  /** 当前表格 UI 状态，便于大模型或外部面板同步 */
  getUiState: () => VcellTableStateSnapshot;
  setUiState: (patch: Partial<VcellTableStateSnapshot>) => void;
  focusContainer: () => void;
};

export type { ColumnDef };
