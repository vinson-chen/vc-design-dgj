# Spin 组件规范（vc-design）

基于 Ant Design 5 的 Spin（加载中），用于表示区域或全局的加载状态，通过 VC Tokens 与主题统一尺寸与颜色。

---

## 1. 用途

- **用途**：数据请求或操作进行中时展示加载指示，可单独使用或包裹内容区域。
- **使用方式**：`<Spin />` 单独展示；或 `<Spin spinning={loading}>内容</Spin>`，spinning 为 true 时在内容上方显示遮罩与加载图标。

---

## 2. 属性

| 属性 | 说明 |
|------|------|
| **spinning** | 是否处于加载状态，默认 true；包裹内容时通常与请求状态绑定 |
| **size** | 尺寸：`small`、`default`（或 `medium`）、`large` |
| **description** | 加载图标下方的说明文字，如「加载中…」 |
| **delay** | 延迟显示（毫秒），避免闪烁，如 300 |
| **indicator** | 自定义加载图标，仅使用 **VcIcon** 或与设计一致的 SVG/元素 |
| **fullscreen** | 是否全屏遮罩，用于整页加载 |

- 未传 children 时仅显示 Spin 本身；传 children 时显示为遮罩层 + 居中 Spin。

---

## 3. 样式与 Token

- 遮罩背景使用半透明中性色，如 `vcTokens.color.neutral.background.mask` 或主题默认。
- 加载图标颜色使用 `vcTokens.color.primary.default`。
- 尺寸与 antd 一致，必要时通过 theme 的 Spin token 调整。

---

## 4. 其他

- **percent**：可显示进度（如 `percent={60}` 或 `"auto"`），用于已知进度的场景。
- 与 Skeleton 区分：Spin 为动态加载指示；Skeleton 为静态占位骨架，二者可配合使用。
