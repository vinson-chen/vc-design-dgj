import React, { useCallback, useState } from 'react';
import { message } from 'vc-design';
import VInput, { type VInputLlmOption } from './VInput';

const DEMO_LLM_OPTIONS: VInputLlmOption[] = [
  { value: 'qwen', label: 'Qwen' },
  { value: 'deepseek', label: 'DeepSeek', disabled: true },
  { value: 'automation_rules', label: '自动化规则', disabled: true },
];

/**
 * VInput 输入区 — 业务组件演示（与源码同目录）。
 */
export default function VInputDemo() {
  const [draft, setDraft] = useState('');
  const [llm, setLlm] = useState('qwen');

  const onSend = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    void message.info(`已发送（演示）：${t.slice(0, 80)}${t.length > 80 ? '…' : ''}`);
    setDraft('');
  }, [draft]);

  return (
    <div style={{ maxWidth: 440, padding: 24 }}>
      <VInput
        value={draft}
        onChange={setDraft}
        onSend={onSend}
        placeholder="输入指令，Shift+Enter 换行，Enter 发送"
        llmOptions={DEMO_LLM_OPTIONS}
        llmValue={llm}
        onLlmChange={setLlm}
      />
    </div>
  );
}