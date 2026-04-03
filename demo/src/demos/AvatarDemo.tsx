import React from 'react';
import { Avatar, Space, VcIcon, vcTokens } from 'vc-design';

const imgUrl =
  'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png';

export default function AvatarDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Avatar 头像</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        代表用户或事物，支持图片、图标或字符。规范见 docs/avatar-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本（尺寸与形状）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="middle" wrap>
            <Avatar size="small">小</Avatar>
            <Avatar size="medium">中</Avatar>
            <Avatar size="large">大</Avatar>
            <Avatar size={56}>56</Avatar>
            <Avatar shape="square" size="medium">方</Avatar>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          类型（图片 / 图标 / 字符）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="middle" wrap>
            <Avatar src={imgUrl} alt="头像" />
            <Avatar icon={<VcIcon type="user" />} />
            <Avatar>U</Avatar>
            <Avatar>张三</Avatar>
            <Avatar style={{ backgroundColor: vcTokens.color.primary.default }}>K</Avatar>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          Avatar.Group
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Avatar.Group max={{ count: 4 }}>
            <Avatar src={imgUrl} />
            <Avatar style={{ backgroundColor: vcTokens.color.primary.default }}>K</Avatar>
            <Avatar icon={<VcIcon type="user" />} />
            <Avatar>A</Avatar>
            <Avatar>B</Avatar>
          </Avatar.Group>
        </div>
      </section>
    </>
  );
}
