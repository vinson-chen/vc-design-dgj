import type { RefObject } from 'react';
import type { VTellMessageBubbleProps } from './types';
import { Spin, vcTokens } from 'vc-design';

/** 消息气泡组件 */
export function VTellMessageBubble({
  message,
  isLatestUser,
  bubbleRef,
}: VTellMessageBubbleProps) {
  const isUser = message.role === 'user';
  const isLoading = message.status === 'loading';

  // 用户消息样式：右对齐、蓝色背景
  // 助手消息样式：左对齐、灰色背景
  const bubbleStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    display: 'inline-block',
    maxWidth: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: 'none',
    background: isUser
      ? vcTokens.color.primary.bg
      : vcTokens.color.neutral.background.layout,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: 14,
    lineHeight: '22px',
    color: vcTokens.color.neutral.text.default,
  };

  // 消息容器样式
  const containerStyle: React.CSSProperties = {
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    maxWidth: '100%',
  };

  if (isLoading) {
    // 加载状态：显示 Spin
    return (
      <div style={containerStyle}>
        <div style={{ minHeight: 28, padding: '2px 0', display: 'flex', alignItems: 'center' }}>
          <Spin size="small" rootClassName="vtell-loading-spin" />
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} ref={isLatestUser && isUser ? bubbleRef : undefined}>
      <div style={bubbleStyle}>{message.content}</div>
    </div>
  );
}