import React from 'react';
import { Popconfirm, Button, Space, vcTokens, VcIcon } from 'vc-design';

export default function PopconfirmDemo() {
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
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Popconfirm 气泡确认框</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        点击触发元素后弹出确认气泡，用于删除、提交等操作的二次确认。规范见 docs/popconfirm-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>基本</h2>
        <div style={sectionStyle}>
          <Popconfirm
            title="确定要执行此操作吗？"
            onConfirm={() => {}}
            onCancel={() => {}}
          >
            <Button>删除</Button>
          </Popconfirm>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>带描述</h2>
        <div style={sectionStyle}>
          <Popconfirm
            title="确定提交？"
            description="提交后将进入审核流程，请确认信息无误。"
            onConfirm={() => {}}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary">提交</Button>
          </Popconfirm>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>危险操作</h2>
        <div style={sectionStyle}>
          <Popconfirm
            title="确定删除该条记录？"
            description="删除后无法恢复。"
            onConfirm={() => {}}
            okText="删除"
            okType="danger"
            cancelText="取消"
          >
            <Button danger>删除</Button>
          </Popconfirm>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>自定义图标</h2>
        <div style={sectionStyle}>
          <Popconfirm
            title="确定要离开当前页？"
            description="未保存的修改将丢失。"
            icon={<VcIcon type="warning" />}
            onConfirm={() => {}}
            okText="离开"
            cancelText="留下"
          >
            <Button>离开页面</Button>
          </Popconfirm>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>位置（placement）</h2>
        <div style={sectionStyle}>
          <Space wrap>
            <Popconfirm
              title="确认？"
              placement="top"
              onConfirm={() => {}}
            >
              <Button>top</Button>
            </Popconfirm>
            <Popconfirm
              title="确认？"
              placement="bottom"
              onConfirm={() => {}}
            >
              <Button>bottom</Button>
            </Popconfirm>
            <Popconfirm
              title="确认？"
              placement="left"
              onConfirm={() => {}}
            >
              <Button>left</Button>
            </Popconfirm>
            <Popconfirm
              title="确认？"
              placement="right"
              onConfirm={() => {}}
            >
              <Button>right</Button>
            </Popconfirm>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>仅确认按钮</h2>
        <div style={sectionStyle}>
          <Popconfirm
            title="已了解上述说明？"
            onConfirm={() => {}}
            showCancel={false}
            okText="知道了"
          >
            <Button>查看说明</Button>
          </Popconfirm>
        </div>
      </section>
    </>
  );
}
