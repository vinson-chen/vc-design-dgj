import React from 'react';
import { Progress, Space, vcTokens } from 'vc-design';

export default function ProgressDemo() {
  const sectionStyle = {
    background: vcTokens.color.neutral.background.layout,
    borderRadius: vcTokens.style.borderRadius.lg,
    padding: 24,
  };
  const h2Style = {
    fontSize: 16,
    marginBottom: 12,
    color: vcTokens.color.neutral.text.label,
  };

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Progress 进度条</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        展示任务完成度或加载进度，支持线型、环形与仪表盘。规范见 docs/progress-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>基本（线型）</h2>
        <div style={sectionStyle}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Progress percent={30} />
            <Progress percent={50} />
            <Progress percent={80} />
            <Progress percent={100} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>状态</h2>
        <div style={sectionStyle}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Progress percent={40} status="normal" />
            <Progress percent={70} status="success" />
            <Progress percent={50} status="exception" />
            <Progress percent={60} status="active" />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>尺寸与不显示文字</h2>
        <div style={sectionStyle}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Progress percent={50} size="small" />
            <Progress percent={50} size="default" />
            <Progress percent={50} showInfo={false} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>自定义 format</h2>
        <div style={sectionStyle}>
          <Progress
            percent={66}
            format={(percent) => `已完成 ${percent ?? 0} 步`}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>环形（circle）</h2>
        <div style={sectionStyle}>
          <Space size="large" wrap>
            <Progress type="circle" percent={30} />
            <Progress type="circle" percent={70} status="success" />
            <Progress type="circle" percent={100} />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>仪表盘（dashboard）</h2>
        <div style={sectionStyle}>
          <Space size="large" wrap>
            <Progress type="dashboard" percent={75} />
            <Progress type="dashboard" percent={100} status="success" />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>步骤条进度</h2>
        <div style={sectionStyle}>
          <Progress percent={50} steps={5} />
          <Progress percent={30} steps={10} style={{ marginTop: 16 }} />
        </div>
      </section>
    </>
  );
}
