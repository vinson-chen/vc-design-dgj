import React, { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { Calendar, vcTokens } from 'vc-design';

dayjs.locale('zh-cn');

export default function CalendarDemo() {
  const [value, setValue] = useState(dayjs());

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Calendar 日历</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        按日历形式展示数据，支持年/月切换与日期选择。规范见 docs/calendar-spec.md。
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
          <Calendar />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          卡片模式与受控
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Calendar
            fullscreen={false}
            value={value}
            onSelect={(date) => setValue(date)}
            onPanelChange={(date) => setValue(date)}
          />
          <p style={{ marginTop: 12, marginBottom: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
            当前选中: {value.format('YYYY-MM-DD')}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          禁用日期与显示周数
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Calendar
            fullscreen={false}
            showWeek
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </div>
      </section>
    </>
  );
}
