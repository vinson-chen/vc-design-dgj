import React, { useRef, useState } from 'react';
import { Tour, Button, Space, vcTokens, VcIcon } from 'vc-design';

export default function TourDemo() {
  const [open, setOpen] = useState(false);
  const ref1 = useRef<HTMLButtonElement>(null);
  const ref2 = useRef<HTMLButtonElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);

  const steps = [
    {
      title: '第一步',
      description: '这是引导的第一步，高亮「开始」按钮。点击下一步继续。',
      target: () => ref1.current!,
      placement: 'bottom' as const,
    },
    {
      title: '第二步',
      description: '第二步高亮中间按钮，用于演示多步骤引导。',
      target: () => ref2.current!,
      placement: 'bottom' as const,
    },
    {
      title: '第三步',
      description: '最后一步高亮右侧区域，完成后可关闭引导。',
      target: () => ref3.current!,
      placement: 'top' as const,
    },
  ];

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Tour 漫游式引导</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        分步高亮页面元素并展示说明，适用于新功能引导与关键操作说明。规范见 docs/tour-spec.md。
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
            minHeight: 200,
          }}
        >
          <Space wrap align="center" style={{ marginBottom: 24 }}>
            <Button ref={ref1} type="primary">
              开始
            </Button>
            <Button ref={ref2}>中间步骤</Button>
            <div
              ref={ref3}
              style={{
                padding: '8px 16px',
                background: vcTokens.color.neutral.fill.tertiary,
                borderRadius: vcTokens.style.borderRadius.sm,
                display: 'inline-block',
              }}
            >
              目标区域
            </div>
          </Space>
          <div>
            <Button type="primary" onClick={() => setOpen(true)} icon={<VcIcon type="play" />}>
              开始引导
            </Button>
          </div>
          <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          主色类型（type="primary"）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 12 }}>
            设置 <code>type="primary"</code> 后，引导气泡与按钮使用主色强调。
          </p>
          <Tour
            open={false}
            type="primary"
            steps={[
              {
                title: '主色引导',
                description: '此步骤使用 primary 类型样式。',
                target: null,
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
