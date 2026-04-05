import React from 'react';
import { vcTokens } from 'vc-design';
import SwitchTabs, { type SwitchTabItemData, type SwitchTabsProps } from './SwitchTabs';

export interface StoreTabsProps
  extends Omit<SwitchTabsProps, 'items' | 'showIcon' | 'showPanel'> {
  items: SwitchTabItemData[];
}

/**
 * store_tabs：带图标的平台切换区。
 * 基于 SwitchTabs，固定 showIcon=true、showPanel=false，并附带背景容器。
 */
export default function StoreTabs({ items, activeKey, onChange }: StoreTabsProps) {
  return (
    <div
      style={{
        background: vcTokens.color.neutral.background.layout,
        borderRadius: vcTokens.style.borderRadius.lg,
        padding: 24,
      }}
    >
      <div style={{ background: vcTokens.color.neutral.background.container }}>
        <SwitchTabs
          items={items}
          activeKey={activeKey}
          onChange={onChange}
          showIcon
          showPanel={false}
        />
      </div>
    </div>
  );
}

