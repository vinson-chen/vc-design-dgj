import React, { useState } from 'react';
import { Typography, VcIcon, vcTokens } from 'vc-design';

const { Title, Text, Paragraph, Link } = Typography;

export default function TypographyDemo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Typography 排版</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        文本与标题的基本格式，支持可编辑、可复制、省略号等。字体与颜色由 vcTokens 统一。规范见 docs/typography-spec.md。
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
          <Title level={1}>h1. vc-design</Title>
          <Title level={2}>h2. vc-design</Title>
          <Title level={3}>h3. vc-design</Title>
          <Title level={4}>h4. vc-design</Title>
          <Title level={5}>h5. vc-design</Title>
          <Paragraph>
            Ant Design, a design language for background applications, is refined by Ant UED Team.
            Ant Design, a design language for background applications, is refined by Ant UED Team.
          </Paragraph>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          标题组件
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Title>Ant Design (default)</Title>
          <Title type="secondary">Ant Design (secondary)</Title>
          <Title type="success">Ant Design (success)</Title>
          <Title type="warning">Ant Design (warning)</Title>
          <Title type="danger">Ant Design (danger)</Title>
          <Title disabled>Ant Design (disabled)</Title>
          <Text mark>Ant Design (mark)</Text>
          <br />
          <Text code>Ant Design (code)</Text>
          <br />
          <Text keyboard>Ant Design (keyboard)</Text>
          <br />
          <Text underline>Ant Design (underline)</Text>
          <br />
          <Text delete>Ant Design (delete)</Text>
          <br />
          <Text strong>Ant Design (strong)</Text>
          <br />
          <Text italic>Ant Design (italic)</Text>
          <br />
          <Link href="https://5x.ant.design/components/typography-cn" target="_blank">
            Ant Design (Link)
          </Link>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          可复制
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Paragraph copyable>This is a copyable text.</Paragraph>
          <Paragraph
            copyable={{
              text: 'Replace copy text.',
              tooltips: ['复制', '已复制'],
            }}
          >
            Replace copy text.
          </Paragraph>
          <Paragraph
            copyable={{
              icon: [<VcIcon key="copy" type="copy" />, <VcIcon key="check" type="check" />],
              tooltips: ['复制', '已复制'],
            }}
          >
            Custom Copy icon (VcIcon).
          </Paragraph>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          可编辑
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Paragraph
            editable={{
              icon: <VcIcon type="edit" />,
              tooltip: '编辑',
              enterIcon: <VcIcon type="check" />,
            }}
          >
            This is an editable text with VcIcon.
          </Paragraph>
          <Paragraph editable>Click icon to edit (default icon).</Paragraph>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          省略号
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Paragraph
            ellipsis={{
              rows: 3,
              expandable: true,
              symbol: expanded ? '收起' : '展开',
              onExpand: (_, info) => setExpanded(info.expanded),
            }}
          >
            Ant Design, a design language for background applications, is refined by Ant UED Team.
            Ant Design, a design language for background applications, is refined by Ant UED Team.
            Ant Design, a design language for background applications, is refined by Ant UED Team.
            Ant Design, a design language for background applications, is refined by Ant UED Team.
            Ant Design, a design language for background applications, is refined by Ant UED Team.
            Ant Design, a design language for background applications, is refined by Ant UED Team.
          </Paragraph>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          省略（多行 + 后缀）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Paragraph
            ellipsis={{
              rows: 2,
              suffix: '-- more',
            }}
          >
            Ant Design, a design language for background applications, is refined by Ant UED Team.
            Ant Design, a design language for background applications, is refined by Ant UED Team.
            Ant Design, a design language for background applications, is refined by Ant UED Team.
          </Paragraph>
        </div>
      </section>
    </>
  );
}
