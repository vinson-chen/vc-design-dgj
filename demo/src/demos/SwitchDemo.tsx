import React, { useState } from 'react';
import { Switch, Space, VcIcon, vcTokens } from 'vc-design';

export default function SwitchDemo() {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Switch 开关</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        在两种状态之间切换，与 Checkbox 区别为切换即生效。规范见 docs/switch-spec.md。
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
          <Space direction="vertical">
            <Switch />
            <Switch defaultChecked />
            <Switch checked={checked} onChange={setChecked} />
            <p style={{ margin: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
              当前: {checked ? '开' : '关'}
            </p>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          文字与图标
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked />
            <Switch
              checkedChildren={<VcIcon type="check" />}
              unCheckedChildren={<VcIcon type="close" />}
            />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          尺寸、禁用与加载
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <Switch size="small" />
            <Switch size="default" />
            <Switch disabled />
            <Switch disabled checked />
            <Switch loading defaultChecked />
          </Space>
        </div>
      </section>
    </>
  );
}
