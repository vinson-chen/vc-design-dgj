import React from 'react';
import { Checkbox, Pagination, vcTokens } from 'vc-design';
import VOverflowActions, { type VOverflowActionItem, type VOverflowActionsProps } from './VOverflowActions';

type PaginationProps = React.ComponentProps<typeof Pagination>;

export interface VBatchOperationBarProps {
  /** 是否全选 */
  checked: boolean;
  /** 是否部分选中，用于展示 indeterminate 状态 */
  indeterminate?: boolean;
  /** 已选条数，会展示在「已选 X 条」中 */
  selectedCount: number;
  /** 勾选状态变更回调 */
  onCheckedChange: (next: boolean) => void;
  /** 左侧批量操作按钮列表 */
  items: VOverflowActionItem[];
  /** 溢出配置：最多可见按钮数量（含更多） */
  maxVisibleWithMore?: number;
  /** 透传给 VOverflowActions 的其它配置（除 items / maxVisibleWithMore / align） */
  overflowActionsProps?: Omit<VOverflowActionsProps, 'items' | 'maxVisibleWithMore' | 'align'>;
  /** 分页配置，直接透传给 Pagination */
  paginationProps: PaginationProps;
}
/** @deprecated Use VBatchOperationBarProps instead */
export type BatchOperationBarProps = VBatchOperationBarProps;

/**
 * batch_operation 风格操作区：左侧批量勾选 + 批量操作，右侧分页。
 * 常用于表格底部批量操作条。
 */
export default function VBatchOperationBar({
  checked,
  indeterminate,
  selectedCount,
  onCheckedChange,
  items,
  maxVisibleWithMore,
  overflowActionsProps,
  paginationProps,
}: VBatchOperationBarProps) {
  return (
    <div
      style={{
        background: vcTokens.color.neutral.background.layout,
        borderRadius: vcTokens.style.borderRadius.lg,
        padding: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: 400,
          rowGap: 8,
          columnGap: 16,
          minHeight: 48,
          padding: '8px 16px',
          boxSizing: 'border-box',
          background: vcTokens.color.neutral.background.container,
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 auto' }}>
          <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            onChange={(e) => onCheckedChange(e.target.checked)}
          >
            已选 {selectedCount} 条
          </Checkbox>
          <div style={{ minWidth: 0, flex: '0 1 auto' }}>
            <VOverflowActions
              items={items}
              maxVisibleWithMore={maxVisibleWithMore}
              iconOnlyMore
              align="left"
              {...overflowActionsProps}
            />
          </div>
        </div>

        <div style={{ marginLeft: 'auto', flex: '0 0 auto' }}>
          <Pagination simple {...paginationProps} />
        </div>
      </div>
    </div>
  );
}