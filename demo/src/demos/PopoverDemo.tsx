import React from 'react';
import { Popover, Button, Space, vcTokens } from 'vc-design';

const content = (
  <div>
    <p style={{ margin: '0 0 8px' }}>气泡内容</p>
    <p style={{ margin: 0 }}>可放链接或按钮等。</p>
  </div>
);

export default function PopoverDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Popover 气泡卡片</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        点击或移入触发，弹出气泡卡片，可承载标题与复杂内容。规范见 docs/popover-spec.md。
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
          <Space wrap>
            <Popover content={content} title="标题">
              <Button>悬停触发</Button>
            </Popover>
            <Popover content={content} title="标题" trigger="click">
              <Button>点击触发</Button>
            </Popover>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          位置与箭头
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space wrap>
            <Popover content={content} title="上" placement="top">
              <Button>top</Button>
            </Popover>
            <Popover content={content} title="下" placement="bottom">
              <Button>bottom</Button>
            </Popover>
            <Popover content={content} title="左" placement="left">
              <Button>left</Button>
            </Popover>
            <Popover content={content} title="右" placement="right">
              <Button>right</Button>
            </Popover>
            <Popover content="无标题" arrow={false}>
              <Button>无箭头</Button>
            </Popover>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          仅内容
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Popover content="仅内容，无标题">
            <span style={{ color: vcTokens.color.primary.default, cursor: 'pointer' }}>悬停查看</span>
          </Popover>
        </div>
      </section>
    </>
  );
}
