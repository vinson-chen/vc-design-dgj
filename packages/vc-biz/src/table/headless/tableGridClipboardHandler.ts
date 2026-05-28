import { parseClipboardMatrix, serializeSelectionToTsv } from './tableGridClipboard';
import { cellStorageKey, parseCellSelectionSetKey } from './tableGridCellAddress';

export type ClipboardHandlerContext = Readonly<{
  editingCell: { r: number; c: number } | null;
  selectedCell: { r: number; c: number } | null;
  selectedCells: ReadonlySet<string>;
  valueByCell: Record<string, string>;
  maxBodyRowIndex: number;
  maxColIndex: number;
}>;

export type CopyResult = Readonly<{
  text: string;
  isMultiCell: boolean;
}>;

export type PasteTarget = Readonly<{
  anchor: { r: number; c: number };
  isHeaderAnchor: boolean;
  applySingleValueToRange: boolean;
  isMatrix: boolean;
  matrix: string[][];
  text: string;
}>;

/** 处理复制：返回复制的文本 */
export function handleCopy(
  ctx: ClipboardHandlerContext,
  editingDraft: string
): CopyResult | null {
  const hasCellContext =
    ctx.editingCell != null || ctx.selectedCell != null;

  if (!hasCellContext) return null;

  if (ctx.selectedCells.size > 1) {
    // 多格框选：序列化为 TSV
    const text = serializeSelectionToTsv(ctx.selectedCells, ctx.valueByCell, ctx.selectedCell);
    return { text, isMultiCell: true };
  }

  if (ctx.editingCell != null) {
    // 编辑态：复制草稿内容
    const text = editingDraft;
    return { text, isMultiCell: false };
  }

  // 单格选中：复制单元格值
  const cell = ctx.selectedCell;
  if (!cell) return null;

  const text = ctx.valueByCell[cellStorageKey(cell.r, cell.c)] ?? '';
  return { text, isMultiCell: false };
}

/** 处理粘贴：返回粘贴目标信息 */
export function handlePaste(
  ctx: ClipboardHandlerContext,
  clipboardText: string
): PasteTarget | null {
  const pasteTarget = ctx.selectedCell ?? ctx.editingCell;
  if (!pasteTarget) return null;

  const anchor = ctx.selectedCell ?? pasteTarget;
  const { matrix, isMatrix } = parseClipboardMatrix(clipboardText);

  const applySingleValueToRange =
    !isMatrix && ctx.selectedCells.size > 1 && anchor.r >= 0;

  const isHeaderAnchor = anchor.r === -1;

  return {
    anchor,
    isHeaderAnchor,
    applySingleValueToRange,
    isMatrix,
    matrix,
    text: clipboardText,
  };
}

/** 应用粘贴结果到 valueByCell */
export function applyPasteToValueByCell(
  prev: Record<string, string>,
  pasteInfo: PasteTarget,
  maxBodyRowIndex: number,
  maxColIndex: number,
  selectedCells?: ReadonlySet<string>
): Record<string, string> {
  const next = { ...prev };

  if (pasteInfo.isHeaderAnchor) {
    // 表头粘贴：单格
    const ck = cellStorageKey(pasteInfo.anchor.r, pasteInfo.anchor.c);
    next[ck] = pasteInfo.text;
  } else if (pasteInfo.applySingleValueToRange && selectedCells) {
    // 单值粘贴到多格选中区域：遍历选中集合
    for (const key of selectedCells) {
      const p = parseCellSelectionSetKey(key);
      if (!p) continue;
      if (p.r < 0 || p.r > maxBodyRowIndex || p.c < 0 || p.c > maxColIndex) continue;
      next[cellStorageKey(p.r, p.c)] = pasteInfo.text;
    }
  } else if (pasteInfo.isMatrix) {
    // 矩阵粘贴
    for (let dr = 0; dr < pasteInfo.matrix.length; dr += 1) {
      const row = pasteInfo.matrix[dr]!;
      for (let dc = 0; dc < row.length; dc += 1) {
        const r = pasteInfo.anchor.r + dr;
        const c = pasteInfo.anchor.c + dc;
        if (r < 0 || r > maxBodyRowIndex || c < 0 || c > maxColIndex) continue;
        next[cellStorageKey(r, c)] = row[dc] ?? '';
      }
    }
  } else {
    // 单格粘贴
    const ck = cellStorageKey(pasteInfo.anchor.r, pasteInfo.anchor.c);
    next[ck] = pasteInfo.text;
  }

  return next;
}