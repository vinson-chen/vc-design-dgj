import React from 'react';
import { vcTokens } from 'vc-design';

export interface OperationBarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  sticky?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 通用操作区（operation_bar）：左右两侧插槽，space-between 对齐。
 * 结构对齐 Figma `operation_bar`：48 高、左右 16px padding、内容 32px 高并垂直居中。
 */
export default function OperationBar({ left, right, sticky = false, className, style }: OperationBarProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 16,
        minWidth: 400,
        minHeight: 48,
        padding: '8px 16px',
        boxSizing: 'border-box',
        background: vcTokens.color.neutral.background.container,
        borderBottom: `1px solid ${vcTokens.color.neutral.border.default}`,
        ...(sticky
          ? {
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }
          : {}),
        ...style,
      }}
    >
      <div style={{ minWidth: 0, flex: '0 1 auto', display: 'flex', alignItems: 'center', gap: 8 }}>{left}</div>
      <div style={{ minWidth: 0, flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        {right}
      </div>
    </div>
  );
}

