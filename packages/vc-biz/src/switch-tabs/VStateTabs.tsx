import React from 'react';
import { vcTokens } from 'vc-design';
import VSwitchTabs, { type VSwitchTabItemData, type VSwitchTabsProps } from './VSwitchTabs';

export interface VStateTabsProps
  extends Omit<VSwitchTabsProps, 'items' | 'showIcon' | 'showPanel'> {
  items: VSwitchTabItemData[];
}
/** @deprecated Use VStateTabsProps instead */
export type StateTabsProps = VStateTabsProps;

/**
 * state_tabs：无图标的状态切换区。
 * 基于 VSwitchTabs，固定 showIcon=false、showPanel=false，并附带背景容器。
 */
export default function VStateTabs({ items, activeKey, onChange, rightSlot }: VStateTabsProps) {
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
          showIcon={false}
          showPanel={false}
          rightSlot={rightSlot}
        />
      </div>
    </div>
  );
}

