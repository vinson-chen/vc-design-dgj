# Alert 组件规范（vc-design）

基于 Ant Design 5 的 Alert（警告提示），用于页面内醒目的提示与反馈，通过 VC Tokens 统一类型色与间距。

---

## 1. 类型（type）

| 类型 | 说明 | Token 映射 |
|------|------|------------|
| **success** | 成功提示 | `vcTokens.color.success.default`、`color.success.background` |
| **info** | 信息提示 | `vcTokens.color.info.default` 或主色 `color.primary.default` |
| **warning** | 警告提示 | `vcTokens.color.warning.default`、`color.warning.background` |
| **error** | 错误提示 | `vcTokens.color.error.default`、`color.error.background` |

- 未传 `type` 时使用默认样式（中性色或 info）。

---

## 2. 内容与结构

| 属性 | 说明 |
|------|------|
| **title** | 主标题，建议简短 |
| **description** | 补充描述，可多行 |
| **action** | 右侧操作区，如按钮链接 |
| **showIcon** | 是否显示左侧类型图标（默认 true 时部分类型显示） |
| **icon** | 自定义图标，仅使用 **VcIcon** |

- 仅标题时单行展示；有 description 时区块化排版。

---

## 3. 可关闭（closable）

- **closable**：为 `true` 时显示关闭按钮；可传对象 `{ closeIcon?, onClose?, afterClose? }`。
- 关闭图标建议使用 `VcIcon type="close"`；关闭后需由业务控制不再渲染或配合 `afterClose` 做动画。

---

## 4. 样式与 Token

- 内边距、圆角与 antd 一致，可选使用 `vcTokens.size.paddingMD`、`vcTokens.style.borderRadius.md`。
- 边框/背景：各类型对应语义色与浅色背景；文字对比度符合可读性。
- **banner**：为 true 时适用顶部横幅场景，去掉圆角等。

---

## 5. 其他

- **role**：无障碍用途，如 `alert`。
- 与 Message/Notification 区别：Alert 为页面内静态区块，不自动消失；Message/Notification 为轻量级全局反馈。
