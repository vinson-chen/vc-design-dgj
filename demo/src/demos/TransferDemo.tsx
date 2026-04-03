import React, { useState } from 'react';
import { Transfer, vcTokens } from 'vc-design';

const mockData = Array.from({ length: 10 }, (_, i) => ({
  key: `item-${i + 1}`,
  title: `选项 ${i + 1}`,
}));

export default function TransferDemo() {
  const [targetKeys, setTargetKeys] = useState<string[]>(['item-2', 'item-5']);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Transfer 穿梭框</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        双栏穿梭选择，仅支持受控。规范见 docs/transfer-spec.md。
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
          <Transfer
            dataSource={mockData}
            targetKeys={targetKeys}
            onChange={setTargetKeys}
            render={(item) => item.title}
          />
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            已选至右侧: {targetKeys.length} 项
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带搜索与标题
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Transfer
            dataSource={mockData}
            targetKeys={targetKeys}
            onChange={setTargetKeys}
            titles={['源列表', '目标列表']}
            showSearch
            filterOption={(input, option) => (option?.title ?? '').includes(input)}
            render={(item) => item.title}
          />
        </div>
      </section>
    </>
  );
}
