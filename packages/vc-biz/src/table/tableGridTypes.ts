import type React from 'react';
import type { BodyRowSelectionStore } from './bodyRowSelectionStore';
import type { CellSelectionStore } from './cellSelectionStore';
import type { TableGridTypographyMetrics } from './tableGridTypography';

export type TableColumnFieldKind = 'text' | 'image' | 'link';

/** 链接列单元格数据 */
export type CellLinkData = Readonly<{ name: string; url: string }>;

/** 列多字段配置：字段名列表 */
export type ColumnMultiFieldConfig = {
  fields: Array<{ name: string }>;
};

/** 表体单元格多字段内容（key 形如 `${bodyRow}-${col}`） */
export type MultiFieldValueByCell = Record<string, Array<{ name: string; content: string }>>;

/** 表头单元格值：标题 + 可选的分组身份标识 */
export type HeaderCellValue = {
  title: string;
  /** 分组列身份标识（存在则表示该列是分组列） */
  groupId?: string;
};

/** 分组配置 */
export type TableGroupingConfig = Readonly<{
  /** 分组列 groupId（undefined 表示无分组） */
  groupedColId?: string;
  /** 展开的分组值集合 */
  expandedGroupKeys: ReadonlySet<string>;
}>;

/** 分组标题行信息 */
export type TableGroupTitleRowInfo = Readonly<{
  /** 分组值（空字符串表示空值组） */
  groupValue: string;
  /** 组内数据行数 */
  groupCount: number;
  /** 组内所有 bodyRowIndex 列表（0-based） */
  bodyRows: ReadonlyArray<number>;
  /** 是否展开 */
  expanded: boolean;
  /** 虚拟 rowIndex（分组标题行） */
  virtualRowIndex: number;
  /** 组内插入行的虚拟 rowIndex（仅展开状态有效） */
  groupInsertTailVirtualIndex?: number;
  /** 是否为空值组 */
  isEmptyGroup?: boolean;
  /** 分组列索引（基于 groupId 查找得到） */
  groupedColIndex?: number;
}>;

export type TableRowsProps = Readonly<{
  rowCount: number;
  colCount: number;
  enableInsertRowCol: boolean;
  enableEditMode: boolean;
  rowMinWidth: number;
  narrowWidth: number;
  /** 文本列拖拽最小宽度 */
  minResizableTextColWidth: number;
  /** 默认文本列宽（不含 checkbox/插入列） */
  defaultTextColWidth: number;
  enableColumnResize: boolean;
  enableVerticalCenter: boolean;
  enableFreezeFirstCol: boolean;
  enableFreezeLastCol: boolean;
  /** 冻结底部「末行」（插入行占位行）：sticky 在可视区底，顶部分割线与冻结列一致 */
  enableFreezeLastRow: boolean;
  enableBodyCellRightBorder: boolean;
  /** 批量选择：控制左侧 checkbox 列；默认 true；关闭时依赖「显示序号」与「插入行列」决定是否保留首列窄轨 */
  enableBatchSelection?: boolean;
  enableShowRowIndex: boolean;
  /** 表体勾选（按行订阅，大表勿再传整表 Record 到 Context） */
  bodyRowSelectionStore: BodyRowSelectionStore;
  colWidths: Array<number | null>;
  onColumnResizeStart: (colIndex: number) => (e: React.MouseEvent) => void;
  onInsertRow: () => void;
  onInsertColumn: () => void;
  /** 删除列/行时下限（与 demo 的 GRID_MIN 一致），用于禁用右键菜单项 */
  gridMinCount?: number;
  onDeleteColumn?: (colIndex: number) => void;
  onDeleteBodyRow?: (bodyRowIndex: number) => void;
  /** 单元格文案（key: `header-{c}` 表头列 c；`{r}-{c}` 表体行 r 列 c） */
  initialValueByCell?: Record<string, string>;
  valueByCell?: Record<string, string>;
  onValueByCellChange?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  /**
   * 表格区域最大高度（px），设置后整表（含表头为虚拟第 0 行 + sticky 钉顶、插入行尾同列表）垂直虚拟滚动。
   * 不传则全量挂载所有行。
   */
  bodyScrollMaxHeight?: number;
  /**
   * @deprecated 已统一由 TableRows 内部 `scrollport` 承担横纵滚，传入无效。保留仅为类型兼容。
   */
  tableOuterScrollRef?: React.RefObject<HTMLDivElement | null>;
  /** 表格可视区宽度变化（用于列宽拖拽边界约束） */
  onViewportClientWidthChange?: (width: number) => void;
  /**
   * 常规字号：vc `font.size.base` / `lineHeight.base`（默认 14/22）；false 为紧凑 sm（12/20）。
   * 缺省为 true。
   */
  enableRegularTableFont?: boolean;
  /** 与 `useTableAreaDemoState` 撤销配合：删除列/行前 `start`，后 `end`，合并为一步 */
  startUndoBatch?: () => void;
  endUndoBatch?: () => void;
  /** 撤销/重做应用快照后递增，用于清空单元格编辑与选中 */
  undoRedoNonce?: number;
  /** 供 `useTableGridEditing` 注册 ⌘Z / Shift+⌘Z */
  tableUndoRedo?: Readonly<{
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
  }>;
  /** 隐藏列索引集合：右键选择面板控制显示/隐藏 */
  hiddenColSet?: ReadonlySet<number>;
  /** 设置单列显隐 */
  setColumnHidden?: (colIndex: number, hidden: boolean) => void;
  /** 批量设置显隐（仅作用于当前总列数范围） */
  setAllColumnsHidden?: (nextHiddenCols: ReadonlySet<number>) => void;
  /** 单元格选中状态 store 回调：TableRows 内部创建后传出 */
  onCellSelectionStore?: (store: CellSelectionStore) => void;
  /** 显示分页：默认关闭；开启后插入行右侧显示简洁模式分页器 */
  enablePagination?: boolean;
  /** 当前页码（1-based），受控模式 */
  paginationCurrent?: number;
  /** 每页条数，默认 20 */
  paginationPageSize?: number;
  /** 页码变化回调 */
  onPaginationChange?: (page: number, pageSize: number) => void;
  /** 当前页表体行起始索引（0-based），用于分页全选 */
  pageBodyRowStart?: number;
  /** 当前页表体行结束索引（0-based），用于分页全选 */
  pageBodyRowEnd?: number;
  /** 支持分组：默认开启 */
  enableGrouping?: boolean;
  /** 分组配置 */
  groupingConfig?: TableGroupingConfig;
  /** 分组列变更回调（切换分组列时触发，会重建展开状态） */
  onGroupingChange?: (groupId: string | undefined) => void;
  /** 展开状态变更回调 */
  onGroupExpansionChange?: (groupKey: string, expanded: boolean) => void;
  /** 批量展开/收起所有分组 */
  onToggleAllGroupExpansion?: (expandAll: boolean) => void;
  /** 组内插入行回调：自动填入分组值 */
  onInsertRowWithGroupValue?: (groupValue: string) => void;
  /** 列顺序变更回调 */
  onColumnOrderChange?: (fromIndex: number, toIndex: number) => void;
}>;

export type TableGridConfigValue = TableRowsProps & {
  deleteColumnAt: (colIndex: number) => void;
  deleteBodyRowAt: (bodyRowIndex: number) => void;
};

/** 传给 Config Context：不含勾选 store、不含单元格数据，减少无关重渲染 */
export type TableGridStaticConfig = Omit<
  TableGridConfigValue,
  | 'bodyRowSelectionStore'
  | 'initialValueByCell'
  | 'valueByCell'
  | 'onValueByCellChange'
  | 'enableRegularTableFont'
  | 'tableOuterScrollRef'
  | 'onViewportClientWidthChange'
> & {
  /** 表体在垂直虚拟列表内：关闭 content-visibility，并与 measureElement 配合 */
  bodyVirtualized?: boolean;
  typography: TableGridTypographyMetrics;
  visibleColIndexes: ReadonlyArray<number>;
  /**
   * 插入列后横滚等操作递增；表头 `hoverByCell` 在下一帧绘制前清空，避免滚动导致指针误挂邻格出现悬停闪动。
   */
  pointerHoverResetNonce: number;
  /** 首列窄轨宽度：0 表示不渲染 checkbox/序号/插入行+ 列 */
  narrowLeadWidth: number;
  /** 常规字号（true=14/22；false=12/20） */
  regularTableFont: boolean;
  /** 列字段类型（默认 text） */
  columnFieldKindByCol: Readonly<Record<number, TableColumnFieldKind>>;
  setColumnFieldKind: (colIndex: number, kind: TableColumnFieldKind) => void;
  /** 列多字段配置：字段名列表 */
  columnMultiFieldConfigByCol: Readonly<Record<number, ColumnMultiFieldConfig>>;
  setColumnMultiFieldFields: (colIndex: number, fields: Array<{ name: string }>) => void;
  /** 表体单元格多字段内容 */
  multiFieldValueByCell: MultiFieldValueByCell;
  setMultiFieldContentByCell: (bodyRowIndex: number, colIndex: number, fieldIndex: number, content: string) => void;
  /** 分组场景：同步多字段内容到分组内所有行 */
  syncMultiFieldToGroup: (groupValue: string, colIndex: number, fieldsContent: Array<{ name: string; content: string }>) => void;
  /** 图片列：表体格内图片预览 URL 列表（key 形如 `${bodyRow}-${col}`） */
  imageUrlsByCell: Readonly<Record<string, ReadonlyArray<string>>>;
  appendImageFilesToCell: (bodyRowIndex: number, colIndex: number, files: readonly File[]) => void;
  removeImageAtCell: (bodyRowIndex: number, colIndex: number, imageIndex: number) => void;
  /** 链接列：表体格内链接数据列表（key 形如 `${bodyRow}-${col}`） */
  linkDataByCell: Readonly<Record<string, ReadonlyArray<CellLinkData>>>;
  appendLinkToCell: (bodyRowIndex: number, colIndex: number, data: CellLinkData) => void;
  updateLinkAtCell: (bodyRowIndex: number, colIndex: number, linkIndex: number, data: CellLinkData) => void;
  removeLinkAtCell: (bodyRowIndex: number, colIndex: number, linkIndex: number) => void;
  /** 显示分页 */
  enablePagination?: boolean;
  /** 当前页码 */
  paginationCurrent?: number;
  /** 每页条数 */
  paginationPageSize?: number;
  /** 页码变化回调 */
  onPaginationChange?: (page: number, pageSize: number) => void;
  /** 当前页表体行起始索引（0-based），用于分页全选 */
  pageBodyRowStart?: number;
  /** 当前页表体行结束索引（0-based），用于分页全选 */
  pageBodyRowEnd?: number;
  /** 支持分组 */
  enableGrouping?: boolean;
  /** 分组配置 */
  groupingConfig?: TableGroupingConfig;
  /** 分组列变更回调（切换分组列时触发，会重建展开状态） */
  onGroupingChange?: (groupId: string | undefined) => void;
  /** 展开状态变更回调 */
  onGroupExpansionChange?: (groupKey: string, expanded: boolean) => void;
  /** 批量展开/收起所有分组 */
  onToggleAllGroupExpansion?: (expandAll: boolean) => void;
  /** 分组标题行信息列表 */
  groupTitleRows?: ReadonlyArray<TableGroupTitleRowInfo>;
  /** 组内插入行回调：自动填入分组值 */
  onInsertRowWithGroupValue?: (groupValue: string) => void;
};
