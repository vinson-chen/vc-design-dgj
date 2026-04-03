import React, { useState } from 'react';
import { Checkbox, Space, vcTokens } from 'vc-design';

const plainOptions = ['苹果', '梨', '橙子'];
const optionsWithDisabled = [
  { label: '苹果', value: 'apple' },
  { label: '梨', value: 'pear' },
  { label: '橙子', value: 'orange', disabled: true },
];

export default function CheckboxDemo() {
  const [checked, setChecked] = useState(false);
  const [groupValue, setGroupValue] = useState<string[]>([]);
  const [checkAll, setCheckAll] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [allList, setAllList] = useState<string[]>(['Apple', 'Pear', 'Orange']);

  const onCheckAllChange = (e: { target: { checked: boolean } }) => {
    setCheckAll(e.target.checked);
    setIndeterminate(false);
    setAllList(e.target.checked ? ['Apple', 'Pear', 'Orange'] : []);
  };

  const onItemChange = (list: string[]) => {
    setAllList(list);
    setIndeterminate(!!list.length && list.length < 3);
    setCheckAll(list.length === 3);
  };

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Checkbox 多选框</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        收集用户的多项选择，可单独使用或成组。规范见 docs/checkbox-spec.md。
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
          <Space direction="vertical">
            <Checkbox>Checkbox</Checkbox>
            <Checkbox defaultChecked>默认选中</Checkbox>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          不可用
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <Checkbox defaultChecked disabled>选中禁用</Checkbox>
            <Checkbox disabled>未选禁用</Checkbox>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          受控
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
            受控多选框
          </Checkbox>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            当前: {checked ? '选中' : '未选'}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          Checkbox 组
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical">
            <Checkbox.Group
              options={plainOptions}
              value={groupValue}
              onChange={(v) => setGroupValue(v as string[])}
            />
            <Checkbox.Group options={optionsWithDisabled} />
          </Space>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            已选: {groupValue.join(', ') || '-'}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          全选
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical">
            <Checkbox
              indeterminate={indeterminate}
              checked={checkAll}
              onChange={onCheckAllChange}
            >
              全选
            </Checkbox>
            <Checkbox.Group
              options={['Apple', 'Pear', 'Orange']}
              value={allList}
              onChange={(v) => onItemChange(v as string[])}
            />
          </Space>
        </div>
      </section>
    </>
  );
}
