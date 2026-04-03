import React from 'react';
import { Breadcrumb, VcIcon, vcTokens } from 'vc-design';

const menuItems = [
  { key: '1', label: 'General' },
  { key: '2', label: 'Layout' },
  { key: '3', label: 'Navigation' },
];

export default function BreadcrumbDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Breadcrumb 面包屑</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        显示当前页面在层级结构中的位置，支持链接、下拉与自定义分隔符。规范见 docs/breadcrumb-spec.md。
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
          <Breadcrumb
            items={[
              { title: '首页', href: '#' },
              { title: '应用', href: '#' },
              { title: '列表' },
            ]}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          自定义分隔符
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Breadcrumb
            separator=">"
            items={[
              { title: '首页', href: '#' },
              { title: '应用', href: '#' },
              { title: '列表' },
            ]}
          />
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
          <Breadcrumb
            items={[
              {
                title: (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <VcIcon type="home" fontSize={14} />
                    首页
                  </span>
                ),
                href: '#',
              },
              {
                title: (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <VcIcon type="menu-application" fontSize={14} />
                    应用
                  </span>
                ),
                href: '#',
              },
              {
                title: (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <VcIcon type="file-1" fontSize={14} />
                    列表
                  </span>
                ),
              },
            ]}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带下拉菜单
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Breadcrumb
            items={[
              { title: '首页', href: '#' },
              {
                title: '应用',
                menu: { items: menuItems },
              },
              { title: '列表' },
            ]}
          />
        </div>
      </section>
    </>
  );
}
