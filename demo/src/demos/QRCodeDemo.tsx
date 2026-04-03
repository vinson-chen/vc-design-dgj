import React from 'react';
import { QRCode, Space, vcTokens } from 'vc-design';

const demoValue = 'https://ant.design';
const iconUrl = 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg';

export default function QRCodeDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>QRCode 二维码</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        将文本转换为二维码，支持尺寸、颜色、中心图标与状态。规范见 docs/qrcode-spec.md。
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
          <Space wrap>
            <QRCode value={demoValue} />
            <QRCode value={demoValue} bordered={false} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          尺寸、类型与颜色
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space wrap align="flex-end">
            <QRCode value={demoValue} size={100} />
            <QRCode value={demoValue} size={160} type="svg" />
            <QRCode value={demoValue} color={vcTokens.color.primary.default} bgColor={vcTokens.color.primary.bg} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          中心图标与状态
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space wrap>
            <QRCode value={demoValue} icon={iconUrl} />
            <QRCode value={demoValue} status="expired" />
            <QRCode value={demoValue} status="scanned" />
          </Space>
        </div>
      </section>
    </>
  );
}
