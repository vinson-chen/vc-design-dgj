import type { SetStateAction } from 'react';
import { cellSelectionSetKey } from './headless/tableGridCellAddress';
import { buildRectangularSelectionKeys } from './headless/tableGridSelectionGeometry';
import {
  adjustCoordAfterRemoveBodyRow,
  adjustCoordAfterRemoveColumn,
  adjustSelectionSetAfterRemoveBodyRow,
  adjustSelectionSetAfterRemoveColumn,
  adjustSelectionSetAfterInsertBodyRow,
  adjustCoordAfterInsertBodyRow,
} from './headless/tableGridSparseRemap';

export type GridCellCoord = Readonly<{ r: number; c: number }>;

export type EditingGridUiState = Readonly<{
  selectedCell: GridCellCoord | null;
  selectedCells: Set<string>;
  selectionAnchor: GridCellCoord | null;
  editingCell: GridCellCoord | null;
}>;

export const initialEditingGridUiState: EditingGridUiState = {
  selectedCell: null,
  selectedCells: new Set<string>(),
  selectionAnchor: null,
  editingCell: null,
};

function resolveSetStateAction<T>(prev: T, update: SetStateAction<T>): T {
  return typeof update === 'function' ? (update as (p: T) => T)(prev) : update;
}

export type EditingGridUiAction =
  | { type: 'setSelectedCell'; update: SetStateAction<GridCellCoord | null> }
  | { type: 'setSelectedCells'; update: SetStateAction<Set<string>> }
  | { type: 'setSelectionAnchor'; update: SetStateAction<GridCellCoord | null> }
  | { type: 'setEditingCell'; update: SetStateAction<GridCellCoord | null> }
  | { type: 'clearSelection' }
  | { type: 'resetAllForUndoOrDisable' }
  | { type: 'applyRangeSelection'; anchor: GridCellCoord; current: GridCellCoord }
  | { type: 'afterRemoveColumn'; colIndex: number }
  | { type: 'afterRemoveBodyRow'; bodyRowIndex: number }
  | { type: 'lockedArrowNavigate'; next: GridCellCoord }
  /** 表格外 pointerdown：已保存编辑态时落到该格；否则清空选中与选区 */
  | { type: 'pointerDownOutside'; wasEditing: boolean; exitCell: GridCellCoord | null }
  /** 仅结束编辑并保留选中在格上（配合外部 setValueByCell） */
  | { type: 'commitEditExit'; cell: GridCellCoord }
  /** 插入行后调整选中集合 */
  | { type: 'afterInsertBodyRow'; bodyRowIndex: number; colCount: number };

export function editingGridUiReducer(
  state: EditingGridUiState,
  action: EditingGridUiAction
): EditingGridUiState {
  switch (action.type) {
    case 'setSelectedCell':
      return { ...state, selectedCell: resolveSetStateAction(state.selectedCell, action.update) };
    case 'setSelectedCells':
      return { ...state, selectedCells: resolveSetStateAction(state.selectedCells, action.update) };
    case 'setSelectionAnchor':
      return {
        ...state,
        selectionAnchor: resolveSetStateAction(state.selectionAnchor, action.update),
      };
    case 'setEditingCell':
      return { ...state, editingCell: resolveSetStateAction(state.editingCell, action.update) };
    case 'clearSelection':
      return {
        ...state,
        selectedCells: new Set<string>(),
        selectionAnchor: null,
        selectedCell: null,
      };
    case 'resetAllForUndoOrDisable':
      return { ...initialEditingGridUiState };
    case 'applyRangeSelection':
      return {
        ...state,
        selectionAnchor: action.anchor,
        selectedCells: buildRectangularSelectionKeys(action.anchor, action.current),
        selectedCell: action.anchor,
        editingCell: null,
      };
    case 'afterRemoveColumn':
      return {
        ...state,
        editingCell: adjustCoordAfterRemoveColumn(state.editingCell, action.colIndex),
        selectedCell: adjustCoordAfterRemoveColumn(state.selectedCell, action.colIndex),
        selectedCells: adjustSelectionSetAfterRemoveColumn(state.selectedCells, action.colIndex),
        selectionAnchor: adjustCoordAfterRemoveColumn(state.selectionAnchor, action.colIndex),
      };
    case 'afterRemoveBodyRow':
      return {
        ...state,
        editingCell: adjustCoordAfterRemoveBodyRow(state.editingCell, action.bodyRowIndex),
        selectedCell: adjustCoordAfterRemoveBodyRow(state.selectedCell, action.bodyRowIndex),
        selectedCells: adjustSelectionSetAfterRemoveBodyRow(state.selectedCells, action.bodyRowIndex),
        selectionAnchor: adjustCoordAfterRemoveBodyRow(state.selectionAnchor, action.bodyRowIndex),
      };
    case 'lockedArrowNavigate':
      return {
        ...state,
        selectedCell: action.next,
        selectedCells: new Set([cellSelectionSetKey(action.next.r, action.next.c)]),
        selectionAnchor: action.next,
      };
    case 'commitEditExit':
      return {
        ...state,
        selectedCell: action.cell,
        editingCell: null,
      };
    case 'pointerDownOutside':
      if (action.wasEditing && action.exitCell) {
        return {
          ...state,
          selectedCell: action.exitCell,
          editingCell: null,
        };
      }
      // 点击表格外部或其他单元格（非编辑状态）：清空选中状态
      return {
        ...state,
        selectedCell: null,
        selectedCells: new Set<string>(),
        selectionAnchor: null,
      };
    case 'afterInsertBodyRow':
      return {
        ...state,
        editingCell: adjustCoordAfterInsertBodyRow(state.editingCell, action.bodyRowIndex),
        selectedCell: adjustCoordAfterInsertBodyRow(state.selectedCell, action.bodyRowIndex),
        selectedCells: adjustSelectionSetAfterInsertBodyRow(state.selectedCells, action.bodyRowIndex, action.colCount),
        selectionAnchor: adjustCoordAfterInsertBodyRow(state.selectionAnchor, action.bodyRowIndex),
      };
    default:
      return state;
  }
}
