import React, { useState } from 'react';
import { AutoComplete, vcTokens } from 'vc-design';

const staticOptions = [
  { value: 'Apple' },
  { value: 'Banana' },
  { value: 'Cherry' },
  { value: 'Date' },
  { value: 'Elderberry' },
];

export default function AutoCompleteDemo() {
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<{ value: string }[]>(staticOptions);

  const onSearch = (text: string) => {
    if (!text) {
      setOptions(staticOptions);
      return;
    }
    setOptions(
      staticOptions.filter((item) => item.value.toLowerCase().includes(text.toLowerCase()))
    );
  };

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>AutoComplete 自动完成</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        输入框自动完成，通过 options 或 onSearch 提供建议。与 Select 区别：强调输入辅助。规范见 docs/auto-complete-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <AutoComplete
            options={staticOptions}
            placeholder="输入试试"
            style={{ width: 240 }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          受控 + onSearch 过滤
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <AutoComplete
            value={value}
            options={options}
            placeholder="输入搜索"
            style={{ width: 240 }}
            onSearch={onSearch}
            onChange={setValue}
          />
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            当前值: {value || '-'}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          支持清除 + 尺寸
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AutoComplete
              options={staticOptions}
              placeholder="allowClear"
              allowClear
              style={{ width: 240 }}
            />
            <AutoComplete
              options={staticOptions}
              placeholder="size small"
              size="small"
              style={{ width: 240 }}
            />
            <AutoComplete
              options={staticOptions}
              placeholder="size large"
              size="large"
              style={{ width: 240 }}
            />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          状态与形态
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AutoComplete
              options={staticOptions}
              placeholder="status error"
              status="error"
              style={{ width: 240 }}
            />
            <AutoComplete
              options={staticOptions}
              placeholder="status warning"
              status="warning"
              style={{ width: 240 }}
            />
            <AutoComplete
              options={staticOptions}
              placeholder="variant filled"
              variant="filled"
              style={{ width: 240 }}
            />
            <AutoComplete
              options={staticOptions}
              placeholder="variant borderless"
              variant="borderless"
              style={{ width: 240 }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
