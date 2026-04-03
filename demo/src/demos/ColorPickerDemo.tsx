import React, { useState } from 'react';
import { ColorPicker, Space, vcTokens } from 'vc-design';

const presets = [
  {
    label: '推荐',
    colors: ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'],
  },
  {
    label: '中性',
    colors: ['#000000', '#ffffff', '#f5f5f5', '#d9d9d9', '#8c8c8c'],
  },
];

export default function ColorPickerDemo() {
  const [color, setColor] = useState<string>('#1677ff');

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>ColorPicker 颜色选择器</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        用于选择颜色，支持单色、格式切换与预设。规范见 docs/color-picker-spec.md。
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
          <ColorPicker />
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
          <Space>
            <ColorPicker size="small" />
            <ColorPicker size="middle" />
            <ColorPicker size="large" />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          受控与显示文本
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <ColorPicker
            value={color}
            onChange={(_, hex) => setColor(hex)}
            showText
          />
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            当前值: {color}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          禁用与清除
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <ColorPicker defaultValue="#1677ff" disabled />
            <ColorPicker defaultValue="#1677ff" allowClear />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          预设颜色
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <ColorPicker defaultValue="#1677ff" presets={presets} showText />
        </div>
      </section>
    </>
  );
}
