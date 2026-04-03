# Popconfirm 组件规范（vc-design）

基于 Ant Design 5 的 Popconfirm（气泡确认框），在点击触发元素后弹出确认气泡，用于二次确认操作，通过 VC Tokens 与主题统一样式。

---

## 1. 用途与触发

- **用途**：在删除、提交等操作前进行轻量级二次确认，避免误操作。
- **触发**：包裹一个可点击元素（如 Button、链接），点击后弹出气泡；默认 `trigger="click"`，可改为 `hover` 等。
- **内容**：`title` 必填，为确认文案；`description` 可选，为补充说明。

---

## 2. 内容与按钮

| 属性 | 说明 |
|------|------|
| **title** | 确认标题/主文案，必填 |
| **description** | 补充描述，可选 |
| **okText** | 确认按钮文案，默认「确定」 |
| **cancelText** | 取消按钮文案，默认「取消」 |
| **okType** | 确认按钮类型：`primary`、`default`、`dashed`、`link`、`text`，危险操作用 `danger` |
| **showCancel** | 是否显示取消按钮，默认 `true` |
| **icon** | 自定义气泡内图标，仅使用 **VcIcon**（如警告用 `type="warning"`） |

- 确认/取消按钮样式与 Button 组件一致，遵循 `vcTokens.color.primary.default`、`color.error.default` 等。

---

## 3. 回调与受控

| 属性 | 说明 |
|------|------|
| **onConfirm** | 点击确认时回调，可用于执行实际操作并关闭气泡 |
| **onCancel** | 点击取消或关闭时回调 |
| **onOpenChange** | 气泡显隐变化时回调，便于受控 `open` |
| **disabled** | 为 true 时触发元素不可点击，不弹出气泡 |

- 若需受控显隐，配合 `open` 与 `onOpenChange` 使用。

---

## 4. 位置与展示

- **placement**：与 Tooltip/Popover 一致，如 `top`、`bottom`、`left`、`right` 及衍生（topLeft、bottomRight 等）。
- 气泡圆角、内边距与 Popover 统一，使用 `vcTokens.style.borderRadius.md` 等。

---

## 5. 其他

- **okButtonProps** / **cancelButtonProps**：透传至确认/取消按钮，如 `loading`、`disabled`。
- 与 Modal.confirm 区分：Popconfirm 紧贴触发元素，不打断整页；需要更强打断感时用 Modal。
