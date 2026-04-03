import React from 'react';
import { Descriptions, Space, vcTokens } from 'vc-design';

const basicItems = [
  { key: '1', label: '姓名', children: '张三' },
  { key: '2', label: '电话', children: '1810000000' },
  { key: '3', label: '所在地', children: '杭州西湖区' },
  { key: '4', label: '备注', children: '-' },
  { key: '5', label: '地址', children: '西湖区万塘路 18 号' },
];

export default function DescriptionsDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Descriptions 描述列表</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        展示多个只读字段，常用于详情页。规范见 docs/descriptions-spec.md。
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
          <Descriptions title="用户信息" items={basicItems} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带边框与 extra
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Descriptions
            title="用户信息"
            extra={<a href="#">编辑</a>}
            bordered
            items={basicItems}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          尺寸与垂直布局
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Descriptions title="小尺寸" size="small" items={basicItems.slice(0, 3)} />
            <Descriptions title="垂直布局" layout="vertical" items={basicItems.slice(0, 3)} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          column 与 span
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Descriptions
            title="列数与跨列"
            bordered
            column={2}
            items={[
              ...basicItems.slice(0, 3),
              { key: '6', label: '长内容', children: '此项 span=2 占满整行', span: 2 },
            ]}
          />
        </div>
      </section>
    </>
  );
}
