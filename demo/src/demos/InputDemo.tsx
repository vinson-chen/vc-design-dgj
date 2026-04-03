import React, { useState } from 'react';
import { Input, Space, VcIcon, vcTokens } from 'vc-design';

const { TextArea } = Input;
const { Password } = Input;
const { Search } = Input;

export default function InputDemo() {
  const [text, setText] = useState('');

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Input 输入框</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        通过鼠标或键盘输入内容，支持前缀/后缀、搜索、密码、字数统计等。规范见 docs/input-spec.md。
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
          <Space direction="vertical" style={{ width: '100%', maxWidth: 360 }}>
            <Input placeholder="请输入" />
            <Input placeholder="受控" value={text} onChange={(e) => setText(e.target.value)} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          尺寸
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical">
            <Input size="small" placeholder="small" />
            <Input size="middle" placeholder="middle" />
            <Input size="large" placeholder="large" />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          前缀与后缀
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" style={{ width: '100%', maxWidth: 360 }}>
            <Input prefix={<VcIcon type="search" />} placeholder="带前缀" />
            <Input suffix={<VcIcon type="close" />} placeholder="带后缀" />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          密码、清除与字数
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" style={{ width: '100%', maxWidth: 360 }}>
            <Password placeholder="密码" />
            <Input placeholder="可清除" allowClear />
            <Input placeholder="字数统计" maxLength={20} showCount />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          搜索框与文本域
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" style={{ width: '100%', maxWidth: 360 }}>
            <Search placeholder="搜索" enterButton onSearch={(v) => console.log(v)} />
            <TextArea placeholder="多行文本" rows={3} />
            <TextArea placeholder="自适应高度" autoSize={{ minRows: 2, maxRows: 4 }} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          禁用与状态
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <Input placeholder="禁用" disabled />
            <Input placeholder="错误" status="error" />
            <Input placeholder="警告" status="warning" />
          </Space>
        </div>
      </section>
    </>
  );
}
