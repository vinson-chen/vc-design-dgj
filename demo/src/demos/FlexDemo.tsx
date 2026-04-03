import React from 'react';
import { Flex, Button, vcTokens } from 'vc-design';

export default function FlexDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Flex 弹性布局</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        用于对齐的弹性布局容器，可设置间距与水平/垂直对齐。规范见 docs/flex-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本布局
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Flex>
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Flex>
          <Flex style={{ marginTop: 16 }} vertical>
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Flex>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          对齐方式（justify / align）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Flex>
          <Flex justify="center" gap="middle" style={{ marginBottom: 16 }}>
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Flex>
          <Flex justify="flex-end" align="flex-end">
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Flex>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          设置间隙（gap）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Flex gap="small" style={{ marginBottom: 16 }}>
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Flex>
          <Flex gap="middle" style={{ marginBottom: 16 }}>
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Flex>
          <Flex gap="large">
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="dashed">Dashed</Button>
            <Button type="link">Link</Button>
          </Flex>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          自动换行（wrap）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Flex wrap="wrap" gap="small">
            {Array.from({ length: 24 }, (_, i) => (
              <Button key={i}>Button</Button>
            ))}
          </Flex>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          组合使用（嵌套）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Flex vertical gap={16}>
            <Flex justify="space-between" align="center">
              <span style={{ color: vcTokens.color.neutral.text.default, fontWeight: 500 }}>
                Title
              </span>
              <Button type="primary" size="small">
                Action
              </Button>
            </Flex>
            <p style={{ margin: 0, color: vcTokens.color.neutral.text.description, fontSize: 14 }}>
              antd is an enterprise-class UI design language and React UI library.
            </p>
            <Flex gap="small">
              <Button>Cancel</Button>
              <Button type="primary">OK</Button>
            </Flex>
          </Flex>
        </div>
      </section>
    </>
  );
}
