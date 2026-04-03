import React, { useState } from 'react';
import { vcTokens, message } from 'vc-design';
import { FilterGroup, type FilterFieldConfig } from 'vc-biz';

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待处理', value: 'pending' },
  { label: '已完成', value: 'done' },
];

/** 无前缀文案：Input + Select + DatePicker */
const fieldsBasic: FilterFieldConfig[] = [
  {
    key: 'goodsName',
    type: 'input',
    placeholder: '请输入',
  },
  {
    key: 'status',
    type: 'select',
    placeholder: '请选择',
    options: statusOptions,
  },
  {
    key: 'bizDate',
    type: 'datePicker',
    placeholder: '选择日期',
  },
];

const fieldsDense: FilterFieldConfig[] = [
  { key: 'g1', type: 'input', placeholder: '请输入' },
  { key: 's1', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 'd1', type: 'datePicker', placeholder: '选择日期' },
  { key: 's2', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 's3', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 's4', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 'd2', type: 'datePicker', placeholder: '选择日期' },
  { key: 's5', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 's6', type: 'select', placeholder: '请选择', options: statusOptions },
];

const fieldsCollapseCase: FilterFieldConfig[] = [
  { key: 'c1', type: 'input', placeholder: '请输入' },
  { key: 'c2', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 'c3', type: 'datePicker', placeholder: '选择日期' },
  { key: 'c4', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 'c5', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 'c6', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 'c7', type: 'datePicker', placeholder: '选择日期' },
  { key: 'c8', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 'c9', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 'c10', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 'c11', type: 'select', placeholder: '请选择', options: statusOptions },
  { key: 'c12', type: 'select', placeholder: '请选择', options: statusOptions },
];

export default function FilterAreaDemo() {
  const [valueBasic, setValueBasic] = useState<Record<string, unknown>>({});
  const [valueDense, setValueDense] = useState<Record<string, unknown>>({});
  const [valueCollapse, setValueCollapse] = useState<Record<string, unknown>>({});

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>FilterArea 筛选区</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        基于 Figma <code>filter_group</code>：筛选项无前缀文案；筛选项宽度始终限制在 160~328px，
        占满时在筛选区可视宽度内等分栅格并自动换行；查询/重置按钮维持跟随/贴右规则。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基础三列
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <FilterGroup
            fields={fieldsBasic}
            value={valueBasic}
            onChange={setValueBasic}
            onSearch={() => {
              message.info(`查询：${JSON.stringify(valueBasic)}`);
            }}
            onReset={() => setValueBasic({})}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          多筛选项换行
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <FilterGroup
            fields={fieldsDense}
            value={valueDense}
            onChange={setValueDense}
            onSearch={() => {
              message.info(`查询：${JSON.stringify(valueDense)}`);
            }}
            onReset={() => setValueDense({})}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          三行以上可折叠（demo）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <FilterGroup
            fields={fieldsCollapseCase}
            value={valueCollapse}
            onChange={setValueCollapse}
            collapsible={{ maxRows: 3, defaultCollapsed: false }}
            onSearch={() => {
              message.info(`查询：${JSON.stringify(valueCollapse)}`);
            }}
            onReset={() => setValueCollapse({})}
          />
        </div>
      </section>
    </>
  );
}
