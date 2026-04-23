import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { VTellProps, VTellAttachedFile } from './types';
import { VTellMessageList, getLastUserMessageId } from './VTellMessageList';
import { VTellCompletionMenu } from './VTellCompletionMenu';
import VInput from '../vcell-input/VInput';
import { vcTokens } from 'vc-design';

/** 默认最小宽度 */
const DEFAULT_MIN_WIDTH_PX = 280;

/** 生成唯一 ID */
function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `vtell-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** VTell 对话区主组件 */
export function VTell({
  messages,
  sending = false,
  onSend,
  widthPx,
  minWidthPx = DEFAULT_MIN_WIDTH_PX,
  llmOptions,
  llmValue,
  onLlmChange,
  placeholder = '输入指令，操控表格',
  l0Completions = [],
  onL0CompletionPick,
  disabled = false,
  className,
}: VTellProps) {
  // ===== 内部 UI 状态 =====
  const [draft, setDraft] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<VTellAttachedFile[]>([]);
  const [completionPaletteOpen, setCompletionPaletteOpen] = useState(false);
  const [completionHighlight, setCompletionHighlight] = useState(0);
  const [completionHideAfterPick, setCompletionHideAfterPick] = useState(false);
  const inputAreaRef = useRef<HTMLDivElement>(null);

  // ===== 补全菜单逻辑 =====
  // 高亮索引在补全列表变化时重置
  useEffect(() => {
    setCompletionHighlight(0);
  }, [l0Completions.map((c) => c.key).join(',')]);

  // 补全菜单是否可见：仅当输入 "/" 或面板已打开时
  const completionMenuVisible =
    !sending &&
    !completionHideAfterPick &&
    l0Completions.length > 0 &&
    (draft.trim() === '/' || completionPaletteOpen);

  // 点击外部关闭补全菜单
  useEffect(() => {
    if (!completionMenuVisible) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // 排除 Dropdown overlay（菜单面板）
      const dropdownOverlay = document.querySelector('.vc-biz-vtell-completion-menu');
      if (dropdownOverlay && dropdownOverlay.contains(target)) return;
      if (inputAreaRef.current && !inputAreaRef.current.contains(target)) {
        setCompletionPaletteOpen(false);
        // 清空输入内容（如果当前是 "/"）
        if (draft.trim() === '/') {
          setDraft('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [completionMenuVisible, draft]);

  // ===== 输入框事件 =====
  const onDraftChange = useCallback((value: string) => {
    setCompletionHideAfterPick(false);
    setDraft(value);
  }, []);

  // 键盘事件捕获（处理补全菜单交互）
  const onKeyDownCapture = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (sending) return;

      // Alt+/ 展开/关闭补全面板
      if (e.altKey && (e.key === '/' || e.code === 'Slash')) {
        e.preventDefault();
        e.stopPropagation();
        setCompletionHideAfterPick(false);
        setCompletionPaletteOpen((open) => !open);
        return;
      }

      if (!completionMenuVisible) return;
      const list = l0Completions;
      const len = list.length;
      if (len === 0) return;

      // Esc 关闭
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setCompletionPaletteOpen(false);
        return;
      }

      // ↓ 下移高亮
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setCompletionHighlight((h) => (h + 1) % len);
        return;
      }

      // ↑ 上移高亮
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setCompletionHighlight((h) => (h - 1 + len) % len);
        return;
      }

      // Enter 选择补全项
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const pick = list[completionHighlight] ?? list[0];
        if (pick) {
          setCompletionHideAfterPick(true);
          setDraft(pick.label);
          setCompletionPaletteOpen(false);
          if (onL0CompletionPick) onL0CompletionPick(pick.label);
        }
      }
    },
    [sending, completionHighlight, completionMenuVisible, l0Completions, onL0CompletionPick]
  );

  // 补全项点击
  const onCompletionPick = useCallback((text: string) => {
    setCompletionHideAfterPick(true);
    setDraft(text);
    setCompletionPaletteOpen(false);
    if (onL0CompletionPick) onL0CompletionPick(text);
  }, [onL0CompletionPick]);

  // slash 按钮点击：打开补全菜单
  const onSlashClick = useCallback(() => {
    setCompletionHideAfterPick(false);
    setCompletionPaletteOpen(true);
  }, []);

  // ===== 发送逻辑 =====
  const handleSend = useCallback(() => {
    if (sending || disabled) return;
    const text = draft.trim();
    const filesSnapshot = [...attachedFiles];
    if (!text && filesSnapshot.length === 0) return;

    // 调用外部 onSend（业务逻辑由使用者处理）
    onSend(text, filesSnapshot);

    // 清空输入区
    setDraft('');
    setAttachedFiles([]);
    setCompletionPaletteOpen(false);
    setCompletionHideAfterPick(false);
  }, [sending, disabled, draft, attachedFiles, onSend]);

  // 附件变更（为每个文件自动生成 id）
  const onAttachedFilesChange = useCallback((files: VTellAttachedFile[]) => {
    setAttachedFiles(files.map((f) => ({ ...f, id: f.id || uid() })));
  }, []);

  // ===== 消息列表 =====
  const lastUserMessageId = useMemo(() => getLastUserMessageId(messages), [messages]);

  // ===== 面板样式 =====
  const panelStyle = useMemo(
    (): React.CSSProperties => ({
      width: widthPx,
      minWidth: minWidthPx,
      flexShrink: 0,
      background: vcTokens.color.neutral.background.container,
      minHeight: 0,
      overflow: 'visible',
      fontSize: 14,
      display: 'flex',
      flexDirection: 'column',
    }),
    [widthPx, minWidthPx]
  );

  return (
    <div style={panelStyle} className={className}>
      {/* 消息列表 */}
      <VTellMessageList messages={messages} lastUserMessageId={lastUserMessageId} />

      {/* 输入区（含补全菜单） */}
      <div
        style={{
          flexShrink: 0,
          padding: 16,
          overflow: 'visible',
          boxSizing: 'border-box',
        }}
      >
        <div ref={inputAreaRef} style={{ position: 'relative' }} onKeyDownCapture={onKeyDownCapture}>
          {/* 补全菜单包裹输入组件 */}
          <VTellCompletionMenu
            visible={completionMenuVisible}
            completions={l0Completions}
            highlightIndex={completionHighlight}
            onHighlightChange={setCompletionHighlight}
            onPick={onCompletionPick}
            inputEmpty={draft.trim().length === 0}
          >
            {/* 输入组件 */}
            <VInput
              value={draft}
              onChange={onDraftChange}
              onSend={handleSend}
              placeholder={placeholder}
              disabled={sending || disabled}
              llmOptions={llmOptions}
              llmValue={llmValue}
              onLlmChange={onLlmChange}
              attachedFiles={attachedFiles}
              onAttachedFilesChange={onAttachedFilesChange}
              onSlashClick={onSlashClick}
              llmDropdownOverlayClassName="vtell-llm-dropdown"
            />
          </VTellCompletionMenu>
        </div>
      </div>
    </div>
  );
}

// 导出工具函数供外部使用
export { uid };
export type { VTellMessage, VTellAttachedFile, VTellLlmOption, VTellCompletionItem } from './types';
/** @deprecated Use VTellMessage, VTellAttachedFile, VTellLlmOption instead */
export type { VtellMessage, VtellAttachedFile, VtellLlmOption } from './types';