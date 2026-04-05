import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnPinningState,
  type Header,
  type Row,
  type Table,
  type VisibilityState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Checkbox, Input, InputNumber, Select, VcIcon, vcTokens } from 'vc-design';
import type { VcellCellAddress, VcellColumnMeta, VcellTableHandle, VcellTableStateSnapshot } from './vcellTableTypes';
import {
  isCellInRange,
  normalizeSelectionRange,
  parseTsv,
  rangeToTsv,
} from './vcellTableSelection';
import { useVcellUndoRedo } from './useVcellUndoRedo';
import './VcellTable.css';

function VcellNumberEditor({
  initial,
  onCommit,
}: {
  initial: number | null | undefined;
  onCommit: (v: unknown) => void;
}) {
  const [v, setV] = useState<number | null>(() =>
    typeof initial === 'number' && !Number.isNaN(initial) ? initial : null,
  );
  return (
    <InputNumber
      autoFocus
      style={{ width: '100%' }}
      value={v ?? undefined}
      onChange={(n) => setV(n ?? null)}
      onBlur={() => onCommit(v)}
      onPressEnter={() => onCommit(v)}
    />
  );
}

export const VCELL_ROW_DRAG_COLUMN_ID = '__vcell_row_drag__';

export type VcellTableProps<TData extends object> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId: (row: TData, index: number) => string;
  /** 数据变更（编辑、粘贴、行排序等）；与撤销栈配合时请先在外部以受控方式更新 data */
  onDataChange?: (next: TData[]) => void;
  rowHeight?: number;
  headerHeight?: number;
  /** 内容区滚动高度 */
  scrollHeight?: number | string;
  /** 行数较大时建议开启（默认 true） */
  virtualized?: boolean;
  maxUndoDepth?: number;
  className?: string;
  style?: React.CSSProperties;
  /** 初始列顺序（不含行拖拽列 id，内部会自动保留行拖拽列在首位） */
  defaultColumnOrder?: string[];
  defaultColumnVisibility?: VisibilityState;
  defaultColumnPinning?: ColumnPinningState;
  /** 关闭行拖拽列 */
  enableRowReorder?: boolean;
  /** 关闭列拖拽排序 */
  enableColumnReorder?: boolean;
  /** 关闭列宽拖拽 */
  enableColumnResize?: boolean;
};

function arrayMoveIndices(length: number, from: number, to: number): number[] {
  const idx = Array.from({ length }, (_, i) => i);
  const [it] = idx.splice(from, 1);
  idx.splice(to, 0, it);
  return idx;
}

type DefAccessor<TData> = {
  accessorKey?: string | keyof TData & string;
  accessorFn?: (row: TData, index: number) => unknown;
};

function getColumnDefAccessors<TData>(def: ColumnDef<TData, unknown>): DefAccessor<TData> {
  return def as DefAccessor<TData>;
}

function getCellValue<TData>(row: TData, columnId: string, table: Table<TData>): unknown {
  const col = table.getColumn(columnId);
  if (!col) return '';
  const def = getColumnDefAccessors(col.columnDef);
  if (typeof def.accessorFn === 'function') {
    return def.accessorFn(row, 0);
  }
  if (def.accessorKey != null && typeof row === 'object' && row != null) {
    return (row as Record<string, unknown>)[def.accessorKey as string];
  }
  return '';
}

function patchRowValue<TData>(
  row: TData,
  columnId: string,
  table: Table<TData>,
  value: unknown,
): TData {
  const col = table.getColumn(columnId);
  if (!col) return row;
  const rawDef = col.columnDef;
  const patch = rawDef.meta?.vcell?.patchRow;
  if (patch) return patch(row, value);
  const def = getColumnDefAccessors(rawDef);
  const key = def.accessorKey as string | undefined;
  if (key != null && typeof row === 'object' && row != null) {
    return { ...(row as object), [key]: value } as TData;
  }
  return row;
}

function cellString(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function isEditableColumn<TData>(table: Table<TData>, columnId: string): boolean {
  if (columnId === VCELL_ROW_DRAG_COLUMN_ID) return false;
  const col = table.getColumn(columnId);
  const m = col?.columnDef.meta?.vcell;
  if (m?.editable === false) return false;
  const def = col?.columnDef ? getColumnDefAccessors(col.columnDef) : undefined;
  return Boolean(
    def?.accessorKey != null || typeof def?.accessorFn === 'function' || m?.patchRow != null,
  );
}

function getCellType<TData>(table: Table<TData>, columnId: string): VcellColumnMeta['cellType'] {
  return table.getColumn(columnId)?.columnDef.meta?.vcell?.cellType ?? 'text';
}

function VcellTableInner<TData extends object>(
  props: VcellTableProps<TData>,
  ref: React.Ref<VcellTableHandle<TData>>,
) {
  const {
    data,
    columns: userColumns,
    getRowId,
    onDataChange,
    rowHeight = 40,
    headerHeight = 40,
    scrollHeight = 420,
    virtualized = true,
    maxUndoDepth = 50,
    className,
    style,
    defaultColumnOrder,
    defaultColumnVisibility,
    defaultColumnPinning,
    enableRowReorder = true,
    enableColumnReorder = true,
    enableColumnResize = true,
  } = props;

  const dataRef = useRef(data);
  dataRef.current = data;

  const applyData = useCallback(
    (next: TData[]) => {
      onDataChange?.(next);
    },
    [onDataChange],
  );

  const { recordBeforeMutation, undo, redo, canUndo, canRedo } = useVcellUndoRedo<TData>({
    maxDepth: maxUndoDepth,
    apply: applyData,
    getCurrent: () => dataRef.current,
  });

  const dragColRef = useRef<string | null>(null);
  const dragRowRef = useRef<string | null>(null);

  const baseIds = useMemo(
    () => userColumns.map((c, i) => (c.id ?? (c as { accessorKey?: string }).accessorKey ?? String(i)) as string),
    [userColumns],
  );

  const initialOrder = useMemo(() => {
    const rest = defaultColumnOrder?.length
      ? defaultColumnOrder.filter((id) => id !== VCELL_ROW_DRAG_COLUMN_ID && baseIds.includes(id))
      : [...baseIds];
    const missing = baseIds.filter((id) => !rest.includes(id));
    const full = [...rest, ...missing];
    return enableRowReorder ? [VCELL_ROW_DRAG_COLUMN_ID, ...full] : full;
  }, [baseIds, defaultColumnOrder, enableRowReorder]);

  const [columnOrder, setColumnOrder] = useState<string[]>(initialOrder);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultColumnVisibility ?? {});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    defaultColumnPinning ?? { left: enableRowReorder ? [VCELL_ROW_DRAG_COLUMN_ID] : [], right: [] },
  );
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});

  const [anchor, setAnchor] = useState<VcellCellAddress | null>(null);
  const [focus, setFocus] = useState<VcellCellAddress | null>(null);
  const [editing, setEditing] = useState<VcellCellAddress | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const rowDragColumn: ColumnDef<TData, unknown> = useMemo(
    () => ({
      id: VCELL_ROW_DRAG_COLUMN_ID,
      header: () => (
        <span className="vc-vcell-table__hint" title="拖拽排序行">
          <VcIcon type="move" />
        </span>
      ),
      cell: ({ row }) => (
        <span
          className="vc-vcell-table__row-drag"
          draggable={enableRowReorder}
          onDragStart={(e) => {
            if (!enableRowReorder) return;
            dragRowRef.current = row.id;
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnd={() => {
            dragRowRef.current = null;
          }}
        >
          <VcIcon type="move" />
        </span>
      ),
      size: 44,
      minSize: 36,
      maxSize: 56,
      enableResizing: false,
      enableHiding: false,
    }),
    [enableRowReorder],
  );

  const columns = useMemo(
    () => (enableRowReorder ? [rowDragColumn, ...userColumns] : userColumns),
    [enableRowReorder, rowDragColumn, userColumns],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
      columnVisibility,
      columnPinning,
      columnSizing,
    },
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, i) => getRowId(row, i),
    columnResizeMode: 'onChange',
    enableColumnResizing: enableColumnResize,
    enableColumnPinning: true,
    defaultColumn: {
      minSize: 80,
      maxSize: 640,
    },
  });

  const leafIds = table.getVisibleLeafColumns().map((c) => c.id);

  const range = useMemo(
    () =>
      anchor && focus
        ? normalizeSelectionRange(anchor, focus, leafIds, data.length)
        : null,
    [anchor, focus, leafIds, data.length],
  );

  const visibleRows = table.getRowModel().rows;

  const shouldVirtualize = virtualized && visibleRows.length > 40;

  const virtualizer = useVirtualizer({
    count: visibleRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 12,
    enabled: shouldVirtualize,
  });

  const vItems = shouldVirtualize ? virtualizer.getVirtualItems() : null;
  const totalSize = shouldVirtualize ? virtualizer.getTotalSize() : 0;

  const pushData = useCallback(
    (next: TData[], record: boolean) => {
      if (record) recordBeforeMutation();
      applyData(next);
    },
    [applyData, recordBeforeMutation],
  );

  const commitCell = useCallback(
    (rowIndex: number, columnId: string, raw: unknown, record: boolean) => {
      if (!onDataChange || !isEditableColumn(table, columnId)) return;
      const row = data[rowIndex];
      if (!row) return;
      let value: unknown = raw;
      const t = getCellType(table, columnId);
      if (t === 'number') {
        value = raw === '' || raw == null ? null : Number(raw);
        if (Number.isNaN(value)) value = null;
      }
      const nextRow = patchRowValue(row, columnId, table, value);
      if (nextRow === row) return;
      const next = data.map((r, i) => (i === rowIndex ? nextRow : r));
      pushData(next, record);
    },
    [data, onDataChange, pushData, table],
  );

  const moveActive = useCallback(
    (dr: number, dc: number, extend: boolean) => {
      if (!focus) return;
      const ri = Math.max(0, Math.min(data.length - 1, focus.rowIndex + dr));
      const ci = leafIds.indexOf(focus.columnId) + dc;
      if (ci < 0 || ci >= leafIds.length) return;
      const columnId = leafIds[ci];
      const next: VcellCellAddress = { rowIndex: ri, columnId };
      setFocus(next);
      if (!extend) setAnchor(next);
    },
    [data.length, focus, leafIds],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key === 'c') {
        if (!range || !anchor) return;
        const tsv = rangeToTsv(range, leafIds, visibleRows, (row, colId) =>
          cellString(getCellValue(row, colId, table)),
        );
        void navigator.clipboard.writeText(tsv);
        e.preventDefault();
        return;
      }
      if (editing) {
        if (e.key === 'Escape') {
          setEditing(null);
          e.preventDefault();
        }
        return;
      }
      if (!focus) return;
      const extend = e.shiftKey;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveActive(-1, 0, extend);
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveActive(1, 0, extend);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveActive(0, -1, extend);
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveActive(0, 1, extend);
          break;
        case 'Tab':
          e.preventDefault();
          moveActive(0, e.shiftKey ? -1 : 1, false);
          break;
        case 'Enter':
        case 'F2':
          if (isEditableColumn(table, focus.columnId)) {
            setEditing({ ...focus });
            e.preventDefault();
          }
          break;
        default:
          break;
      }
    },
    [editing, focus, leafIds, moveActive, range, redo, table, undo, visibleRows],
  );

  const onPaste = useCallback(
    (e: ClipboardEvent) => {
      if (!focus || !onDataChange) return;
      const text = e.clipboardData?.getData('text/plain');
      if (!text) return;
      e.preventDefault();
      const grid = parseTsv(text);
      if (grid.length === 0) return;
      recordBeforeMutation();
      let next = [...data];
      const startCol = leafIds.indexOf(focus.columnId);
      if (startCol < 0) return;
      for (let r = 0; r < grid.length; r += 1) {
        const ri = focus.rowIndex + r;
        if (ri >= next.length) break;
        const line = grid[r];
        for (let c = 0; c < line.length; c += 1) {
          const ci = startCol + c;
          if (ci >= leafIds.length) break;
          const colId = leafIds[ci];
          if (!isEditableColumn(table, colId)) continue;
          const cellText = line[c];
          const t = getCellType(table, colId);
          let val: unknown = cellText;
          if (t === 'number') {
            val = cellText === '' ? null : Number(cellText);
            if (Number.isNaN(val)) val = null;
          }
          next[ri] = patchRowValue(next[ri], colId, table, val);
        }
      }
      applyData(next);
    },
    [applyData, data, focus, leafIds, onDataChange, recordBeforeMutation, table],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const fn = (ev: ClipboardEvent) => onPaste(ev);
    el.addEventListener('paste', fn);
    return () => el.removeEventListener('paste', fn);
  }, [onPaste]);

  useImperativeHandle(
    ref,
    () => ({
      getData: () => dataRef.current,
      undo,
      redo,
      getUiState: (): VcellTableStateSnapshot => ({
        columnOrder,
        columnVisibility,
        columnPinning,
        columnSizing,
      }),
      setUiState: (patch) => {
        if (patch.columnOrder) setColumnOrder(patch.columnOrder);
        if (patch.columnVisibility) setColumnVisibility(patch.columnVisibility);
        if (patch.columnPinning) setColumnPinning(patch.columnPinning);
        if (patch.columnSizing) setColumnSizing(patch.columnSizing);
      },
      focusContainer: () => containerRef.current?.focus(),
    }),
    [columnOrder, columnPinning, columnSizing, columnVisibility, redo, undo],
  );

  const tokenVars = useMemo(
    () =>
      ({
        '--vc-vcell-border': vcTokens.color.neutral.border.default,
        '--vc-vcell-bg': vcTokens.color.neutral.background.container,
        '--vc-vcell-header-bg': vcTokens.color.neutral.fill.secondary,
        '--vc-vcell-hover-bg': vcTokens.color.neutral.background.controlItemBgHover,
        '--vc-vcell-select-bg': vcTokens.color.primary.bg,
        '--vc-vcell-active-border': vcTokens.color.primary.default,
        '--vc-vcell-text': vcTokens.color.neutral.text.default,
        '--vc-vcell-muted': vcTokens.color.neutral.text.description,
        '--vc-vcell-radius': `${vcTokens.style.borderRadius.sm}px`,
        '--vc-vcell-row-height': `${rowHeight}px`,
        '--vc-vcell-header-height': `${headerHeight}px`,
        '--vc-vcell-font-size': `${vcTokens.style.font.size.base}px`,
        '--vc-vcell-line-height': `${vcTokens.style.font.lineHeight.base}px`,
      }) as React.CSSProperties,
    [headerHeight, rowHeight],
  );

  const onDropRow = useCallback(
    (targetRowId: string) => {
      const fromId = dragRowRef.current;
      if (!fromId || fromId === targetRowId || !onDataChange) return;
      const from = data.findIndex((r, i) => getRowId(r, i) === fromId);
      const to = data.findIndex((r, i) => getRowId(r, i) === targetRowId);
      if (from < 0 || to < 0) return;
      recordBeforeMutation();
      const order = arrayMoveIndices(data.length, from, to);
      const next = order.map((i) => data[i]);
      applyData(next);
      dragRowRef.current = null;
    },
    [applyData, data, getRowId, onDataChange, recordBeforeMutation],
  );

  const columnDrop = useCallback(
    (targetColumnId: string) => {
      const fromId = dragColRef.current;
      if (!fromId || fromId === targetColumnId) return;
      const ids = [...columnOrder];
      const fi = ids.indexOf(fromId);
      const ti = ids.indexOf(targetColumnId);
      if (fi < 0 || ti < 0) return;
      const next = [...ids];
      const [it] = next.splice(fi, 1);
      next.splice(ti, 0, it);
      setColumnOrder(next);
      dragColRef.current = null;
    },
    [columnOrder],
  );

  const gripDragProps = (columnId: string) =>
    enableColumnReorder && columnId !== VCELL_ROW_DRAG_COLUMN_ID
      ? {
          draggable: true as const,
          onDragStart: () => {
            dragColRef.current = columnId;
          },
          onDragEnd: () => {
            dragColRef.current = null;
          },
        }
      : {};

  const renderBodyCell = (row: Row<TData>, cell: ReturnType<Row<TData>['getVisibleCells']>[number]) => {
    const colId = cell.column.id;
    const addr: VcellCellAddress = { rowIndex: row.index, columnId: colId };
    const selected = isCellInRange(row.index, colId, range, leafIds);
    const active = focus?.rowIndex === row.index && focus?.columnId === colId;
    const isEdit = editing?.rowIndex === row.index && editing?.columnId === colId;
    const val = getCellValue(row.original, colId, table);
    const editable = isEditableColumn(table, colId);
    const ctype = getCellType(table, colId);
    const opts = cell.column.columnDef.meta?.vcell?.selectOptions ?? [];

    const pin = cell.column.getIsPinned();
    const pinCls =
      pin === 'left' ? 'vc-vcell-table__td--pinned-left' : pin === 'right' ? 'vc-vcell-table__td--pinned-right' : '';

    return (
      <td
        key={cell.id}
        className={[
          'vc-vcell-table__td',
          pinCls,
          selected ? 'vc-vcell-table__td--selected' : '',
          active ? 'vc-vcell-table__td--active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          width: cell.column.getSize(),
          minWidth: cell.column.getSize(),
          maxWidth: cell.column.getSize(),
          left: pin === 'left' ? cell.column.getStart('left') : undefined,
          right: pin === 'right' ? cell.column.getAfter('right') : undefined,
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          containerRef.current?.focus();
          if (e.shiftKey && anchor) {
            setFocus(addr);
          } else {
            setAnchor(addr);
            setFocus(addr);
          }
        }}
        onDoubleClick={() => {
          if (editable) setEditing(addr);
        }}
        onDragOver={(e) => {
          if (enableRowReorder && dragRowRef.current) e.preventDefault();
        }}
        onDrop={() => {
          if (enableRowReorder && colId === VCELL_ROW_DRAG_COLUMN_ID) {
            onDropRow(row.id);
          }
        }}
      >
        <div className="vc-vcell-table__cell-inner">
          {isEdit ? (
            ctype === 'number' ? (
              <VcellNumberEditor
                initial={
                  typeof val === 'number'
                    ? val
                    : val == null || val === ''
                      ? undefined
                      : Number(val)
                }
                onCommit={(v) => {
                  commitCell(row.index, colId, v, true);
                  setEditing(null);
                }}
              />
            ) : ctype === 'select' ? (
              <Select
                style={{ width: '100%' }}
                autoFocus
                defaultValue={val == null ? undefined : String(val)}
                options={opts.map((o) => ({ label: o.label, value: o.value }))}
                onChange={(v) => {
                  commitCell(row.index, colId, v, true);
                  setEditing(null);
                }}
                onBlur={() => setEditing(null)}
              />
            ) : (
              <Input
                autoFocus
                defaultValue={cellString(val)}
                onBlur={(ev) => {
                  commitCell(row.index, colId, ev.target.value, true);
                  setEditing(null);
                }}
                onPressEnter={(ev) => {
                  commitCell(row.index, colId, (ev.target as HTMLInputElement).value, true);
                  setEditing(null);
                }}
              />
            )
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </div>
      </td>
    );
  };

  const renderHeader = (header: Header<TData, unknown>) => {
    const col = header.column;
    const pin = col.getIsPinned();
    const pinCls =
      pin === 'left' ? 'vc-vcell-table__th--pinned-left' : pin === 'right' ? 'vc-vcell-table__th--pinned-right' : '';
    return (
      <th
        key={header.id}
        colSpan={header.colSpan}
        className={['vc-vcell-table__th', pinCls].filter(Boolean).join(' ')}
        style={{
          width: col.getSize(),
          minWidth: col.getSize(),
          maxWidth: col.getSize(),
          position: 'relative',
          left: pin === 'left' ? col.getStart('left') : undefined,
          right: pin === 'right' ? col.getAfter('right') : undefined,
        }}
        onDragOver={
          enableColumnReorder && col.id !== VCELL_ROW_DRAG_COLUMN_ID
            ? (e) => e.preventDefault()
            : undefined
        }
        onDrop={
          enableColumnReorder && col.id !== VCELL_ROW_DRAG_COLUMN_ID
            ? () => columnDrop(col.id)
            : undefined
        }
      >
        <div className="vc-vcell-table__header-main">
          {enableColumnReorder && col.id !== VCELL_ROW_DRAG_COLUMN_ID && (
            <span
              className="vc-vcell-table__drag-grip"
              title="拖拽调整列顺序"
              {...gripDragProps(col.id)}
            >
              <VcIcon type="move" />
            </span>
          )}
          {header.isPlaceholder ? null : flexRender(col.columnDef.header, header.getContext())}
        </div>
        {enableColumnResize && col.getCanResize() ? (
          <div
            className="vc-vcell-table__resize"
            onMouseDown={header.getResizeHandler()}
            onTouchStart={header.getResizeHandler()}
            role="separator"
            aria-orientation="vertical"
          />
        ) : null}
      </th>
    );
  };

  const colCount = table.getVisibleLeafColumns().length;

  const visibilityMenu = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {table.getAllLeafColumns().map((col) => {
        if (col.id === VCELL_ROW_DRAG_COLUMN_ID) return null;
        return (
          <Checkbox
            key={col.id}
            checked={col.getIsVisible()}
            onChange={(e) => col.toggleVisibility(e.target.checked)}
          >
            {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
          </Checkbox>
        );
      })}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={['vc-vcell-table', className].filter(Boolean).join(' ')}
      style={{ ...tokenVars, ...style }}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="vc-vcell-table__toolbar">
        {visibilityMenu}
        <span className="vc-vcell-table__hint">
          {canUndo() ? '可撤销' : ''} {canRedo() ? '/ 可重做' : ''} · Ctrl+Z / Ctrl+Shift+Z · 复制 Ctrl+C · 粘贴 Ctrl+V
        </span>
      </div>
      <div ref={scrollRef} className="vc-vcell-table__scroll" style={{ maxHeight: scrollHeight }}>
        <table className="vc-vcell-table__table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => renderHeader(h))}
              </tr>
            ))}
          </thead>
          <tbody>
            {shouldVirtualize && vItems && vItems.length > 0 ? (
              <>
                <tr aria-hidden>
                  <td colSpan={colCount} style={{ padding: 0, border: 'none', height: vItems[0].start }} />
                </tr>
                {vItems.map((vi) => {
                  const row = visibleRows[vi.index];
                  if (!row) return null;
                  return (
                    <tr key={row.id} style={{ height: vi.size }}>
                      {row.getVisibleCells().map((cell) => renderBodyCell(row, cell))}
                    </tr>
                  );
                })}
                <tr aria-hidden>
                  <td
                    colSpan={colCount}
                    style={{
                      padding: 0,
                      border: 'none',
                      height: totalSize - (vItems[vItems.length - 1]?.end ?? 0),
                    }}
                  />
                </tr>
              </>
            ) : (
              visibleRows.map((row) => (
                <tr key={row.id}>{row.getVisibleCells().map((cell) => renderBodyCell(row, cell))}</tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VcellTableForward<TData extends object>(
  props: VcellTableProps<TData>,
  ref: React.Ref<VcellTableHandle<TData>>,
) {
  return VcellTableInner(props, ref);
}

export const VcellTable = forwardRef(VcellTableForward) as <TData extends object>(
  props: VcellTableProps<TData> & { ref?: React.Ref<VcellTableHandle<TData>> },
) => React.ReactElement;

export default VcellTable;
