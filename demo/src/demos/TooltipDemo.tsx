import React from 'react';
import { Tooltip, Button, Space, vcTokens, VcIcon } from 'vc-design';

export default function TooltipDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Tooltip 文字提示</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        悬停或聚焦时展示简短说明，适用于按钮、图标等补充说明。规范见 docs/tooltip-spec.md。
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
            <Tooltip title="提示文案">
              <Button>悬停我</Button>
            </Tooltip>
            <Tooltip title="多行说明：第一行。第二行补充说明。">
              <Button>多行提示</Button>
            </Tooltip>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          位置
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space wrap>
            <Tooltip title="上方" placement="top">
              <Button>top</Button>
            </Tooltip>
            <Tooltip title="下方" placement="bottom">
              <Button>bottom</Button>
            </Tooltip>
            <Tooltip title="左侧" placement="left">
              <Button>left</Button>
            </Tooltip>
            <Tooltip title="右侧" placement="right">
              <Button>right</Button>
            </Tooltip>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          颜色（color）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space wrap>
            <Tooltip title="默认深色" color="#000">
              <Button>默认</Button>
            </Tooltip>
            <Tooltip title="主色气泡" color="blue">
              <Button>blue</Button>
            </Tooltip>
            <Tooltip title="成功色" color="green">
              <Button>green</Button>
            </Tooltip>
            <Tooltip title="警告色" color="orange">
              <Button>orange</Button>
            </Tooltip>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          包裹图标
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space wrap>
            <Tooltip title="搜索">
              <span style={{ cursor: 'pointer' }}><VcIcon type="search" /></span>
            </Tooltip>
            <Tooltip title="设置">
              <span style={{ cursor: 'pointer' }}><VcIcon type="setting" /></span>
            </Tooltip>
            <Tooltip title="帮助">
              <span style={{ cursor: 'pointer' }}><VcIcon type="question" /></span>
            </Tooltip>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          无箭头
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Tooltip title="不显示箭头" arrow={false}>
            <Button>arrow=false</Button>
          </Tooltip>
        </div>
      </section>
    </>
  );
}
