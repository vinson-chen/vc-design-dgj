import React, { useState } from 'react';
import { Button, VcIcon, vcTokens } from 'vc-design';

const spec = {
  type: [
    { key: 'primary', label: '主按钮' },
    { key: 'default', label: '默认' },
    { key: 'dashed', label: '虚线' },
    { key: 'link', label: '链接' },
    { key: 'text', label: '文字' },
  ],
};

export default function ButtonDemo() {
  const [clicked, setClicked] = useState<string | null>(null);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Button 按钮</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        以下为《Button 组件规范》的可交互对照，用于核对尺寸、类型、状态与 Token 效果。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          规范摘要
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 16,
            fontSize: 13,
            color: vcTokens.color.neutral.text.default,
          }}
        >
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>尺寸：</strong> Large 40px / Middle 32px / Small 24px；圆角 8px / 6px / 4px；字号 16 / 14 / 12px。
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>类型：</strong> primary（#0888FF）、default、dashed、link、text。
          </p>
          <p style={{ margin: 0 }}>
            <strong>主色：</strong> 默认 #0888FF，Hover #39A0FF，Active #077AE5（来自 vcTokens.color.primary）。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          类型（Type）
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          {spec.type.map(({ key, label }) => (
            <Button
              key={key}
              type={key as 'primary' | 'default' | 'dashed' | 'link' | 'text'}
              onClick={() => setClicked(`type-${key}`)}
            >
              {label}
            </Button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          尺寸（Size）
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Button size="large" onClick={() => setClicked('size-large')}>Large</Button>
          <Button size="middle" onClick={() => setClicked('size-middle')}>Middle</Button>
          <Button size="small" onClick={() => setClicked('size-small')}>Small</Button>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button type="primary" size="large">Primary Large</Button>
          <Button type="primary" size="middle">Primary Middle</Button>
          <Button type="primary" size="small">Primary Small</Button>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          状态（Disabled / Loading）
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Button disabled>默认禁用</Button>
          <Button type="primary" disabled>主按钮禁用</Button>
          <Button loading>Loading</Button>
          <Button type="primary" loading>主按钮 Loading</Button>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          危险按钮（Danger）
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Button danger>Danger Default</Button>
          <Button type="primary" danger>Danger Primary</Button>
          <Button type="primary" danger disabled>Danger Primary Disabled</Button>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带图标
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Button type="primary" icon={<VcIcon type="search" />}>搜索</Button>
          <Button icon={<VcIcon type="search" />}>默认带图标</Button>
          <Button type="primary" icon={<VcIcon type="search" />} loading>搜索 Loading</Button>
        </div>
      </section>

      {clicked && (
        <div
          style={{
            marginTop: 24,
            padding: 12,
            background: vcTokens.color.primary.bg,
            borderRadius: vcTokens.style.borderRadius.sm,
            color: vcTokens.color.primary.text,
          }}
        >
          当前点击：<code>{clicked}</code>
        </div>
      )}
    </>
  );
}
