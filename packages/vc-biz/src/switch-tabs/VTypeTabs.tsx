import React from 'react';
import { vcTokens } from 'vc-design';
import VSwitchTabs, { type VSwitchTabItemData, type VSwitchTabsProps } from './VSwitchTabs';

export interface VTypeTabsProps
  extends Omit<VSwitchTabsProps, 'items' | 'showIcon' | 'showPanel'> {
  items: VSwitchTabItemData[];
}
/** @deprecated Use VTypeTabsProps instead */
export type TypeTabsProps = VTypeTabsProps;

/**
 * 带图标的类型/平台切换区（设计稿 Figma 中对应 `store_tabs` 实例）。
 * 基于 VSwitchTabs，固定 showIcon=true、showPanel=false，并附带背景容器。
 */
export default function VTypeTabs({ items, activeKey, onChange, rightSlot }: VTypeTabsProps) {
  return (
    <div
      style={{
        minWidth: 320,
        background: vcTokens.color.neutral.background.layout,
        borderRadius: vcTokens.style.borderRadius.lg,
        padding: 24,
      }}
    >
      <div
        style={{
          minWidth: 320,
          background: vcTokens.color.neutral.background.container,
          overflowX: 'auto',
        }}
      >
        <VSwitchTabs
          items={items}
          activeKey={activeKey}
          onChange={onChange}
          showIcon
          showPanel={false}
          rightSlot={rightSlot}
        />
      </div>
    </div>
  );
}
