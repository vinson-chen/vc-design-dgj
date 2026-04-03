import React, { useState } from 'react';
import { Skeleton, Button, Card, vcTokens } from 'vc-design';

export default function SkeletonDemo() {
  const [loading, setLoading] = useState(true);

  const sectionStyle = {
    background: vcTokens.color.neutral.background.layout,
    borderRadius: vcTokens.style.borderRadius.lg,
    padding: 24,
  };
  const h2Style = {
    fontSize: 16,
    marginBottom: 12,
    color: vcTokens.color.neutral.text.label,
  };

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Skeleton 骨架屏</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        内容加载时的占位展示，减少布局跳动。规范见 docs/skeleton-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>基本</h2>
        <div style={sectionStyle}>
          <Skeleton />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>头像 + 标题 + 段落</h2>
        <div style={sectionStyle}>
          <Skeleton avatar title paragraph />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>开启动画（active）</h2>
        <div style={sectionStyle}>
          <Skeleton avatar title paragraph active />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>loading 包裹真实内容</h2>
        <div style={sectionStyle}>
          <Skeleton loading={loading} avatar title paragraph>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: vcTokens.color.primary.background,
                }}
              />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>标题文案</div>
                <div style={{ color: vcTokens.color.neutral.text.description, fontSize: 14 }}>
                  这里是加载完成后展示的真实内容。
                </div>
              </div>
            </div>
          </Skeleton>
          <Button
            type="primary"
            size="small"
            style={{ marginTop: 16 }}
            onClick={() => setLoading(!loading)}
          >
            {loading ? '显示内容' : '显示骨架'}
          </Button>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>子组件拼装</h2>
        <div style={sectionStyle}>
          <Card size="small" style={{ maxWidth: 360 }}>
            <Skeleton.Avatar size={48} shape="circle" style={{ marginBottom: 12 }} />
            <Skeleton.Input active style={{ width: '100%', marginBottom: 12 }} />
            <Skeleton.Button size="small" style={{ marginRight: 8 }} />
            <Skeleton.Button size="small" />
          </Card>
        </div>
      </section>
    </>
  );
}
