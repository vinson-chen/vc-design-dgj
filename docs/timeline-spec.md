# Timeline 组件规范（vc-design）

基于 Ant Design 5 的 Timeline，通过 VC Tokens 统一时间轴节点与连线样式。

---

## 1. 方向与模式

| 属性 | 说明 | 可选值 |
|------|------|--------|
| **orientation** | 时间轴方向 | `vertical`（默认）、`horizontal` |
| **mode** | 节点相对轴线位置（垂直时） | `left`、`right`、`alternate`（左右交替） |
| **variant** | 与 Steps 一致的变体 | 同 Steps，如默认实心/空心等 |

- 垂直时间轴为最常用；水平适用于横向流程展示。

---

## 2. 节点颜色（color）

Timeline.Item 的 `color` 与 Token 映射：

| 预设值 | 说明 | Token 映射 |
|--------|------|------------|
| **blue** | 主色/进行中 | `vcTokens.color.primary.default` |
| **green** | 成功 | `vcTokens.color.success.default` |
| **red** | 错误/失败 | `vcTokens.color.error.default` |
| **gray** | 默认/未完成 | `vcTokens.color.neutral.border.default` 或 `color.neutral.text.tertiary` |

- 连线与节点圆点颜色与上述语义色一致。

---

## 3. 节点内容

| 属性 | 说明 |
|------|------|
| **title** | 节点标题（时间或阶段名），建议使用 `vcTokens.color.neutral.text.label` 层级 |
| **content** | 节点描述正文，建议使用 `vcTokens.color.neutral.text.description` |
| **icon** | 自定义节点图标，仅使用 **VcIcon** |
| **loading** | 进行中状态，显示加载态 |

- 使用 `items` 数组或 `Timeline.Item` 子组件均可；图标与文字间距遵循 `paddingXS`（8px）。

---

## 4. 布局与间距

- 节点间距与 antd 默认一致，由组件内部 padding 控制。
- 轴线（连接线）颜色：`vcTokens.color.neutral.border.default` 或浅一级边框色。
- 与其它块级组件（如 Card、List）组合时，建议外层使用 `Space` 或合适 margin 保持留白。

---

## 5. 其他

- **reverse**：倒序展示节点，适用于“最新在上”的列表。
- **pending**：已废弃，待进行项请直接在 `items` 中增加一项并配合 `loading` 或自定义样式。
