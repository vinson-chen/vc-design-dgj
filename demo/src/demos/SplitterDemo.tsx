import React, { useState } from 'react';
import { Splitter, vcTokens } from 'vc-design';

export default function SplitterDemo() {
  const [sizes, setSizes] = useState<number[]>([]);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Splitter 分隔面板</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        自由切分区域，支持水平/垂直、拖拽调整、min/max、可折叠。子元素仅支持 Splitter.Panel。规范见 docs/splitter-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本用法
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Splitter style={{ height: 200 }}>
            <Splitter.Panel defaultSize="30%" min="100px" max="70%">
              <div
                style={{
                  height: '100%',
                  padding: 16,
                  background: vcTokens.color.neutral.background.container,
                  borderRadius: vcTokens.style.borderRadius.sm,
                  color: vcTokens.color.neutral.text.label,
                }}
              >
                First
              </div>
            </Splitter.Panel>
            <Splitter.Panel defaultSize="70%" min="200px">
              <div
                style={{
                  height: '100%',
                  padding: 16,
                  background: vcTokens.color.neutral.background.elevated,
                  borderRadius: vcTokens.style.borderRadius.sm,
                  color: vcTokens.color.neutral.text.label,
                }}
              >
                Second
              </div>
            </Splitter.Panel>
          </Splitter>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          垂直方向
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Splitter layout="vertical" style={{ height: 200 }}>
            <Splitter.Panel defaultSize="40%" min="60px">
              <div
                style={{
                  height: '100%',
                  padding: 16,
                  background: vcTokens.color.neutral.background.container,
                  borderRadius: vcTokens.style.borderRadius.sm,
                  color: vcTokens.color.neutral.text.label,
                }}
              >
                First
              </div>
            </Splitter.Panel>
            <Splitter.Panel defaultSize="60%" min="80px">
              <div
                style={{
                  height: '100%',
                  padding: 16,
                  background: vcTokens.color.neutral.background.elevated,
                  borderRadius: vcTokens.style.borderRadius.sm,
                  color: vcTokens.color.neutral.text.label,
                }}
              >
                Second
              </div>
            </Splitter.Panel>
          </Splitter>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          可折叠（collapsible）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Splitter style={{ height: 200 }}>
            <Splitter.Panel defaultSize="30%" min="80px" max="60%" collapsible>
              <div
                style={{
                  height: '100%',
                  padding: 16,
                  background: vcTokens.color.neutral.background.container,
                  borderRadius: vcTokens.style.borderRadius.sm,
                  color: vcTokens.color.neutral.text.label,
                }}
              >
                First
              </div>
            </Splitter.Panel>
            <Splitter.Panel defaultSize="70%" min="200px">
              <div
                style={{
                  height: '100%',
                  padding: 16,
                  background: vcTokens.color.neutral.background.elevated,
                  borderRadius: vcTokens.style.borderRadius.sm,
                  color: vcTokens.color.neutral.text.label,
                }}
              >
                Second
              </div>
            </Splitter.Panel>
          </Splitter>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          多面板
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Splitter style={{ height: 200 }}>
            <Splitter.Panel defaultSize="25%" min="80px">
              <div
                style={{
                  height: '100%',
                  padding: 16,
                  background: vcTokens.color.neutral.background.container,
                  borderRadius: vcTokens.style.borderRadius.sm,
                  color: vcTokens.color.neutral.text.label,
                }}
              >
                Panel 1
              </div>
            </Splitter.Panel>
            <Splitter.Panel defaultSize="50%" min="80px">
              <div
                style={{
                  height: '100%',
                  padding: 16,
                  background: vcTokens.color.neutral.background.elevated,
                  borderRadius: vcTokens.style.borderRadius.sm,
                  color: vcTokens.color.neutral.text.label,
                }}
              >
                Panel 2
              </div>
            </Splitter.Panel>
            <Splitter.Panel defaultSize="25%" min="80px">
              <div
                style={{
                  height: '100%',
                  padding: 16,
                  background: vcTokens.color.neutral.background.container,
                  borderRadius: vcTokens.style.borderRadius.sm,
                  color: vcTokens.color.neutral.text.label,
                }}
              >
                Panel 3
              </div>
            </Splitter.Panel>
          </Splitter>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          受控模式
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Splitter
            style={{ height: 200 }}
            onResize={(s) => setSizes(s)}
          >
            <Splitter.Panel size={sizes.length === 2 ? sizes[0] : undefined} defaultSize="50%" min="100px" max="80%">
              <div
                style={{
                  height: '100%',
                  padding: 16,
                  background: vcTokens.color.neutral.background.container,
                  borderRadius: vcTokens.style.borderRadius.sm,
                  color: vcTokens.color.neutral.text.label,
                }}
              >
                First
              </div>
            </Splitter.Panel>
            <Splitter.Panel size={sizes.length === 2 ? sizes[1] : undefined} defaultSize="50%" min="100px">
              <div
                style={{
                  height: '100%',
                  padding: 16,
                  background: vcTokens.color.neutral.background.elevated,
                  borderRadius: vcTokens.style.borderRadius.sm,
                  color: vcTokens.color.neutral.text.label,
                }}
              >
                Second
              </div>
            </Splitter.Panel>
          </Splitter>
          {sizes.length === 2 && (
            <p style={{ marginTop: 12, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
              当前比例: {Math.round(sizes[0])}% / {Math.round(sizes[1])}%
            </p>
          )}
        </div>
      </section>
    </>
  );
}
