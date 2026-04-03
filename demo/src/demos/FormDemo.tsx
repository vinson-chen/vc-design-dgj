import React from 'react';
import { Form, Button, Checkbox, Input, Space, vcTokens } from 'vc-design';

export default function FormDemo() {
  const [form] = Form.useForm();

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Form 表单</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        高性能表单，自带数据域与校验。规范见 docs/form-spec.md。
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
          <Form
            layout="vertical"
            initialValues={{ username: '', agree: false }}
            onFinish={(values) => console.log('submit', values)}
            onFinishFailed={(e) => console.log('failed', e)}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item
              name="agree"
              valuePropName="checked"
              rules={[{ required: true, message: '请勾选' }]}
            >
              <Checkbox>同意协议</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </Form.Item>
          </Form>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          水平布局与校验
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            onFinish={(values) => console.log(values)}
          >
            <Form.Item name="note" label="备注" rules={[{ required: true }]}>
              <Input placeholder="请输入备注" />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
              <Space>
                <Button type="primary" htmlType="submit">
                  确定
                </Button>
                <Button onClick={() => form.resetFields()}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </section>
    </>
  );
}
