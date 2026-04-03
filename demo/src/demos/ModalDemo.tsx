import React, { useState } from 'react';
import { Modal, Button, Space, Form, Input, vcTokens, VcIcon } from 'vc-design';

export default function ModalDemo() {
  const [openBasic, setOpenBasic] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openFooter, setOpenFooter] = useState(false);
  const [openWidth, setOpenWidth] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openAsync, setOpenAsync] = useState(false);
  const [openNoTitle, setOpenNoTitle] = useState(false);

  const showStatic = () => {
    Modal.info({
      title: '信息',
      content: '这是一条信息类对话框，用于告知用户。',
    });
  };

  const showConfirm = () => {
    Modal.confirm({
      title: '确认操作',
      content: '确定要执行该操作吗？',
      okText: '确定',
      cancelText: '取消',
    });
  };

  const showSuccess = () => {
    Modal.success({
      title: '操作成功',
      content: '您的修改已保存。',
    });
  };

  const showWarning = () => {
    Modal.warning({
      title: '注意',
      content: '请先完成必填项再提交。',
    });
  };

  const showError = () => {
    Modal.error({
      title: '操作失败',
      content: '网络异常，请稍后重试。',
    });
  };

  const handleAsyncOk = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1500);
    });
  };

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
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Modal 对话框</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        居中弹出的模态对话框，用于重要操作确认与信息展示。规范见 docs/modal-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>基本</h2>
        <div style={sectionStyle}>
          <Button type="primary" onClick={() => setOpenBasic(true)}>
            打开对话框
          </Button>
          <Modal
            title="基本对话框"
            open={openBasic}
            onOk={() => setOpenBasic(false)}
            onCancel={() => setOpenBasic(false)}
          >
            <p style={{ color: vcTokens.color.neutral.text.description }}>
              用于展示简单信息或进行基本确认操作。
            </p>
          </Modal>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>确认对话框与自定义按钮</h2>
        <div style={sectionStyle}>
          <Button danger onClick={() => setOpenConfirm(true)}>
            删除前确认
          </Button>
          <Modal
            title="删除确认"
            open={openConfirm}
            onOk={() => setOpenConfirm(false)}
            onCancel={() => setOpenConfirm(false)}
            okText="删除"
            okType="primary"
            cancelText="取消"
            closeIcon={<VcIcon type="close" />}
          >
            <p style={{ color: vcTokens.color.neutral.text.description }}>
              此操作无法撤销，请确认是否删除。
            </p>
          </Modal>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>静态方法</h2>
        <div style={sectionStyle}>
          <Space wrap>
            <Button onClick={showStatic}>Info</Button>
            <Button onClick={showConfirm}>Confirm</Button>
            <Button onClick={showSuccess}>Success</Button>
            <Button onClick={showWarning}>Warning</Button>
            <Button danger onClick={showError}>Error</Button>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>自定义页脚</h2>
        <div style={sectionStyle}>
          <Button onClick={() => setOpenFooter(true)}>自定义 footer</Button>
          <Modal
            title="自定义页脚"
            open={openFooter}
            onCancel={() => setOpenFooter(false)}
            footer={
              <Space>
                <Button onClick={() => setOpenFooter(false)}>稍后再说</Button>
                <Button type="primary" onClick={() => setOpenFooter(false)}>
                  知道了
                </Button>
              </Space>
            }
          >
            <p style={{ color: vcTokens.color.neutral.text.description }}>
              通过 footer 传入自定义按钮，可隐藏默认的确定/取消。
            </p>
          </Modal>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>自定义宽度</h2>
        <div style={sectionStyle}>
          <Button onClick={() => setOpenWidth(true)}>宽对话框</Button>
          <Modal
            title="较宽对话框"
            width={640}
            open={openWidth}
            onOk={() => setOpenWidth(false)}
            onCancel={() => setOpenWidth(false)}
          >
            <p style={{ color: vcTokens.color.neutral.text.description }}>
              通过 width 指定宽度（如 640px），适合内容较多的场景。
            </p>
          </Modal>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>表单对话框</h2>
        <div style={sectionStyle}>
          <Button type="primary" onClick={() => setOpenForm(true)}>
            编辑
          </Button>
          <Modal
            title="编辑信息"
            open={openForm}
            onOk={() => setOpenForm(false)}
            onCancel={() => setOpenForm(false)}
            okText="保存"
            cancelText="取消"
            width={480}
          >
            <Form layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item label="名称" name="name" rules={[{ required: true }]}>
                <Input placeholder="请输入名称" />
              </Form.Item>
              <Form.Item label="备注" name="remark">
                <Input.TextArea rows={3} placeholder="选填" />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>异步关闭</h2>
        <div style={sectionStyle}>
          <Button onClick={() => setOpenAsync(true)}>提交（模拟异步）</Button>
          <Modal
            title="异步提交"
            open={openAsync}
            onOk={handleAsyncOk}
            onCancel={() => setOpenAsync(false)}
            okText="提交"
            cancelText="取消"
          >
            <p style={{ color: vcTokens.color.neutral.text.description }}>
              onOk 返回 Promise 时，确定按钮会显示 loading，resolve 后关闭。
            </p>
          </Modal>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>无标题与仅内容</h2>
        <div style={sectionStyle}>
          <Button onClick={() => setOpenNoTitle(true)}>无标题</Button>
          <Modal
            open={openNoTitle}
            onCancel={() => setOpenNoTitle(false)}
            footer={null}
            closable
          >
            <p style={{ color: vcTokens.color.neutral.text.description }}>
              不设置 title 且 footer 为 null 时，可做纯内容展示或自定义整块区域。
            </p>
          </Modal>
        </div>
      </section>
    </>
  );
}

