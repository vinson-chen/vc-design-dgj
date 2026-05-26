import React, { useRef, useState, useCallback } from 'react';
import { Button, Space, Typography, VcIcon, vcTokens } from 'vc-design';
import {
  TableCellEditing,
  TableCellImage,
  TableHeaderCell,
  getColLetterIndex,
  VTableCell,
  storeLogoUrlByKey,
} from 'vc-biz';
import type { TableGridEditingState } from 'vc-biz';
import type { TableGridTypographyMetrics } from 'vc-biz/src/table/tableGridTypography';

// 模拟 typography 配置
const mockTypography: TableGridTypographyMetrics = {
  fontSizePx: 14,
  lineHeightPx: 22,
  displayCellMaxHeightPx: 100,
  headerCellPaddingY: 8,
  bodyCellPaddingY: 8,
  bodyCellPaddingX: 8,
  tableTextStyle: {},
  theadCellMinHeightPx: 36,
  bodyVirtualRowEstimatePx: 40,
  headerVirtualRowEstimatePx: 36,
};

// 创建模拟的 editingApi
function createMockEditingApi(overrides: Partial<TableGridEditingState> = {}): TableGridEditingState {
  const editingDraftRef = { current: '' };
  const editTextAreaRef = { current: null as HTMLTextAreaElement | null };
  const headerEditInputRef = { current: null as HTMLInputElement | null };
  const pendingBlurIgnoreCellKeyRef = { current: null as string | null };
  const suppressDuplicatePrevCellClickSaveRef = { current: false };

  return {
    selectedCell: null,
    setSelectedCell: () => {},
    selectedCells: new Set(),
    setSelectedCells: () => {},
    selectionAnchor: null,
    setSelectionAnchor: () => {},
    isCellMultiSelected: () => false,
    clearSelection: () => {},
    setRangeSelection: () => {},
    hoverLockedCell: null,
    setHoverLockedCell: () => {},
    editingCell: null,
    setEditingCell: () => {},
    editingDraft: '',
    setEditingDraft: () => {},
    valueByCell: {},
    setValueByCell: () => {},
    editTextAreaRef,
    headerEditInputRef,
    editingDraftRef,
    getEditingValueForSave: () => editingDraftRef.current,
    pendingBlurIgnoreCellKeyRef,
    scheduleClearEditCommitGuards: () => {},
    consumeDuplicatePrevCellClickSave: () => false,
    suppressDuplicatePrevCellClickSaveRef,
    removeColumnAt: () => {},
    removeBodyRowAt: () => {},
    addColumnToSelection: () => {},
    removeColumnFromSelection: () => {},
    insertBodyRowAt: () => {},
    ...overrides,
  };
}

// 模拟 cfg
const mockCfg = {
  enableShowRowIndex: true,
  enableEditMode: true,
  colCount: 5,
  rowCount: 10,
  enableColumnResize: true,
  enableFreezeFirstCol: false,
  enableFreezeLastCol: false,
  enableInsertRowCol: false,
  enableBatchSelection: true,
  enableVerticalCenter: true,
  narrowWidth: 40,
  narrowLeadWidth: 40,
  rowMinWidth: 600,
  colWidths: [],
  onColumnResizeStart: () => () => {},
  visibleColIndexes: [0, 1, 2, 3, 4],
  columnFieldKindByCol: {},
  setColumnFieldKind: () => {},
  imageUrlsByCell: {},
  appendImageFilesToCell: () => {},
  removeImageAtCell: () => {},
  typography: mockTypography,
  pointerHoverResetNonce: 0,
  gridMinCount: 2,
  deleteColumnAt: () => {},
  deleteBodyRowAt: () => {},
  onInsertRow: () => {},
  onInsertColumn: () => {},
};

// 从 storeLogoUrlByKey 获取一些店铺 logo 作为示例图片
const sampleStoreLogos = [
  storeLogoUrlByKey['taobao'],
  storeLogoUrlByKey['jingdong'],
  storeLogoUrlByKey['pdd'],
  storeLogoUrlByKey['douyin'],
  storeLogoUrlByKey['tianmao'],
];

export default function TableCellDemo() {
  const [editingText, setEditingText] = useState('示例编辑文本');
  const [hoverLocked, setHoverLocked] = useState(true);
  const editingApiRef = useRef(createMockEditingApi({
    editingDraftRef: { current: editingText },
    getEditingValueForSave: () => editingText,
  }));

  // 同步 editingApiRef
  editingApiRef.current = {
    ...editingApiRef.current,
    editingDraftRef: { current: editingText },
    getEditingValueForSave: () => editingText,
  };

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>TableCellEditing / TableCellImage / TableHeaderCell</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        从 TableGridTextCell.tsx 拆分的表格单元格组件，可独立使用，也可组合用于自定义表格场景。
      </p>

      {/* 规范摘要 */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          规范摘要
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 16,
            fontSize: 13,
            color: vcTokens.color.neutral.text.default,
          }}
        >
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>TableCellEditing：</strong> 表体单元格编辑态，原生 textarea + 高度自适应，支持 Enter 提交、Escape 取消。
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>TableCellImage：</strong> 图片列单元格，32px 预览缩略图，锁定态显示添加/删除按钮。
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>TableHeaderCell：</strong> 表头单元格，含标题、编辑态 input、右键菜单，支持列标题截断计算。
          </p>
          <p style={{ margin: 0 }}>
            <strong>辅助函数：</strong> getColLetterIndex(colIndex) → A-Z 列序号；getBodyEditTextareaStyle(typography) → 编辑态样式。
          </p>
        </div>
      </section>

      {/* TableCellEditing */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          TableCellEditing - 编辑态 textarea
        </h2>
        <p style={{ fontSize: 13, color: vcTokens.color.neutral.text.description, marginBottom: 12 }}>
          用于表格单元格编辑态，原生 textarea + 高度自适应。Enter 提交并导航到下一行，Escape / Ctrl+Enter 退出编辑。
        </p>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* 基本编辑态 */}
            <div>
              <Typography.Text style={{ fontSize: 12, color: vcTokens.color.neutral.text.label, marginBottom: 8 }}>
                基本编辑态（无 inset panel）
              </Typography.Text>
              <VTableCell variant="tbody" style={{ width: 300 }}>
                <TableCellEditing
                  bodyRowIndex={0}
                  colIndex={0}
                  cellKey="0-0"
                  editingDraft={editingText}
                  typography={mockTypography}
                  editingApi={editingApiRef.current}
                  rowCount={10}
                />
              </VTableCell>
            </div>

            {/* 带蓝色描边的锁定态 */}
            <div>
              <Typography.Text style={{ fontSize: 12, color: vcTokens.color.neutral.text.label, marginBottom: 8 }}>
                锁定态（蓝色描边 inset panel）
              </Typography.Text>
              <VTableCell variant="tbody" style={{ width: 300 }}>
                <TableCellEditing
                  bodyRowIndex={1}
                  colIndex={0}
                  cellKey="1-0"
                  editingDraft={editingText}
                  typography={mockTypography}
                  editingApi={editingApiRef.current}
                  rowCount={10}
                  wrapWithInsetPanel
                />
              </VTableCell>
            </div>

            {/* 多行文本 */}
            <div>
              <Typography.Text style={{ fontSize: 12, color: vcTokens.color.neutral.text.label, marginBottom: 8 }}>
                多行文本（textarea 高度自适应）
              </Typography.Text>
              <VTableCell variant="tbody" style={{ width: 300 }}>
                <TableCellEditing
                  bodyRowIndex={2}
                  colIndex={0}
                  cellKey="2-0"
                  editingDraft="第一行内容\n第二行内容\n第三行内容"
                  typography={mockTypography}
                  editingApi={{
                    ...editingApiRef.current,
                    editingDraftRef: { current: '第一行内容\n第二行内容\n第三行内容' },
                    getEditingValueForSave: () => '第一行内容\n第二行内容\n第三行内容',
                  }}
                  rowCount={10}
                  wrapWithInsetPanel
                />
              </VTableCell>
            </div>
          </Space>
        </div>
      </section>

      {/* TableCellImage */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          TableCellImage - 图片列单元格
        </h2>
        <p style={{ fontSize: 13, color: vcTokens.color.neutral.text.description, marginBottom: 12 }}>
          用于图片列单元格，32px 预览缩略图。锁定态（hoverLocked）时显示添加按钮和删除按钮。
        </p>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* 无锁定态 */}
            <div>
              <Typography.Text style={{ fontSize: 12, color: vcTokens.color.neutral.text.label, marginBottom: 8 }}>
                非锁定态（仅展示图片）
              </Typography.Text>
              <VTableCell variant="tbody" style={{ width: 200 }}>
                <TableCellImage
                  bodyRowIndex={0}
                  colIndex={1}
                  imageUrls={[sampleStoreLogos[0], sampleStoreLogos[1]]}
                  isHoverLocked={false}
                  enableEditMode={true}
                  editingApi={editingApiRef.current}
                  appendImageFiles={() => {}}
                  removeImageAt={() => {}}
                />
              </VTableCell>
            </div>

            {/* 锁定态 */}
            <div>
              <Typography.Text style={{ fontSize: 12, color: vcTokens.color.neutral.text.label, marginBottom: 8 }}>
                锁定态（显示添加/删除按钮）
              </Typography.Text>
              <VTableCell variant="tbody" hovered style={{ width: 200 }}>
                <TableCellImage
                  bodyRowIndex={1}
                  colIndex={1}
                  imageUrls={[sampleStoreLogos[2], sampleStoreLogos[3], sampleStoreLogos[4]]}
                  isHoverLocked={hoverLocked}
                  enableEditMode={true}
                  editingApi={editingApiRef.current}
                  appendImageFiles={() => {}}
                  removeImageAt={() => {}}
                />
              </VTableCell>
              <Button size="small" style={{ marginTop: 8 }} onClick={() => setHoverLocked(!hoverLocked)}>
                切换锁定态
              </Button>
            </div>

            {/* 空图片格 */}
            <div>
              <Typography.Text style={{ fontSize: 12, color: vcTokens.color.neutral.text.label, marginBottom: 8 }}>
                空图片格（锁定态显示添加按钮）
              </Typography.Text>
              <VTableCell variant="tbody" hovered style={{ width: 200 }}>
                <TableCellImage
                  bodyRowIndex={2}
                  colIndex={1}
                  imageUrls={[]}
                  isHoverLocked={true}
                  enableEditMode={true}
                  editingApi={editingApiRef.current}
                  appendImageFiles={() => {}}
                  removeImageAt={() => {}}
                />
              </VTableCell>
            </div>
          </Space>
        </div>
      </section>

      {/* TableHeaderCell */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          TableHeaderCell - 表头单元格
        </h2>
        <p style={{ fontSize: 13, color: vcTokens.color.neutral.text.description, marginBottom: 12 }}>
          用于表头单元格，包含标题、编辑态 input、右键菜单。标题过长时自动截断并显示 Tooltip。
        </p>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* 普通表头 */}
            <div>
              <Typography.Text style={{ fontSize: 12, color: vcTokens.color.neutral.text.label, marginBottom: 8 }}>
                普通表头（带列序号）
              </Typography.Text>
              <VTableCell variant="thead" style={{ width: 200 }}>
                <TableHeaderCell
                  colIndex={0}
                  isInsertColPlaceholder={false}
                  headerStored="商品名称"
                  isHeaderEditing={false}
                  isHeaderSelectedLocked={false}
                  isHeaderFullColumnSelected={false}
                  cfg={mockCfg}
                  typography={mockTypography}
                  editingApi={editingApiRef.current}
                  canResizeHeaderTextCol={true}
                  showHeaderColumnMenu={false}
                  headerContextMenuItems={undefined}
                  onHeaderColumnMenuClick={() => {}}
                />
              </VTableCell>
            </div>

            {/* 长标题截断 */}
            <div>
              <Typography.Text style={{ fontSize: 12, color: vcTokens.color.neutral.text.label, marginBottom: 8 }}>
                长标题截断（鼠标悬停显示完整 Tooltip）
              </Typography.Text>
              <VTableCell variant="thead" style={{ width: 150 }}>
                <TableHeaderCell
                  colIndex={1}
                  isInsertColPlaceholder={false}
                  headerStored="这是一个非常长的列标题用于测试截断效果"
                  isHeaderEditing={false}
                  isHeaderSelectedLocked={false}
                  isHeaderFullColumnSelected={false}
                  cfg={mockCfg}
                  typography={mockTypography}
                  editingApi={editingApiRef.current}
                  canResizeHeaderTextCol={true}
                  showHeaderColumnMenu={false}
                  headerContextMenuItems={undefined}
                  onHeaderColumnMenuClick={() => {}}
                />
              </VTableCell>
            </div>

            {/* 编辑态 */}
            <div>
              <Typography.Text style={{ fontSize: 12, color: vcTokens.color.neutral.text.label, marginBottom: 8 }}>
                编辑态（原生 input）
              </Typography.Text>
              <VTableCell variant="thead" style={{ width: 200 }}>
                <TableHeaderCell
                  colIndex={2}
                  isInsertColPlaceholder={false}
                  headerStored="可编辑列"
                  isHeaderEditing={true}
                  isHeaderSelectedLocked={false}
                  isHeaderFullColumnSelected={false}
                  cfg={mockCfg}
                  typography={mockTypography}
                  editingApi={{
                    ...editingApiRef.current,
                    headerEditInputRef: { current: null },
                    editingDraftRef: { current: '编辑态文本' },
                  }}
                  canResizeHeaderTextCol={true}
                  showHeaderColumnMenu={false}
                  headerContextMenuItems={undefined}
                  onHeaderColumnMenuClick={() => {}}
                />
              </VTableCell>
            </div>

            {/* 不同列序号 */}
            <div>
              <Typography.Text style={{ fontSize: 12, color: vcTokens.color.neutral.text.label, marginBottom: 8 }}>
                不同列序号（getColLetterIndex 辅助函数）
              </Typography.Text>
              <div style={{ display: 'flex', gap: 8 }}>
                {[0, 1, 2, 3, 4, 25, 26, 27].map((col) => (
                  <VTableCell key={col} variant="thead" style={{ width: 80 }}>
                    <TableHeaderCell
                      colIndex={col}
                      isInsertColPlaceholder={false}
                      headerStored={`列${col + 1}`}
                      isHeaderEditing={false}
                      isHeaderSelectedLocked={false}
                      isHeaderFullColumnSelected={false}
                      cfg={mockCfg}
                      typography={mockTypography}
                      editingApi={editingApiRef.current}
                      canResizeHeaderTextCol={false}
                      showHeaderColumnMenu={false}
                      headerContextMenuItems={undefined}
                      onHeaderColumnMenuClick={() => {}}
                    />
                  </VTableCell>
                ))}
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                getColLetterIndex(25)="{getColLetterIndex(25)}", getColLetterIndex(26)="{getColLetterIndex(26)}", getColLetterIndex(27)="{getColLetterIndex(27)}"
              </Typography.Text>
            </div>
          </Space>
        </div>
      </section>

      {/* 组合示例 */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          组合示例 - 简化表格行
        </h2>
        <p style={{ fontSize: 13, color: vcTokens.color.neutral.text.description, marginBottom: 12 }}>
          使用 VTableCell + 拆分组件组合构建简化表格，展示组件的灵活组合能力。
        </p>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          {/* 表头行 */}
          <div style={{ display: 'flex', gap: 1, marginBottom: 1 }}>
            <VTableCell variant="thead" style={{ width: 150 }}>
              <TableHeaderCell
                colIndex={0}
                isInsertColPlaceholder={false}
                headerStored="商品名称"
                isHeaderEditing={false}
                isHeaderSelectedLocked={false}
                isHeaderFullColumnSelected={false}
                cfg={mockCfg}
                typography={mockTypography}
                editingApi={editingApiRef.current}
                canResizeHeaderTextCol={false}
                showHeaderColumnMenu={false}
                headerContextMenuItems={undefined}
                onHeaderColumnMenuClick={() => {}}
              />
            </VTableCell>
            <VTableCell variant="thead" style={{ width: 100 }}>
              <TableHeaderCell
                colIndex={1}
                isInsertColPlaceholder={false}
                headerStored="图片"
                isHeaderEditing={false}
                isHeaderSelectedLocked={false}
                isHeaderFullColumnSelected={false}
                cfg={mockCfg}
                typography={mockTypography}
                editingApi={editingApiRef.current}
                canResizeHeaderTextCol={false}
                showHeaderColumnMenu={false}
                headerContextMenuItems={undefined}
                onHeaderColumnMenuClick={() => {}}
              />
            </VTableCell>
          </div>

          {/* 表体行 */}
          <div style={{ display: 'flex', gap: 1 }}>
            <VTableCell variant="tbody" hovered style={{ width: 150 }}>
              <TableCellEditing
                bodyRowIndex={0}
                colIndex={0}
                cellKey="0-0"
                editingDraft="示例商品名称"
                typography={mockTypography}
                editingApi={{
                  ...editingApiRef.current,
                  editingDraftRef: { current: '示例商品名称' },
                  getEditingValueForSave: () => '示例商品名称',
                }}
                rowCount={10}
                wrapWithInsetPanel
              />
            </VTableCell>
            <VTableCell variant="tbody" hovered style={{ width: 100 }}>
              <TableCellImage
                bodyRowIndex={0}
                colIndex={1}
                imageUrls={[sampleStoreLogos[0]]}
                isHoverLocked={true}
                enableEditMode={true}
                editingApi={editingApiRef.current}
                appendImageFiles={() => {}}
                removeImageAt={() => {}}
              />
            </VTableCell>
          </div>
        </div>
      </section>
    </>
  );
}