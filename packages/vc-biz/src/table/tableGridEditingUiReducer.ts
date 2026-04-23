import type { SetStateAction } from 'react';
import { cellSelectionSetKey } from './headless/tableGridCellAddress';
import { buildRectangularSelectionKeys } from './headless/tableGridSelectionGeometry';
import {
  adjustCoordAfterRemoveBodyRow,
  adjustCoordAfterRemoveColumn,
  adjustSelectionSetAfterRemoveBodyRow,
  adjustSelectionSetAfterRemoveColumn,
} from './headless/tableGridSparseRemap';

export type GridCellCoord = Readonly<{ r: number; c: number }>;

export type EditingGridUiState = Readonly<{
  selectedCell: GridCellCoord | null;
  selectedCells: Set<string>;
  selectionAnchor: GridCellCoord | null;
  hoverLockedCell: GridCellCoord | null;
  editingCell: GridCellCoord | null;
}>;

export const initialEditingGridUiState: EditingGridUiState = {
  selectedCell: null,
  selectedCells: new Set<string>(),
  selectionAnchor: null,
  hoverLockedCell: null,
  editingCell: null,
};

function resolveSetStateAction<T>(prev: T, update: SetStateAction<T>): T {
  return typeof update === 'function' ? (update as (p: T) => T)(prev) : update;
}

export type EditingGridUiAction =
  | { type: 'setSelectedCell'; update: SetStateAction<GridCellCoord | null> }
  | { type: 'setSelectedCells'; update: SetStateAction<Set<string>> }
  | { type: 'setSelectionAnchor'; update: SetStateAction<GridCellCoord | null> }
  | { type: 'setHoverLockedCell'; update: SetStateAction<GridCellCoord | null> }
  | { type: 'setEditingCell'; update: SetStateAction<GridCellCoord | null> }
  | { type: 'clearSelection' }
  | { type: 'resetAllForUndoOrDisable' }
  | { type: 'applyRangeSelection'; anchor: GridCellCoord; current: GridCellCoord }
  | { type: 'afterRemoveColumn'; colIndex: number }
  | { type: 'afterRemoveBodyRow'; bodyRowIndex: number }
  | { type: 'lockedArrowNavigate'; next: GridCellCoord }
  /** 表格外 pointerdown：已保存编辑态时落到该格；否则清空锁定与选区 */
  | { type: 'pointerDownOutside'; wasEditing: boolean; exitCell: GridCellCoord | null }
  /** 仅结束编辑并保留选中/锁定在格上（配合外部 setValueByCell） */
  | { type: 'commitEditExit'; cell: GridCellCoord };

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
    case 'setHoverLockedCell':
      return {
        ...state,
        hoverLockedCell: resolveSetStateAction(state.hoverLockedCell, action.update),
      };
    case 'setEditingCell':
      return { ...state, editingCell: resolveSetStateAction(state.editingCell, action.update) };
    case 'clearSelection':
      return {
        ...state,
        selectedCells: new Set<string>(),
        selectionAnchor: null,
        selectedCell: null,
        hoverLockedCell: null,
      };
    case 'resetAllForUndoOrDisable':
      return { ...initialEditingGridUiState };
    case 'applyRangeSelection':
      return {
        ...state,
        selectionAnchor: action.anchor,
        selectedCells: buildRectangularSelectionKeys(action.anchor, action.current),
        selectedCell: action.anchor,
        hoverLockedCell: action.anchor,
        editingCell: null,
      };
    case 'afterRemoveColumn':
      return {
        ...state,
        editingCell: adjustCoordAfterRemoveColumn(state.editingCell, action.colIndex),
        selectedCell: adjustCoordAfterRemoveColumn(state.selectedCell, action.colIndex),
        selectedCells: adjustSelectionSetAfterRemoveColumn(state.selectedCells, action.colIndex),
        selectionAnchor: adjustCoordAfterRemoveColumn(state.selectionAnchor, action.colIndex),
        hoverLockedCell: adjustCoordAfterRemoveColumn(state.hoverLockedCell, action.colIndex),
      };
    case 'afterRemoveBodyRow':
      return {
        ...state,
        editingCell: adjustCoordAfterRemoveBodyRow(state.editingCell, action.bodyRowIndex),
        selectedCell: adjustCoordAfterRemoveBodyRow(state.selectedCell, action.bodyRowIndex),
        selectedCells: adjustSelectionSetAfterRemoveBodyRow(state.selectedCells, action.bodyRowIndex),
        selectionAnchor: adjustCoordAfterRemoveBodyRow(state.selectionAnchor, action.bodyRowIndex),
        hoverLockedCell: adjustCoordAfterRemoveBodyRow(state.hoverLockedCell, action.bodyRowIndex),
      };
    case 'lockedArrowNavigate':
      return {
        ...state,
        hoverLockedCell: action.next,
        selectedCell: action.next,
        selectedCells: new Set([cellSelectionSetKey(action.next.r, action.next.c)]),
        selectionAnchor: action.next,
      };
    case 'commitEditExit':
      return {
        ...state,
        selectedCell: action.cell,
        hoverLockedCell: action.cell,
        editingCell: null,
      };
    case 'pointerDownOutside':
      if (action.wasEditing && action.exitCell) {
        return {
          ...state,
          selectedCell: action.exitCell,
          hoverLockedCell: action.exitCell,
          editingCell: null,
        };
      }
      return {
        ...state,
        hoverLockedCell: null,
        selectedCell: null,
        selectedCells: new Set<string>(),
        selectionAnchor: null,
      };
    default:
      return state;
  }
}
