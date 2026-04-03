import React, { useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker, Space, vcTokens } from 'vc-design';

const { RangePicker } = DatePicker;

export default function DatePickerDemo() {
  const [date, setDate] = useState(dayjs('2024-06-01'));

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>DatePicker 日期选择框</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        输入或选择日期，支持单日、范围、年/季/月/周及时间。规范见 docs/date-picker-spec.md。
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
          <DatePicker />
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
          <DatePicker value={date} onChange={(d) => d && setDate(d)} />
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            当前: {date.format('YYYY-MM-DD')}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          范围选择
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <RangePicker />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          年 / 月 / 周
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space wrap>
            <DatePicker picker="year" placeholder="选择年" />
            <DatePicker picker="month" placeholder="选择月" />
            <DatePicker picker="week" placeholder="选择周" />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          日期时间与尺寸
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle">
            <DatePicker showTime placeholder="日期时间" />
            <Space>
              <DatePicker size="small" placeholder="小" />
              <DatePicker size="middle" placeholder="中" />
              <DatePicker size="large" placeholder="大" />
            </Space>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          禁用
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <DatePicker disabled />
            <DatePicker disabledDate={(current) => current && current > dayjs().endOf('day')} placeholder="不可选未来" />
          </Space>
        </div>
      </section>
    </>
  );
}
