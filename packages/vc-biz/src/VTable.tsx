import React from 'react';
import type { TableAreaDemoModel } from './TableArea';
import { TableAreaTableInstance } from './TableArea';

/**
 * VTable 表格区主组件。
 *
 * 语义上等价于 demo 中的 <TableAreaTableInstance {...useTableAreaDemoState()} />，
 * 只是将「表格实例」部分封装为独立组件，便于在业务中重复使用。
 *
 * - 行数 / 列数、插入行列、编辑模式等开关，均从 TableAreaDemoModel 透传；
 * - 随容器高度自适应：将 `useTableAreaDemoState({ bodyScrollMaxHeight })` 与
 *   `useTableBodyScrollMaxHeight`（ResizeObserver 测量宿主）配合使用，见 vc-design VTableDemo；
 * - 样式、交互表现完全复用原 VTable 实现，与 demo 视觉保持一致；
 * - 表格内图标（含插入行/列 add）一律使用 vc-design 的 VcIcon，不引入 @ant-design/icons。
 */
export type VTableProps = TableAreaDemoModel;
/** @deprecated Use VTableProps instead */
export type BizTableProps = VTableProps;

export default function VTable(props: VTableProps) {
  return <TableAreaTableInstance {...props} />;
}