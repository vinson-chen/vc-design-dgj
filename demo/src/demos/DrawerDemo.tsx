import React, { useState } from 'react';
import { Drawer, Button, Space, vcTokens, VcIcon } from 'vc-design';

export default function DrawerDemo() {
  const [openRight, setOpenRight] = useState(false);
  const [openLeft, setOpenLeft] = useState(false);
  const [openLarge, setOpenLarge] = useState(false);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Drawer 抽屉</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        从侧边或上下滑出的面板，适用于表单、详情等较长内容。规范见 docs/drawer-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本（右侧）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Button type="primary" onClick={() => setOpenRight(true)}>
            打开抽屉
          </Button>
          <Drawer
            title="抽屉标题"
            placement="right"
            open={openRight}
            onClose={() => setOpenRight(false)}
          >
            <p style={{ color: vcTokens.color.neutral.text.description }}>
              抽屉内容区域。可放置表单、列表或任意内容。
            </p>
          </Drawer>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          左侧与自定义关闭图标
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Button onClick={() => setOpenLeft(true)}>左侧抽屉</Button>
          <Drawer
            title="左侧抽屉"
            placement="left"
            open={openLeft}
            onClose={() => setOpenLeft(false)}
            closeIcon={<VcIcon type="close" />}
          >
            <p style={{ color: vcTokens.color.neutral.text.description }}>
              从左侧滑出的抽屉，关闭图标使用 VcIcon。
            </p>
          </Drawer>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带页脚与大尺寸
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Button onClick={() => setOpenLarge(true)}>大尺寸抽屉</Button>
          <Drawer
            title="带页脚的抽屉"
            placement="right"
            size="large"
            open={openLarge}
            onClose={() => setOpenLarge(false)}
            footer={
              <Space>
                <Button onClick={() => setOpenLarge(false)}>取消</Button>
                <Button type="primary" onClick={() => setOpenLarge(false)}>
                  确定
                </Button>
              </Space>
            }
          >
            <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 16 }}>
              使用 size="large" 获得更宽面板，footer 放置操作按钮。
            </p>
          </Drawer>
        </div>
      </section>
    </>
  );
}
