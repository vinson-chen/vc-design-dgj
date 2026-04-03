import React, { useState } from 'react';
import { Rate, Space, vcTokens } from 'vc-design';

const desc = ['很差', '较差', '一般', '较好', '很好'];

export default function RateDemo() {
  const [value, setValue] = useState<number>(3);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Rate 评分</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        对事物进行评分操作，支持整星、半星、自定义字符与提示。规范见 docs/rate-spec.md。
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
            <Rate />
            <Rate value={value} onChange={setValue} />
            <p style={{ margin: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
              当前: {value} 星
            </p>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          半星与文案
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical">
            <Rate allowHalf defaultValue={2.5} />
            <Space align="center">
              <Rate tooltips={desc} value={value} onChange={setValue} />
              <span style={{ color: vcTokens.color.neutral.text.description }}>
                {value ? desc[value - 1] : ''}
              </span>
            </Space>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          清除与只读
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <Rate allowClear={true} defaultValue={3} />
            <Rate allowClear={false} defaultValue={3} />
            <Rate disabled defaultValue={4} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          自定义数量
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Rate count={10} defaultValue={5} />
        </div>
      </section>
    </>
  );
}
