import React, { useState } from 'react';
import { FloatButton, VcIcon, vcTokens } from 'vc-design';

/** 每个演示块单独成「视口」，FloatButton 固定在该块右下角，不叠加到页面右下角 */
const demoBlockStyle: React.CSSProperties = {
  background: vcTokens.color.neutral.background.layout,
  borderRadius: vcTokens.style.borderRadius.lg,
  padding: 24,
  position: 'relative',
  minHeight: 200,
  overflow: 'hidden',
  transform: 'translateZ(0)', // 形成 fixed 的包含块，与 antd 文档演示区一致
};

export default function FloatButtonDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>FloatButton 悬浮按钮</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        悬浮于页面固定位置的按钮，支持类型、形状、描述、气泡卡片、按钮组与回到顶部。图标使用 VcIcon，默认无 -filled 后缀。每个演示块为独立区域，按钮固定在该块右下角。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本
        </h2>
        <div style={demoBlockStyle}>
          <FloatButton icon={<VcIcon type="add" />} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          类型（Type）
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ ...demoBlockStyle, flex: '1 1 200px', minWidth: 200 }}>
            <FloatButton type="default" icon={<VcIcon type="add" />} />
          </div>
          <div style={{ ...demoBlockStyle, flex: '1 1 200px', minWidth: 200 }}>
            <FloatButton type="primary" icon={<VcIcon type="add" />} />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          形状（Shape）
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ ...demoBlockStyle, flex: '1 1 200px', minWidth: 200 }}>
            <FloatButton shape="circle" icon={<VcIcon type="add" />} />
          </div>
          <div style={{ ...demoBlockStyle, flex: '1 1 200px', minWidth: 200 }}>
            <FloatButton shape="square" icon={<VcIcon type="add" />} />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          描述（仅 square）
        </h2>
        <div style={demoBlockStyle}>
          <FloatButton
            shape="square"
            type="primary"
            icon={<VcIcon type="add" />}
            description="新建"
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          气泡卡片（tooltip）
        </h2>
        <div style={demoBlockStyle}>
          <FloatButton icon={<VcIcon type="add" />} tooltip="新建" />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          按钮组（Group）
        </h2>
        <div style={{ ...demoBlockStyle, minHeight: 260 }}>
          <FloatButton.Group>
            <FloatButton icon={<VcIcon type="add" />} />
            <FloatButton icon={<VcIcon type="mail" />} />
          </FloatButton.Group>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          菜单模式（trigger）
        </h2>
        <div style={{ ...demoBlockStyle, minHeight: 260 }}>
          <FloatButton.Group trigger="click" open={open} onOpenChange={setOpen}>
            <FloatButton icon={<VcIcon type="add" />} />
            <FloatButton icon={<VcIcon type="mail" />} />
            <FloatButton icon={<VcIcon type="setting" />} />
          </FloatButton.Group>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          回到顶部（BackTop）
        </h2>
        <div
          style={{
            ...demoBlockStyle,
            height: 280,
            minHeight: 280,
            overflow: 'auto',
          }}
          id="float-button-backtop-target"
        >
          <p style={{ color: vcTokens.color.neutral.text.description }}>
            向下滚动后，右下角会出现回到顶部按钮。
          </p>
          <div style={{ height: 400 }} />
          <FloatButton.BackTop
            target={() => document.getElementById('float-button-backtop-target')!}
            visibilityHeight={80}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          徽标数（badge）
        </h2>
        <div style={demoBlockStyle}>
          <FloatButton icon={<VcIcon type="mail" />} badge={{ count: 5 }} />
        </div>
      </section>
    </>
  );
}
