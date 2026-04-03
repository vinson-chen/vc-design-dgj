import React, { useState } from 'react';
import { VcIcon, vcTokens } from 'vc-design';
import { iconTypes } from './iconTypes';

export default function IconDemo() {
  const [search, setSearch] = useState('');

  const filteredTypes = search.trim()
    ? iconTypes.filter((t) => t.toLowerCase().includes(search.trim().toLowerCase()))
    : iconTypes;

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Icon 图标</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        使用项目提供的 iconfont 图标库，通过 VcIcon 统一使用。同一图标有线框与实底（-filled）时，默认使用无 -filled 后缀。规范见 docs/icon-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本用法
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <VcIcon type="search" style={{ fontSize: 24, color: vcTokens.color.primary.default }} />
            <span style={{ fontSize: 12, color: vcTokens.color.neutral.text.description }}>search 24px</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <VcIcon type="add" style={{ fontSize: 20 }} />
            <span style={{ fontSize: 12, color: vcTokens.color.neutral.text.description }}>add 20px</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <VcIcon type="setting" fontSize={16} />
            <span style={{ fontSize: 12, color: vcTokens.color.neutral.text.description }}>setting 16px</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <VcIcon type="search-filled" style={{ fontSize: 24 }} />
            <span style={{ fontSize: 12, color: vcTokens.color.neutral.text.description }}>search-filled</span>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          图标列表（项目图标库）
        </h2>
        <p style={{ fontSize: 13, color: vcTokens.color.neutral.text.description, marginBottom: 12 }}>
          以下 type 与 icon 目录 SVG 及 iconfont class 一一对应，可直接作为 VcIcon 的 type 使用。支持按名称筛选。
        </p>
        <input
          type="text"
          placeholder="筛选图标名称…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 320,
            padding: '8px 12px',
            marginBottom: 16,
            border: `1px solid ${vcTokens.color.neutral.border.default}`,
            borderRadius: vcTokens.style.borderRadius.sm,
            fontSize: 14,
          }}
        />
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 16,
          }}
        >
          {filteredTypes.map((type) => (
            <div
              key={type}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: 12,
                background: vcTokens.color.neutral.background.container,
                borderRadius: vcTokens.style.borderRadius.sm,
                border: `1px solid ${vcTokens.color.neutral.border.secondary}`,
              }}
            >
              <VcIcon type={type} style={{ fontSize: 24, color: vcTokens.color.neutral.text.default }} />
              <span
                style={{
                  fontSize: 11,
                  color: vcTokens.color.neutral.text.description,
                  textAlign: 'center',
                  wordBreak: 'break-all',
                }}
              >
                {type}
              </span>
            </div>
          ))}
        </div>
        {filteredTypes.length === 0 && (
          <p style={{ color: vcTokens.color.neutral.text.description, marginTop: 12 }}>未匹配到图标</p>
        )}
      </section>
    </>
  );
}
