import React from 'react';
import { Space, Button, Divider, vcTokens } from 'vc-design';

export default function SpaceDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Space 间距</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        设置组件之间的间距，支持水平/垂直、尺寸、对齐、换行与分隔符。规范见 docs/space-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本用法
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          垂直间距
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle">
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          间距大小（size）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="small" style={{ marginBottom: 16 }}>
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Space>
          <br />
          <Space size="middle" style={{ marginBottom: 16 }}>
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Space>
          <br />
          <Space size="large">
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          对齐（align）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space align="center" size="middle" style={{ marginBottom: 16 }}>
            <span>center</span>
            <Button type="primary">Primary</Button>
            <span style={{ padding: '8px 12px', background: vcTokens.color.neutral.fill.default, borderRadius: 4 }}>Block</span>
          </Space>
          <br />
          <Space align="start" size="middle" style={{ marginBottom: 16 }}>
            <span>start</span>
            <Button type="primary">Primary</Button>
            <span style={{ padding: '8px 12px', background: vcTokens.color.neutral.fill.default, borderRadius: 4 }}>Block</span>
          </Space>
          <br />
          <Space align="end" size="middle" style={{ marginBottom: 16 }}>
            <span>end</span>
            <Button type="primary">Primary</Button>
            <span style={{ padding: '8px 12px', background: vcTokens.color.neutral.fill.default, borderRadius: 4 }}>Block</span>
          </Space>
          <br />
          <Space align="baseline" size="middle">
            <span>baseline</span>
            <Button type="primary">Primary</Button>
            <span style={{ padding: '8px 12px', background: vcTokens.color.neutral.fill.default, borderRadius: 4 }}>Block</span>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          自动换行（wrap）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
            maxWidth: 320,
          }}
        >
          <Space wrap size="small">
            {Array.from({ length: 20 }, (_, i) => (
              <Button key={i}>Button</Button>
            ))}
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          分隔符（split）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space split={<Divider type="vertical" />}>
            <span style={{ color: vcTokens.color.neutral.text.default }}>Link</span>
            <span style={{ color: vcTokens.color.neutral.text.default }}>Link</span>
            <span style={{ color: vcTokens.color.neutral.text.default }}>Link</span>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          Space.Compact 紧凑布局（Button）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space.Compact style={{ marginBottom: 16 }}>
            <Button type="primary">Button 1</Button>
            <Button>Button 2</Button>
            <Button>Button 3</Button>
            <Button>Button 4</Button>
          </Space.Compact>
          <br />
          <Space.Compact direction="vertical" style={{ width: 'fit-content' }}>
            <Button type="primary">Button 1</Button>
            <Button>Button 2</Button>
            <Button>Button 3</Button>
          </Space.Compact>
        </div>
      </section>
    </>
  );
}
