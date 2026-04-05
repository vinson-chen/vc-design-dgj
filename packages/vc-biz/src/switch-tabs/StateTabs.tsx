import React from 'react';
import { vcTokens } from 'vc-design';
import SwitchTabs, { type SwitchTabItemData, type SwitchTabsProps } from './SwitchTabs';

export interface StateTabsProps
  extends Omit<SwitchTabsProps, 'items' | 'showIcon' | 'showPanel'> {
  items: SwitchTabItemData[];
}

/**
 * state_tabs：无图标的状态切换区。
 * 基于 SwitchTabs，固定 showIcon=false、showPanel=false，并附带背景容器。
 */
export default function StateTabs({ items, activeKey, onChange }: StateTabsProps) {
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
          showIcon={false}
          showPanel={false}
        />
      </div>
    </div>
  );
}

