import React from 'react';
import { Watermark, Card, vcTokens } from 'vc-design';

export default function WatermarkDemo() {
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
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Watermark 水印</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        在页面或容器上添加文字/图片水印，常用于环境标识与防泄露。规范见 docs/watermark-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>基本文字水印</h2>
        <div style={sectionStyle}>
          <Watermark content="内部测试">
            <div
              style={{
                height: 180,
                background: '#fff',
                borderRadius: vcTokens.style.borderRadius.md,
                padding: 24,
              }}
            >
              <p style={{ margin: 0, color: vcTokens.color.neutral.text.description }}>
                该区域内容将叠加「内部测试」文字水印。
              </p>
            </div>
          </Watermark>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>多行文本与字体配置</h2>
        <div style={sectionStyle}>
          <Watermark
            content={['仅供内部使用', 'Do Not Share']}
            font={{
              color: 'rgba(0,0,0,0.08)',
              fontSize: 16,
              fontWeight: 500,
            }}
            gap={[120, 120]}
            rotate={-22}
          >
            <div
              style={{
                height: 200,
                background: '#fff',
                borderRadius: vcTokens.style.borderRadius.md,
                padding: 24,
              }}
            >
              <p style={{ margin: 0, color: vcTokens.color.neutral.text.description }}>
                多行文本水印，适用于强调保密的预览页面。
              </p>
            </div>
          </Watermark>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>调整间距与偏移</h2>
        <div style={sectionStyle}>
          <Watermark
            content="VC"
            gap={[80, 80]}
            offset={[40, 40]}
            rotate={-30}
          >
            <div
              style={{
                height: 180,
                background: '#fff',
                borderRadius: vcTokens.style.borderRadius.md,
                padding: 24,
              }}
            >
              <p style={{ margin: 0, color: vcTokens.color.neutral.text.description }}>
                通过 gap 与 offset 控制水印密度与起始位置。
              </p>
            </div>
          </Watermark>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>作为页面背景水印</h2>
        <div style={sectionStyle}>
          <Watermark content="Demo Environment" zIndex={1}>
            <Card
              title="页面区块"
              size="small"
              style={{
                minHeight: 160,
              }}
            >
              <p style={{ color: vcTokens.color.neutral.text.description }}>
                整个 Card 区域都叠加了水印，适合场景环境标识。
              </p>
            </Card>
          </Watermark>
        </div>
      </section>
    </>
  );
}

