/**
 * 单元格选中状态 Store：订阅机制与 BodyRowSelectionStore 类似，
 * 用于在组件外部（如 Vtell）访问单元格选中状态。
 */

/** 单元格选中 key 格式：`${r}:${c}`，r 为行号（表头为 -1），c 为列号 */
export type CellSelectionKey = string;

/** 单元格选中摘要：用于生成"已选标签"文案 */
export type CellSelectionSummary = Readonly<{
  /** 选中类型 */
  kind: 'full' | 'rows' | 'column' | 'cell' | 'cell-range';
  /** 行号列表（bodyRowIndex，从0开始，仅 kind='rows' 时有） */
  rows?: number[];
  /** 是否为连续行区间 */
  rowsContinuous?: boolean;
  /** 列号（colIndex，从0开始，仅 kind='column' 时有） */
  column?: number;
  /** 单元格起始位置（仅 kind='cell' 或 'cell-range' 时有） */
  cellStart?: { r: number; c: number };
  /** 单元格结束位置（仅 kind='cell-range' 时有） */
  cellEnd?: { r: number; c: number };
}>;

/** 已选标签数据：传递给 VcellInput */
export type SelectionTagData = Readonly<{
  icon: 'grid-all' | 'grid-row' | 'grid-column' | 'grid-cell';
  label: string;
}>;

/**
 * 解析单元格选中 key 为行列号
 * key 格式：`${r}:${c}`，如 "0:2" 表示第0行第2列
 */
export function parseCellSelectionKey(key: CellSelectionKey): { r: number; c: number } {
  const parts = key.split(':');
  if (parts.length !== 2) {
    throw new Error(`Invalid cell selection key: ${key}`);
  }
  return { r: parseInt(parts[0], 10), c: parseInt(parts[1], 10) };
}

/** 将行列号转为单元格选中 key */
export function cellSelectionKey(r: number, c: number): CellSelectionKey {
  return `${r}:${c}`;
}

/** 将列索引转换为字母（如 0 -> A, 1 -> B, 26 -> AA） */
export function colIndexToLetter(colIndex: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (colIndex < 26) {
    return letters[colIndex];
  }
  // 超过 26 列时使用 AA, AB, ... 格式
  const firstLetterIndex = Math.floor(colIndex / 26) - 1;
  const secondLetterIndex = colIndex % 26;
  return letters[firstLetterIndex] + letters[secondLetterIndex];
}

/** 将行号转换为显示序号（从 1 开始） */
export function rowIndexToDisplay(rowIndex: number): number {
  // 表头行号为 -1，表体从 0 开始，显示时都从 1 开始
  return rowIndex >= 0 ? rowIndex + 1 : 0;
}

/**
 * 单元格选中状态 Store
 * - 内部持有 selectedCells Set 的引用
 * - 提供订阅机制，外部组件可监听选中变化
 */
export class CellSelectionStore {
  private selectedCells: ReadonlySet<string> = new Set<string>();
  private selectionListeners = new Set<() => void>();
  /** 缓存摘要，避免重复计算 */
  private summaryCache: CellSelectionSummary | null = null;
  private rowCount = 0;
  private colCount = 0;

  /** 更新选中集合（由 TableRows 内部调用） */
  setSelectedCells(cells: ReadonlySet<string>): void {
    if (cells === this.selectedCells) return;
    this.selectedCells = cells;
    this.summaryCache = null; // 清除缓存
    this.emitSelection();
  }

  /** 更新行列数（用于计算"全选"判断） */
  setDimensions(rowCount: number, colCount: number): void {
    if (rowCount === this.rowCount && colCount === this.colCount) return;
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.summaryCache = null;
  }

  /** 获取选中集合 */
  getSelectedCells(): ReadonlySet<string> {
    return this.selectedCells;
  }

  /** 获取行列数 */
  getRowCount(): number {
    return this.rowCount;
  }

  getColCount(): number {
    return this.colCount;
  }

  /** 订阅选中变化 */
  subscribeSelection(cb: () => void): () => void {
    this.selectionListeners.add(cb);
    return () => this.selectionListeners.delete(cb);
  }

  /** 获取选中摘要 */
  getSelectionSummary(): CellSelectionSummary | null {
    if (this.summaryCache !== null) {
      return this.summaryCache;
    }
    this.summaryCache = this.computeSummary();
    return this.summaryCache;
  }

  private computeSummary(): CellSelectionSummary | null {
    const cells = this.selectedCells;
    if (cells.size === 0) {
      return null;
    }

    // 解析所有选中格
    const parsed = Array.from(cells).map(parseCellSelectionKey);

    // 按行列分组
    const rowSet = new Set<number>();
    const colSet = new Set<number>();
    let minR = Infinity, maxR = -Infinity;
    let minC = Infinity, maxC = -Infinity;

    for (const { r, c } of parsed) {
      rowSet.add(r);
      colSet.add(c);
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
      minC = Math.min(minC, c);
      maxC = Math.max(maxC, c);
    }

    // 判断是否为"全选"（所有表体行 + 所有列）
    // 注意：表头行 r=-1 不算在"全选"内
    const bodyRows = Array.from(rowSet).filter(r => r >= 0);
    const bodyRowCount = this.rowCount;
    const colCount = this.colCount;

    if (
      bodyRows.length === bodyRowCount &&
      colSet.size === colCount &&
      bodyRowCount > 0 &&
      colCount > 0
    ) {
      return { kind: 'full' };
    }

    // 判断是否为"整列"（仅表头选中 + 该列所有表体格）
    if (rowSet.has(-1) && bodyRows.length === bodyRowCount) {
      // 表头选中且所有行都选中 → 可能是整列
      // 但需要判断是否只有一列
      if (colSet.size === 1) {
        return { kind: 'column', column: Array.from(colSet)[0] };
      }
    }

    // 判断是否为"整行"（某行所有列都选中）
    if (colSet.size === colCount && colCount > 0) {
      const rows = Array.from(rowSet).filter(r => r >= 0).sort((a, b) => a - b);
      if (rows.length > 0) {
        // 检查是否为连续行
        const continuous = rows.length === maxR - minR + 1 && minR === rows[0] && maxR === rows[rows.length - 1];
        return { kind: 'rows', rows, rowsContinuous: continuous };
      }
    }

    // 单个单元格
    if (cells.size === 1) {
      const { r, c } = parsed[0];
      return { kind: 'cell', cellStart: { r, c } };
    }

    // 框选区域（矩形）
    const expectedCount = (maxR - minR + 1) * (maxC - minC + 1);
    if (cells.size === expectedCount) {
      return { kind: 'cell-range', cellStart: { r: minR, c: minC }, cellEnd: { r: maxR, c: maxC } };
    }

    // 其他情况：无法归纳为简单摘要，返回 null（不显示标签）
    return null;
  }

  private emitSelection(): void {
    this.selectionListeners.forEach((l) => l());
  }
}