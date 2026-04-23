import React from 'react';
import { Space, vcTokens } from 'vc-design';
import { VMenuGroup } from 'vc-biz';

const items = [
  { key: 'self-goods', label: '自营商品', iconName: 'catalog' },
  { key: 'dropship-goods', label: '代发商品', iconName: 'cart' },
  { key: 'base-goods', label: '基础商品', iconName: 'tag' },
];

export default function BizMenuGroupSpecDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>导航区 · 第二步 .menu_group 规范</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 16 }}>
        small:false 用于展开导航，small:true 用于收起导航。
      </p>
      <div
        style={{
          background: vcTokens.color.neutral.background.layout,
          borderRadius: 8,
          padding: 16,
        }}
      >
        <Space size={24} align="start">
          <div
            style={{
              width: 180,
              background: vcTokens.color.menu.navBackground,
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <VMenuGroup
              title="商品管理"
              groupIconName="control-platform"
              items={items}
              opened
              small={false}
              dark
              activeItemKey="dropship-goods"
            />
          </div>
          <div
            style={{
              width: 48,
              background: vcTokens.color.menu.navBackground,
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <VMenuGroup
              title="商品管理"
              groupIconName="control-platform"
              items={items}
              opened
              small
              dark
              activeItemKey="dropship-goods"
            />
          </div>
        </Space>
      </div>
    </>
  );
}
