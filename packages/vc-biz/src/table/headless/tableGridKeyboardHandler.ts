import type { GridCellCoord } from './tableGridSparseRemap';
import { stepLockedCell } from './tableGridSelectionGeometry';
import { cellStorageKey, TABLE_GRID_HEADER_ROW_INDEX } from './tableGridCellAddress';

export type KeyboardNavigateResult = {
  next: GridCellCoord;
  key: string;
};

export type ClearCellResult = {
  r: number;
  c: number;
  cellKey: string;
};

export type KeyboardHandlerContext = Readonly<{
  editingCell: GridCellCoord | null;
  selectedCell: GridCellCoord | null;
  maxBodyRowIndex: number;
  maxColIndex: number;
  activeElement: Element | null;
}>;

/** 判断是否为方向键 */
export function isArrowKey(key: string): boolean {
  return key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight';
}

/** 判断是否为清空单元格按键（Delete / Backspace） */
export function isClearCellKey(key: string, isEditing: boolean): boolean {
  return key === 'Delete' || (key === 'Backspace' && !isEditing);
}

/** 判断外部元素是否阻止表格键盘处理 */
export function isExternalFieldFocused(activeEl: Element | null): boolean {
  if (!activeEl || activeEl === document.body) return false;
  const tag = activeEl.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return !activeEl.closest('[data-hover-lock-cell]');
  }
  if (activeEl.hasAttribute('contenteditable')) {
    return !activeEl.closest('[data-hover-lock-cell]');
  }
  return false;
}

/** 方向键导航：计算下一个锁定单元格 */
export function handleArrowNavigation(
  ctx: KeyboardHandlerContext,
  key: string
): KeyboardNavigateResult | null {
  if (!ctx.selectedCell) return null;
  if (!isArrowKey(key)) return null;
  if (ctx.maxBodyRowIndex < 0 || ctx.maxColIndex < 0) return null;

  // 如果 textarea 已聚焦，不处理方向键
  const taFocused = activeElementIsTextarea(ctx.activeElement);
  if (taFocused) return null;

  const from = ctx.editingCell ?? ctx.selectedCell;
  const next = stepLockedCell(from.r, from.c, key, ctx.maxBodyRowIndex, ctx.maxColIndex);
  return { next, key };
}

/** 清空锁定单元格：返回要清空的单元格信息 */
export function handleClearLockedCell(
  ctx: KeyboardHandlerContext,
  key: string
): ClearCellResult | null {
  if (!ctx.selectedCell) return null;
  if (!isClearCellKey(key, ctx.editingCell != null)) return null;
  if (isExternalFieldFocused(ctx.activeElement)) return null;

  const { r, c } = ctx.selectedCell;
  const cellKey = cellStorageKey(r, c);
  return { r, c, cellKey };
}

/** 判断是否应进入编辑态（单字符按键） */
export function shouldEnterEditMode(
  ctx: KeyboardHandlerContext,
  key: string
): boolean {
  if (!ctx.selectedCell) return false;
  // 表头保持"仅双击进入编辑"，不支持键入即编辑
  if (ctx.selectedCell.r === TABLE_GRID_HEADER_ROW_INDEX) return false;
  if (key.length !== 1) return false;
  if (ctx.editingCell != null) return false;
  return true;
}

/** 判断是否应追加字符到编辑草稿 */
export function shouldAppendToEditDraft(
  ctx: KeyboardHandlerContext,
  key: string
): boolean {
  if (!ctx.editingCell) return false;
  // 表头编辑不支持"任意按键追加"
  if (ctx.editingCell.r === TABLE_GRID_HEADER_ROW_INDEX) return false;
  if (key.length !== 1) return false;
  return true;
}

/** 辅助函数：判断 activeElement 是否为 textarea */
function activeElementIsTextarea(activeEl: Element | null): boolean {
  if (!activeEl) return false;
  return activeEl.tagName === 'TEXTAREA';
}