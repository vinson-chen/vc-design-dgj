import React from 'react';
import { vcTokens } from 'vc-design';
import VFilterGroup, { type VFilterGroupProps } from './VFilterGroup';

export type VFilterAreaProps = VFilterGroupProps;
/** @deprecated Use VFilterAreaProps instead */
export type FilterAreaProps = VFilterAreaProps;

/**
 * 篮选区（filter_group）：在 `VFilterGroup` 外包一层与 demo 一致的布局容器（layout 背景、圆角、内边距）。
 * 三种用法均由同一组件承担，通过 `fields` 数量与可选 `collapsible` 区分：
 * - 少量筛选项（如基础三列）
 * - 多筛选项自动换行
 * - 行数较多时传入 `collapsible={{ maxRows, defaultCollapsed? }}` 启用折叠
 */
export default function VFilterArea(props: VFilterAreaProps) {
  return (
    <div
      style={{
        background: vcTokens.color.neutral.background.layout,
        borderRadius: vcTokens.style.borderRadius.lg,
        padding: 24,
      }}
    >
      <VFilterGroup {...props} />
    </div>
  );
}