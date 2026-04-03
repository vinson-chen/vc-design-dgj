# Tag 组件规范（vc-design）

基于 Ant Design 5 的 Tag，通过 VC Tokens 统一外观与语义色。

---

## 1. 尺寸与圆角

| 项     | 值   | Token 来源 |
|--------|------|------------|
| 高度   | 22px | 由内边距与字号推导，与 antd 默认一致 |
| 水平内边距 | 6px | `vcTokens.size.paddingXS`（8px）或略小，与 antd 一致 |
| 字号   | 12px | `vcTokens.size.fontSize.sm` |
| 圆角   | 4px | `vcTokens.style.borderRadius.sm` |

---

## 2. 类型（variant）

| 类型     | 说明 | Token 映射 |
|----------|------|------------|
| **filled** | 填充背景（默认） | 背景与边框使用语义色，文字为对应对比色 |
| **outlined** | 描边 | 边框使用语义色，背景透明，文字使用语义色 |
| **solid** | 实色 | 与 filled 类似，用于强对比场景 |

- 未传 `variant` 时与 antd 一致，默认为填充样式。
- 主色 Tag 使用：`vcTokens.color.primary.default`、`vcTokens.color.primary.background` 等。

---

## 3. 颜色（color）

| 语义/预设 | 说明 | Token 映射 |
|-----------|------|------------|
| **default** | 默认灰标 | 边框 `color.neutral.border.default`，文字 `color.neutral.text.default`，背景 `color.neutral.fill.tertiary` |
| **primary** | 主色 | `color.primary.default` / `color.primary.background` |
| **success** | 成功 | `color.success.default` |
| **processing** | 进行中 | `color.info.default` 或主色系 |
| **error** | 错误 | `color.error.default` |
| **warning** | 警告 | `color.warning.default` |
| 自定义色值 | 传入 hex/rgb 等 | 由 antd 直接应用，与设计规范一致时可配合 vcTokens |

- 所有语义色来自：`vcTokens.color.{primary|success|error|warning|neutral}.default` 及对应 background。

---

## 4. 状态

| 状态     | 说明 |
|----------|------|
| **默认** | 正常展示，可点击（若作为链接或可关闭） |
| **可关闭** | `closable` 为 true 时显示关闭图标，点击触发 `onClose` |
| **禁用** | `disabled` 为 true 时不可交互，样式变灰 |
| **链接** | 设置 `href` 时渲染为 `<a>`，可配 `target` |

- 关闭图标建议使用 `VcIcon type="close"`，与 vc-design 图标规范一致。

---

## 5. 图标与可关闭

- **图标**：通过 `icon` 传入，仅使用 `VcIcon`，如 `<Tag icon={<VcIcon type="xxx" />}>标签</Tag>`。
- **可关闭**：`closable` 或自定义 `closeIcon`，关闭图标仅用 `VcIcon`。
- 图标与文字间距遵循 `paddingXS`（8px）或 antd 默认间距。

---

## 6. 其他

- **CheckableTag**：可选标签组见 antd 文档，样式与 Token 与 Tag 一致。
- **Tag 组合**：多 Tag 排列时使用 `Space` 组件，`size` 建议 `small` 以贴合标签密度。
