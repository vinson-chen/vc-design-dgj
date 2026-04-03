import React, { useState } from 'react';
import { Collapse, Space, vcTokens } from 'vc-design';

const text =
  '可折叠的内容区域。对复杂区域进行分组和隐藏，保持页面整洁。';

const items = [
  { key: '1', label: '面板 1', children: <p style={{ margin: 0 }}>{text}</p> },
  { key: '2', label: '面板 2', children: <p style={{ margin: 0 }}>{text}</p> },
  { key: '3', label: '面板 3', children: <p style={{ margin: 0 }}>{text}</p> },
];

export default function CollapseDemo() {
  const [activeKey, setActiveKey] = useState<string | string[]>(['1']);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Collapse 折叠面板</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        可折叠/展开的内容区域，支持手风琴、尺寸与简洁风格。规范见 docs/collapse-spec.md。
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
          <Collapse
            defaultActiveKey={['1']}
            items={items}
            onChange={(key) => setActiveKey(key as string[])}
          />
          <p style={{ marginTop: 12, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            当前展开: {Array.isArray(activeKey) ? activeKey.join(', ') : activeKey}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          手风琴与尺寸
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Collapse accordion items={items} defaultActiveKey="1" />
            <Collapse size="small" items={items} defaultActiveKey={['1']} />
            <Collapse size="large" items={items} defaultActiveKey={['2']} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          简洁风格、幽灵与 extra
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Collapse bordered={false} items={items} defaultActiveKey={['1']} />
            <Collapse ghost items={items} defaultActiveKey={['2']} />
            <Collapse
              items={[
                { key: '1', label: '带 extra', extra: '右侧', children: <p style={{ margin: 0 }}>{text}</p> },
                { key: '2', label: '无箭头', showArrow: false, children: <p style={{ margin: 0 }}>{text}</p> },
              ]}
              defaultActiveKey={['1']}
            />
          </Space>
        </div>
      </section>
    </>
  );
}
