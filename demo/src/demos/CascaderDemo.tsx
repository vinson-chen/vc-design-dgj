import React from 'react';
import { Cascader, vcTokens } from 'vc-design';

const options = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      { value: 'hangzhou', label: '杭州', children: [{ value: 'xihu', label: '西湖' }] },
      { value: 'ningbo', label: '宁波', children: [{ value: 'jiangbei', label: '江北' }] },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      { value: 'nanjing', label: '南京', children: [{ value: 'zhonghuamen', label: '中华门' }] },
      { value: 'suzhou', label: '苏州', children: [{ value: 'huqiu', label: '虎丘' }] },
    ],
  },
];

export default function CascaderDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Cascader 级联选择</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        级联选择框，适用于省市区、分类层级等关联数据。规范见 docs/cascader-spec.md。
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
          <Cascader options={options} placeholder="请选择" style={{ width: 240 }} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          默认值
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Cascader
            options={options}
            defaultValue={['zhejiang', 'hangzhou', 'xihu']}
            placeholder="请选择"
            style={{ width: 240 }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          移入展开
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Cascader
            options={options}
            expandTrigger="hover"
            placeholder="请选择（悬停展开）"
            style={{ width: 240 }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          禁用选项
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Cascader
            options={[
              ...options,
              { value: 'guangdong', label: '广东', disabled: true, children: [] },
            ]}
            placeholder="请选择"
            style={{ width: 240 }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          选择即改变（changeOnSelect）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Cascader
            options={options}
            changeOnSelect
            placeholder="可选中任意一级"
            style={{ width: 240 }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          搜索
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Cascader
            options={options}
            showSearch={{ filter: (input, path) => path.some((p) => p.label?.toString().toLowerCase().includes(input.toLowerCase())) }}
            placeholder="可搜索"
            style={{ width: 240 }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          尺寸与自定义展示
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Cascader
              options={options}
              size="small"
              placeholder="small"
              style={{ width: 240 }}
            />
            <Cascader
              options={options}
              size="large"
              placeholder="large"
              style={{ width: 240 }}
            />
            <Cascader
              options={options}
              displayRender={(labels) => labels.join(' / ')}
              placeholder="自定义 displayRender"
              style={{ width: 280 }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
