import { useCallback, useState } from 'react';
import { Flex, vcTokens } from 'vc-design';
import { VTell } from '../../../packages/vc-biz/src/vtell';
import type { VTellMessage, VTellAttachedFile } from '../../../packages/vc-biz/src/vtell/types';

/** 生成唯一 ID */
function uid(): string {
  return `vtell-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** VTell 对话区演示页面 */
export default function VTellDemo() {
  const [messages, setMessages] = useState<VTellMessage[]>([]);
  const [sending, setSending] = useState(false);

  // 模拟 LLM 选项
  const llmOptions = [
    { value: 'automation_rules', label: '预设规则' },
    { value: 'qwen', label: 'Qwen' },
    { value: 'deepseek', label: 'DeepSeek' },
  ];
  const [llmValue, setLlmValue] = useState('qwen');

  // 模拟 L0 补全池
  const l0Completions = [
    { key: 'delete-rows', label: '删除选中行', icon: 'delete' },
    { key: 'clear-body', label: '清空所有表体', icon: 'clear' },
    { key: 'discount', label: '把第2列打8折', icon: 'edit' },
    { key: 'delete-empty', label: '删除空行', icon: 'filter' },
    { key: 'uppercase', label: '把第1列转成大写', icon: 'edit' },
    { key: 'clear-column', label: '清空第3列', icon: 'clear' },
  ];

  // 发送消息回调（VTell 要求签名：text + files）
  const onSend = useCallback(async (text: string, _files: VTellAttachedFile[]) => {
    // 添加用户消息
    const userMsg: VTellMessage = { id: uid(), role: 'user', content: text };
    const loadingMsg: VTellMessage = { id: uid(), role: 'assistant', content: '', status: 'loading' };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setSending(true);

    // 模拟 Agent 回复（延迟 500ms）
    await new Promise((r) => setTimeout(r, 500));
    const reply = `已收到您的指令：「${text}」。这是一个演示回复，实际使用时 VTell 会与 TableAgent 结合，实现 L0/L1/L2 三层路由。`;

    // 更新助手消息
    setMessages((prev) =>
      prev.map((m) => (m.status === 'loading' ? { ...m, content: reply, status: undefined } : m))
    );
    setSending(false);
  }, []);

  return (
    <Flex vertical gap={16} style={{ padding: 24, boxSizing: 'border-box' }}>
      {/* 标题区 */}
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: vcTokens.color.neutral.text.default }}>
          VTell 对话区
        </h2>
        <p style={{ fontSize: 14, color: vcTokens.color.neutral.text.label, margin: '8px 0 0' }}>
          纯 UI 组件，不包含 Agent 路由逻辑。支持多表格对话历史切换、L0 句式补全。
        </p>
      </div>

      {/* 对话区演示 */}
      <div
        style={{
          height: 400,
          border: `1px solid ${vcTokens.color.neutral.border.default}`,
          borderRadius: 8,
          overflow: 'hidden',
          background: vcTokens.color.neutral.background.layout,
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        {/* VTell 组件 */}
        <VTell
          messages={messages}
          sending={sending}
          onSend={onSend}
          widthPx={400}
          llmOptions={llmOptions}
          llmValue={llmValue}
          onLlmChange={setLlmValue}
          placeholder="输入指令，演示对话效果"
          l0Completions={l0Completions}
        />

        {/* 占位区域（模拟表格区） */}
        <div
          style={{
            flex: 1,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: vcTokens.color.neutral.text.label,
            fontSize: 14,
          }}
        >
          表格区占位（实际使用时与 VTable 配合）
        </div>
      </div>

      {/* 使用说明 */}
      <div
        style={{
          padding: 16,
          background: vcTokens.color.neutral.background.container,
          borderRadius: 8,
          fontSize: 13,
          lineHeight: '20px',
          color: vcTokens.color.neutral.text.description,
        }}
      >
        <strong style={{ color: vcTokens.color.neutral.text.default }}>快捷键：</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          <li>Alt+/ — 展开/关闭 L0 补全面板</li>
          <li>↑↓ — 在补全列表中导航</li>
          <li>Enter — 选择补全项或发送消息</li>
          <li>Esc — 关闭补全面板</li>
        </ul>
      </div>
    </Flex>
  );
}