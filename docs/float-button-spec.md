# FloatButton 悬浮按钮 组件规范（vc-design）

基于 Ant Design 5 的 FloatButton，通过 VC Tokens 统一外观。悬浮于页面固定位置的快捷操作按钮。

---

## 1. 尺寸与形状

| 形状 | 说明 | 圆角 Token |
|------|------|------------|
| **circle** | 圆形（默认） | 50% 圆形 |
| **square** | 方形 | `vcTokens.style.borderRadius.lg`（8px） |

- 主按钮尺寸由 AntD 默认（约 56px 圆形/方形），与全局 `colorPrimary` 等 token 一致即可。

---

## 2. 类型（Type）

| 类型 | 说明 | Token 来源 |
|------|------|------------|
| **default** | 默认，白底描边 | 背景 `color.neutral.background.container`，边框 `color.neutral.border.default`，图标/文字 `color.neutral.text.default` |
| **primary** | 主色填充 | 背景 `color.primary.default`（#0888FF），图标/文字 `color.neutral.text.solid`；hover 使用 `color.primary.hover`，active 使用 `color.primary.active` |

- 主色系来自：`vcTokens.color.primary.*`
- 中性色来自：`vcTokens.color.neutral.*`

---

## 3. 状态与颜色

| 状态 | primary | default |
|------|---------|---------|
| **默认** | 背景 #0888FF，图标白色 | 背景白，边框 #E1E2E4，图标 rgba(0,0,0,0.9) |
| **Hover** | 背景 #39A0FF | 背景 rgba(0,0,0,0.02)，边框略深 |
| **Active** | 背景 #077AE5 | 背景 rgba(0,0,0,0.05) |

---

## 4. 子组件与能力

- **FloatButton**：单按钮，支持 `icon`、`description`（仅 square）、`tooltip`、`type`、`shape`、`onClick`、`href`、`badge`。
- **FloatButton.Group**：组合多个 FloatButton，支持 `shape`、`trigger`（click/hover 菜单）、`placement`（top/right/bottom/left）、`open` / `onOpenChange` 受控。
- **FloatButton.BackTop**：回到顶部，支持 `visibilityHeight`、`duration`、`target`。

---

## 5. 图标

- 使用 `VcIcon` 作为 `icon` 传入，默认使用无 `-filled` 后缀的 type（如 `type="add"`）。
- 图标与文字颜色由类型/状态继承，无需单独指定。

---

## 6. Token 映射汇总

- `colorPrimary` / `colorPrimaryHover` / `colorPrimaryActive` → primary 悬浮按钮背景
- `colorBgContainer` / `colorBorder` / `colorText` → default 悬浮按钮
- `borderRadiusLG` → square 形状圆角

以上由 `buildAntdTheme(vcTokens)` 全局注入，FloatButton 无需单独 components 覆盖即可生效。
