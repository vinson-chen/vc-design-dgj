import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';
import type { VTellMessage, VTellMessageListProps } from './types';
import { VTellMessageBubble } from './VTellMessageBubble';
import { vcTokens } from 'vc-design';

/** 消息列表组件（含自动滚动到最新消息） */
export function VTellMessageList({ messages, lastUserMessageId }: VTellMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const latestUserBubbleRef = useRef<HTMLDivElement | null>(null);

  // 自动滚动到最新用户消息（顶在滚动区上沿）
  useLayoutEffect(() => {
    const sc = scrollRef.current;
    const el = latestUserBubbleRef.current;
    if (!sc || !el || lastUserMessageId == null) return;

    const scrollLatestUserToTop = () => {
      const scRect = sc.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const nextTop = sc.scrollTop + (elRect.top - scRect.top);
      const max = Math.max(0, sc.scrollHeight - sc.clientHeight);
      sc.scrollTop = Math.min(Math.max(0, nextTop), max);
    };

    scrollLatestUserToTop();
    // 使用两次 raf 确保布局稳定后滚动
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(scrollLatestUserToTop);
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [messages, lastUserMessageId]);

  // 判断消息是否是新对话组的开始（用户消息，且前一条不是用户消息）
  const isNewConversationGroup = (index: number, msg: VTellMessage): boolean => {
    if (msg.role !== 'user') return false;
    if (index === 0) return true;
    return messages[index - 1].role !== 'user';
  };

  // 获取消息的 margin-top
  // - 第一条消息：0
  // - 用户消息：新对话组开始时 32px，连续发送时 8px
  // - 助手消息：8px（跟随用户消息）
  const getMessageMarginTop = (index: number, msg: VTellMessage): number => {
    if (index === 0) return 0;
    if (msg.role === 'user') {
      return isNewConversationGroup(index, msg) ? 32 : 8;
    }
    // 助手消息：跟随用户消息，间距 8px
    return 8;
  };

  // 滚动区域样式
  const scrollAreaStyle: React.CSSProperties = {
    flex: 1,
    minHeight: 0,
    padding: 16,
    paddingBottom: 20,
    overflow: 'auto',
    boxSizing: 'border-box',
    scrollbarGutter: 'stable',
    display: 'flex',
    flexDirection: 'column',
  };

  // 底部渐变遮罩样式
  const gradientMaskStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 16,
    bottom: 0,
    height: 24,
    pointerEvents: 'none',
    zIndex: 2,
    background: `linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, ${vcTokens.color.neutral.background.container} 45%, ${vcTokens.color.neutral.background.container} 100%)`,
  };

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div ref={scrollRef} style={scrollAreaStyle}>
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            style={{ marginTop: getMessageMarginTop(index, msg) }}
          >
            <VTellMessageBubble
              message={msg}
              isLatestUser={msg.id === lastUserMessageId && msg.role === 'user'}
              bubbleRef={latestUserBubbleRef}
            />
          </div>
        ))}
      </div>
      {/* 底部渐变遮罩 */}
      <div aria-hidden style={gradientMaskStyle} />
    </div>
  );
}

/** 获取最新用户消息 ID */
export function getLastUserMessageId(messages: VTellMessage[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].id;
  }
  return undefined;
}