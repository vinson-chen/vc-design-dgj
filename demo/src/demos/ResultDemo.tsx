import React from 'react';
import { Result, Button, Space, vcTokens } from 'vc-design';

export default function ResultDemo() {
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
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Result 结果</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        展示操作结果或状态，包含图标/插图、标题、副标题与操作按钮。规范见 docs/result-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>基础类型</h2>
        <div style={sectionStyle}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Result
              status="success"
              title="操作成功"
              subTitle="提交已成功处理。"
              extra={
                <Space>
                  <Button type="primary">返回列表</Button>
                  <Button>查看详情</Button>
                </Space>
              }
            />
            <Result
              status="info"
              title="提示信息"
              subTitle="这里是一些说明文字。"
            />
            <Result
              status="warning"
              title="需要注意"
              subTitle="当前操作存在风险，请确认后继续。"
            />
            <Result
              status="error"
              title="操作失败"
              subTitle="请检查网络或稍后重试。"
              extra={
                <Space>
                  <Button type="primary">重试</Button>
                  <Button>返回</Button>
                </Space>
              }
            />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>异常状态页</h2>
        <div style={sectionStyle}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Result
              status="404"
              title="404"
              subTitle="抱歉，您访问的页面不存在。"
              extra={<Button type="primary">返回首页</Button>}
            />
            <Result
              status="403"
              title="403"
              subTitle="抱歉，您无权访问此页面。"
              extra={<Button type="primary">返回首页</Button>}
            />
            <Result
              status="500"
              title="500"
              subTitle="抱歉，服务器出错了。"
              extra={<Button type="primary">返回首页</Button>}
            />
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>自定义内容</h2>
        <div style={sectionStyle}>
          <Result
            status="info"
            title="操作完成"
            subTitle="以下是本次处理的明细。"
            extra={<Button type="primary">继续操作</Button>}
          >
            <div style={{ marginTop: 16, color: vcTokens.color.neutral.text.description }}>
              <p>• 已创建 3 条记录</p>
              <p>• 跳过 1 条重复记录</p>
            </div>
          </Result>
        </div>
      </section>
    </>
  );
}

