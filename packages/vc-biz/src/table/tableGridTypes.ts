import type React from 'react';

export type TableRowsProps = Readonly<{
  rowCount: number;
  colCount: number;
  enableInsertRowCol: boolean;
  enableEditMode: boolean;
  rowMinWidth: number;
  narrowWidth: number;
  minTextColWidth: number;
  enableColumnResize: boolean;
  enableVerticalCenter: boolean;
  enableFreezeFirstCol: boolean;
  enableFreezeLastCol: boolean;
  enableBodyCellRightBorder: boolean;
  enableShowRowIndex: boolean;
  hoveredRowIndex: number | null;
  setHoveredRowIndex: (value: number | null) => void;
  checkedByBodyRow: Record<number, boolean>;
  setCheckedByBodyRow: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  headerAllChecked: boolean;
  headerIndeterminate: boolean;
  toggleAllHeader: (checked: boolean) => void;
  colWidths: Array<number | null>;
  onColumnResizeStart: (colIndex: number) => (e: React.MouseEvent) => void;
  onInsertRow: () => void;
  onInsertColumn: () => void;
  insertLayoutTextColPx: number | null;
  /** 删除列/行时下限（与 demo 的 GRID_MIN 一致），用于禁用右键菜单项 */
  gridMinCount?: number;
  onDeleteColumn?: (colIndex: number) => void;
  onDeleteBodyRow?: (bodyRowIndex: number) => void;
}>;

export type TableGridConfigValue = TableRowsProps & {
  deleteColumnAt: (colIndex: number) => void;
  deleteBodyRowAt: (bodyRowIndex: number) => void;
};
