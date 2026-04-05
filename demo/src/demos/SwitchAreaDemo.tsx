import React, { useMemo, useState } from 'react';
import { Button, Drawer, vcTokens } from 'vc-design';
import { StateTabs, StoreTabs, type SwitchTabItemData } from 'vc-biz';

export default function SwitchAreaDemo() {
  const [storeActiveKey, setStoreActiveKey] = useState('精选平台');
  const [stateActiveKey, setStateActiveKey] = useState('全部');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const storeItems = useMemo<SwitchTabItemData[]>(
    () => [
      { key: '精选平台', label: '精选平台', icon: 'otherstore.jpg' },
      { key: '抖音', label: '抖音', icon: 'douyin.jpg' },
      { key: '拼多多', label: '拼多多', icon: 'pdd.jpg' },
      { key: '京东', label: '京东', icon: 'jingdong.jpg' },
      { key: '微信小店', label: '微信小店', icon: 'wxgonghuo.jpg' },
      { key: '更多平台', label: '更多平台', icon: 'add.svg' },
    ],
    [],
  );

  const stateItems = useMemo<SwitchTabItemData[]>(
    () => [
      { key: '全部', label: '全部' },
      { key: '进行中', label: '进行中' },
      { key: '已完成', label: '已完成' },
      { key: '已关闭', label: '已关闭' },
      { key: '已归档', label: '已归档', disabled: true },
    ],
    [],
  );

  const storeDrawerList = ['淘宝', '天猫', '快手', '小红书', '视频号小店', '美团'];

  const handleStoreChange = (key: string) => {
    if (key === '更多平台') {
      setDrawerOpen(true);
      return;
    }
    setStoreActiveKey(key);
  };

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>StoreTabs · StateTabs</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        本页分别演示 <code>StoreTabs</code>（Figma <code>store_tabs</code>，带图标）与 <code>StateTabs</code>（Figma{' '}
        <code>state_tabs</code>，无图标）；底层导航与动效来自 <code>SwitchTabs</code>。
        设计对齐 <code>tabs + .tab_item</code>：active 下划线与横向切换、tab_item 的 hover/pressed，并支持 svg 与图片图标。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          StoreTabs（带图标）
        </h2>
        <StoreTabs
          items={storeItems}
          activeKey={storeActiveKey}
          onChange={handleStoreChange}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          StateTabs（无图标）
        </h2>
        <StateTabs
          items={stateItems}
          activeKey={stateActiveKey}
          onChange={setStateActiveKey}
        />
      </section>

      <Drawer
        title="更多平台"
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={360}
      >
        <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 12 }}>
          这里先放占位内容，后续可替换为平台选择器或搜索列表。
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {storeDrawerList.map((name) => (
            <div
              key={name}
              style={{
                padding: '8px 12px',
                borderRadius: vcTokens.style.borderRadius.md,
                background: vcTokens.color.neutral.fill.tertiary,
              }}
            >
              {name}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => setDrawerOpen(false)}>
            确认
          </Button>
        </div>
      </Drawer>
    </>
  );
}
