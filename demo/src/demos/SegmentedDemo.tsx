import React, { useState } from 'react';
import { Segmented, Space, VcIcon, vcTokens } from 'vc-design';

const simpleOptions = ['列表', '看板', '地图'];
const optionsWithIcon = [
  { label: '列表', value: 'list', icon: <VcIcon type="menu-application" /> },
  { label: '看板', value: 'kanban', icon: <VcIcon type="file-1" /> },
  { label: '地图', value: 'map', icon: <VcIcon type="search" /> },
];

export default function SegmentedDemo() {
  const [value, setValue] = useState<string | number>('列表');

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Segmented 分段控制器</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        多选项单选，支持文字、图标、尺寸与垂直排列。规范见 docs/segmented-spec.md。
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
          <Space direction="vertical" size="middle">
            <Segmented options={simpleOptions} />
            <Segmented options={simpleOptions} defaultValue="看板" onChange={(v) => setValue(v)} />
            <p style={{ margin: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
              当前选中: {String(value)}
            </p>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带图标、尺寸与形状
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle">
            <Segmented options={optionsWithIcon} />
            <Segmented options={simpleOptions} size="small" />
            <Segmented options={simpleOptions} size="large" />
            <Segmented options={simpleOptions} shape="round" />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          垂直与 block
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="large" wrap>
            <Segmented options={simpleOptions} orientation="vertical" />
            <div style={{ width: 280 }}>
              <Segmented options={simpleOptions} block />
            </div>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          禁用
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Segmented options={simpleOptions} disabled />
          <Segmented
            options={[
              { label: '可选', value: 'a' },
              { label: '禁用项', value: 'b', disabled: true },
              { label: '可选', value: 'c' },
            ]}
            style={{ marginTop: 12 }}
          />
        </div>
      </section>
    </>
  );
}
