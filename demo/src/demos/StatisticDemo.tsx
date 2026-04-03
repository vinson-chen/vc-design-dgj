import React from 'react';
import dayjs from 'dayjs';
import { Statistic, Row, Col, Space, vcTokens } from 'vc-design';

const deadline = Date.now() + 1000 * 60 * 60 * 2; // 2 小时后

export default function StatisticDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Statistic 统计数值</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        展示统计数值，支持标题、前后缀、精度与计时器。规范见 docs/statistic-spec.md。
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
          <Row gutter={24}>
            <Col span={8}>
              <Statistic title="活跃用户" value={112893} />
            </Col>
            <Col span={8}>
              <Statistic title="账户余额（元）" value={112893.0} precision={2} />
            </Col>
            <Col span={8}>
              <Statistic title="待处理" value={93} suffix="/ 100" />
            </Col>
          </Row>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          前缀与后缀
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="large" wrap>
            <Statistic title="反馈" value={1128} prefix="¥" />
            <Statistic title="增长率" value={11.28} suffix="%" precision={2} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          计时器（Timer）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="large" wrap>
            <Statistic.Timer title="倒计时" type="countdown" value={deadline} format="HH:mm:ss" />
            <Statistic.Timer title="正计时" type="countup" value={dayjs().subtract(1, 'hour').valueOf()} format="HH:mm:ss" />
          </Space>
        </div>
      </section>
    </>
  );
}
