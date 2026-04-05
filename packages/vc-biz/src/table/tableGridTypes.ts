import type React from 'react';
import type { BodyRowSelectionStore } from './bodyRowSelectionStore';
import type { TableGridTypographyMetrics } from './tableGridTypography';

export type TableRowsProps = Readonly<{
  rowCount: number;
  colCount: number;
  enableInsertRowCol: boolean;
  enableEditMode: boolean;
  rowMinWidth: number;
  narrowWidth: number;
  minTextColWidth: number;
  enableColumnResize: boolean;
  enableVerticalCenter: boolean;
  enableFreezeFirstCol: boolean;
  enableFreezeLastCol: boolean;
  /** 冻结底部「末行」（插入行占位行）：sticky 在可视区底，顶部分割线与冻结列一致 */
  enableFreezeLastRow: boolean;
  enableBodyCellRightBorder: boolean;
  enableShowRowIndex: boolean;
  /** 表体勾选（按行订阅，大表勿再传整表 Record 到 Context） */
  bodyRowSelectionStore: BodyRowSelectionStore;
  colWidths: Array<number | null>;
  onColumnResizeStart: (colIndex: number) => (e: React.MouseEvent) => void;
  onInsertRow: () => void;
  onInsertColumn: () => void;
  insertLayoutTextColPx: number | null;
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
   * 非虚拟列表时，横滚所在的外层 overflow 容器（与 TableArea 表格外框一致），用于插入列后滚到最右侧。
   * 虚拟列表时不必传，由 TableRows 内部 scrollport 处理。
   */
  tableOuterScrollRef?: React.RefObject<HTMLDivElement | null>;
  /**
   * 常规字号：vc `font.size.base` / `lineHeight.base`（默认 14/22）；false 为紧凑 sm（12/20）。
   * 缺省为 true。
   */
  enableRegularTableFont?: boolean;
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
> & {
  /** 表体在垂直虚拟列表内：关闭 content-visibility，并与 measureElement 配合 */
  bodyVirtualized?: boolean;
  typography: TableGridTypographyMetrics;
};
