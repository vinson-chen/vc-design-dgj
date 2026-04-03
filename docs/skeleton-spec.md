# Skeleton 组件规范（vc-design）

基于 Ant Design 5 的 Skeleton（骨架屏），在内容加载时展示占位区块，通过 VC Tokens 与主题统一占位色与动画。

---

## 1. 用途

- **用途**：数据或页面加载中的占位展示，减少布局跳动，提升感知性能。
- **使用方式**：单独使用 `<Skeleton />` 或通过 `loading` 包裹真实内容，`loading` 为 true 时显示骨架，为 false 时渲染 children。

---

## 2. 基础结构

| 属性 | 说明 |
|------|------|
| **avatar** | 是否显示头像占位，可传 `true` 或 `{ size?: number, shape?: 'circle' \| 'square' }` |
| **title** | 是否显示标题占位，可传 `true` 或 `{ width?: number \| string }` |
| **paragraph** | 是否显示段落占位，可传 `true` 或 `{ rows?: number, width?: ... }` |
| **active** | 是否开启动画（闪烁/渐变），默认 false |
| **round** | 是否圆角，默认 true |

- 未传 avatar/title/paragraph 时仅渲染 children 对应的骨架；传入则展示默认组合布局（头像 + 标题 + 多行段落）。

---

## 3. 加载态包裹

- **loading**：为 true 时显示 Skeleton，为 false 时渲染 children。
- 用法：`<Skeleton loading={loading} avatar title paragraph><真实内容 /></Skeleton>`，数据加载完成后将 loading 置为 false。

---

## 4. 子组件

- **Skeleton.Avatar**：独立头像占位。
- **Skeleton.Button**：按钮占位。
- **Skeleton.Input**：输入框占位。
- **Skeleton.Image**：图片占位。
- **Skeleton.Node**：自定义节点占位。

可用于自由拼装列表、表单、卡片的骨架布局。

---

## 5. 样式与 Token

- 占位背景色使用 `vcTokens.color.neutral.fill.tertiary` 或主题默认 skeleton 色。
- 动画与 antd 一致；圆角可用 `vcTokens.style.borderRadius.sm`。
