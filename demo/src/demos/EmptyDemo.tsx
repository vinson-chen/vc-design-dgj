import React from 'react';
import { vcTokens } from 'vc-design';

interface EmptyDemoProps {
  componentName: string;
}

export default function EmptyDemo({ componentName }: EmptyDemoProps) {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>{componentName}</h1>
      <div
        style={{
          padding: 48,
          textAlign: 'center',
          background: vcTokens.color.neutral.background.layout,
          borderRadius: vcTokens.style.borderRadius.lg,
          color: vcTokens.color.neutral.text.description,
        }}
      >
        暂无演示，后续补充。
      </div>
    </>
  );
}
