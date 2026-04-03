# Divider 分割线 组件规范（vc-design）

基于 Ant Design 5 的 Divider，用于区隔内容。通过 VC Tokens 统一分割线颜色与间距。

---

## 1. 类型与方向

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| **horizontal** | 水平分割线（默认） | 区块间、段落间 |
| **vertical** | 垂直分割线 | 行内元素间（如表格操作列） |

---

## 2. 颜色与线型

| 项 | Token 来源 | 说明 |
|----|------------|------|
| 分割线颜色 | `vcTokens.color.neutral.border.default` | #E1E2E4 |
| 弱分割线 | `vcTokens.color.neutral.border.secondary` | #F0F1F2 |
| 变体 | variant | solid（默认）、dashed（虚线）、dotted（点线） |

- 由 AntD 全局 token `colorBorder`、`colorSplit` 继承，与 vc-design 中性边框一致。

---

## 3. 水平分割线

- **无文字**：单线，上下留白由组件默认或 `size`（small / middle / large）控制。
- **带文字**：`children` 传入标题，线从两侧延伸；`orientation` 可设为 `start`、`center`、`end` 控制文字位置；`orientationMargin` 控制文字与边缘距离。
- **plain**：为 true 时中间文字使用正文样式（非标题），更轻量。
- **size**（5.25.0+）：水平分割线间距大小，small / middle / large。

---

## 4. 垂直分割线

- **type="vertical"**：行内垂直分割，常用于 Text、Link 等之间。
- 横向间距由 AntD Divider token `verticalMarginInline` 等控制。

---

## 5. Token 映射汇总

- `colorBorder` / `colorSplit` → 分割线颜色（对应 `color.neutral.border.default`、`color.neutral.border.split`）
- 组件 token：`orientationMargin`、`textPaddingInline`、`verticalMarginInline`（可选在 theme.components.Divider 中覆盖）

以上由 `buildAntdTheme(vcTokens)` 全局注入，Divider 无需单独 components 覆盖即可与 vc-design 规范一致。
