import React, { useState } from 'react';
import { Slider, Space, vcTokens } from 'vc-design';

const marks = {
  0: '0°C',
  26: '26°C',
  37: '37°C',
  100: { style: { fontWeight: 600 }, label: '100°C' },
};

export default function SliderDemo() {
  const [value, setValue] = useState<number>(30);
  const [rangeValue, setRangeValue] = useState<[number, number]>([20, 60]);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Slider 滑动输入条</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        滑动型输入器，展示当前值和可选范围，支持单/双滑块、刻度、自定义提示。规范见 docs/slider-spec.md。
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
          <Space direction="vertical" style={{ width: '100%', maxWidth: 400 }}>
            <Slider value={value} onChange={setValue} />
            <p style={{ margin: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
              当前: {value}
            </p>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          范围与禁用
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" style={{ width: '100%', maxWidth: 400 }}>
            <Slider range value={rangeValue} onChange={setRangeValue} />
            <p style={{ margin: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
              范围: [{rangeValue[0]}, {rangeValue[1]}]
            </p>
            <Slider disabled defaultValue={50} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          刻度与自定义提示
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" style={{ width: '100%', maxWidth: 400 }}>
            <Slider marks={marks} defaultValue={26} />
            <Slider
              marks={{ 0: '0', 50: '50', 100: '100' }}
              tooltip={{ formatter: (v) => `${v}%` }}
              defaultValue={30}
            />
          </Space>
        </div>
      </section>
    </>
  );
}
