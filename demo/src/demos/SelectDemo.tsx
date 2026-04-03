import React, { useState } from 'react';
import { Select, Space, vcTokens, VcIcon } from 'vc-design';

const options = [
  { value: 'apple', label: '苹果' },
  { value: 'pear', label: '梨' },
  { value: 'orange', label: '橙子' },
];

const optionsWithDisabled = [
  { value: 'apple', label: '苹果' },
  { value: 'pear', label: '梨' },
  { value: 'orange', label: '橙子', disabled: true },
];

export default function SelectDemo() {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Select 选择器</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        下拉选择器，支持单选、多选、搜索与分组。规范见 docs/select-spec.md。
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
          <Space direction="vertical" style={{ width: '100%', maxWidth: 280 }}>
            <Select
              placeholder="请选择"
              options={options}
              value={value}
              onChange={setValue}
              allowClear
              suffixIcon={<VcIcon type="chevron-down" />}
            />
            <p style={{ margin: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
              当前: {value ?? '-'}
            </p>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          可搜索与多选
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" style={{ width: '100%', maxWidth: 280 }}>
            <Select
              placeholder="可搜索"
              options={options}
              showSearch
              suffixIcon={<VcIcon type="chevron-down" />}
              filterOption={(input, opt) =>
                (opt?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
            />
            <Select
              mode="multiple"
              placeholder="多选"
              options={options}
              defaultValue={['apple']}
              style={{ width: '100%' }}
              suffixIcon={<VcIcon type="chevron-down" />}
            />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          尺寸与禁用
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <Select
              options={options}
              size="small"
              placeholder="小"
              style={{ width: 120 }}
              suffixIcon={<VcIcon type="chevron-down" />}
            />
            <Select
              options={options}
              size="middle"
              placeholder="中"
              style={{ width: 120 }}
              suffixIcon={<VcIcon type="chevron-down" />}
            />
            <Select
              options={options}
              size="large"
              placeholder="大"
              style={{ width: 120 }}
              suffixIcon={<VcIcon type="chevron-down" />}
            />
            <Select
              options={options}
              disabled
              placeholder="禁用"
              style={{ width: 120 }}
              suffixIcon={<VcIcon type="chevron-down" />}
            />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          选项禁用与状态
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <Select
              options={optionsWithDisabled}
              placeholder="部分禁用"
              style={{ width: 160 }}
              suffixIcon={<VcIcon type="chevron-down" />}
            />
            <Select
              options={options}
              status="error"
              placeholder="错误"
              style={{ width: 120 }}
              suffixIcon={<VcIcon type="chevron-down" />}
            />
            <Select
              options={options}
              status="warning"
              placeholder="警告"
              style={{ width: 120 }}
              suffixIcon={<VcIcon type="chevron-down" />}
            />
          </Space>
        </div>
      </section>
    </>
  );
}
