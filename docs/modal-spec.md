# Modal 组件规范（vc-design）

基于 Ant Design 5 的 Modal（对话框），用于重要操作确认、信息展示，通过 VC Tokens 与主题统一尺寸、层级与语义色。

---

## 1. 用途与类型

- **用途**：打断当前操作的弹层，进行确认、警告或展示关键信息。
- **显示方式**：
  - 组件：`<Modal open={open} onOk={...} onCancel={...} />`
  - 静态方法：`Modal.confirm`、`Modal.info`、`Modal.success`、`Modal.warning`、`Modal.error`

---

## 2. 尺寸与布局

| 属性   | 说明             | 建议值 / Token |
|--------|------------------|----------------|
| **width** | 对话框宽度       | 数字或字符串，常见如 `520`、`600` |
| **centered** | 是否垂直居中 | 默认居中即可 |

- 内边距与圆角参考：`vcTokens.size.paddingMD`、`vcTokens.style.borderRadius.lg`。

---

## 3. 内容与交互

| 属性 | 说明 |
|------|------|
| **title** | 标题内容，简短明了 |
| **children** | 主体内容，可为文本、表单或其他组件 |
| **okText** / **cancelText** | 确认/取消按钮文案 |
| **okType** | 确认按钮类型（primary/dashed/link 等） |
| **footer** | 自定义底部按钮区域，为 `null` 时不展示默认按钮 |
| **closable** | 是否显示右上角关闭按钮，可配 `closeIcon`（仅用 VcIcon） |
| **maskClosable** | 点击遮罩是否关闭，危险操作建议设为 `false` |

---

## 4. 状态与静态方法

- **组件方式**：通过 `open` 控制显示；`onOk`、`onCancel` 处理用户操作。
- **静态方式**：`Modal.confirm/info/success/warning/error`，常用于简单确认或提示：
  - 通过 `type` 与图标区分语义，颜色与 Alert/Message 一致。
  - 支持 `okButtonProps`、`cancelButtonProps` 等细化控制。

---

## 5. 样式与 Token

- 语义色：确认/错误等场景按钮与图标使用 `vcTokens.color.{primary|success|warning|error}.default`。
- 遮罩：与 Drawer 一致的半透明背景，层级高于普通页面元素。
- 支持通过 `classNames` / `styles` 精细定制标题、内容、底部等区域。

---

## 6. 其他

- 与 Drawer 区分：Modal 居中弹出，用于打断式确认；Drawer 侧边滑出，适合较长内容编辑。

