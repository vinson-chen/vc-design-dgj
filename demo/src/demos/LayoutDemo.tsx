import React, { useState } from 'react';
import { Layout, Button, vcTokens } from 'vc-design';
import { Menu } from 'antd';

const { Header, Sider, Content, Footer } = Layout;

const sideMenuItems = [
  { key: '1', label: 'nav 1' },
  { key: '2', label: 'nav 2' },
  { key: '3', label: 'nav 3' },
];

export default function LayoutDemo() {
  const [collapsed, setCollapsed] = useState(false);
  const [customCollapsed, setCustomCollapsed] = useState(false);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Layout 布局</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        页面级整体布局，支持 Header、Sider、Content、Footer 组合。规范见 docs/layout-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本结构
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            overflow: 'hidden',
          }}
        >
          <Layout>
            <Header style={{ color: vcTokens.color.neutral.text.solid }}>
              Header
            </Header>
            <Layout>
              <Sider theme="light" width={200}>
                <div style={{ padding: 16, color: vcTokens.color.neutral.text.label }}>
                  left sidebar
                </div>
              </Sider>
              <Content style={{ padding: 24, minHeight: 120, background: vcTokens.color.neutral.background.container }}>
                main content
              </Content>
              <Sider theme="light" width={200}>
                <div style={{ padding: 16, color: vcTokens.color.neutral.text.label }}>
                  right sidebar
                </div>
              </Sider>
            </Layout>
            <Footer style={{ textAlign: 'center' }}>Footer</Footer>
          </Layout>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          上中下布局
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            overflow: 'hidden',
          }}
        >
          <Layout>
            <Header style={{ color: vcTokens.color.neutral.text.solid }}>Header</Header>
            <Content style={{ padding: 24, minHeight: 120, background: vcTokens.color.neutral.background.container }}>
              Content
            </Content>
            <Footer style={{ textAlign: 'center' }}>Footer</Footer>
          </Layout>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          侧边布局（可收起）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            overflow: 'hidden',
          }}
        >
          <Layout style={{ minHeight: 200 }}>
            <Sider
              theme="light"
              collapsible
              collapsed={collapsed}
              onCollapse={setCollapsed}
            >
              <Menu mode="inline" items={sideMenuItems} style={{ borderRight: 0 }} />
            </Sider>
            <Layout>
              <Header style={{ background: vcTokens.color.neutral.background.container, padding: '0 24px' }}>
                Header
              </Header>
              <Content style={{ padding: 24, background: vcTokens.color.neutral.background.container }}>
                Content
              </Content>
            </Layout>
          </Layout>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          自定义触发器
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            overflow: 'hidden',
          }}
        >
          <Layout style={{ minHeight: 160 }}>
            <Sider
              theme="light"
              collapsible
              collapsed={customCollapsed}
              onCollapse={setCustomCollapsed}
              trigger={null}
            >
              <Menu mode="inline" items={sideMenuItems} style={{ borderRight: 0 }} />
            </Sider>
            <Layout>
              <Header style={{ background: vcTokens.color.neutral.background.container, padding: '0 24px', display: 'flex', alignItems: 'center' }}>
                <Button type="text" onClick={() => setCustomCollapsed(!customCollapsed)}>
                  {customCollapsed ? '展开' : '收起'}
                </Button>
              </Header>
              <Content style={{ padding: 24, background: vcTokens.color.neutral.background.container }}>
                content
              </Content>
            </Layout>
          </Layout>
        </div>
      </section>
    </>
  );
}
