import React from 'react';
import { vcTokens } from 'vc-design';
import { VMenu } from 'vc-biz';

export default function BizMenuLayoutDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>导航区 · 第三步 menu 布局结构</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 16 }}>
        点击右上角图标触发展开收起（small:false / small:true）。
      </p>
      <div
        style={{
          background: vcTokens.color.neutral.background.layout,
          borderRadius: 8,
          border: `1px solid ${vcTokens.color.neutral.border.default}`,
          padding: 16,
          minHeight: 840,
        }}
      >
        <VMenu />
      </div>
    </>
  );
}
