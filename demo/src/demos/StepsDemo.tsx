import React, { useState } from 'react';
import { Steps, VcIcon, vcTokens } from 'vc-design';

const basicItems = [
  { title: '已完成', description: '这是描述' },
  { title: '进行中', description: '这是描述' },
  { title: '待进行', description: '这是描述' },
];

const iconItems = [
  { title: '登录', icon: <VcIcon type="user" fontSize={16} /> },
  { title: '验证', icon: <VcIcon type="verify" fontSize={16} /> },
  { title: '支付', icon: <VcIcon type="wallet" fontSize={16} /> },
  { title: '完成', icon: <VcIcon type="check-circle" fontSize={16} /> },
];

export default function StepsDemo() {
  const [current, setCurrent] = useState(0);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Steps 步骤条</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        引导用户按流程完成任务，支持水平/垂直、图标、状态与可点击。规范见 docs/steps-spec.md。
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
          <Steps current={1} items={basicItems} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          迷你版
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Steps size="small" current={1} items={basicItems} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带图标
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Steps current={1} items={iconItems} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          竖直方向
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Steps direction="vertical" current={1} items={basicItems} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          步骤运行错误
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Steps
            current={1}
            status="error"
            items={[
              { title: '已完成', description: '描述' },
              { title: '进行中', description: '描述' },
              { title: '待进行', description: '描述' },
            ]}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          可点击切换
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Steps current={current} onChange={setCurrent} items={basicItems} />
          <p style={{ marginTop: 16, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            当前步骤: {current + 1}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带进度
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Steps current={1} percent={60} items={basicItems} />
        </div>
      </section>
    </>
  );
}
