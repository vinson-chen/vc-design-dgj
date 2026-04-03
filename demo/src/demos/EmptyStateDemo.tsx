import React from 'react';
import { Empty, Button, Space, vcTokens } from 'vc-design';

export default function EmptyStateDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Empty 空状态</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        无数据时的占位与提示，可自定义描述与操作。规范见 docs/empty-spec.md。
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
          <Empty />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          简易图与自定义描述
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            <Empty description="暂无数据，请稍后再试" />
            <Empty description={false} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带操作
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Empty description="暂无内容">
            <Button type="primary">创建</Button>
          </Empty>
        </div>
      </section>
    </>
  );
}
