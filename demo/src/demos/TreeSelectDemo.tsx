import React, { useState } from 'react';
import { TreeSelect, Space, vcTokens } from 'vc-design';

const treeData = [
  {
    value: 'zhejiang',
    title: '浙江',
    children: [
      { value: 'hangzhou', title: '杭州', children: [{ value: 'xihu', title: '西湖' }] },
      { value: 'ningbo', title: '宁波', children: [{ value: 'jiangbei', title: '江北' }] },
    ],
  },
  {
    value: 'jiangsu',
    title: '江苏',
    children: [
      { value: 'nanjing', title: '南京', children: [{ value: 'zhonghuamen', title: '中华门' }] },
      { value: 'suzhou', title: '苏州', children: [{ value: 'huqiu', title: '虎丘' }] },
    ],
  },
];

export default function TreeSelectDemo() {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>TreeSelect 树选择</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        树型选择控件，适用于层级数据。规范见 docs/tree-select-spec.md。
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
            <TreeSelect
              treeData={treeData}
              placeholder="请选择"
              value={value}
              onChange={setValue}
              allowClear
              style={{ width: '100%' }}
            />
            <p style={{ margin: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
              当前: {value ?? '-'}
            </p>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          多选与可搜索
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" style={{ width: '100%', maxWidth: 320 }}>
            <TreeSelect
              treeData={treeData}
              multiple
              placeholder="多选"
              treeDefaultExpandAll
              style={{ width: '100%' }}
            />
            <TreeSelect
              treeData={treeData}
              showSearch
              placeholder="可搜索"
              treeNodeFilterProp="title"
              style={{ width: '100%' }}
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
            <TreeSelect treeData={treeData} size="small" placeholder="小" style={{ width: 160 }} />
            <TreeSelect treeData={treeData} size="middle" placeholder="中" style={{ width: 160 }} />
            <TreeSelect treeData={treeData} disabled placeholder="禁用" style={{ width: 160 }} />
          </Space>
        </div>
      </section>
    </>
  );
}
