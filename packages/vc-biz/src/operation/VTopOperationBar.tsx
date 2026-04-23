import React from 'react';
import { Button, Input, VcIcon, vcTokens } from 'vc-design';
import VOperationBar from '../VOperationBar';
import VOverflowActions, { type VOverflowActionItem, type VOverflowActionsProps } from './VOverflowActions';

export interface VTopOperationBarProps {
  /** 搜索框占位文案，默认「请输入」 */
  searchPlaceholder?: string;
  /** 搜索框宽度，默认 320 */
  searchWidth?: number;
  /** 搜索回调，对齐 AntD Input.Search 的 onSearch 行为 */
  onSearch?: (value: string) => void;
  /** 右侧操作区主按钮列表 */
  items: VOverflowActionItem[];
  /** 透传给 VOverflowActions 的其它配置（除 items） */
  overflowActionsProps?: Omit<VOverflowActionsProps, 'items'>;
}
/** @deprecated Use VTopOperationBarProps instead */
export type TopOperationBarProps = VTopOperationBarProps;

/**
 * top_bar 风格操作区：左侧搜索框 + 右侧溢出操作区。
 * 结构对齐 Figma `operation_bar` 中的 top_bar 实例。
 */
export default function VTopOperationBar({
  searchPlaceholder = '请输入',
  searchWidth = 320,
  onSearch,
  items,
  overflowActionsProps,
}: VTopOperationBarProps) {
  return (
    <div
      style={{
        background: vcTokens.color.neutral.background.layout,
        borderRadius: vcTokens.style.borderRadius.lg,
        padding: 24,
      }}
    >
      <VOperationBar
        left={
          <Input.Search
            placeholder={searchPlaceholder}
            style={{ width: searchWidth }}
            allowClear
            enterButton={<Button icon={<VcIcon type="search" fontSize={16} />} />}
            onSearch={onSearch}
          />
        }
        right={
          <div style={{ minWidth: 0, width: '100%' }}>
            <VOverflowActions items={items} iconOnlyMore {...overflowActionsProps} />
          </div>
        }
      />
    </div>
  );
}