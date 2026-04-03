import React from 'react';
import { List, Avatar, Space, vcTokens } from 'vc-design';

const data = [
  { id: '1', title: '标题一', desc: '描述内容一' },
  { id: '2', title: '标题二', desc: '描述内容二' },
  { id: '3', title: '标题三', desc: '描述内容三' },
];

const avatarUrl = 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png';

export default function ListDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>List 列表</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        基础列表展示，支持 dataSource、Item.Meta、尺寸与分页。规范见 docs/list-spec.md。
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
          <List
            header={<div>列表头</div>}
            footer={<div>列表底</div>}
            bordered
            dataSource={data}
            renderItem={(item) => (
              <List.Item key={item.id}>{item.title} — {item.desc}</List.Item>
            )}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          List.Item.Meta 与尺寸
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <List
              size="small"
              dataSource={data}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar src={avatarUrl} />}
                    title={item.title}
                    description={item.desc}
                  />
                </List.Item>
              )}
            />
            <List
              size="large"
              dataSource={data.slice(0, 2)}
              renderItem={(item) => (
                <List.Item key={item.id} extra={<span style={{ color: vcTokens.color.neutral.text.description }}>额外</span>}>
                  <List.Item.Meta title={item.title} description={item.desc} />
                </List.Item>
              )}
            />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          竖排与操作
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <List
            itemLayout="vertical"
            dataSource={data}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[<span key="a">编辑</span>, <span key="b">更多</span>]}
              >
                <List.Item.Meta title={item.title} description={item.desc} />
              </List.Item>
            )}
          />
        </div>
      </section>
    </>
  );
}
