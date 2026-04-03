import React from 'react';
import type { TableAreaDemoModel } from './TableArea';
import { TableAreaTableInstance } from './TableArea';

/**
 * BizTable 表格区主组件。
 *
 * 语义上等价于 demo 中的 <TableAreaTableInstance {...useTableAreaDemoState()} />，
 * 只是将「表格实例」部分封装为独立组件，便于在业务中重复使用。
 *
 * - 行数 / 列数、插入行列、编辑模式等开关，均从 TableAreaDemoModel 透传；
 * - 样式、交互表现完全复用原 BizTable 实现，与 demo 视觉保持一致。
 */
export type BizTableProps = TableAreaDemoModel;

export default function BizTable(props: BizTableProps) {
  return <TableAreaTableInstance {...props} />;
}

