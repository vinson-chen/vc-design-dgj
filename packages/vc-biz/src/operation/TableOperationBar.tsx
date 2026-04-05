import React from 'react';
import { Segmented, vcTokens } from 'vc-design';
import OperationBar from '../OperationBar';
import OverflowActions, { type OverflowActionItem, type OverflowActionsProps } from './OverflowActions';

export interface TableOperationBarProps {
  /** Segmented 选项文案列表，对齐常见状态维度 */
  segmentedOptions: string[];
  /** 当前选中值 */
  value: string;
  /** 选中变更回调 */
  onChange: (next: string) => void;
  /** 右侧主按钮列表 */
  primaryItems: OverflowActionItem[];
  /** 仅在下拉菜单中展示的操作 */
  menuOnlyItems?: OverflowActionItem[];
  /** 溢出配置：最多可见按钮数量（含更多） */
  maxVisibleWithMore?: number;
  /** 透传给 OverflowActions 的其它配置（除 items / menuOnlyItems / maxVisibleWithMore） */
  overflowActionsProps?: Omit<OverflowActionsProps, 'items' | 'menuOnlyItems' | 'maxVisibleWithMore'>;
}

/**
 * table_operation 风格操作区：左侧状态 Segmented，右侧溢出操作区。
 * 常用于列表表头上的操作条。
 */
export default function TableOperationBar({
  segmentedOptions,
  value,
  onChange,
  primaryItems,
  menuOnlyItems,
  maxVisibleWithMore,
  overflowActionsProps,
}: TableOperationBarProps) {
  return (
    <div
      style={{
        background: vcTokens.color.neutral.background.layout,
        borderRadius: vcTokens.style.borderRadius.lg,
        padding: 24,
      }}
    >
      <OperationBar
        style={{ borderBottom: 'none' }}
        left={
          <Segmented
            options={segmentedOptions}
            value={value}
            onChange={(v) => onChange(String(v))}
          />
        }
        right={
          <div style={{ minWidth: 0, width: '100%' }}>
            <OverflowActions
              items={primaryItems}
              menuOnlyItems={menuOnlyItems}
              maxVisibleWithMore={maxVisibleWithMore}
              iconOnlyMore
              align="right"
              {...overflowActionsProps}
            />
          </div>
        }
      />
    </div>
  );
}

