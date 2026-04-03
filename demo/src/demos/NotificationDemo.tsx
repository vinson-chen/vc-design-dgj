import React from 'react';
import { Button, Space, vcTokens, notification, VcIcon } from 'vc-design';

export default function NotificationDemo() {
  const [api, contextHolder] = notification.useNotification();

  const openBasic = () => {
    notification.open({
      message: '通知标题',
      description: '这是通知的补充描述，可多行。',
      placement: 'topRight' as const,
    });
  };

  const openTypes = () => {
    notification.success({
      message: '操作成功',
      description: '您的请求已处理完成。',
      placement: 'topRight',
    });
    notification.info({
      message: '提示',
      description: '这是一条信息类通知。',
      placement: 'topRight',
    });
    notification.warning({
      message: '注意',
      description: '请检查输入内容后再提交。',
      placement: 'topRight',
    });
    notification.error({
      message: '操作失败',
      description: '网络异常，请稍后重试。',
      placement: 'topRight',
    });
  };

  const openPlacement = (placement: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight') => {
    notification.info({
      message: `位置：${placement}`,
      description: '通过 placement 控制通知出现的位置。',
      placement,
    });
  };

  const openWithAction = () => {
    notification.info({
      message: '带操作的通知',
      description: '可在 description 下方放置操作按钮。',
      placement: 'topRight' as const,
      actions: (
        <Space>
          <Button type="primary" size="small" onClick={() => notification.destroy()}>
            查看
          </Button>
          <Button size="small" onClick={() => notification.destroy()}>
            关闭
          </Button>
        </Space>
      ),
    });
  };

  const openNoAutoClose = () => {
    notification.warning({
      message: '不自动关闭',
      description: 'duration 设为 false 时需用户手动关闭。',
      placement: 'topRight',
      duration: 0,
    });
  };

  const openByHook = () => {
    api.success({
      message: '通过 useNotification 调用',
      description: '在组件内使用 Hook 获取 api 后调用。',
      placement: 'topRight',
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
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Notification 通知提醒框</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        角标式通知，支持标题与描述、多种类型与位置，适用于系统级提醒。规范见 docs/notification-spec.md。
      </p>

      {contextHolder}

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>基本</h2>
        <div style={sectionStyle}>
          <Button type="primary" onClick={openBasic}>
            打开通知
          </Button>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>类型</h2>
        <div style={sectionStyle}>
          <Button onClick={openTypes}>打开多种类型</Button>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>位置（placement）</h2>
        <div style={sectionStyle}>
          <Space wrap>
            <Button onClick={() => openPlacement('topLeft')}>topLeft</Button>
            <Button onClick={() => openPlacement('topRight')}>topRight</Button>
            <Button onClick={() => openPlacement('bottomLeft')}>bottomLeft</Button>
            <Button onClick={() => openPlacement('bottomRight')}>bottomRight</Button>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>带操作与不自动关闭</h2>
        <div style={sectionStyle}>
          <Space wrap>
            <Button onClick={openWithAction}>带操作按钮</Button>
            <Button onClick={openNoAutoClose}>不自动关闭</Button>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={h2Style}>useNotification Hook</h2>
        <div style={sectionStyle}>
          <Button onClick={openByHook}>通过 useNotification 调用</Button>
        </div>
      </section>
    </>
  );
}
