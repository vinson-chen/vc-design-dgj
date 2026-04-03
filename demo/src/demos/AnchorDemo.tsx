import React, { useState } from 'react';
import { Anchor, Flex, vcTokens } from 'vc-design';

const ANCHOR_SCROLL_ID = 'anchor-demo-scroll';

const anchorItems = [
  { key: 'basic', href: '#anchor-basic', title: '基本' },
  { key: 'static', href: '#anchor-static', title: '静态位置' },
  {
    key: 'api',
    href: '#anchor-api',
    title: 'API',
    children: [
      { key: 'api-props', href: '#anchor-api-props', title: 'Anchor Props' },
      { key: 'api-link', href: '#anchor-api-link', title: 'Link Props' },
    ],
  },
];

function Block({ id, title, height = 120 }: { id: string; title: string; height?: number }) {
  return (
    <div
      id={id}
      style={{
        height,
        padding: 16,
        background: vcTokens.color.neutral.background.container,
        borderRadius: vcTokens.style.borderRadius.sm,
        marginBottom: 16,
        border: `1px solid ${vcTokens.color.neutral.border.secondary}`,
      }}
    >
      <strong style={{ color: vcTokens.color.neutral.text.label }}>{title}</strong>
    </div>
  );
}

function getScrollContainer(): HTMLElement {
  return document.getElementById(ANCHOR_SCROLL_ID) || document.body;
}

export default function AnchorDemo() {
  const [activeLink, setActiveLink] = useState('');

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Anchor 锚点</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        用于跳转到页面指定位置，支持垂直/横向、固定/静态、嵌套与 onChange。规范见 docs/anchor-spec.md。
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
          <Flex gap={24} align="flex-start">
            <Anchor
              affix={false}
              items={anchorItems}
              getContainer={getScrollContainer}
              style={{ minWidth: 160 }}
            />
            <div id={ANCHOR_SCROLL_ID} style={{ flex: 1, overflow: 'auto', maxHeight: 320 }}>
              <Block id="anchor-basic" title="Basic demo" />
              <Block id="anchor-static" title="Static demo" />
              <Block id="anchor-api" title="API" height={60} />
              <Block id="anchor-api-props" title="Anchor Props" />
              <Block id="anchor-api-link" title="Link Props" />
            </div>
          </Flex>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          横向 Anchor
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Anchor
            direction="horizontal"
            affix={false}
            getContainer={getScrollContainer}
            items={[
              { key: 'h1', href: '#anchor-basic', title: '基本' },
              { key: 'h2', href: '#anchor-static', title: '静态' },
              { key: 'h3', href: '#anchor-api', title: 'API' },
            ]}
          />
          <p style={{ marginTop: 12, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            点击上方链接将滚动到「基本」示例中的对应区块。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          监听锚点链接改变（onChange）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Flex gap={24} align="flex-start">
            <Anchor
              affix={false}
              items={anchorItems}
              getContainer={getScrollContainer}
              onChange={setActiveLink}
              style={{ minWidth: 160 }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ marginBottom: 12, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
                当前高亮: {activeLink || '-'}
              </p>
              <p style={{ marginBottom: 8, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
                在「基本」示例的右侧区域滚动，或点击左侧锚点，可看到高亮变化。
              </p>
            </div>
          </Flex>
        </div>
      </section>
    </>
  );
}
