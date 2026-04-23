import React from 'react';
import VOperationBar from '../VOperationBar';

export interface VTopBarProps {
  /** 左侧槽位，如品牌标题 */
  left?: React.ReactNode;
  /** 右侧槽位，如用户入口 */
  right?: React.ReactNode;
  sticky?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
/** @deprecated Use VTopBarProps instead */
export type TopBarProps = VTopBarProps;

/**
 * 顶栏（Figma `top_bar` / `operation_bar` 顶区）：内部使用 VOperationBar，
 * 48px 高、左右 16px 内边距、槽位内垂直居中，避免自行拼 Header 时出现贴顶错位。
 */
export default function VTopBar({ left, right, sticky, className, style }: VTopBarProps) {
  return (
    <VOperationBar
      left={left}
      right={right}
      sticky={sticky}
      className={className}
      style={{ width: '100%', boxSizing: 'border-box', ...style }}
    />
  );
}