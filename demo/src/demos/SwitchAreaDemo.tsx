import React, { useMemo, useState } from 'react';
import { Button, Drawer, vcTokens } from 'vc-design';
import { SwitchTabs, type SwitchTabItemData } from 'vc-biz';

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
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>SwitchArea 切换区</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        基于 Figma <code>tabs + .tab_item + store_tabs + state_tabs</code>：active 下划线与横向切换动效沿用现有 Tabs，
        tab_item 补齐 hover/pressed 交互态，并支持 svg 与图片图标两种来源。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          store_tabs（带图标）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <div style={{ background: vcTokens.color.neutral.background.container }}>
            <SwitchTabs
              items={storeItems}
              activeKey={storeActiveKey}
              onChange={handleStoreChange}
              showIcon
              showPanel={false}
            />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          state_tabs（无图标）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <div style={{ background: vcTokens.color.neutral.background.container }}>
            <SwitchTabs
              items={stateItems}
              activeKey={stateActiveKey}
              onChange={setStateActiveKey}
              showIcon={false}
              showPanel={false}
            />
          </div>
        </div>
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
