import React from 'react';
import OperationBar from '../OperationBar';

export interface TopBarProps {
  /** 左侧槽位，如品牌标题 */
  left?: React.ReactNode;
  /** 右侧槽位，如用户入口 */
  right?: React.ReactNode;
  sticky?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 顶栏（Figma `top_bar` / `operation_bar` 顶区）：内部使用 OperationBar，
 * 48px 高、左右 16px 内边距、槽位内垂直居中，避免自行拼 Header 时出现贴顶错位。
 */
export default function TopBar({ left, right, sticky, className, style }: TopBarProps) {
  return (
    <OperationBar
      left={left}
      right={right}
      sticky={sticky}
      className={className}
      style={{ width: '100%', boxSizing: 'border-box', ...style }}
    />
  );
}
