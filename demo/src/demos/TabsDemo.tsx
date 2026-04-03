import React from 'react';
import { Tabs, Button, VcIcon, vcTokens } from 'vc-design';

const lineItems = [
  { key: '1', label: '标签 1', children: <div style={{ padding: 16, color: vcTokens.color.neutral.text.default }}>内容 1</div> },
  { key: '2', label: '标签 2', children: <div style={{ padding: 16, color: vcTokens.color.neutral.text.default }}>内容 2</div> },
  { key: '3', label: '标签 3', children: <div style={{ padding: 16, color: vcTokens.color.neutral.text.default }}>内容 3</div> },
];

const iconItems = [
  { key: '1', label: '标签 1', icon: <VcIcon type="file-1" fontSize={14} />, children: <div style={{ padding: 16, color: vcTokens.color.neutral.text.default }}>内容 1</div> },
  { key: '2', label: '标签 2', icon: <VcIcon type="menu-application" fontSize={14} />, children: <div style={{ padding: 16, color: vcTokens.color.neutral.text.default }}>内容 2</div> },
  { key: '3', label: '标签 3', icon: <VcIcon type="user" fontSize={14} />, children: <div style={{ padding: 16, color: vcTokens.color.neutral.text.default }}>内容 3</div> },
];

const disabledItems = [
  { key: '1', label: '标签 1', children: <div style={{ padding: 16, color: vcTokens.color.neutral.text.default }}>内容 1</div> },
  { key: '2', label: '标签 2', disabled: true, children: <div style={{ padding: 16, color: vcTokens.color.neutral.text.default }}>内容 2</div> },
  { key: '3', label: '标签 3', children: <div style={{ padding: 16, color: vcTokens.color.neutral.text.default }}>内容 3</div> },
];

export default function TabsDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Tabs 标签页</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        选项卡切换组件，支持线型/卡片、位置、尺寸与附加内容。规范见 docs/tabs-spec.md。
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
          <Tabs defaultActiveKey="1" items={lineItems} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          禁用某一项
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Tabs defaultActiveKey="1" items={disabledItems} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          居中
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Tabs defaultActiveKey="1" centered items={lineItems} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带图标
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Tabs defaultActiveKey="1" items={iconItems} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          尺寸
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Tabs defaultActiveKey="1" size="small" items={lineItems} style={{ marginBottom: 24 }} />
          <Tabs defaultActiveKey="1" size="middle" items={lineItems} style={{ marginBottom: 24 }} />
          <Tabs defaultActiveKey="1" size="large" items={lineItems} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          位置（左侧）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Tabs defaultActiveKey="1" tabPosition="left" items={lineItems} style={{ minHeight: 160 }} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          卡片式页签
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Tabs type="card" defaultActiveKey="1" items={lineItems} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          附加内容
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Tabs
            defaultActiveKey="1"
            items={lineItems}
            tabBarExtraContent={{ right: <Button size="small">操作</Button> }}
          />
        </div>
      </section>
    </>
  );
}
