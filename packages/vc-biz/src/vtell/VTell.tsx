import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, KeyboardEvent, SetStateAction } from 'react';
import type { VTellProps, VTellAttachedFile, VTellCompletionItem } from './types';
import { VTellMessageList, getLastUserMessageId } from './VTellMessageList';
import { VTellCompletionMenu } from './VTellCompletionMenu';
import VInput, { type VInputCommandTag } from '../vcell-input/VInput';
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
  onCancel,
  widthPx,
  minWidthPx = DEFAULT_MIN_WIDTH_PX,
  llmOptions,
  llmValue,
  onLlmChange,
  placeholder = '输入指令，操控表格',
  l0Completions = [],
  onL0CompletionPick,
  hashtagCompletions = [],
  onHashtagPick,
  commandTags: commandTagsProp,
  onCommandTagsChange,
  disabled = false,
  className,
  style,
}: VTellProps) {
  // ===== 内部 UI 状态 =====
  const [draft, setDraft] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<VTellAttachedFile[]>([]);
  const [commandTags, setCommandTags] = useState<VInputCommandTag[]>([]);

  // 受控模式：当外部提供 commandTags 时，由外部控制标签列表
  const controlled = commandTagsProp != null;
  const resolvedCommandTags = controlled ? (commandTagsProp ?? []) : commandTags;
  const commandTagsRef = useRef(resolvedCommandTags);
  commandTagsRef.current = resolvedCommandTags;
  const onCommandTagsChangeRef = useRef(onCommandTagsChange);
  onCommandTagsChangeRef.current = onCommandTagsChange;

  const handleCommandTagsChange: Dispatch<SetStateAction<VInputCommandTag[]>> = useCallback(
    (action) => {
      if (controlled) {
        const next = typeof action === 'function' ? action(commandTagsRef.current) : action;
        onCommandTagsChangeRef.current?.(next);
      } else {
        setCommandTags(action);
      }
    },
    [controlled]
  );
  // slash 补全面板状态
  const [completionPaletteOpen, setCompletionPaletteOpen] = useState(false);
  // -1 表示无选中项，用户导航后才设置有效索引
  const [completionHighlight, setCompletionHighlight] = useState(-1);
  const [completionHideAfterPick, setCompletionHideAfterPick] = useState(false);
  // hashtag 选择范围面板状态
  const [hashtagPaletteOpen, setHashtagPaletteOpen] = useState(false);
  const [hashtagHighlight, setHashtagHighlight] = useState(-1);
  const [hashtagHideAfterPick, setHashtagHideAfterPick] = useState(false);
  const inputAreaRef = useRef<HTMLDivElement>(null);

  // ===== 模糊搜索预设规则 =====
  // 根据输入内容过滤 L0 预设规则（排除 "/" 和 "#" 触发字符）
  const filteredL0Completions = useMemo(() => {
    const query = draft.trim();
    // "/" 触发时显示全部
    if (query === '/') return l0Completions;
    // 面板已打开且输入为空（按钮点击触发）时显示全部
    if (query === '' && completionPaletteOpen) return l0Completions;
    // "#" 或空时不过滤
    if (query === '#' || query === '') return [];
    // 模糊匹配：输入内容命中 label 或 synonyms 时显示
    const lowerQuery = query.toLowerCase();
    return l0Completions.filter((item) => {
      const lowerLabel = item.label.toLowerCase();
      // label 包含查询内容
      if (lowerLabel.includes(lowerQuery)) return true;
      // 同义词匹配
      if (item.synonyms) {
        for (const syn of item.synonyms) {
          if (syn.toLowerCase().includes(lowerQuery)) return true;
        }
      }
      return false;
    });
  }, [draft, l0Completions, completionPaletteOpen]);

  // ===== 补全菜单逻辑 =====
  // 补全菜单是否可见：有过滤结果且未隐藏
  const completionMenuVisible =
    !sending &&
    !completionHideAfterPick &&
    filteredL0Completions.length > 0;

  // 面板关闭时重置高亮索引为 -1（无选中项）
  useEffect(() => {
    if (!completionMenuVisible) {
      setCompletionHighlight(-1);
    }
  }, [completionMenuVisible]);

  // ===== hashtag 选择范围面板逻辑 =====
  // hashtag 面板是否可见：仅当输入 "#" 或面板已打开时
  const hashtagMenuVisible =
    !sending &&
    !hashtagHideAfterPick &&
    hashtagCompletions.length > 0 &&
    (draft.trim() === '#' || hashtagPaletteOpen);

  // 面板关闭时重置高亮索引为 -1（无选中项）
  useEffect(() => {
    if (!hashtagMenuVisible) {
      setHashtagHighlight(-1);
    }
  }, [hashtagMenuVisible]);

  // 点击外部关闭面板（适用于 slash 和 hashtag 面板）
  useEffect(() => {
    if (!completionMenuVisible && !hashtagMenuVisible) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // 排除 Dropdown overlay（菜单面板）
      const dropdownOverlay = document.querySelector('.vc-biz-vtell-completion-menu');
      if (dropdownOverlay && dropdownOverlay.contains(target)) return;
      if (inputAreaRef.current && !inputAreaRef.current.contains(target)) {
        // 关闭 slash 面板
        if (completionMenuVisible) {
          setCompletionPaletteOpen(false);
          if (draft.trim() === '/') setDraft('');
        }
        // 关闭 hashtag 面板
        if (hashtagMenuVisible) {
          setHashtagPaletteOpen(false);
          if (draft.trim() === '#') setDraft('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [completionMenuVisible, hashtagMenuVisible, draft]);

  // ===== 输入框事件 =====
  const onDraftChange = useCallback((value: string) => {
    setCompletionHideAfterPick(false);
    setHashtagHideAfterPick(false);
    setDraft(value);
    // 输入 "/" 时切换到 slash 面板，关闭 hashtag 面板
    if (value.trim() === '/') {
      setCompletionPaletteOpen(true);
      setHashtagPaletteOpen(false);
    }
    // 输入 "#" 时切换到 hashtag 面板，关闭 slash 面板
    if (value.trim() === '#') {
      setHashtagPaletteOpen(true);
      setCompletionPaletteOpen(false);
    }
  }, []);

  // slash 按钮点击：切换 slash 面板，关闭 hashtag 面板
  const onSlashClick = useCallback(() => {
    setCompletionHideAfterPick(false);
    // 已打开则关闭，未打开则打开
    setCompletionPaletteOpen((prev) => !prev);
    setHashtagPaletteOpen(false);
  }, []);

  // hashtag 按钮点击：切换 hashtag 面板，关闭 slash 面板
  const onHashtagClick = useCallback(() => {
    setHashtagHideAfterPick(false);
    // 已打开则关闭，未打开则打开
    setHashtagPaletteOpen((prev) => !prev);
    setCompletionPaletteOpen(false);
  }, []);

  // 键盘事件捕获（处理补全菜单交互）
  const onKeyDownCapture = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (sending) return;

      // 优先处理 slash 补全菜单
      if (completionMenuVisible) {
        const list = filteredL0Completions;
        const len = list.length;
        if (len > 0) {
          // Esc 关闭
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            setCompletionPaletteOpen(false);
            return;
          }

          // ↓ 下移高亮（无选中项时从 0 开始）
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            setCompletionHighlight((h) => h < 0 ? 0 : (h + 1) % len);
            return;
          }

          // ↑ 上移高亮（无选中项时从最后一项开始）
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            e.stopPropagation();
            setCompletionHighlight((h) => h < 0 ? len - 1 : (h - 1 + len) % len);
            return;
          }

          // Enter 选择补全项：仅当有选中项时才拦截
          if (e.key === 'Enter' && !e.shiftKey && completionHighlight >= 0) {
            e.preventDefault();
            e.stopPropagation();
            const pick = list[completionHighlight];
            if (pick) {
              setCompletionHideAfterPick(true);
              // 清空输入框
              setDraft('');
              // 添加指令标签，替换已有的 slash 类型标签（保持原位置）
              const newTag: VInputCommandTag = { id: uid(), label: pick.label, type: 'slash' };
              handleCommandTagsChange((prev) => {
                const existingIndex = prev.findIndex((t) => t.type === 'slash');
                if (existingIndex >= 0) {
                  const next = [...prev];
                  next[existingIndex] = newTag;
                  return next;
                }
                return [...prev, newTag];
              });
              setCompletionPaletteOpen(false);
              if (onL0CompletionPick) onL0CompletionPick(pick.label);
            }
            return;
          }
        }
      }

      // 处理 hashtag 选择范围面板
      if (hashtagMenuVisible) {
        const list = hashtagCompletions;
        const len = list.length;

        // Esc 关闭
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setHashtagPaletteOpen(false);
          return;
        }

        // ↓ 下移高亮（无选中项时从 0 开始）
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          setHashtagHighlight((h) => h < 0 ? 0 : (h + 1) % len);
          return;
        }

        // ↑ 上移高亮（无选中项时从最后一项开始）
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          setHashtagHighlight((h) => h < 0 ? len - 1 : (h - 1 + len) % len);
          return;
        }

        // Enter 选择选项：仅当有选中项时才拦截
        if (e.key === 'Enter' && !e.shiftKey && hashtagHighlight >= 0) {
          e.preventDefault();
          e.stopPropagation();
          const pick = list[hashtagHighlight];
          if (pick) {
            handleHashtagPick(pick.label);
          }
          return;
        }
      }
    },
    [sending, completionMenuVisible, hashtagMenuVisible, filteredL0Completions, completionHighlight, hashtagHighlight, onL0CompletionPick, handleCommandTagsChange]
  );

  // 补全项点击：添加指令标签，清空输入框
  const onCompletionPick = useCallback((text: string) => {
    setCompletionHideAfterPick(true);
    // 清空输入框
    setDraft('');
    // 添加指令标签，替换已有的 slash 类型标签（保持原位置）
    const newTag: VInputCommandTag = { id: uid(), label: text, type: 'slash' };
    handleCommandTagsChange((prev) => {
      const existingIndex = prev.findIndex((t) => t.type === 'slash');
      if (existingIndex >= 0) {
        // 替换原位置的标签
        const next = [...prev];
        next[existingIndex] = newTag;
        return next;
      }
      // 没有同类型标签，添加到末尾
      return [...prev, newTag];
    });
    setCompletionPaletteOpen(false);
    if (onL0CompletionPick) onL0CompletionPick(text);
  }, [onL0CompletionPick, handleCommandTagsChange]);

  // hashtag 选项点击内部处理：添加指令标签（替换同类型标签，保持位置）
  const handleHashtagPick = useCallback((text: string) => {
    setHashtagHideAfterPick(true);
    // 清空输入框（如果当前是 "#"）
    if (draft.trim() === '#') {
      setDraft('');
    }
    // 添加指令标签，替换已有的 hashtag 类型标签（保持原位置）
    const newTag: VInputCommandTag = { id: uid(), label: text, type: 'hashtag' };
    handleCommandTagsChange((prev) => {
      const existingIndex = prev.findIndex((t) => t.type === 'hashtag');
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = newTag;
        return next;
      }
      return [...prev, newTag];
    });
    setHashtagPaletteOpen(false);
    // 调用外部回调
    if (onHashtagPick) onHashtagPick(text);
  }, [draft, onHashtagPick]);

  // ===== 发送逻辑 =====
  const handleSend = useCallback(() => {
    if (sending || disabled) return;
    const text = draft.trim();
    // 需要有内容（文本、标签或附件）才可发送
    if (!text && resolvedCommandTags.length === 0 && attachedFiles.length === 0) return;
    const filesSnapshot = [...attachedFiles];
    const tagsSnapshot = [...resolvedCommandTags];

    // 调用外部 onSend（业务逻辑由使用者处理）
    onSend(text, filesSnapshot, tagsSnapshot);

    // 清空输入区
    setDraft('');
    setAttachedFiles([]);
    handleCommandTagsChange([]);
    setCompletionPaletteOpen(false);
    setCompletionHideAfterPick(false);
    setHashtagPaletteOpen(false);
    setHashtagHideAfterPick(false);
  }, [sending, disabled, draft, attachedFiles, resolvedCommandTags, handleCommandTagsChange, onSend]);

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
      ...style,
    }),
    [widthPx, minWidthPx, style]
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
          {/* 根据当前活跃面板条件渲染 */}
          {hashtagMenuVisible ? (
            // hashtag 选择范围面板
            <VTellCompletionMenu
              visible={hashtagMenuVisible}
              completions={hashtagCompletions}
              highlightIndex={hashtagHighlight}
              onHighlightChange={setHashtagHighlight}
              onPick={handleHashtagPick}
              inputEmpty={draft.trim().length === 0}
              containerRef={inputAreaRef}
            >
              <VInput
                value={draft}
                onChange={onDraftChange}
                onSend={handleSend}
                onCancel={onCancel}
                sending={sending}
                placeholder={placeholder}
                disabled={disabled}
                llmOptions={llmOptions}
                llmValue={llmValue}
                onLlmChange={onLlmChange}
                attachedFiles={attachedFiles}
                onAttachedFilesChange={onAttachedFilesChange}
                commandTags={resolvedCommandTags}
                onCommandTagsChange={handleCommandTagsChange}
                onSlashClick={onSlashClick}
                onHashtagClick={onHashtagClick}
                paletteOpen={hashtagPaletteOpen || completionPaletteOpen}
                llmDropdownOverlayClassName="vtell-llm-dropdown"
              />
            </VTellCompletionMenu>
          ) : (
            // slash 补全菜单（显示过滤后的结果）
            <VTellCompletionMenu
              visible={completionMenuVisible}
              completions={filteredL0Completions}
              highlightIndex={completionHighlight}
              onHighlightChange={setCompletionHighlight}
              onPick={onCompletionPick}
              inputEmpty={draft.trim().length === 0}
              containerRef={inputAreaRef}
            >
              <VInput
                value={draft}
                onChange={onDraftChange}
                onSend={handleSend}
                onCancel={onCancel}
                sending={sending}
                placeholder={placeholder}
                disabled={disabled}
                llmOptions={llmOptions}
                llmValue={llmValue}
                onLlmChange={onLlmChange}
                attachedFiles={attachedFiles}
                onAttachedFilesChange={onAttachedFilesChange}
                commandTags={resolvedCommandTags}
                onCommandTagsChange={handleCommandTagsChange}
                onSlashClick={onSlashClick}
                onHashtagClick={onHashtagClick}
                paletteOpen={hashtagPaletteOpen || completionPaletteOpen}
                llmDropdownOverlayClassName="vtell-llm-dropdown"
              />
            </VTellCompletionMenu>
          )}
        </div>
      </div>
    </div>
  );
}

// 导出工具函数供外部使用
export { uid };
export type { VTellMessage, VTellAttachedFile, VTellLlmOption, VTellCompletionItem, VInputCommandTag } from './types';
/** @deprecated Use VTellMessage, VTellAttachedFile, VTellLlmOption instead */
export type { VtellMessage, VtellAttachedFile, VtellLlmOption } from './types';