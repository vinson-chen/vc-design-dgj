import React, { useState } from 'react';
import {
  VcConfigProvider,
  Button,
  DatePicker,
  Select,
  Space,
  VcIcon,
  vcTokens,
} from 'vc-design';
import type { Locale } from 'antd/es/locale';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';

export default function ConfigProviderDemo() {
  const [size, setSize] = useState<'small' | 'middle' | 'large'>('middle');
  const [locale, setLocale] = useState<Locale>(zhCN);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>ConfigProvider 全局化配置</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        在应用根节点包裹一次，使主题（Token）、语言、尺寸对内部所有组件生效。规范见
        docs/config-provider-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          默认行为（当前页面已在根节点使用 VcConfigProvider）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <p style={{ marginBottom: 16, fontSize: 13, color: vcTokens.color.neutral.text.description }}>
            下方按钮、选择器、日期框均使用 VC 主题与默认中文。
          </p>
          <Space wrap>
            <Button type="primary">主按钮</Button>
            <Button>默认按钮</Button>
            <Select
              placeholder="请选择"
              style={{ width: 160 }}
              options={[{ value: 'a', label: '选项 A' }]}
              suffixIcon={<VcIcon type="chevron-down" />}
            />
            <DatePicker placeholder="选择日期" />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          全局尺寸（componentSize）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space style={{ marginBottom: 16 }}>
            {(['small', 'middle', 'large'] as const).map((s) => (
              <Button key={s} type={size === s ? 'primary' : 'default'} onClick={() => setSize(s)}>
                {s === 'small' ? '小' : s === 'middle' ? '中' : '大'}
              </Button>
            ))}
          </Space>
          <VcConfigProvider componentSize={size}>
            <Space wrap>
              <Button>Button</Button>
              <Select placeholder="Select" style={{ width: 120 }} options={[]} />
              <DatePicker placeholder="DatePicker" />
            </Space>
          </VcConfigProvider>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          语言（locale）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space style={{ marginBottom: 16 }}>
            <Button
              type={locale === zhCN ? 'primary' : 'default'}
              onClick={() => setLocale(zhCN)}
            >
              中文
            </Button>
            <Button
              type={locale === enUS ? 'primary' : 'default'}
              onClick={() => setLocale(enUS)}
            >
              English
            </Button>
          </Space>
          <VcConfigProvider locale={locale}>
            <Space wrap>
              <DatePicker placeholder={locale === zhCN ? '选择日期' : 'Select date'} />
              <Select
                placeholder={locale === zhCN ? '请选择' : 'Please select'}
                style={{ width: 160 }}
                options={[]}
              />
            </Space>
          </VcConfigProvider>
        </div>
      </section>
    </>
  );
}
