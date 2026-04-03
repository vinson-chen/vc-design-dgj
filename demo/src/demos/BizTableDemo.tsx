import React from 'react';
import { vcTokens } from 'vc-design';
import {
  TableAreaConfigPanel,
  TableAreaTableInstance,
  useTableAreaDemoState,
} from 'vc-biz';

const sectionBox: React.CSSProperties = {
  background: vcTokens.color.neutral.background.layout,
  borderRadius: vcTokens.style.borderRadius.lg,
  padding: 24,
};

export default function BizTableDemo() {
  const demo = useTableAreaDemoState();

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>BizTable 表格区</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        demo 以你定义的 <code>cell / row / column</code> 规范做可交互还原：每行 1 个 checkbox、表头列支持拖拽列宽、
        hover/active 为整行触发；列数与行数可在 2～20 间调整。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>配置项</h2>
        <div style={sectionBox}>
          <TableAreaConfigPanel {...demo} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>表格实例</h2>
        <div style={sectionBox}>
          <TableAreaTableInstance {...demo} />
        </div>
      </section>
    </>
  );
}
