import React, { useState } from 'react';
import dayjs from 'dayjs';
import { TimePicker, Space, vcTokens } from 'vc-design';

const { RangePicker } = TimePicker;

export default function TimePickerDemo() {
  const [time, setTime] = useState(dayjs('14:30:00', 'HH:mm:ss'));

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>TimePicker 时间选择框</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        输入或选择时间，支持步长、12 小时制、范围选择。规范见 docs/time-picker-spec.md。
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
            <TimePicker />
            <TimePicker value={time} onChange={(t) => t && setTime(t)} />
            <p style={{ margin: 0, fontSize: 12, color: vcTokens.color.neutral.text.description }}>
              当前: {time.format('HH:mm:ss')}
            </p>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          范围与尺寸
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical">
            <RangePicker />
            <Space>
              <TimePicker size="small" />
              <TimePicker size="middle" />
              <TimePicker size="large" />
            </Space>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          步长与禁用
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space>
            <TimePicker minuteStep={15} secondStep={10} />
            <TimePicker disabled defaultValue={dayjs('12:00:00', 'HH:mm:ss')} />
          </Space>
        </div>
      </section>
    </>
  );
}
