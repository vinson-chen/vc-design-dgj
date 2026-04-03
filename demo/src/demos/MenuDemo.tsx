import React from 'react';
import { Menu, Flex, VcIcon, vcTokens } from 'vc-design';

const itemsWithIcon = [
  {
    key: 'nav-1',
    icon: <VcIcon type="home" fontSize={14} />,
    label: '首页',
  },
  {
    key: 'nav-2',
    icon: <VcIcon type="menu-application" fontSize={14} />,
    label: '应用',
    children: [
      { key: 'nav-2-1', label: '子项 1' },
      { key: 'nav-2-2', label: '子项 2' },
    ],
  },
  {
    key: 'nav-3',
    icon: <VcIcon type="file-1" fontSize={14} />,
    label: '文档',
  },
];

const inlineItems = [
  { key: '1', label: '选项 1' },
  {
    key: '2',
    label: '选项 2',
    children: [
      { key: '2-1', label: '子项 2-1' },
      { key: '2-2', label: '子项 2-2' },
    ],
  },
  {
    key: '3',
    label: '选项 3',
    children: [
      { key: '3-1', label: '子项 3-1' },
      { key: '3-2', label: '子项 3-2' },
    ],
  },
];

export default function MenuDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Menu 导航菜单</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        为页面和功能提供导航，支持水平/垂直/内嵌、主题与子菜单。规范见 docs/menu-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          水平菜单（顶部导航）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Menu
            mode="horizontal"
            defaultSelectedKeys={['nav-1']}
            items={itemsWithIcon}
            style={{ borderBottom: 'none', minWidth: 0 }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          垂直菜单
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Flex gap={24} style={{ alignItems: 'flex-start' }}>
            <Menu
              mode="vertical"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['2']}
              items={inlineItems}
              style={{ width: 200 }}
            />
            <div style={{ flex: 1, padding: 16, background: vcTokens.color.neutral.background.container, borderRadius: vcTokens.style.borderRadius.sm, color: vcTokens.color.neutral.text.description }}>
              右侧内容区
            </div>
          </Flex>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          内嵌菜单（inline）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['2-1']}
            defaultOpenKeys={['2']}
            items={inlineItems}
            style={{ width: 240 }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          暗色主题
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Menu
            mode="inline"
            theme="dark"
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['2']}
            items={inlineItems}
            style={{ width: 240 }}
          />
        </div>
      </section>
    </>
  );
}
