import React from 'react';
import { Timeline, vcTokens, VcIcon } from 'vc-design';

const items = [
  {
    title: '2024-01-01 创建项目',
    content: '项目初始化完成，仓库与基础配置就绪。',
    color: 'green',
  },
  {
    title: '2024-02-15 设计评审',
    content: '组件规范与 Token 体系评审通过。',
    color: 'blue',
  },
  {
    title: '2024-03-01 开发中',
    content: '核心组件开发与 Demo 搭建进行中。',
    color: 'blue',
    loading: true,
  },
  {
    title: '待发布',
    content: '版本发布与文档收尾。',
    color: 'gray',
  },
];

const itemsWithIcon = [
  {
    title: '开始',
    content: '流程开始节点。',
    color: 'green',
    icon: <VcIcon type="check-circle" />,
  },
  {
    title: '进行中',
    content: '当前处理中的步骤。',
    color: 'blue',
    icon: <VcIcon type="clock" />,
  },
  {
    title: '异常',
    content: '需关注或重试的节点。',
    color: 'red',
    icon: <VcIcon type="info" />,
  },
];

export default function TimelineDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Timeline 时间轴</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        垂直或水平展示时间流、流程步骤，支持颜色与自定义图标。规范见 docs/timeline-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本（垂直）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Timeline items={items} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          左右交替（alternate）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Timeline mode="alternate" items={items.slice(0, 3)} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          自定义图标
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Timeline items={itemsWithIcon} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          使用 Timeline.Item 子组件
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Timeline>
            <Timeline.Item color="green" title="已完成" content="第一步已完成" />
            <Timeline.Item color="blue" title="进行中" content="第二步进行中" />
            <Timeline.Item color="gray" title="待开始" content="第三步待开始" />
          </Timeline>
        </div>
      </section>
    </>
  );
}
