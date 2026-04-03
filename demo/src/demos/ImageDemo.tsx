import React from 'react';
import { Image, Space, vcTokens } from 'vc-design';

const imgUrl = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';
const imgUrl2 = 'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp';
const imgUrl3 = 'https://gw.alipayobjects.com/zos/antfincdn/D%26R%26K%20-%20Pic.jpg';

export default function ImageDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Image 图片</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        可预览的图片展示，支持占位、容错与多图预览。规范见 docs/image-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本与预览
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="middle" wrap>
            <Image width={120} src={imgUrl} alt="示例图" />
            <Image width={120} src={imgUrl} alt="禁用预览" preview={false} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          占位与尺寸
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="middle" wrap>
            <Image width={120} height={80} src={imgUrl} placeholder alt="占位" />
            <Image width={160} src={imgUrl2} alt="示例" />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          多图预览（PreviewGroup）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Image.PreviewGroup>
            <Space size="middle" wrap>
              <Image width={120} src={imgUrl} alt="1" />
              <Image width={120} src={imgUrl2} alt="2" />
              <Image width={120} src={imgUrl3} alt="3" />
            </Space>
          </Image.PreviewGroup>
          <p style={{ marginTop: 12, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            点击任意一张可在预览中左右切换
          </p>
        </div>
      </section>
    </>
  );
}
