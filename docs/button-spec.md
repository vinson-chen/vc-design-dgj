# Button 组件规范（vc-design）

基于 Ant Design 5 的 Button，通过 VC Tokens 统一外观与尺寸。

---

## 1. 尺寸（Size）

| 尺寸 | 高度 | 水平内边距 | 字号 | 圆角 | Token 来源 |
|------|------|------------|------|------|------------|
| **Large** | 40px | 15px | 16px | 8px | `controlHeightLG` / `borderRadiusLG` |
| **Middle** | 32px | 15px | 14px | 6px | `controlHeight` / `borderRadius` |
| **Small** | 24px | 7px | 12px | 4px | `controlHeightSM` / `borderRadiusSM` |

- 高度来自：`vcTokens.size.controlHeight.{lg | md | sm}`
- 圆角来自：`vcTokens.style.borderRadius.{lg | md | sm}`
- 纯图标描边按钮（业务实例特例）：固定 **32px × 32px**（例如 VTable 图片列 add）。

---

## 2. 类型（Type）

| 类型 | 说明 | 主色 Token |
|------|------|------------|
| **primary** | 主按钮，主要操作 | `color.primary.default`，hover/active 使用 `color.primary.hover` / `color.primary.active` |
| **default** | 默认按钮，次要操作 | 边框 `color.neutral.border.default`，文字 `color.neutral.text.default` |
| **dashed** | 虚线边框 | 同 default，边框样式为 dashed |
| **link** | 链接样式 | 文字 `color.primary.text`，hover 使用 `color.primary.textHover` |
| **text** | 文字按钮 | 无边框无背景，文字同 default，hover 使用 `color.neutral.fill.secondary` |

---

## 3. 状态与颜色

| 状态 | 主按钮 (primary) | 默认/虚线 (default/dashed) |
|------|------------------|----------------------------|
| **默认** | 背景 `#0888FF` | 背景透明，边框 `#E1E2E4`，文字 `rgba(0,0,0,0.9)` |
| **Hover** | 背景 `#39A0FF` | 边框与文字略深，背景 `rgba(0,0,0,0.02)` |
| **Active** | 背景 `#077AE5` | 背景 `rgba(0,0,0,0.05)` |
| **Disabled** | 背景与文字使用 disabled 透明度 | 边框与文字 `rgba(0,0,0,0.3)`，不可点击 |

- 主色系来自：`vcTokens.color.primary.*`
- 中性色来自：`vcTokens.color.neutral.*`

---

## 4. 危险按钮（danger）

- **primary + danger**：使用 `color.error.default`（#EA572E）及其 hover/active。
- **default/dashed + danger**：边框与文字使用 `color.error.default`，hover 时浅红背景。

---

## 5. 其他

- **图标**：支持前置/后置图标，与文字间距由 `paddingXS`（8px）控制。
- **Loading**：与 Ant Design 行为一致，不改变尺寸与圆角。
- **块级按钮**：`block` 时宽度 100%，高度仍按尺寸规范。

---

## 6. Token 映射汇总

- `colorPrimary` → 主按钮背景
- `colorPrimaryHover` / `colorPrimaryActive` → 主按钮悬停/按下
- `controlHeight` / `controlHeightLG` / `controlHeightSM` → 中/大/小高度
- `borderRadius` / `borderRadiusSM` / `borderRadiusLG` → 中/小/大圆角
- `fontSize` / `fontSizeSM` / `fontSizeLG` → 中/小/大字号

以上由 `buildAntdTheme(vcTokens)` 注入到 Ant Design 的 `ConfigProvider.theme`，无需在 Button 上单独传样式即可生效。
