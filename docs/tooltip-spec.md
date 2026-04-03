# Tooltip 组件规范（vc-design）

基于 Ant Design 5 的 Tooltip，用于悬停或聚焦时展示简短说明，通过 VC Tokens 统一气泡样式。

---

## 1. 用途与触发

- **用途**：简短文字提示，不承载复杂内容（复杂内容用 Popover）。
- **触发**：默认悬停（hover）触发；可通过 `trigger` 配置为 `focus`、`click` 等。
- **内容**：通过 `title` 传入字符串或 React 节点；建议以纯文本或极简排版为主。

---

## 2. 位置（placement）

| 值 | 说明 |
|----|------|
| **top** / **topLeft** / **topRight** | 上方，居中或偏左/偏右 |
| **bottom** / **bottomLeft** / **bottomRight** | 下方 |
| **left** / **leftTop** / **leftBottom** | 左侧 |
| **right** / **rightTop** / **rightBottom** | 右侧 |

- 默认 `top`；当空间不足时 antd 会自动调整（`autoAdjustOverflow`）。
- 箭头与气泡间距、箭头大小由组件与主题控制，与 `vcTokens.size.paddingXS` 等保持一致即可。

---

## 3. 样式与 Token

| 项 | Token 映射 |
|----|------------|
| 气泡背景（默认深色） | 使用 antd 默认 dark 气泡时，由主题 token 控制 |
| 气泡文字 | 对比色，保证可读 |
| 箭头 | 与气泡同色，指向触发元素 |
| 圆角 | `vcTokens.style.borderRadius.sm`（4px）或 antd 默认 |

- **color**：可传入预设色（如 `blue`、`green`），对应 `vcTokens.color.primary.default`、`vcTokens.color.success.default` 等，用于浅色气泡背景。

---

## 4. 箭头与容器

- **arrow**：`true`（默认）显示箭头；`false` 不显示；可传 `{ pointAtCenter: true }` 使箭头指向触发元素中心。
- **getPopupContainer**：挂载节点，默认 `document.body`；若需限制在某一区域内，可指定为滚动容器节点以避免裁剪。

---

## 5. 与其它组件配合

- 包裹 **Button**、**图标（VcIcon）**、**Typography.Text** 等时，需保证触发区域可聚焦或可被鼠标覆盖（如禁用按钮需单独处理）。
- 图标仅使用 **VcIcon**；若 Tooltip 内需图标，同样使用 `VcIcon`。

---

## 6. 其他

- **open / defaultOpen / onOpenChange**：受控或非受控显隐。
- **destroyOnHidden**：隐藏时销毁内容，适合内容较重时使用。
