import React, { useState } from 'react';
import { Spin, Button, Card, vcTokens } from 'vc-design';

export default function SpinDemo() {
  const [loading, setLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

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
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Spin 加载中</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        表示区域或全局的加载状态，可单独使用或包裹内容。规范见 docs/spin-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>基本</h2>
        <div style={sectionStyle}>
          <Spin />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>尺寸</h2>
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <Spin size="small" />
            <Spin size="default" />
            <Spin size="large" />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>带说明文字</h2>
        <div style={sectionStyle}>
          <Spin description="加载中…" />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>包裹内容</h2>
        <div style={sectionStyle}>
          <Spin spinning={loading}>
            <Card title="卡片标题" size="small" style={{ maxWidth: 400 }}>
              <p style={{ color: vcTokens.color.neutral.text.description }}>
                这里是卡片内容。点击下方按钮切换加载状态。
              </p>
            </Card>
          </Spin>
          <Button
            type="primary"
            size="small"
            style={{ marginTop: 16 }}
            onClick={() => setLoading(!loading)}
          >
            {loading ? '停止加载' : '开始加载'}
          </Button>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>延迟显示（delay）</h2>
        <div style={sectionStyle}>
          <Spin spinning={loading} delay={500} description="延迟 500ms 显示">
            <div
              style={{
                padding: 24,
                background: vcTokens.color.neutral.fill.tertiary,
                borderRadius: vcTokens.style.borderRadius.sm,
                minHeight: 80,
              }}
            >
              内容区域
            </div>
          </Spin>
          <Button
            size="small"
            style={{ marginTop: 16 }}
            onClick={() => setLoading(!loading)}
          >
            切换加载（delay 500ms）
          </Button>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>全屏（fullscreen）</h2>
        <div style={sectionStyle}>
          <Button
            onClick={() => {
              setFullscreen(true);
              setTimeout(() => setFullscreen(false), 2000);
            }}
          >
            打开全屏加载（2 秒后自动关闭）
          </Button>
          <Spin fullscreen spinning={fullscreen} description="加载中…" />
        </div>
      </section>
    </>
  );
}
