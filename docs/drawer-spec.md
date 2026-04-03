# Drawer 组件规范（vc-design）

基于 Ant Design 5 的 Drawer（抽屉），从侧边或上下滑出的面板，通过 VC Tokens 统一宽度、遮罩与内边距。

---

## 1. 位置与尺寸

| 属性 | 说明 | 可选值 / Token |
|------|------|----------------|
| **placement** | 滑出方向 | `right`（默认）、`left`、`top`、`bottom` |
| **size** | 宽度（左右）或高度（上下） | `default`、`large`，或数字/字符串（如 `400`、`'30%'`） |

- 默认宽度与 antd 一致；大尺寸时使用更宽预设。圆角、内边距可对齐 `vcTokens.size.paddingMD`、`vcTokens.style.borderRadius.lg`。

---

## 2. 结构与内容

| 属性 | 说明 |
|------|------|
| **title** | 标题栏文案或 React 节点 |
| **extra** | 标题栏右侧额外内容（如操作按钮） |
| **footer** | 底部区域，通常放「确定」「取消」等按钮 |
| **closable** | 是否显示关闭按钮，可配 `closeIcon`、`onClose` |
| **closeIcon** | 自定义关闭图标，仅使用 **VcIcon**（如 `type="close"`） |
| **loading** | 内容区 loading 态 |

- 内容区（children）可任意排版；与 Modal 区别为从侧边/上下滑出，适合表单、详情等较长内容。

---

## 3. 显隐与遮罩

| 属性 | 说明 |
|------|------|
| **open** | 是否显示（受控） |
| **onClose** | 关闭时回调（点击关闭按钮、遮罩或 Esc） |
| **afterOpenChange** | 打开/关闭动画结束后回调 |
| **mask** | 是否显示遮罩，可传对象配置 `closable` 等 |
| **maskClosable** | 点击遮罩是否关闭（已废弃，用 `mask.closable`） |
| **destroyOnHidden** | 关闭后是否销毁内容，便于每次打开重新挂载 |

---

## 4. 样式与 Token

- 面板背景：`vcTokens.color.neutral.background.container` 或主题默认。
- 遮罩色与动画与 antd 一致；需定制时通过 `styles` / `classNames` 覆盖。
- **resizable**：可配置是否可拖拽调整宽度（左右抽屉）。

---

## 5. 其他

- **focusable**：关闭后焦点是否回到触发元素，无障碍场景建议保持默认。
- 与 Modal 选择：内容偏长、需从侧边展开时用 Drawer；居中弹窗用 Modal。
