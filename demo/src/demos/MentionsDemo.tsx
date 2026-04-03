import React, { useState } from 'react';
import { Mentions, Space, vcTokens } from 'vc-design';

const users = [
  { value: '张三', label: '张三' },
  { value: '李四', label: '李四' },
  { value: '王五', label: '王五' },
];

export default function MentionsDemo() {
  const [text, setText] = useState('');

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Mentions 提及</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        在输入中通过触发字符提及某人或某事，常用于 @ 提及。规范见 docs/mentions-spec.md。
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
          <Mentions
            options={users}
            placeholder="输入 @ 提及用户"
            value={text}
            onChange={setText}
          />
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            当前内容: {text || '-'}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          向上展开与清除
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" style={{ width: '100%', maxWidth: 360 }}>
            <Mentions options={users} placeholder="向上展开" placement="top" />
            <Mentions options={users} placeholder="可清除" allowClear defaultValue="@张三 " />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          自适应高度与状态
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" style={{ width: '100%', maxWidth: 360 }}>
            <Mentions options={users} placeholder="多行自适应" autoSize={{ minRows: 2, maxRows: 4 }} />
            <Mentions options={users} placeholder="错误状态" status="error" />
            <Mentions options={users} placeholder="警告状态" status="warning" />
          </Space>
        </div>
      </section>
    </>
  );
}
