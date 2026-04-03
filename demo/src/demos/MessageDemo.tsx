import React from 'react';
import { Button, Space, vcTokens, message } from 'vc-design';

export default function MessageDemo() {
  const [messageApi, contextHolder] = message.useMessage();

  const openStaticMessages = () => {
    message.success('操作成功');
    message.info('这是一条信息提示');
    message.warning('这是一条警告提示');
    message.error('这是一条错误提示');
  };

  const openLoading = () => {
    const key = 'loading-example';
    message.loading({ content: '正在加载...', key });
    setTimeout(() => {
      message.success({ content: '加载完成', key, duration: 2 });
    }, 1000);
  };

  const openHookMessage = () => {
    messageApi.success('通过 useMessage 调用');
  };

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Message 全局提示</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        轻量级全局反馈，不打断当前操作，适合展示简短状态信息。规范见 docs/message-spec.md。
      </p>

      {contextHolder}

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本类型
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space wrap>
            <Button type="primary" onClick={openStaticMessages}>
              打开多种类型
            </Button>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          Loading 与更新
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space wrap>
            <Button onClick={openLoading}>加载流程</Button>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          useMessage Hook
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space wrap>
            <Button onClick={openHookMessage}>通过 useMessage 调用</Button>
          </Space>
        </div>
      </section>
    </>
  );
}

