import { useCallback, useRef, useState } from 'react';
import { vcTokens } from 'vc-design';
import { VTell } from '../../../packages/vc-biz/src/vtell';
import type { VTellMessage, VTellAttachedFile, VInputCommandTag } from '../../../packages/vc-biz/src/vtell/types';

/** 生成唯一 ID */
function uid(): string {
  return `vtell-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** VTell 对话区演示页面 */
export default function VTellDemo() {
  const [messages, setMessages] = useState<VTellMessage[]>([]);
  const [sending, setSending] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingMsgIdRef = useRef<string | null>(null);

  // 模拟 LLM 选项
  const llmOptions = [
    { value: 'qwen', label: 'Qwen' },
    { value: 'deepseek', label: 'DeepSeek' },
  ];
  const [llmValue, setLlmValue] = useState('qwen');

  // 模拟 L0 补全池（slash 面板）
  const l0Completions = [
    { key: 'input', label: '录入' },
    { key: 'formula', label: '公式' },
    { key: 'clear', label: '清空' },
    { key: 'delete', label: '删除' },
  ];

  // 模拟 hashtag 补全池（选择范围面板）
  const hashtagCompletions = [
    { key: 'select-all', label: '全选' },
    { key: 'select-row', label: '选行' },
    { key: 'select-column', label: '选列' },
    { key: 'select-cell', label: '选单元格' },
  ];

  // 发送消息回调（VTell 要求签名：text + files + tags）
  const onSend = useCallback(async (text: string, files: VTellAttachedFile[], tags: VInputCommandTag[]) => {
    // 添加用户消息
    const userMsg: VTellMessage = { id: uid(), role: 'user', content: text, tags, files };
    const loadingMsgId = uid();
    const loadingMsg: VTellMessage = { id: loadingMsgId, role: 'assistant', content: '', status: 'loading' };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setSending(true);
    loadingMsgIdRef.current = loadingMsgId;

    // 模拟 Agent 回复（延迟 3 秒，方便验收撤回按钮）
    loadingTimerRef.current = setTimeout(() => {
      const tagsText = tags.length > 0 ? `（标签：${tags.map(t => t.label).join('、')}）` : '';
      const filesText = files.length > 0 ? `（附件：${files.map(f => f.file.name).join('、')}）` : '';
      const reply = `已收到您的指令：「${text}」${tagsText}${filesText}。这是一个演示回复，实际使用时 VTell 会与 TableAgent 结合，实现 L0/L1/L2 三层路由。`;

      // 更新助手消息
      setMessages((prev) =>
        prev.map((m) => (m.id === loadingMsgIdRef.current ? { ...m, content: reply, status: undefined } : m))
      );
      setSending(false);
      loadingTimerRef.current = null;
      loadingMsgIdRef.current = null;
    }, 3000);
  }, []);

  // 撤回消息回调
  const onCancel = useCallback(() => {
    // 清除定时器
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    // 移除 loading 消息
    if (loadingMsgIdRef.current) {
      setMessages((prev) => prev.filter((m) => m.id !== loadingMsgIdRef.current));
      loadingMsgIdRef.current = null;
    }
    setSending(false);
  }, []);

  return (
    <div
      style={{
        height: 'calc(100vh - 48px)', // 减去顶部导航高度
        display: 'flex',
        flexDirection: 'column',
        background: vcTokens.color.neutral.background.layout,
      }}
    >
      {/* 页面标题 */}
      <div
        style={{
          padding: '12px 16px',
          background: vcTokens.color.neutral.background.container,
          borderBottom: `1px solid ${vcTokens.color.neutral.border.default}`,
        }}
      >
        <h2
          style={{
            fontSize: 16,
            lineHeight: '24px',
            fontWeight: 600,
            color: vcTokens.color.neutral.text.default,
            margin: 0,
          }}
        >
          VTell 对话区组件
        </h2>
      </div>

      {/* 交互说明 */}
      <div
        style={{
          padding: '12px 16px',
          background: vcTokens.color.neutral.background.container,
          fontSize: 13,
          lineHeight: '20px',
          color: vcTokens.color.neutral.text.description,
        }}
      >
        <strong style={{ color: vcTokens.color.neutral.text.default }}>交互说明：</strong>
        输入 "/" 或点击 slash 按钮 — 展开 L0 句式面板；输入 "#" 或点击 hashtag 按钮 — 展开选择范围面板；↑↓ 导航、Enter 选择或发送、Esc 关闭面板
      </div>

      {/* VTell 对话区：自适应可视区域 */}
      <VTell
        messages={messages}
        sending={sending}
        onSend={onSend}
        onCancel={onCancel}
        llmOptions={llmOptions}
        llmValue={llmValue}
        onLlmChange={setLlmValue}
        placeholder="输入指令，演示对话效果"
        l0Completions={l0Completions}
        hashtagCompletions={hashtagCompletions}
        style={{ flex: 1, minHeight: 0 }}
      />
    </div>
  );
}