import React, { useState } from 'react';
import { vcTokens, message } from 'vc-design';
import { FilterArea, type FilterFieldConfig } from 'vc-biz';

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
      <h1 style={{ marginBottom: 8, fontWeight: 600, fontSize: 18 }}>VFilterArea 筛选区</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        <code>VFilterArea</code> 在外层提供 demo 布局容器，筛选项与查询/重置由内部 <code>VFilterGroup</code> 实现。
        设计对齐 Figma <code>filter_group</code>：筛选项无前缀文案；宽度 160~328px，可视宽度内等分栅格并换行；按钮跟随/贴右。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          FilterArea · 少量筛选项
        </h2>
        <FilterArea
          fields={fieldsBasic}
          value={valueBasic}
          onChange={setValueBasic}
          onSearch={() => {
            message.info(`查询：${JSON.stringify(valueBasic)}`);
          }}
          onReset={() => setValueBasic({})}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          FilterArea · 多筛选项换行
        </h2>
        <FilterArea
          fields={fieldsDense}
          value={valueDense}
          onChange={setValueDense}
          onSearch={() => {
            message.info(`查询：${JSON.stringify(valueDense)}`);
          }}
          onReset={() => setValueDense({})}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          FilterArea · collapsible 多行折叠
        </h2>
        <FilterArea
          fields={fieldsCollapseCase}
          value={valueCollapse}
          onChange={setValueCollapse}
          collapsible={{ maxRows: 3, defaultCollapsed: false }}
          onSearch={() => {
            message.info(`查询：${JSON.stringify(valueCollapse)}`);
          }}
          onReset={() => setValueCollapse({})}
        />
      </section>
    </>
  );
}
