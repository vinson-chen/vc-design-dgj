/**
 * 表体行勾选：按行订阅 + 表头单独订阅，避免整表 Context 随 Record 引用变化而跑上千次 selector。
 */
export type BodyRowSelectionFooterSnapshot = Readonly<{ total: number; selected: number }>;

export class BodyRowSelectionStore {
  private bodyRowCount = 0;
  private checks = new Map<number, boolean>();
  /**
   * 上一次「非 Shift」点选行的锚点；Shift+点选时与当前行构成闭区间，整段设为当前点击意图状态（与 Gmail/资源管理器一致）。
   */
  private shiftAnchorBodyRow: number | null = null;
  /** useSyncExternalStore：同数据返回同一引用，避免无限重渲染 */
  private footerStatsCache: BodyRowSelectionFooterSnapshot = { total: 0, selected: 0 };
  private rowListeners = new Map<number, Set<() => void>>();
  private headerListeners = new Set<() => void>();
  /** 任意勾选变化（供表格外批量条等 useSyncExternalStore 订阅） */
  private selectionListeners = new Set<() => void>();

  setBodyRowCount(n: number): void {
    if (n === this.bodyRowCount) return;
    if (this.shiftAnchorBodyRow != null && this.shiftAnchorBodyRow >= n) {
      this.shiftAnchorBodyRow = null;
    }
    const prev = this.bodyRowCount;
    this.bodyRowCount = n;
    if (n < prev) {
      for (const k of Array.from(this.checks.keys())) {
        if (k >= n) this.checks.delete(k);
      }
      for (let i = 0; i < n; i += 1) this.emitRow(i);
      this.emitHeader();
      this.emitSelection();
      return;
    }
    for (let i = prev; i < n; i += 1) this.emitRow(i);
    this.emitHeader();
    this.emitSelection();
  }

  getRow(i: number): boolean {
    return !!this.checks.get(i);
  }

  setRow(i: number, v: boolean): void {
    const prev = this.getRow(i);
    if (prev === v) return;
    if (v) this.checks.set(i, true);
    else this.checks.delete(i);
    this.emitRow(i);
    this.emitHeader();
    this.emitSelection();
  }

  toggleRow(i: number): void {
    this.setRow(i, !this.getRow(i));
  }

  /**
   * 表体勾选：支持 Shift+点击连续区间批量选中/取消（`targetChecked` 为点击后应对当前行生效的状态）。
   */
  applyShiftAwareBodyRowSet(i: number, shiftKey: boolean, targetChecked: boolean): void {
    if (this.bodyRowCount <= 0 || i < 0 || i >= this.bodyRowCount) return;

    if (!shiftKey || this.shiftAnchorBodyRow == null) {
      this.setRow(i, targetChecked);
      this.shiftAnchorBodyRow = i;
      return;
    }

    const anchor = this.shiftAnchorBodyRow;
    const lo = Math.min(anchor, i);
    const hi = Math.max(anchor, i);
    this.setRangeChecked(lo, hi, targetChecked);
  }

  private setRangeChecked(lo: number, hi: number, checked: boolean): void {
    let changed = false;
    for (let r = lo; r <= hi; r += 1) {
      if (r < 0 || r >= this.bodyRowCount) continue;
      const prev = this.getRow(r);
      if (prev === checked) continue;
      if (checked) this.checks.set(r, true);
      else this.checks.delete(r);
      changed = true;
      this.emitRow(r);
    }
    if (changed) {
      this.emitHeader();
      this.emitSelection();
    }
  }

  toggleAll(checked: boolean): void {
    this.shiftAnchorBodyRow = null;
    if (checked) {
      for (let i = 0; i < this.bodyRowCount; i += 1) this.checks.set(i, true);
    } else {
      this.checks.clear();
    }
    for (let i = 0; i < this.bodyRowCount; i += 1) this.emitRow(i);
    this.emitHeader();
    this.emitSelection();
  }

  /** 删除表体行后压缩行号（与 TableArea deleteBodyRow 一致） */
  remapAfterDeleteBodyRow(deletedIndex: number): void {
    if (this.shiftAnchorBodyRow != null) {
      if (this.shiftAnchorBodyRow === deletedIndex) this.shiftAnchorBodyRow = null;
      else if (this.shiftAnchorBodyRow > deletedIndex) this.shiftAnchorBodyRow -= 1;
    }
    const next = new Map<number, boolean>();
    for (const [k, v] of this.checks) {
      if (k < deletedIndex) next.set(k, v);
      else if (k > deletedIndex) next.set(k - 1, v);
    }
    this.checks = next;
    this.bodyRowCount = Math.max(0, this.bodyRowCount - 1);
    for (let i = 0; i < this.bodyRowCount; i += 1) this.emitRow(i);
    this.emitHeader();
    this.emitSelection();
  }

  /** 0=无行, 1=全未选, 2=全选, 3=部分 */
  getHeaderFingerprint(): number {
    const n = this.bodyRowCount;
    if (n <= 0) return 0;
    let c = 0;
    for (let i = 0; i < n; i += 1) {
      if (this.getRow(i)) c += 1;
    }
    if (c === 0) return 1;
    if (c === n) return 2;
    return 3;
  }

  headerAllChecked(): boolean {
    return this.getHeaderFingerprint() === 2;
  }

  headerIndeterminate(): boolean {
    return this.getHeaderFingerprint() === 3;
  }

  subscribeRow(i: number, cb: () => void): () => void {
    let set = this.rowListeners.get(i);
    if (!set) {
      set = new Set();
      this.rowListeners.set(i, set);
    }
    set.add(cb);
    return () => {
      set!.delete(cb);
      if (set!.size === 0) this.rowListeners.delete(i);
    };
  }

  subscribeHeader(cb: () => void): () => void {
    this.headerListeners.add(cb);
    return () => this.headerListeners.delete(cb);
  }

  subscribeSelection(cb: () => void): () => void {
    this.selectionListeners.add(cb);
    return () => this.selectionListeners.delete(cb);
  }

  getCheckedCount(): number {
    let c = 0;
    for (let i = 0; i < this.bodyRowCount; i += 1) {
      if (this.getRow(i)) c += 1;
    }
    return c;
  }

  getBodyRowCount(): number {
    return this.bodyRowCount;
  }

  getFooterStatsSnapshot(): BodyRowSelectionFooterSnapshot {
    const total = this.bodyRowCount;
    const selected = this.getCheckedCount();
    const c = this.footerStatsCache;
    if (c.total !== total || c.selected !== selected) {
      this.footerStatsCache = { total, selected };
    }
    return this.footerStatsCache;
  }

  private emitRow(i: number): void {
    this.rowListeners.get(i)?.forEach((l) => l());
  }

  private emitHeader(): void {
    this.headerListeners.forEach((l) => l());
  }

  private emitSelection(): void {
    this.selectionListeners.forEach((l) => l());
  }
}
