import React, { useState } from 'react';
import { Tag, Space, vcTokens, VcIcon } from 'vc-design';

export default function TagDemo() {
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Tag 标签</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        用于标记和分类的标签，支持多种颜色、可关闭与图标。规范见 docs/tag-spec.md。
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
          <Space size="small" wrap>
            <Tag>默认</Tag>
            <Tag color="primary">主色</Tag>
            <Tag color="success">成功</Tag>
            <Tag color="processing">进行中</Tag>
            <Tag color="error">错误</Tag>
            <Tag color="warning">警告</Tag>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          描边（outlined）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="small" wrap>
            <Tag variant="outlined">默认</Tag>
            <Tag variant="outlined" color="primary">主色</Tag>
            <Tag variant="outlined" color="success">成功</Tag>
            <Tag variant="outlined" color="error">错误</Tag>
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
          <Space size="small" wrap>
            {!closed.a && (
              <Tag closable onClose={() => setClosed((c) => ({ ...c, a: true }))}>
                可关闭
              </Tag>
            )}
            {!closed.b && (
              <Tag color="primary" closable onClose={() => setClosed((c) => ({ ...c, b: true }))}>
                主色可关闭
              </Tag>
            )}
            {!closed.c && (
              <Tag closable closeIcon={<VcIcon type="close" />} onClose={() => setClosed((c) => ({ ...c, c: true }))}>
                自定义关闭图标
              </Tag>
            )}
          </Space>
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
          <Space size="small" wrap>
            <Tag icon={<VcIcon type="check" />}>完成</Tag>
            <Tag color="primary" icon={<VcIcon type="info" />}>提示</Tag>
            <Tag color="success" icon={<VcIcon type="check-circle" />}>已通过</Tag>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          禁用与链接
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="small" wrap>
            <Tag disabled>禁用</Tag>
            <Tag href="https://ant.design" target="_blank">链接标签</Tag>
          </Space>
        </div>
      </section>
    </>
  );
}
