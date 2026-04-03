import React, { useCallback, useMemo } from 'react';
import { TableGridConfigContextProvider } from './tableGridConfigContext';
import { TableGridEditingContextProvider } from './tableGridEditingContext';
import TableGridRow from './TableGridRow';
import type { TableGridConfigValue, TableRowsProps } from './tableGridTypes';
import { useTableGridEditing } from './useTableGridEditing';

export type { TableRowsProps } from './tableGridTypes';

export default function TableRows(props: TableRowsProps) {
  const editing = useTableGridEditing(props.enableEditMode);
  const displayRowCount = props.rowCount + (props.enableInsertRowCol ? 1 : 0);

  const deleteColumnAt = useCallback(
    (colIndex: number) => {
      if (!props.enableInsertRowCol || colIndex < 0 || colIndex >= props.colCount) return;
      const minC = props.gridMinCount ?? 2;
      if (props.colCount <= minC) return;
      editing.removeColumnAt(colIndex);
      props.onDeleteColumn?.(colIndex);
    },
    [
      editing.removeColumnAt,
      props.colCount,
      props.enableInsertRowCol,
      props.gridMinCount,
      props.onDeleteColumn,
    ]
  );

  const deleteBodyRowAt = useCallback(
    (bodyRowIndex: number) => {
      if (!props.enableInsertRowCol) return;
      const minR = props.gridMinCount ?? 2;
      if (props.rowCount <= minR) return;
      editing.removeBodyRowAt(bodyRowIndex);
      props.onDeleteBodyRow?.(bodyRowIndex);
    },
    [
      editing.removeBodyRowAt,
      props.enableInsertRowCol,
      props.gridMinCount,
      props.onDeleteBodyRow,
      props.rowCount,
    ]
  );

  const configValue = useMemo((): TableGridConfigValue => {
    return {
      ...props,
      deleteColumnAt,
      deleteBodyRowAt,
    };
  }, [
    props.rowCount,
    props.colCount,
    props.enableInsertRowCol,
    props.enableEditMode,
    props.rowMinWidth,
    props.narrowWidth,
    props.minTextColWidth,
    props.enableColumnResize,
    props.enableVerticalCenter,
    props.enableFreezeFirstCol,
    props.enableFreezeLastCol,
    props.enableBodyCellRightBorder,
    props.enableShowRowIndex,
    props.gridMinCount,
    props.hoveredRowIndex,
    props.setHoveredRowIndex,
    props.checkedByBodyRow,
    props.setCheckedByBodyRow,
    props.headerAllChecked,
    props.headerIndeterminate,
    props.toggleAllHeader,
    props.colWidths,
    props.onColumnResizeStart,
    props.onInsertRow,
    props.onInsertColumn,
    props.insertLayoutTextColPx,
    props.onDeleteColumn,
    props.onDeleteBodyRow,
    deleteColumnAt,
    deleteBodyRowAt,
  ]);

  return (
    <TableGridConfigContextProvider value={configValue}>
      <TableGridEditingContextProvider value={editing}>
        {Array.from({ length: displayRowCount }).map((_, rowIndex) => (
          <TableGridRow key={`row-${rowIndex}`} rowIndex={rowIndex} />
        ))}
      </TableGridEditingContextProvider>
    </TableGridConfigContextProvider>
  );
}
