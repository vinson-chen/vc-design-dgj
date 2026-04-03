import React, { useState } from 'react';
import type { UploadFile } from 'antd';
import { Upload, Button, Space, VcIcon, vcTokens } from 'vc-design';

export default function UploadDemo() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Upload 上传</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        文件选择上传与拖拽上传，支持列表样式与自定义。规范见 docs/upload-spec.md。
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
          <Upload
            fileList={fileList}
            onChange={({ fileList: next }) => setFileList(next)}
            beforeUpload={() => false}
          >
            <Button icon={<VcIcon type="upload" />}>选择文件</Button>
          </Upload>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          拖拽与图片列表
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Upload.Dragger
              multiple
              beforeUpload={() => false}
              fileList={[]}
            >
              <p>点击或拖拽文件到此区域上传</p>
            </Upload.Dragger>
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              maxCount={4}
            />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          限制与禁用
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button>最多 1 个</Button>
            </Upload>
            <Upload beforeUpload={() => false} disabled>
              <Button disabled>禁用</Button>
            </Upload>
          </Space>
        </div>
      </section>
    </>
  );
}
