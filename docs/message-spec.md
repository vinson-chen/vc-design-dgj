# Message 组件规范（vc-design）

基于 Ant Design 5 的 Message（全局提示），用于轻量级全局反馈，通过 VC Tokens 与主题统一类型色与层级。

---

## 1. 类型（type）

通过静态方法调用：

- `message.info(content, duration?, onClose?)`
- `message.success(...)`
- `message.warning(...)`
- `message.error(...)`
- `message.loading(...)`

| 类型      | 说明     | Token 映射                           |
|-----------|----------|--------------------------------------|
| **info**  | 信息提示 | `vcTokens.color.info.default` 或主色 |
| **success** | 成功提示 | `vcTokens.color.success.default`     |
| **warning** | 警告提示 | `vcTokens.color.warning.default`     |
| **error** | 错误提示 | `vcTokens.color.error.default`       |
| **loading** | 加载中 | 与 info 类似，图标为 loading 态      |

---

## 2. 调用方式

- **静态调用**：`message.success('操作成功')`。
- **受控调用**：`const [messageApi, contextHolder] = message.useMessage();`，在组件内通过 `messageApi` 调用，`contextHolder` 需要渲染在组件树中。
- **配置**：使用 `message.config` 设置全局配置，如：
  - `top`：距顶部距离
  - `duration`：默认自动关闭时间
  - `maxCount`：同一时间最多展示条数

---

## 3. 内容与时长

| 属性     | 说明                                   |
|----------|----------------------------------------|
| **content** | 文本或 React 节点，建议保持简短       |
| **duration** | 自动关闭时间（秒），`0` 表示不自动关闭 |
| **onClose**  | 关闭时回调                           |

- 内容不建议放复杂交互；复杂内容使用 Notification 或 Modal。

---

## 4. 样式与 Token

- 背景与边框颜色与各类型语义色一致（与 Alert、Notification 保持体系统一）。
- 圆角、阴影与 antd 默认一致，适配全局浮层风格。
- 文字颜色使用与背景对比度足够的中性色或反白文字。

---

## 5. 其他

- Message 为 **全局挂载**，适合简短、不会打断操作的提示。
- 需要与具体元素强绑定或提供操作按钮时，优先考虑 Alert、Notification 或 Modal。

