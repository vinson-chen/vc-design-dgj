import React, { useState } from 'react';
import { Radio, Space, vcTokens } from 'vc-design';

const plainOptions = ['苹果', '梨', '橙子'];
const optionsWithDisabled = [
  { label: '苹果', value: 'apple' },
  { label: '梨', value: 'pear' },
  { label: '橙子', value: 'orange', disabled: true },
];

export default function RadioDemo() {
  const [value, setValue] = useState<string>('apple');

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Radio 单选框</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        在多个备选项中选中单个状态，选项默认全部可见。规范见 docs/radio-spec.md。
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
            <Radio>Radio</Radio>
            <Radio defaultChecked>默认选中</Radio>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          单选组
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical">
            <Radio.Group value={value} onChange={(e) => setValue(e.target.value)}>
              <Radio value="apple">苹果</Radio>
              <Radio value="pear">梨</Radio>
              <Radio value="orange">橙子</Radio>
            </Radio.Group>
            <Radio.Group options={plainOptions} />
            <Radio.Group options={optionsWithDisabled} defaultValue="apple" />
          </Space>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            当前: {value}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          按钮样式与尺寸
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle">
            <Radio.Group optionType="button" options={plainOptions} defaultValue="苹果" />
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={plainOptions}
              defaultValue="梨"
            />
            <Space>
              <Radio.Group optionType="button" size="small" options={plainOptions} />
              <Radio.Group optionType="button" size="middle" options={plainOptions} />
              <Radio.Group optionType="button" size="large" options={plainOptions} />
            </Space>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          禁用
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <Radio disabled>禁用</Radio>
            <Radio.Group options={plainOptions} disabled defaultValue="苹果" />
          </Space>
        </div>
      </section>
    </>
  );
}
