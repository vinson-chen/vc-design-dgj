import React, { useCallback, useMemo, useState } from 'react';
import { Button, Drawer, vcTokens } from 'vc-design';
import {
  VCustomTabs,
  VStateTabs,
  VTypeTabs,
  useVCustomTabsState,
  type VCustomTabsActiveTabFieldConfig,
  type VSwitchTabItemData,
} from 'vc-biz';

export default function SwitchAreaDemo() {
  const [storeActiveKey, setStoreActiveKey] = useState('精选平台');
  const [stateActiveKey, setStateActiveKey] = useState('全部');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const customTabs = useVCustomTabsState();
  const customTabsVertical = useVCustomTabsState({ initialLabel: '表格 1' });
  /** 最小演示：让 VCustomTabs 出现「字段配置」及右侧列显隐子面板（与业务页传入的 activeTabFieldConfig 同源契约） */
  const [demoHiddenColSet, setDemoHiddenColSet] = useState<Set<number>>(() => new Set());
  const setDemoColumnHidden = useCallback((colIndex: number, hidden: boolean) => {
    setDemoHiddenColSet((prev) => {
      const next = new Set(prev);
      if (hidden) next.add(colIndex);
      else next.delete(colIndex);
      return next;
    });
  }, []);
  const customTabsFieldConfigDemo = useMemo<VCustomTabsActiveTabFieldConfig>(
    () => ({
      colCount: 2,
      valueByCell: { 'header-0': '列 1', 'header-1': '列 2' },
      hiddenColSet: demoHiddenColSet,
      setColumnHidden: setDemoColumnHidden,
      enableFreezeLastCol: false,
    }),
    [demoHiddenColSet, setDemoColumnHidden],
  );

  const storeItems = useMemo<VSwitchTabItemData[]>(
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

  const stateItems = useMemo<VSwitchTabItemData[]>(
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
      <h1 style={{ marginBottom: 8, fontWeight: 600, fontSize: 18 }}>VTabs 切换区</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        本页分别演示 <code>VTypeTabs</code>（Figma <code>store_tabs</code>，带图标）、<code>VStateTabs</code>（Figma{' '}
        <code>state_tabs</code>，无图标）与 <code>VCustomTabs</code>（Figma <code>CustomTabs</code> /{' '}
        <code>861:1412</code>，可增删改选项）；VTypeTabs/VStateTabs 底层来自 <code>VSwitchTabs</code>。
        <code>VCustomTabs</code> 扩展 <code>.tab_item</code> 的 <code>active-hover</code>、<code>active-pressed</code>、
        <code>active-input</code> 等状态：有图标时悬停/菜单态下图标换为 <code>more</code>，添加面板中「商品」「订单」暂禁用。
        下方示例传入最小 <code>activeTabFieldConfig</code>，可展开「字段配置」子面板。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          VTypeTabs（带图标）
        </h2>
        <VTypeTabs
          items={storeItems}
          activeKey={storeActiveKey}
          onChange={handleStoreChange}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          VStateTabs（无图标）
        </h2>
        <VStateTabs
          items={stateItems}
          activeKey={stateActiveKey}
          onChange={setStateActiveKey}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          VCustomTabs（可配置选项卡）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <div style={{ background: vcTokens.color.neutral.background.container }}>
            <VCustomTabs
              items={customTabs.items}
              onItemsChange={customTabs.setItems}
              activeKey={customTabs.activeKey}
              onActiveKeyChange={customTabs.setActiveKey}
              activeTabFieldConfig={customTabsFieldConfigDemo}
            />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          VCustomTabs 垂直模式
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <VCustomTabs
            mode="vertical"
            items={customTabsVertical.items}
            onItemsChange={customTabsVertical.setItems}
            activeKey={customTabsVertical.activeKey}
            onActiveKeyChange={customTabsVertical.setActiveKey}
            verticalWidth={240}
            verticalHeight={400}
          />
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
            认
          </Button>
        </div>
      </Drawer>
    </>
  );
}
