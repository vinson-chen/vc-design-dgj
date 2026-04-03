# Icon 图标 组件规范（vc-design）

基于项目提供的 iconfont 图标库，通过 `VcIcon` 组件统一使用。不依赖 `@ant-design/icons`，图标与 iconfont 项目一一对应。

---

## 1. 组件与用法

- **组件名**：`VcIcon`（从 `vc-design` 引入）。
- **渲染方式**：`<i className="iconfont icon-{type}" />`，需在页面中已加载 iconfont 的 Font class 样式（含 `@font-face` 与 `.icon-xxx` 定义）。
- **基本用法**：
  - `type`：必填，对应 iconfont 的 class 后缀。如 `type="search"` 渲染为 `icon-search`。
  - 同一图标若有线框与实底两种（如 `search` / `search-filled`），**默认使用无 `-filled` 后缀**；需要实底时传 `type="search-filled"`。

---

## 2. API（VcIconProps）

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 图标类型，对应 iconfont class 后缀（`icon-{type}`） | string | - |
| fontSize | 图标字号 | number \| string | - |
| style | 内联样式 | CSSProperties | - |
| className | 额外类名 | string | - |

继承 `React.HTMLAttributes<HTMLElement>`（除 `children`），可传 `onClick`、`aria-*` 等。

---

## 3. 尺寸与颜色

- **尺寸**：通过 `fontSize` 或 `style.fontSize` 控制，常用 14px、16px、20px 与文案对齐；亦可使用 `vcTokens.style.font.size.base`（14）等。
- **颜色**：继承父级 `color`（`currentColor`），可通过父级或 `style.color` 设置；与 AntD 组件同用时由组件 token 控制。

---

## 4. 图标库来源

- 图标来自你在 iconfont 上的项目（Project id 5131978），与本地 `icon` 目录中 SVG 对应。
- 使用前需在页面引入 iconfont 的 **Font class** 在线链接或本地 CSS，确保 `.iconfont` 与 `.icon-{type}` 已定义。
- 新增/变更图标时，在 iconfont 更新后同步更新业务中使用的 `type` 或文档中的图标列表。

---

## 5. Token 与主题

- 图标不单独占用 Design Token；颜色、字号由使用场景（如 Button、Input）的 token 决定。
- 中性场景下图标颜色可对应 `vcTokens.color.neutral.text.icon`（rgba(0,0,0,0.5)），hover 对应 `color.neutral.text.iconHover`。

---

## 6. 与 Ant Design Icon 的差异

- AntD 使用 `@ant-design/icons`（SVG 组件）；vc-design 使用 **VcIcon + iconfont**，图标由字体渲染。
- 业务中统一使用 `<VcIcon type="xxx" />`，不再混用 `@ant-design/icons`，以保证风格与图标库一致。
