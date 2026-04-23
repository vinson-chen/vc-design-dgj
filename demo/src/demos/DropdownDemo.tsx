import React from 'react';
import { Dropdown, Button, Space, VcIcon, vcTokens } from 'vc-design';

const basicMenuItems = [
  { key: '1', label: '选项 1' },
  { key: '2', label: '选项 2' },
  { key: '3', label: '选项 3' },
];

const menuWithDivider = [
  { key: '1', label: '选项 1' },
  { key: '2', label: '选项 2' },
  { type: 'divider' },
  { key: '3', label: '选项 3', disabled: true },
  { key: '4', label: '危险操作', danger: true },
];

const subMenuItems = [
  {
    key: 'sub',
    label: '子菜单',
    children: [
      { key: 'sub-1', label: '子项 1' },
      { key: 'sub-2', label: '子项 2' },
      { key: 'sub-3', label: '子项 3' },
      { key: 'sub-4', label: '子项 4' },
    ],
  },
  { key: '5', label: '直接项' },
];

export default function DropdownDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Dropdown 下拉菜单</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        向下弹出的列表，用于收纳操作命令。支持点击/悬停触发、位置、箭头与 Dropdown.Button。规范见 docs/dropdown-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Dropdown menu={{ items: basicMenuItems }}>
            <span style={{ cursor: 'pointer', color: vcTokens.color.primary.text }}>
              Hover me
            </span>
          </Dropdown>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          弹出位置
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space wrap>
            <Dropdown menu={{ items: basicMenuItems }} placement="bottomLeft">
              <Button>bottomLeft</Button>
            </Dropdown>
            <Dropdown menu={{ items: basicMenuItems }} placement="bottom">
              <Button>bottom</Button>
            </Dropdown>
            <Dropdown menu={{ items: basicMenuItems }} placement="bottomRight">
              <Button>bottomRight</Button>
            </Dropdown>
            <Dropdown menu={{ items: basicMenuItems }} placement="topLeft">
              <Button>topLeft</Button>
            </Dropdown>
            <Dropdown menu={{ items: basicMenuItems }} placement="top">
              <Button>top</Button>
            </Dropdown>
            <Dropdown menu={{ items: basicMenuItems }} placement="topRight">
              <Button>topRight</Button>
            </Dropdown>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          触发方式（click）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Dropdown menu={{ items: basicMenuItems }} trigger={['click']}>
            <Button>Click me</Button>
          </Dropdown>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          分割线与禁用项
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Dropdown menu={{ items: menuWithDivider }}>
            <Button>Hover me</Button>
          </Dropdown>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带下拉框的按钮（Dropdown.Button）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space wrap>
            <Dropdown.Button menu={{ items: basicMenuItems }}>主操作</Dropdown.Button>
            <Dropdown.Button menu={{ items: basicMenuItems }} type="primary">
              Primary
            </Dropdown.Button>
            <Dropdown.Button
              menu={{ items: basicMenuItems }}
              icon={<VcIcon type="chevron-down" fontSize={12} />}
            >
              自定义图标
            </Dropdown.Button>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          多级菜单
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Dropdown menu={{ items: subMenuItems }}>
            <Button>Cascading menu</Button>
          </Dropdown>
        </div>
      </section>
    </>
  );
}
