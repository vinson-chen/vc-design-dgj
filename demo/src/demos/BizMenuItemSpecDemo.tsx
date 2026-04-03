import React from 'react';
import { Space, vcTokens } from 'vc-design';
import { BizMenuItem } from 'vc-biz';

export default function BizMenuItemSpecDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>导航区 · 第一步 .menu_item 规范</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 16 }}>
        left 用于展开导航（small:false），center 用于收起导航（small:true）。
      </p>
      <div
        style={{
          background: vcTokens.color.menu.navBackground,
          borderRadius: 8,
          padding: 16,
          display: 'grid',
          gap: 16,
        }}
      >
        <section>
          <h3 style={{ color: vcTokens.color.neutral.text.solid, margin: '0 0 8px' }}>
            left（展开）
          </h3>
          <Space wrap size={8}>
            <BizMenuItem dark align="left" state="default" label="导航名称" />
            <BizMenuItem dark align="left" state="hover" label="导航名称" />
            <BizMenuItem dark align="left" state="active" label="导航名称" />
          </Space>
        </section>
        <section>
          <h3 style={{ color: vcTokens.color.neutral.text.solid, margin: '0 0 8px' }}>
            center（收起）
          </h3>
          <Space wrap size={8}>
            <BizMenuItem dark align="center" state="default" label="导航" />
            <BizMenuItem dark align="center" state="hover" label="导航" />
            <BizMenuItem dark align="center" state="active" label="导航" />
          </Space>
        </section>
      </div>
    </>
  );
}
