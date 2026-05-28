import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BodyRowSelectionStore } from './bodyRowSelectionStore';
import TableRows from './TableRows';
import type { TableRowsProps } from './tableGridTypes';

/** 与 TableArea demo 中 GRID_MAX 对齐，保证 colWidths[colIndex] 读取安全 */
const COL_WIDTHS_SLOTS = 20;

function createTableRowsProps(overrides: Partial<TableRowsProps> = {}): TableRowsProps {
  const colCount = overrides.colCount ?? 2;
  const narrowWidth = overrides.narrowWidth ?? 40;
  const minResizableTextColWidth = overrides.minResizableTextColWidth ?? 100;
  const defaultTextColWidth = overrides.defaultTextColWidth ?? 200;
  const enableInsertRowCol = overrides.enableInsertRowCol ?? false;
  const batchOn = overrides.enableBatchSelection !== false;
  const showRowIndex = overrides.enableShowRowIndex ?? false;
  const narrowLeadForMin = batchOn || showRowIndex ? narrowWidth : 0;
  const rowMinWidth =
    overrides.rowMinWidth ??
    narrowLeadForMin +
      colCount * defaultTextColWidth +
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
    minResizableTextColWidth,
    defaultTextColWidth,
    enableColumnResize: false,
    enableVerticalCenter: true,
    enableFreezeFirstCol: false,
    enableFreezeLastCol: false,
    enableFreezeLastRow: false,
    enableBodyCellRightBorder: false,
    enableBatchSelection: true,
    enableShowRowIndex: false,
    bodyRowSelectionStore: store,
    colWidths: Array.from({ length: COL_WIDTHS_SLOTS }, () => null),
    onColumnResizeStart: () => () => {},
    onInsertRow: vi.fn(),
    onInsertColumn: vi.fn(),
    ...overrides,
  };
}

async function switchFirstHeaderColumnToImageType() {
  const menuBtn = screen.getAllByRole('button', { name: '列操作' })[0];
  expect(menuBtn).toBeInTheDocument();
  act(() => {
    fireEvent.click(menuBtn!);
  });
  act(() => {
    const editLabel = screen.getByText('编辑列');
    const title =
      (editLabel.closest('.ant-dropdown-menu-submenu-title') as HTMLElement | null) ??
      (editLabel.closest('.ant-menu-submenu-title') as HTMLElement | null) ??
      editLabel;
    fireEvent.click(title);
  });
  await waitFor(() => {
    expect(screen.getByText('列标题')).toBeInTheDocument();
  });
  const origin = screen.getByText('列类型').closest('.vc-biz-table-header-field-type-inner');
  expect(origin).toBeTruthy();
  const combobox = within(origin as HTMLElement).getByRole('combobox', { hidden: true });
  act(() => {
    fireEvent.mouseDown(combobox);
  });
  act(() => {
    fireEvent.click(screen.getByText('图片列'));
  });
  act(() => {
    const saveBtn = within(origin as HTMLElement).getByRole('button', {
      name: '保存',
      hidden: true,
    });
    fireEvent.click(saveBtn);
  });
}

describe('TableRows smoke', () => {
  it('switches first column to image type and renders add button in body cell when anchored', async () => {
    render(
      <TableRows
        {...createTableRowsProps({
          enableEditMode: true,
          enableInsertRowCol: true,
          colCount: 1,
          rowCount: 3,
          setColumnHidden: vi.fn(),
          setAllColumnsHidden: vi.fn(),
        })}
      />
    );

    await switchFirstHeaderColumnToImageType();

    // 图片列 add 按钮只在锚点态显示
    expect(screen.queryByRole('button', { name: '添加图片' })).not.toBeInTheDocument();
    const bodyCell = document.querySelector(
      '[data-hover-lock-cell][data-body-row="0"][data-col="0"]'
    ) as HTMLElement | null;
    expect(bodyCell).toBeTruthy();
    fireEvent.click(bodyCell!);
    // 点击后进入锚点态，显示 add 按钮
    expect(screen.getByRole('button', { name: '添加图片' })).toBeInTheDocument();
  });

  it('uploads multiple images and deletes one via close action', async () => {
    const createObjectURLMock = vi
      .fn<(f: File) => string>()
      .mockReturnValueOnce('blob:test-a')
      .mockReturnValueOnce('blob:test-b');
    const revokeObjectURLMock = vi.fn<(url: string) => void>();
    const oldCreate = (URL as { createObjectURL?: unknown }).createObjectURL;
    const oldRevoke = (URL as { revokeObjectURL?: unknown }).revokeObjectURL;
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURLMock });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURLMock });

    const { container } = render(
      <TableRows
        {...createTableRowsProps({
          enableEditMode: true,
          enableInsertRowCol: true,
          colCount: 1,
          rowCount: 3,
          setColumnHidden: vi.fn(),
          setAllColumnsHidden: vi.fn(),
        })}
      />
    );

    await switchFirstHeaderColumnToImageType();
    const bodyCell = container.querySelector(
      '[data-hover-lock-cell][data-body-row="0"][data-col="0"]'
    ) as HTMLElement | null;
    expect(bodyCell).toBeTruthy();
    fireEvent.click(bodyCell!);

    const fileInput = container.querySelector(
      '.vc-biz-table-image-file-input'
    ) as HTMLInputElement | null;
    expect(fileInput).toBeTruthy();

    const f1 = new File(['a'], 'a.png', { type: 'image/png' });
    const f2 = new File(['b'], 'b.png', { type: 'image/png' });
    fireEvent.change(fileInput!, { target: { files: [f1, f2] } });

    expect(bodyCell!.querySelectorAll('.vc-biz-table-image-item-preview')).toHaveLength(2);

    const firstImageItem = bodyCell!.querySelector('.vc-biz-table-image-item') as HTMLElement | null;
    expect(firstImageItem).toBeTruthy();
    fireEvent.mouseEnter(firstImageItem!);

    const removeBtn = firstImageItem!.querySelector(
      '.vc-biz-table-image-remove-btn'
    ) as HTMLButtonElement | null;
    expect(removeBtn).toBeTruthy();
    fireEvent.click(removeBtn!);

    expect(bodyCell!.querySelectorAll('.vc-biz-table-image-item-preview')).toHaveLength(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-a');
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: oldCreate });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: oldRevoke });
  });

  it('puts insert-row add in first text column when batch and row index are off', () => {
    render(
      <TableRows
        {...createTableRowsProps({
          enableBatchSelection: false,
          enableShowRowIndex: false,
          enableInsertRowCol: true,
          rowCount: 2,
        })}
      />
    );
    const insertButtons = screen.getAllByRole('button', { name: '插入行' });
    expect(insertButtons.length).toBeGreaterThanOrEqual(1);
    const headerRow = screen.getAllByRole('row')[0];
    expect(within(headerRow).queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('shows header # and row numbers when batch selection is off but row index is on', () => {
    render(
      <TableRows
        {...createTableRowsProps({
          enableBatchSelection: false,
          enableShowRowIndex: true,
          rowCount: 2,
        })}
      />
    );
    const headerRow = screen.getAllByRole('row')[0];
    expect(within(headerRow).getByText('#')).toBeInTheDocument();
    expect(within(headerRow).queryByRole('checkbox')).not.toBeInTheDocument();
    const bodyRows = screen.getAllByRole('row').slice(1);
    expect(within(bodyRows[0]!).getByText('1')).toBeInTheDocument();
    expect(within(bodyRows[0]!).queryByRole('checkbox')).not.toBeInTheDocument();
  });

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
        })}
      />
    );

    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(1);
  });

  it('clicking header text cell selects first body cell as anchor', () => {
    const { container } = render(
      <TableRows
        {...createTableRowsProps({
          enableEditMode: true,
          rowCount: 4,
        })}
      />
    );

    // 表头列选：点击“列 1”后，首个表体格应进入 selectedIdle（readOnly textarea）
    fireEvent.click(screen.getByText('列 1'));
    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[];
    expect(textareas.length).toBeGreaterThanOrEqual(1);
    expect(textareas[0]?.readOnly).toBe(true);

    // 同列多选可测试标记：首个 body 行为 anchor，其余行为 multi
    const col0BodyCells = Array.from(
      container.querySelectorAll('[data-hover-lock-cell][data-col="0"]')
    ).filter((el) => Number((el as HTMLElement).getAttribute('data-body-row')) >= 0) as HTMLElement[];
    expect(col0BodyCells.length).toBe(3);
    expect(col0BodyCells[0]?.getAttribute('data-selection-kind')).toBe('anchor');
    expect(col0BodyCells[1]?.getAttribute('data-selection-kind')).toBe('multi');
    expect(col0BodyCells[2]?.getAttribute('data-selection-kind')).toBe('multi');
  });

  it('dragging from body cell keeps anchor in selected idle style', () => {
    const { container } = render(
      <TableRows
        {...createTableRowsProps({
          enableEditMode: true,
          rowCount: 5,
        })}
      />
    );

    const bodyCells = Array.from(
      container.querySelectorAll('[data-hover-lock-cell]')
    ).filter((el) => Number((el as HTMLElement).getAttribute('data-body-row')) >= 0);
    expect(bodyCells.length).toBeGreaterThan(2);
    const start = bodyCells[0] as HTMLElement;
    const end = bodyCells[2] as HTMLElement;

    fireEvent.mouseDown(start, { button: 0, clientX: 120, clientY: 120 });
    fireEvent.mouseMove(window, { clientX: 260, clientY: 180 });
    fireEvent.mouseMove(end, { clientX: 260, clientY: 180 });
    fireEvent.mouseUp(window, { clientX: 260, clientY: 180 });

    // 拖拽后 anchor 仍保持 selectedIdle（readOnly textarea）
    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[];
    expect(textareas.length).toBeGreaterThanOrEqual(1);
    expect(textareas[0]?.readOnly).toBe(true);
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
    const minResizableTextColWidth = 100;

    const { container } = render(
      <TableRows
        {...createTableRowsProps({
          rowCount: bodyRows + 1,
          colCount,
          rowMinWidth: narrowWidth + (colCount - 1) * 200 + 200,
        })}
      />
    );

    expect(container.querySelectorAll('[role="row"]')).toHaveLength(bodyRows + 2);
  });
});
