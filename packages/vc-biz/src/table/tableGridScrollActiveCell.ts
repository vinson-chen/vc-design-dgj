export type TableCellNavKey =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight';

const EDGE_PAD = 2;

function isNavKey(k: string): k is TableCellNavKey {
  return (
    k === 'ArrowUp' ||
    k === 'ArrowDown' ||
    k === 'ArrowLeft' ||
    k === 'ArrowRight'
  );
}

/** 与 TableRows 传入一致，用于推算冻结遮挡（DOM 不可测时的兜底） */
export type TableFrozenScrollConfig = Readonly<{
  colCount: number;
  enableInsertRowCol: boolean;
  enableFreezeFirstCol: boolean;
  enableFreezeLastCol: boolean;
  enableFreezeLastRow: boolean;
  displayRowCount: number;
  narrowWidth: number;
  /** 首列窄轨（checkbox/序号/插入行+）；0 表示无该列 */
  narrowLeadWidth: number;
  minResizableTextColWidth: number;
  defaultTextColWidth: number;
  /** 未挂载 footer DOM 时估算 sticky 末行高度 */
  frozenFooterRowEstimatePx: number;
}>;

export type ScrollTableActiveCellIntoViewArgs = Readonly<{
  scrollRoot: HTMLElement | null;
  bodyRow: number;
  col: number;
  key: string;
  useVirtual: boolean;
  scrollToVirtualRow?: (
    virtualIndex: number,
    opts: { align: 'start' | 'end' | 'auto' | 'center'; behavior?: ScrollBehavior }
  ) => void;
  frozen?: TableFrozenScrollConfig;
}>;

/** 扣除 sticky 头/尾与左右冻结列后的「可完整看到单元格」区域（viewport 坐标） */
function getSafeViewportClientRect(
  scrollRoot: HTMLElement,
  sr: DOMRect,
  frozen: TableFrozenScrollConfig | undefined
): { top: number; bottom: number; left: number; right: number } {
  let top = sr.top;
  let bottom = sr.bottom;
  let left = sr.left;
  let right = sr.right;

  if (!frozen) {
    return { top, bottom, left, right };
  }

  const header = scrollRoot.querySelector<HTMLElement>('[data-vc-biz-table-frozen-header]');
  if (header) {
    top = Math.max(top, header.getBoundingClientRect().bottom);
  }

  if (frozen.enableFreezeLastRow && frozen.displayRowCount > 1) {
    const footer = scrollRoot.querySelector<HTMLElement>('[data-vc-biz-table-frozen-footer]');
    if (footer) {
      bottom = Math.min(bottom, footer.getBoundingClientRect().top);
    } else {
      bottom = Math.min(bottom, sr.bottom - frozen.frozenFooterRowEstimatePx);
    }
  }

  if (frozen.enableFreezeFirstCol && frozen.colCount > 0) {
    /** 左冻结区右缘须用 sticky 的列 0 右边界（viewport 固定） */
    const col0 =
      scrollRoot.querySelector<HTMLElement>('[data-body-row][data-col="0"]') ??
      scrollRoot.querySelector<HTMLElement>('[role="row"] [data-col="0"]');
    if (col0) {
      left = Math.max(left, col0.getBoundingClientRect().right);
    } else {
      left = Math.max(left, sr.left + frozen.narrowLeadWidth + frozen.defaultTextColWidth);
    }
  }

  if (frozen.enableFreezeLastCol && frozen.colCount > 0) {
    const lastIdx = frozen.colCount - 1;
    const lastCell = scrollRoot.querySelector<HTMLElement>(
      `[data-body-row][data-col="${lastIdx}"]`
    );
    if (lastCell) {
      right = Math.min(right, lastCell.getBoundingClientRect().left);
    } else {
      let w = frozen.defaultTextColWidth;
      if (frozen.enableInsertRowCol) w += frozen.narrowWidth;
      right = Math.min(right, sr.right - w);
    }
  }

  if (top >= bottom - EDGE_PAD) {
    top = sr.top;
    bottom = sr.bottom;
  }
  if (left >= right - EDGE_PAD) {
    left = sr.left;
    right = sr.right;
  }

  return { top, bottom, left, right };
}

/** 仅在越出安全区时做最小 scroll 修正，避免把滚动条推到视口极限 */
function nudgeCellIntoSafeRect(
  scrollRoot: HTMLElement,
  el: HTMLElement,
  safe: { top: number; bottom: number; left: number; right: number }
) {
  const er = el.getBoundingClientRect();

  if (er.bottom > safe.bottom - EDGE_PAD) {
    scrollRoot.scrollTop += er.bottom - safe.bottom + EDGE_PAD;
  }
  if (er.top < safe.top + EDGE_PAD) {
    scrollRoot.scrollTop += er.top - safe.top - EDGE_PAD;
  }
  if (er.right > safe.right - EDGE_PAD) {
    scrollRoot.scrollLeft += er.right - safe.right + EDGE_PAD;
  }
  if (er.left < safe.left + EDGE_PAD) {
    scrollRoot.scrollLeft += er.left - safe.left - EDGE_PAD;
  }
}

function queryTargetCell(
  scrollRoot: HTMLElement | null,
  bodyRow: number,
  col: number,
  useVirtual: boolean
): HTMLElement | null {
  const sel = `[data-body-row="${bodyRow}"][data-col="${col}"]`;
  let el = scrollRoot?.querySelector<HTMLElement>(sel) ?? null;
  if (!el && !useVirtual) {
    el = typeof document !== 'undefined' ? document.querySelector<HTMLElement>(sel) : null;
  }
  return el;
}

/**
 * 键盘切换锁定格后的滚动：
 * - 目标格已在 DOM：不调用 scrollToIndex（避免 TanStack `auto` 退化成 start/end 把条推到边缘），只做安全区最小溢出校正。
 * - 目标格未挂载（虚拟列表外）：scrollToIndex 用 `center` 温和卷入，再校正。
 */
export function scrollTableActiveCellIntoView(a: ScrollTableActiveCellIntoViewArgs): void {
  if (!isNavKey(a.key)) return;

  const { scrollRoot, bodyRow, col, useVirtual, scrollToVirtualRow, frozen } = a;
  const virtualRowIndex = bodyRow + 1;

  const finish = (el: HTMLElement) => {
    const root =
      scrollRoot ??
      (typeof el.closest === 'function'
        ? el.closest<HTMLElement>('.vc-biz-table-scrollport')
        : null);

    if (!root) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
      return;
    }

    const sr = root.getBoundingClientRect();
    const safe = getSafeViewportClientRect(root, sr, frozen);

    if (!useVirtual && !frozen) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
      return;
    }

    nudgeCellIntoSafeRect(root, el, safe);
  };

  const run = () => {
    let el = queryTargetCell(scrollRoot, bodyRow, col, useVirtual);

    if (el) {
      finish(el);
      return;
    }

    if (useVirtual && scrollToVirtualRow) {
      scrollToVirtualRow(virtualRowIndex, { align: 'center', behavior: 'auto' });
      requestAnimationFrame(() => {
        el = queryTargetCell(scrollRoot, bodyRow, col, useVirtual);
        if (el) finish(el);
      });
    }
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
}
