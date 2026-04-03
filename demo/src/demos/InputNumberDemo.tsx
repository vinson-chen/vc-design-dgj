import React, { useState } from 'react';
import { InputNumber, Space, VcIcon, vcTokens } from 'vc-design';

export default function InputNumberDemo() {
  const [value, setValue] = useState<number | null>(100);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>InputNumber 数字输入框</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        通过鼠标或键盘输入范围内的数值，支持步长、精度、格式化等。规范见 docs/input-number-spec.md。
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
          <Space direction="vertical">
            <InputNumber placeholder="请输入数字" />
            <InputNumber value={value} onChange={setValue} />
            <p style={{ margin: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
              当前值: {value ?? '-'}
            </p>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          尺寸与范围
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <InputNumber size="small" min={0} max={100} defaultValue={50} />
            <InputNumber size="middle" min={0} max={100} />
            <InputNumber size="large" min={0} max={100} step={10} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          精度与格式化
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <InputNumber min={0} max={100} step={0.1} precision={2} placeholder="保留两位小数" />
            <InputNumber
              formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(s) => Number(s?.replace(/,/g, '') ?? '')}
              placeholder="千分位"
            />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          前缀/后缀与禁用
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <InputNumber prefix={<VcIcon type="wallet" />} defaultValue={0} />
            <InputNumber suffix="元" defaultValue={0} />
            <InputNumber disabled defaultValue={99} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          状态
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <InputNumber status="error" placeholder="错误" />
            <InputNumber status="warning" placeholder="警告" />
          </Space>
        </div>
      </section>
    </>
  );
}
