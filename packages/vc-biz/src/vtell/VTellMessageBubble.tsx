import type { RefObject } from 'react';
import type { VTellMessageBubbleProps } from './types';
import type { VTellAttachedFile } from './types';
import { Spin, VcIcon, vcTokens } from 'vc-design';

/** 获取 Excel 文件扩展名 */
function excelExtLabel(file: File): '.xlsx' | '.xls' | null {
  const n = file.name.toLowerCase();
  if (n.endsWith('.xlsx')) return '.xlsx';
  if (n.endsWith('.xls')) return '.xls';
  return null;
}

/** 获取 Excel 文件基础名 */
function excelBaseName(file: File): string {
  const n = file.name;
  const lower = n.toLowerCase();
  if (lower.endsWith('.xlsx')) return n.slice(0, -5);
  if (lower.endsWith('.xls')) return n.slice(0, -4);
  return n;
}

/** 消息气泡组件 */
export function VTellMessageBubble({
  message,
  isLatestUser,
  bubbleRef,
}: VTellMessageBubbleProps) {
  const isUser = message.role === 'user';
  const isLoading = message.status === 'loading';
  const hasTags = message.tags && message.tags.length > 0;
  const hasFiles = message.files && message.files.length > 0;
  const hasMeta = hasTags || hasFiles;

  // 消息容器样式：左对齐，子元素宽度独立
  const containerStyle: React.CSSProperties = {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  };

  // 标签容器样式：左对齐
  const tagsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: 8,
    flexWrap: 'wrap',
  };

  // 单个指令标签样式
  const tagStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 24,
    padding: '0 8px',
    borderRadius: 4,
    background: vcTokens.color.primary.bg,
    fontSize: 14,
    lineHeight: '24px',
    color: vcTokens.color.primary.text,
  };

  // 单个文件标签样式
  const fileTagStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 24,
    padding: '0 8px',
    borderRadius: 4,
    background: vcTokens.color.primary.bg,
    fontSize: 14,
    lineHeight: '24px',
    color: vcTokens.color.primary.text,
  };

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
      {/* 标签区域：右对齐，在气泡上方 */}
      {hasMeta && (
        <div style={tagsContainerStyle}>
          {/* 指令标签 */}
          {message.tags?.map((tag) => (
            <span key={tag.id} style={tagStyle}>
              <VcIcon type={tag.type === 'slash' ? 'slash' : 'hashtag'} fontSize={14} />
              <span>{tag.label}</span>
            </span>
          ))}
          {/* 文件标签 */}
          {message.files?.map((f) => {
            const ext = excelExtLabel(f.file);
            if (!ext) return null;
            const label = `${excelBaseName(f.file)}${ext}`;
            return (
              <span key={f.id} style={fileTagStyle}>
                <VcIcon type="file-1" fontSize={14} />
                <span>{label}</span>
              </span>
            );
          })}
        </div>
      )}
      {/* 消息气泡：只有有内容时才显示 */}
      {message.content && <div style={bubbleStyle}>{message.content}</div>}
    </div>
  );
}