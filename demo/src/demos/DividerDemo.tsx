import React from 'react';
import { Divider, Typography, vcTokens } from 'vc-design';

const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt a te dicta? Refert tamen, quo modo.';

export default function DividerDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Divider 分割线</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        区隔内容的分割线，支持水平/垂直、带文字、间距大小与变体（实线/虚线/点线）。规范见 docs/divider-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          水平分割线
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
          <Divider />
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
          <Divider />
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带文字的分割线
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
          <Divider>Text</Divider>
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
          <Divider orientation="start">Left Text</Divider>
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
          <Divider orientation="end">Right Text</Divider>
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          设置分割线的间距大小（size）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
          <Divider size="small" />
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>small</p>
          <Divider size="middle" />
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>middle</p>
          <Divider size="large" />
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>large</p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          分割文字使用正文样式（plain）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
          <Divider plain>Solid</Divider>
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
          <Divider plain variant="dotted">Dotted</Divider>
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
          <Divider plain variant="dashed">Dashed</Divider>
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          垂直分割线
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <span style={{ color: vcTokens.color.neutral.text.default }}>Text</span>
          <Divider type="vertical" />
          <Typography.Link href="#">Link</Typography.Link>
          <Divider type="vertical" />
          <Typography.Link href="#">Link</Typography.Link>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          变体（variant）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
          <Divider>Solid</Divider>
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
          <Divider variant="dashed">Dashed</Divider>
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
          <Divider variant="dotted">Dotted</Divider>
          <p style={{ margin: 0, color: vcTokens.color.neutral.text.default }}>{lorem}</p>
        </div>
      </section>
    </>
  );
}
