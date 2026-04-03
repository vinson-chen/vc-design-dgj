import React from 'react';
import { Badge, Space, Avatar, VcIcon, vcTokens } from 'vc-design';

const imgUrl =
  'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png';

export default function BadgeDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Badge 徽标数</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        图标或头像右上角的徽标数字或状态点。规范见 docs/badge-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本与封顶
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="large" wrap>
            <Badge count={5}>
              <span style={{ padding: 8, background: vcTokens.color.neutral.background.container, borderRadius: 4 }}>
                <VcIcon type="mail" />
              </span>
            </Badge>
            <Badge count={0} showZero>
              <span style={{ padding: 8, background: vcTokens.color.neutral.background.container, borderRadius: 4 }}>
                <VcIcon type="mail" />
              </span>
            </Badge>
            <Badge count={100} overflowCount={99}>
              <span style={{ padding: 8, background: vcTokens.color.neutral.background.container, borderRadius: 4 }}>
                <VcIcon type="mail" />
              </span>
            </Badge>
            <Badge count={1000} overflowCount={999}>
              <span style={{ padding: 8, background: vcTokens.color.neutral.background.container, borderRadius: 4 }}>
                <VcIcon type="mail" />
              </span>
            </Badge>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          小红点与头像
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="large" wrap>
            <Badge dot>
              <VcIcon type="mail" style={{ fontSize: 20 }} />
            </Badge>
            <Badge count={3}>
              <Avatar src={imgUrl} alt="头像" />
            </Badge>
            <Badge dot status="processing">
              <Avatar icon={<VcIcon type="user" />} />
            </Badge>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          状态点
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="middle" wrap>
            <Badge status="success" text="成功" />
            <Badge status="error" text="失败" />
            <Badge status="default" text="默认" />
            <Badge status="processing" text="进行中" />
            <Badge status="warning" text="警告" />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          大小与颜色
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="large" wrap>
            <Badge count={5} size="small">
              <Avatar shape="square" icon={<VcIcon type="user" />} />
            </Badge>
            <Badge count={5} size="medium">
              <Avatar shape="square" icon={<VcIcon type="user" />} />
            </Badge>
            <Badge count={5} color={vcTokens.color.primary.default}>
              <Avatar shape="square" icon={<VcIcon type="user" />} />
            </Badge>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          Badge.Ribbon
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="middle" wrap>
            <Badge.Ribbon text="徽标">
              <div
                style={{
                  width: 200,
                  padding: 16,
                  background: vcTokens.color.neutral.background.container,
                  borderRadius: vcTokens.style.borderRadius.md,
                  border: `1px solid ${vcTokens.color.neutral.border.default}`,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>卡片</div>
                内容区域
              </div>
            </Badge.Ribbon>
            <Badge.Ribbon text="缎带" color={vcTokens.color.primary.default} placement="start">
              <div
                style={{
                  width: 200,
                  padding: 16,
                  background: vcTokens.color.neutral.background.container,
                  borderRadius: vcTokens.style.borderRadius.md,
                  border: `1px solid ${vcTokens.color.neutral.border.default}`,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>卡片</div>
                内容区域
              </div>
            </Badge.Ribbon>
          </Space>
        </div>
      </section>
    </>
  );
}
