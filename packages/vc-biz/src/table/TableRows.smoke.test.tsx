import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BodyRowSelectionStore } from './bodyRowSelectionStore';
import TableRows from './TableRows';
import type { TableRowsProps } from './tableGridTypes';

/** 与 TableArea demo 中 GRID_MAX 对齐，保证 colWidths[colIndex] 读取安全 */
const COL_WIDTHS_SLOTS = 20;

function createTableRowsProps(overrides: Partial<TableRowsProps> = {}): TableRowsProps {
  const colCount = overrides.colCount ?? 2;
  const narrowWidth = overrides.narrowWidth ?? 40;
  const minTextColWidth = overrides.minTextColWidth ?? 100;
  const enableInsertRowCol = overrides.enableInsertRowCol ?? false;
  const rowMinWidth =
    overrides.rowMinWidth ??
    narrowWidth +
      colCount * (enableInsertRowCol ? 160 : minTextColWidth) +
      (enableInsertRowCol ? narrowWidth : 0);

  const rowCount = overrides.rowCount ?? 3;
  const store = overrides.bodyRowSelectionStore ?? new BodyRowSelectionStore();
  store.setBodyRowCount(Math.max(0, rowCount - 1));

  return {
    rowCount,
    colCount,
    enableInsertRowCol,
    enableEditMode: false,
    rowMinWidth,
    narrowWidth,
    minTextColWidth,
    enableColumnResize: false,
    enableVerticalCenter: true,
    enableFreezeFirstCol: false,
    enableFreezeLastCol: false,
    enableFreezeLastRow: false,
    enableBodyCellRightBorder: false,
    enableShowRowIndex: false,
    bodyRowSelectionStore: store,
    colWidths: Array.from({ length: COL_WIDTHS_SLOTS }, () => null),
    onColumnResizeStart: () => () => {},
    onInsertRow: vi.fn(),
    onInsertColumn: vi.fn(),
    insertLayoutTextColPx: null,
    ...overrides,
  };
}

describe('TableRows smoke', () => {
  it('mounts header + body rows without throwing', () => {
    render(<TableRows {...createTableRowsProps()} />);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4);

    const headerRow = rows[0];
    expect(within(headerRow).getByRole('checkbox')).toBeInTheDocument();
  });

  it('mounts with body virtual scroll (header shares rowMinWidth with body)', () => {
    render(
      <TableRows
        {...createTableRowsProps({
          rowCount: 12,
          bodyScrollMaxHeight: 200,
        })}
      />
    );

    expect(screen.getByText('列 1')).toBeInTheDocument();
    expect(screen.getByText('列 2')).toBeInTheDocument();
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it('mounts insert-row placeholder when enableInsertRowCol is true', () => {
    render(
      <TableRows
        {...createTableRowsProps({
          enableInsertRowCol: true,
          insertLayoutTextColPx: 160,
        })}
      />
    );

    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(1);
  });
});

/**
 * 大列表仅做「能挂载、不抛错」的本地/CI 可选检查，默认跳过以免拖慢常规测试。
 * 启用：VC_TABLE_PERF=1 npm test
 */
const perfEnabled = process.env.VC_TABLE_PERF === '1';

describe.skipIf(!perfEnabled)('TableRows perf smoke (opt-in)', () => {
  it('mounts ~800 body rows without throwing', () => {
    const bodyRows = 800;
    const colCount = 4;
    const narrowWidth = 40;
    const minTextColWidth = 100;

    const { container } = render(
      <TableRows
        {...createTableRowsProps({
          rowCount: bodyRows + 1,
          colCount,
          rowMinWidth: narrowWidth + colCount * minTextColWidth,
        })}
      />
    );

    expect(container.querySelectorAll('[role="row"]')).toHaveLength(bodyRows + 2);
  });
});
