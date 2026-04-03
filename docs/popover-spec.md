# Popover 气泡卡片 组件规范（vc-design）

基于 Ant Design 5 的 Popover，点击/移入元素时弹出气泡式卡片浮层。

---

## 1. 何时使用

- 目标元素有进一步描述或操作时，收纳到卡片中按操作展现。
- 与 Tooltip 区别：可对浮层内元素操作，可承载链接、按钮等更复杂内容。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **title** | 卡片标题 | ReactNode \| () => ReactNode | - |
| **content** | 卡片内容 | ReactNode \| () => ReactNode | - |
| **trigger** | 触发方式 | `'hover'` \| `'focus'` \| `'click'` \| `'contextMenu'` \| 数组 | `'hover'` |
| **placement** | 气泡位置 | top/left/right/bottom 及 *Left/*Right/*Top/*Bottom | `'top'` |
| **open** / **defaultOpen** | 受控/默认显隐 | boolean | false |
| **onOpenChange** | 显隐回调 | (open: boolean) => void | - |
| **arrow** | 是否显示箭头或指向中心 | boolean \| { pointAtCenter: boolean } | true |
| **color** | 背景色 | string | - |
| **getPopupContainer** | 浮层挂载节点 | (node) => HTMLElement | () => document.body |
| **mouseEnterDelay** / **mouseLeaveDelay** | 移入/移出延时（秒） | number | 0.1 |
| **destroyOnHidden** | 关闭后销毁 DOM | boolean | false |
| **zIndex** | 层级 | number | - |
| **classNames** / **styles** | 语义化结构 | 见文档 | - |

> 子元素须能接受 onMouseEnter、onMouseLeave、onFocus、onClick 等事件；自定义子组件需用 forwardRef 透传 ref。

---

## 3. Token

titleMinWidth、zIndexPopup 等，可由 theme 覆盖。
