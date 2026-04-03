import React from 'react';
import { vcTokens } from 'vc-design';

export default function Overview() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>组件总览</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        vc-design 基于 Ant Design 5.x，通过 VC Tokens（vcTokens）统一颜色、间距、圆角与字体。左侧导航可切换到不同组件进行规范检验。
      </p>
      <div
        style={{
          background: vcTokens.color.neutral.background.layout,
          borderRadius: vcTokens.style.borderRadius.lg,
          padding: 24,
          fontSize: 14,
          color: vcTokens.color.neutral.text.default,
        }}
      >
        <p style={{ margin: '0 0 12px 0' }}>
          <strong>通用</strong>：Button、FloatButton、Icon、Typography
        </p>
        <p style={{ margin: '0 0 12px 0' }}>
          <strong>布局</strong>：Divider、Flex、Grid、Layout、Space、Splitter
        </p>
        <p style={{ margin: '0 0 12px 0' }}>
          <strong>导航</strong>：Anchor、Breadcrumb、Dropdown、Menu、Pagination、Steps、Tabs
        </p>
        <p style={{ margin: '0 0 12px 0' }}>
          <strong>数据录入 / 数据展示 / 反馈 / 其他</strong>：与 Ant Design 组件分类一致，可点击左侧菜单查看各组件演示（未实现的组件显示「暂无演示」）。
        </p>
      </div>
    </>
  );
}
