# Typography 排版 组件规范（vc-design）

基于 Ant Design 5 的 Typography，用于标题、段落、文本与链接的展示与交互。通过 VC Tokens 统一字体、字号、行高与颜色。

---

## 1. 字体与基础 Token

| 项 | Token 来源 | 说明 |
|----|------------|------|
| 字体 | `vcTokens.style.font.family.primary` | PingFang SC |
| 数字字体 | `vcTokens.style.font.family.number` | Barlow |
| 字号 | `vcTokens.style.font.size` | sm: 12、base: 14、md: 16、lg: 20、xl: 24、xxl: 32 |
| 行高 | `vcTokens.style.font.lineHeight` | sm: 20、base: 22、md: 24、lg: 28、xl: 32、xxl: 40 |
| 正文颜色 | `vcTokens.color.neutral.text.default` | rgba(0,0,0,0.9) |
| 次要文本 | `vcTokens.color.neutral.text.label` | rgba(0,0,0,0.7) |
| 说明/描述 | `vcTokens.color.neutral.text.description` | rgba(0,0,0,0.5) |
| 占位/禁用 | `vcTokens.color.neutral.text.placeholder` / disabled | rgba(0,0,0,0.3) |
| 链接色 | `vcTokens.color.primary.text` | #0888FF |
| 链接 Hover | `vcTokens.color.primary.textHover` | #39A0FF |

以上由 `buildAntdTheme(vcTokens)` 注入全局 token（如 `colorText`、`fontFamily`、`fontSize` 等），Typography 继承使用。

---

## 2. 标题（Title）

| 级别 | 对应 | 建议字号 Token | 说明 |
|------|------|----------------|------|
| level 1 | h1 | `style.font.size.xxl`（32px） | 页面主标题 |
| level 2 | h2 | `style.font.size.xl`（24px） | 区块标题 |
| level 3 | h3 | `style.font.size.lg`（20px） | 小节标题 |
| level 4 | h4 | `style.font.size.md`（16px） | 次级标题 |
| level 5 | h5 | `style.font.size.base`（14px） | 小标题 |

- 支持 `type`：default、secondary、success、warning、danger；颜色对应 vc-design 语义色（primary/success/warning/error）。
- 支持 `copyable`、`editable`、`ellipsis`、`mark`、`code`、`delete`、`underline`、`strong`、`italic`。
- 标题上下间距由 AntD Typography token（titleMarginTop、titleMarginBottom）控制，可按需在 theme.components.Typography 中覆盖。

---

## 3. 文本（Text）与段落（Paragraph）

- **Typography.Text**：行内/块级文本，支持 `code`、`copyable`、`delete`、`disabled`、`editable`、`ellipsis`、`keyboard`、`mark`、`strong`、`italic`、`type`、`underline`。
- **Typography.Paragraph**：块级段落，支持多行省略（`ellipsis.rows`）、可展开（`ellipsis.expandable`）、可编辑、可复制。
- 文本类型 `type`：secondary、success、warning、danger，颜色与 vcTokens 语义色一致。

---

## 4. 链接（Link）

- **Typography.Link**：继承 `color.primary.text`，hover 使用 `color.primary.textHover`。
- 支持 `copyable`、`editable`、`ellipsis` 等与 Text 相同能力。

---

## 5. 可复制（copyable）

- 复制图标使用 **VcIcon**（如不传 `icon` 则使用 AntD 默认，建议业务层统一传 `icon={[<VcIcon type="copy" />, <VcIcon type="check" />]}` 以统一图标库）。
- `tooltips`、`onCopy`、`format` 等与 AntD 一致。

---

## 6. 可编辑（editable）

- 编辑图标使用 **VcIcon**：`icon={<VcIcon type="edit" />}`，确认图标可用 `enterIcon={<VcIcon type="check" />}`。
- 支持 `editing` 受控、`maxLength`、`autoSize`、`triggerType`、`onChange`、`onStart`、`onEnd`、`onCancel`。

---

## 7. 省略（ellipsis）

- 支持单行/多行省略（`rows`）、可展开（`expandable`）、后缀（`suffix`）、`tooltip`、受控展开（`expanded`/`onExpand`）。
- 长文本省略时 tooltip 展示全文，样式继承全局 Tooltip token。

---

## 8. Token 映射汇总

- `fontFamily`、`fontSize`、`fontSizeSM`、`fontSizeLG` → 字体与字号
- `colorText`、`colorTextSecondary`、`colorTextTertiary`、`colorPrimary` → 正文、次要、链接
- Typography 组件 token：`titleMarginTop`、`titleMarginBottom`（可选在 theme.components.Typography 中覆盖）

以上由全局 theme 注入，Typography 无需单独 components 覆盖即可与 vc-design 规范一致；若需微调标题间距，可在 `buildAntdTheme` 的 `components.Typography` 中设置。
