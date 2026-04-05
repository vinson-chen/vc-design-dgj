import React from 'react';
import { Collapse, vcTokens } from 'vc-design';
import {
  TableAreaConfigPanel,
  TableAreaTableInstance,
  useTableAreaDemoState,
  useTableBodyScrollMaxHeight,
} from 'vc-biz';

const sectionBox: React.CSSProperties = {
  background: vcTokens.color.neutral.background.layout,
  borderRadius: vcTokens.style.borderRadius.lg,
  padding: 24,
};

export default function BizTableDemo() {
  const { hostRef, bodyScrollMaxHeight } = useTableBodyScrollMaxHeight();
  const demo = useTableAreaDemoState({
    bodyScrollMaxHeight,
    /** 首屏优先表格高度，快捷键说明收进配置或文档即可 */
    showEditKeyboardHints: false,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ margin: 0, flexShrink: 0, fontWeight: 600 }}>BizTable 表格区</h1>

      <Collapse
        bordered={false}
        style={{
          flexShrink: 0,
          background: vcTokens.color.neutral.background.layout,
        }}
        defaultActiveKey={[]}
        items={[
          {
            key: 'config',
            label: '配置项',
            children: (
              <div style={{ ...sectionBox, marginBottom: 0 }}>
                <TableAreaConfigPanel {...demo} />
              </div>
            ),
          },
        ]}
      />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          ...sectionBox,
          padding: 16,
        }}
      >
        <div ref={hostRef} style={{ flex: 1, minHeight: 0, width: '100%' }}>
          <TableAreaTableInstance {...demo} />
        </div>
      </div>
    </div>
  );
}
