import React from 'react';
import { vcTokens } from 'vc-design';
import { VMenu } from 'vc-biz';

export default function BizMenuCaseDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600, fontSize: 18 }}>VMenu 导航区</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        本例演示 <code>VMenu</code> 侧栏导航；后续可在此区补充顶部导航等案例。结构与样式对齐 Figma Menu 实例。
      </p>
      <section style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'inline-block',
            background: vcTokens.color.neutral.background.layout,
            border: `1px solid ${vcTokens.color.neutral.border.default}`,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
            minHeight: 840,
          }}
        >
          <VMenu />
        </div>
      </section>
    </>
  );
}
