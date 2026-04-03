import React, { useState } from 'react';
import { Alert, Button, Space, vcTokens, VcIcon } from 'vc-design';

export default function AlertDemo() {
  const [closed, setClosed] = useState(false);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Alert 警告提示</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        页面内醒目的提示与反馈，支持成功/信息/警告/错误等类型与可关闭。规范见 docs/alert-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          类型
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert message="成功提示" type="success" />
            <Alert message="信息提示" type="info" />
            <Alert message="警告提示" type="warning" />
            <Alert message="错误提示" type="error" />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带描述
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              message="提示标题"
              description="这里是补充描述，可多行。用于说明详情或操作建议。"
              type="info"
              showIcon
            />
            <Alert
              message="警告标题"
              description="警告的详细说明内容，用户可根据描述采取相应操作。"
              type="warning"
              showIcon
            />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          可关闭
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          {!closed && (
            <Alert
              message="可关闭提示"
              description="关闭后由业务控制不再展示。"
              type="info"
              closable
              onClose={() => setClosed(true)}
              style={{ marginBottom: 16 }}
            />
          )}
          {closed && (
            <Button size="small" onClick={() => setClosed(false)}>
              重新显示
            </Button>
          )}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带操作与自定义图标
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Alert
            message="带操作的提示"
            description="可通过 action 放置按钮或链接。"
            type="info"
            showIcon
            icon={<VcIcon type="info" />}
            action={
              <Button size="small" type="primary">
                查看
              </Button>
            }
          />
        </div>
      </section>
    </>
  );
}
