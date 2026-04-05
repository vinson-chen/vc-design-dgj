import {
  useVirtualizer,
  type Virtualizer,
  type Range,
  type Rect,
  defaultRangeExtractor,
  observeElementRect as observeElementRectBase,
} from '@tanstack/react-virtual';
import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { vcTokens } from 'vc-design';
import { BodyRowSelectionStoreContext } from './bodyRowSelectionStoreContext';
import { TableGridEditingDispatchersRefContext } from './tableGridEditingDispatchersRefContext';
import { TableGridEditingStateContext } from './tableGridEditingStateContext';
import type { TableGridEditingStateSlice } from './tableGridEditingStateContext';
import { TableGridConfigContext } from './tableGridConfigContext';
import TableGridRow from './TableGridRow';
import { TableRowHoverStoreContext } from './tableRowHoverStoreContext';
import { createTableRowHoverStore } from './tableRowHoverStore';
import type { TableGridStaticConfig } from './tableGridTypes';
import type { TableRowsProps } from './tableGridTypes';
import { getTableBodyVirtualOverscan, TABLE_HEADER_BG_DEFAULT } from './tableGridConstants';
import { getTableGridTypographyMetrics } from './tableGridTypography';
import type { TableFrozenScrollConfig } from './tableGridScrollActiveCell';
import './tableBodyScroll.css';
import { scrollTableActiveCellIntoView } from './tableGridScrollActiveCell';
import type { TableGridEditingState } from './useTableGridEditing';
import { useTableGridEditing } from './useTableGridEditing';

export type { TableRowsProps } from './tableGridTypes';

/** 冻结末行占位外层：虚拟列表与非虚拟列表共用，避免两处样式漂移 */
const FROZEN_FOOTER_WRAP_STYLE: React.CSSProperties = {
  position: 'sticky',
  bottom: 0,
  zIndex: 5,
  width: '100%',
  boxSizing: 'border-box',
  background: vcTokens.color.neutral.background.container,
  isolation: 'isolate',
};

/** 虚拟列表始终包含第 0 行（表头），以便 sticky 钉顶时仍参与测量与渲染 */
function rangeExtractorPinHeader(range: Range) {
  const base = defaultRangeExtractor(range);
  if (base.includes(0)) return base;
  return [0, ...base].sort((a, b) => a - b);
}

export default function TableRows(props: TableRowsProps) {
  const hoverStoreRef = useRef<ReturnType<typeof createTableRowHoverStore> | null>(null);
  if (hoverStoreRef.current == null) {
    hoverStoreRef.current = createTableRowHoverStore();
  }
  const hoverStore = hoverStoreRef.current;

  const gridNavMaxBodyRowIndex = props.rowCount >= 2 ? props.rowCount - 2 : -1;
  const gridNavMaxColIndex = props.colCount > 0 ? props.colCount - 1 : -1;

  const keyboardNavigateScrollRef = useRef<(bodyRow: number, col: number, key: string) => void>(
    () => {}
  );
  const onKeyboardNavigateCell = useCallback(
    (p: { r: number; c: number; key: string }) => {
      keyboardNavigateScrollRef.current(p.r, p.c, p.key);
    },
    []
  );

  const editing = useTableGridEditing(props.enableEditMode, {
    initialValueByCell:
      props.valueByCell === undefined ? props.initialValueByCell : undefined,
    valueByCell: props.valueByCell,
    onValueByCellChange: props.onValueByCellChange,
    maxBodyRowIndex: gridNavMaxBodyRowIndex,
    maxColIndex: gridNavMaxColIndex,
    onKeyboardNavigateCell,
  });

  const editingDispatchersRef = useRef<TableGridEditingState | null>(null);
  editingDispatchersRef.current = editing;

  const editingStateSlice = useMemo((): TableGridEditingStateSlice => {
    return {
      editingCell: editing.editingCell,
      selectedCell: editing.selectedCell,
      valueByCell: editing.valueByCell,
      hoverLockedCell: editing.hoverLockedCell,
    };
  }, [editing.editingCell, editing.selectedCell, editing.valueByCell, editing.hoverLockedCell]);

  /** 末行（插入行占位）始终渲染；「插入行列」只控制是否出现 + 与插入能力 */
  const displayRowCount = props.rowCount + 1;
  const useBodyVirtual =
    props.bodyScrollMaxHeight != null &&
    props.bodyScrollMaxHeight > 0 &&
    displayRowCount > 0;

  const typography = useMemo(
    () => getTableGridTypographyMetrics(props.enableRegularTableFont !== false),
    [props.enableRegularTableFont]
  );

  /** 纵滚 + 横滚同一容器，冻结列 left/right sticky 才能与表头 top 参照同一 scrollport */
  const scrollParentRef = useRef<HTMLDivElement>(null);

  const observeElementRectPatched = useMemo(() => {
    const maxH = props.bodyScrollMaxHeight ?? 0;
    return (instance: Virtualizer<HTMLDivElement, Element>, cb: (rect: Rect) => void) =>
      observeElementRectBase(instance, (rect) => {
        /** jsdom / 首帧未布局时常为 0，用配置高度兜底以便算出可见 range */
        cb({
          width: rect.width > 0 ? rect.width : 320,
          height: rect.height > 0 ? rect.height : maxH > 0 ? maxH : rect.height,
        });
      });
  }, [props.bodyScrollMaxHeight]);

  /** 虚拟化不含末行：末行若在 absolute 子树内做 sticky bottom，浏览器无法相对外层 scrollport 粘底 */
  const virtualRowCount = props.rowCount;

  /** 触控板惯性 / 自定义 wheel 单帧位移大时，固定小 overscan 易出现行间空白裂缝 */
  const virtualListOverscan = useMemo(() => {
    if (!useBodyVirtual) return 8;
    const h = props.bodyScrollMaxHeight ?? 520;
    return getTableBodyVirtualOverscan(h, typography.bodyVirtualRowEstimatePx);
  }, [useBodyVirtual, props.bodyScrollMaxHeight, typography.bodyVirtualRowEstimatePx]);

  const rowVirtualizer = useVirtualizer({
    count: useBodyVirtual ? virtualRowCount : 0,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: (index) =>
      index === 0
        ? typography.headerVirtualRowEstimatePx
        : typography.bodyVirtualRowEstimatePx,
    overscan: virtualListOverscan,
    enabled: useBodyVirtual,
    rangeExtractor: rangeExtractorPinHeader,
    observeElementRect: observeElementRectPatched,
    /** 将 RO 回调合并到 rAF，减轻与 scroll 同帧竞态导致的测量抖动 */
    useAnimationFrameWithResizeObserver: true,
  });

  // 默认会在「行高与 estimate 不一致」时修正 scrollTop；编辑态 TextArea autoSize / ResizeObserver
  // 会触发行高变化，在部分 scrollOffset 下会错误修正，整表跳到最后一屏并导致 hover/编辑行错位。
  const rv = rowVirtualizer as Virtualizer<HTMLDivElement, Element>;
  rv.shouldAdjustScrollPositionOnItemSizeChange = () => false;

  const rowVirtualizerRef = useRef(rowVirtualizer);
  rowVirtualizerRef.current = rowVirtualizer;

  useLayoutEffect(() => {
    const frozen: TableFrozenScrollConfig = {
      colCount: props.colCount,
      enableInsertRowCol: props.enableInsertRowCol,
      enableFreezeFirstCol: props.enableFreezeFirstCol,
      enableFreezeLastCol: props.enableFreezeLastCol,
      enableFreezeLastRow: props.enableFreezeLastRow,
      displayRowCount,
      narrowWidth: props.narrowWidth,
      minTextColWidth: props.minTextColWidth,
      frozenFooterRowEstimatePx: typography.bodyVirtualRowEstimatePx,
    };
    keyboardNavigateScrollRef.current = (bodyRow, col, key) => {
      scrollTableActiveCellIntoView({
        scrollRoot: scrollParentRef.current,
        bodyRow,
        col,
        key,
        useVirtual: useBodyVirtual,
        scrollToVirtualRow: useBodyVirtual
          ? (virtualIndex, opts) => rowVirtualizerRef.current.scrollToIndex(virtualIndex, opts)
          : undefined,
        frozen,
      });
    };
  }, [
    useBodyVirtual,
    displayRowCount,
    props.colCount,
    props.enableInsertRowCol,
    props.enableFreezeFirstCol,
    props.enableFreezeLastCol,
    props.enableFreezeLastRow,
    props.narrowWidth,
    props.minTextColWidth,
    typography.bodyVirtualRowEstimatePx,
  ]);

  /** 进入编辑或表体滚动时清除行 hover：避免滚动/虚拟列表下移时鼠标未动却误触发别行的 mouseEnter，造成「编辑第 8 行但灰底在第 15 行」 */
  useLayoutEffect(() => {
    if (editing.editingCell != null) {
      hoverStore.setHoveredRowIndex(null);
    }
  }, [editing.editingCell, hoverStore]);

  const onBodyScroll = useCallback(() => {
    hoverStore.setHoveredRowIndex(null);
  }, [hoverStore]);

  /** 非 passive wheel：双轴 delta 一次写入 scrollLeft/scrollTop；编辑区与 Ctrl/⌘+滚轮不拦截 */
  useLayoutEffect(() => {
    if (!useBodyVirtual) return;
    const el = scrollParentRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;

      const target = e.target as HTMLElement | null;
      if (target?.closest('textarea, input, [contenteditable="true"]')) return;

      let dX = e.deltaX;
      let dY = e.deltaY;
      if (e.shiftKey && dX === 0 && dY !== 0) {
        dX = dY;
        dY = 0;
      }

      const {
        scrollLeft,
        scrollTop,
        scrollWidth,
        clientWidth,
        scrollHeight,
        clientHeight,
      } = el;
      const maxX = Math.max(0, scrollWidth - clientWidth);
      const maxY = Math.max(0, scrollHeight - clientHeight);

      const nextX = Math.min(maxX, Math.max(0, scrollLeft + dX));
      const nextY = Math.min(maxY, Math.max(0, scrollTop + dY));

      if (nextX !== scrollLeft || nextY !== scrollTop) {
        el.scrollLeft = nextX;
        el.scrollTop = nextY;
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [useBodyVirtual]);

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

  const scrollTableViewportToBottom = useCallback(() => {
    const run = () => {
      const inner = scrollParentRef.current;
      if (inner) {
        inner.scrollTop = Math.max(0, inner.scrollHeight - inner.clientHeight);
        return;
      }
      const outer = props.tableOuterScrollRef?.current;
      if (outer) {
        outer.scrollTop = Math.max(0, outer.scrollHeight - outer.clientHeight);
        return;
      }
      if (typeof document !== 'undefined') {
        document
          .querySelector<HTMLElement>('[data-vc-biz-table-insert-tail-row]')
          ?.scrollIntoView({ block: 'end', behavior: 'auto' });
      }
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  }, [props.tableOuterScrollRef]);

  const scrollTableViewportToRight = useCallback(() => {
    const run = () => {
      const inner = scrollParentRef.current;
      const outer = props.tableOuterScrollRef?.current;
      const el = inner ?? outer ?? null;
      if (el) {
        el.scrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
      }
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  }, [props.tableOuterScrollRef]);

  const onInsertRowWrapped = useCallback(() => {
    props.onInsertRow();
    scrollTableViewportToBottom();
  }, [props.onInsertRow, scrollTableViewportToBottom]);

  const onInsertColumnWrapped = useCallback(() => {
    props.onInsertColumn();
    scrollTableViewportToRight();
  }, [props.onInsertColumn, scrollTableViewportToRight]);

  const staticConfig = useMemo((): TableGridStaticConfig => {
    const {
      bodyRowSelectionStore: _bs,
      initialValueByCell: _iv,
      valueByCell: _v,
      onValueByCellChange: _ov,
      bodyScrollMaxHeight: _bh,
      tableOuterScrollRef: _tor,
      enableRegularTableFont: _erf,
      onInsertRow: _oir,
      onInsertColumn: _oic,
      ...rest
    } = props;
    return {
      ...rest,
      onInsertRow: onInsertRowWrapped,
      onInsertColumn: onInsertColumnWrapped,
      deleteColumnAt,
      deleteBodyRowAt,
      bodyVirtualized: useBodyVirtual,
      typography,
    };
  }, [
    typography,
    useBodyVirtual,
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
    props.enableFreezeLastRow,
    props.enableBodyCellRightBorder,
    props.enableShowRowIndex,
    props.gridMinCount,
    props.colWidths,
    props.onColumnResizeStart,
    props.insertLayoutTextColPx,
    props.onDeleteColumn,
    props.onDeleteBodyRow,
    deleteColumnAt,
    deleteBodyRowAt,
    onInsertRowWrapped,
    onInsertColumnWrapped,
  ]);

  return (
    <BodyRowSelectionStoreContext.Provider value={props.bodyRowSelectionStore}>
      <TableRowHoverStoreContext.Provider value={hoverStore}>
        <TableGridConfigContext.Provider value={staticConfig}>
          <TableGridEditingDispatchersRefContext.Provider value={editingDispatchersRef}>
            <TableGridEditingStateContext.Provider value={editingStateSlice}>
              {useBodyVirtual ? (
                /**
                 * 路线 C：表头 = 虚拟第 0 行。单一 overflow:auto 容器同时承担 maxHeight 纵滚与宽表横滚，
                 * 冻结列 left/right 与表头 top 共用同一 scrollport（拆成「外横 + 内纵」时 sticky 会失效）。
                 */
                <div
                  ref={scrollParentRef}
                  className="vc-biz-table-scrollport"
                  onScroll={onBodyScroll}
                  style={{
                    width: '100%',
                    maxHeight: props.bodyScrollMaxHeight,
                    overflow: 'auto',
                    scrollbarGutter: 'stable',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      minWidth: props.rowMinWidth,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        height: rowVirtualizer.getTotalSize(),
                        width: '100%',
                        position: 'relative',
                        background: vcTokens.color.neutral.background.container,
                      }}
                    >
                      {rowVirtualizer.getVirtualItems().map((vi) => {
                        const rowIndex = vi.index;
                        const isHeaderRow = rowIndex === 0;
                        return (
                          <div
                            key={vi.key}
                            data-index={vi.index}
                            ref={rowVirtualizer.measureElement}
                            style={
                              isHeaderRow
                                ? {
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 6,
                                    width: '100%',
                                    isolation: 'isolate',
                                    background: TABLE_HEADER_BG_DEFAULT,
                                  }
                                : {
                                    position: 'absolute',
                                    top: vi.start,
                                    left: 0,
                                    width: '100%',
                                    zIndex: 1,
                                  }
                            }
                            {...(isHeaderRow ? { 'data-vc-biz-table-frozen-header': '' } : {})}
                          >
                            <TableGridRow rowIndex={rowIndex} />
                          </div>
                        );
                      })}
                    </div>
                    <div
                      style={
                        props.enableFreezeLastRow && displayRowCount > 1
                          ? FROZEN_FOOTER_WRAP_STYLE
                          : { width: '100%', boxSizing: 'border-box' }
                      }
                      {...(props.enableFreezeLastRow && displayRowCount > 1
                        ? { 'data-vc-biz-table-frozen-footer': '' }
                        : {})}
                    >
                      <TableGridRow rowIndex={props.rowCount} />
                    </div>
                  </div>
                </div>
              ) : (
                Array.from({ length: displayRowCount }).map((_, rowIndex) => {
                  const isTailRow = rowIndex === props.rowCount;
                  const freezeFooter =
                    props.enableFreezeLastRow && isTailRow && displayRowCount > 1;
                  if (!freezeFooter) {
                    return <TableGridRow key={`row-${rowIndex}`} rowIndex={rowIndex} />;
                  }
                  return (
                    <div
                      key={`row-${rowIndex}`}
                      data-vc-biz-table-frozen-footer=""
                      style={FROZEN_FOOTER_WRAP_STYLE}
                    >
                      <TableGridRow rowIndex={rowIndex} />
                    </div>
                  );
                })
              )}
            </TableGridEditingStateContext.Provider>
          </TableGridEditingDispatchersRefContext.Provider>
        </TableGridConfigContext.Provider>
      </TableRowHoverStoreContext.Provider>
    </BodyRowSelectionStoreContext.Provider>
  );
}
