# 切换区（Switch Area）业务组件规范（vc-design）

基于 Figma `tabs / .tab_item / store_tabs / state_tabs` 的业务切换区规范，用于页面顶部“平台切换 / 状态切换”场景。

---

## 1. 结构约定

- 容器使用 Tabs，保留现有 active 下划线样式与横向切换动效。
- `tab_item` 作为 tab label slot，承载图标 + 文案。
- 设计稿：`store_tabs` 为带图标实例；`state_tabs` 为无图标实例。
- 实现：`TypeTabs`（带图标）、`StateTabs`（无图标）。

---

## 2. tab_item 交互态

- `active`：文字主色（`vcTokens.color.primary.default`），字重 500。
- `default`：文字默认色（`vcTokens.color.neutral.text.default`）。
- `hover`：背景 `rgba(0,0,0,0.05)`。
- `pressed`：背景 `rgba(0,0,0,0.1)`。
- `disabled`：沿用 Tabs 现有效果（含禁用文字视觉与交互禁用）。

> 注意：active 下划线与切换动画不在 `tab_item` 内重写，由 Tabs 容器统一提供。

---

## 3. 图标规则

- 当 `icon` 识别为 `svg`（或无扩展名）时，解析为 `VcIcon` 的 `type`。
- 当 `icon` 识别为 `jpg/png/gif` 时，从 `packages/vc-biz/assets/store_logo` 按同名资源加载（构建生成 `storeLogoUrls`）。
- 图片资源未命中时，回退到 `otherstore.jpg`；svg 未命中时，回退 `help-circle`。

---

## 4. 业务实例

### 4.1 store_tabs（带图标）→ `TypeTabs`

- 组件导出：`TypeTabs`（`TypeTabsProps`），对应 Figma `store_tabs`。
- 图标默认读取 `packages/vc-biz/assets/store_logo` 同名图片（如 `douyin.jpg`、`pdd.jpg`）。
- 最后一项“更多平台”为动作项：点击后在页面右侧打开 Drawer（占位内容可后续替换）。

### 4.2 state_tabs（无图标）

- 关闭图标显示，仅展示文字状态切换。
- 建议保留至少一个 `disabled` 项用于交互验收。

---

## 5. 代码落点（demo）

- 带图标封装：`packages/vc-biz/src/switch-tabs/TypeTabs.tsx`
- 无图标封装：`packages/vc-biz/src/switch-tabs/StateTabs.tsx`
- 底层导航：`packages/vc-biz/src/switch-tabs/SwitchTabs.tsx`
- 图标解析：`packages/vc-biz/src/switch-tabs/iconResolver.ts`
- Demo：`demo/src/demos/SwitchAreaDemo.tsx`

---

## 6. SwitchTabs Token 映射（实现口径）

`SwitchTabs` 在根节点注入 `--switch-tabs-*` CSS 变量，值统一来自 `vcTokens`，避免样式散落硬编码。

| CSS 变量 | 来源 token / 数值 | 用途 |
|---|---|---|
| `--switch-tabs-color-text` | `vcTokens.color.neutral.text.default` | 默认文本色 |
| `--switch-tabs-color-text-disabled` | `vcTokens.color.neutral.text.disabled` | 禁用文本色 |
| `--switch-tabs-color-primary` | `vcTokens.color.primary.default` | 选中文本色、ink-bar 颜色 |
| `--switch-tabs-color-primary-border` | `vcTokens.color.primary.border` | focus-visible 描边 |
| `--switch-tabs-color-border` | `vcTokens.color.neutral.border.default` | tabs 底描边 |
| `--switch-tabs-bg-hover` | `vcTokens.color.neutral.fill.secondary` | hover 背景 |
| `--switch-tabs-bg-pressed` | `vcTokens.color.neutral.fill.default` | pressed 背景 |
| `--switch-tabs-tab-padding-y` | `vcTokens.size.padding.xs` | tab 垂直外层间距 |
| `--switch-tabs-more-margin-left` | `vcTokens.size.padding.xxs` | more 按钮左侧间距 |
| `--switch-tabs-item-gap` | `vcTokens.size.padding.xs` | 图标与文案间距 |
| `--switch-tabs-item-min-height` | `vcTokens.size.controlHeight.md` | item 高度（32） |
| `--switch-tabs-item-padding-h` | `vcTokens.size.padding.sm` | item 水平内边距 |
| `--switch-tabs-item-radius` | `vcTokens.style.borderRadius.md` | item 圆角（6） |
| `--switch-tabs-font-size` | `vcTokens.style.font.size.base` | 字号（14） |
| `--switch-tabs-line-height` | `vcTokens.style.font.lineHeight.base` | 行高（22） |

### 固定语义值（与 Figma 对齐）

以下值当前为语义常量（非 vcTokens 字段），用于保持与 Figma `.tab_item`/`tabs` 的视觉一致：

- `--switch-tabs-nav-min-height`: `48px`（tabs 导航高）
- `--switch-tabs-item-padding-v`: `5px`（item 纵向内边距）
- `--switch-tabs-font-weight-default`: `400`
- `--switch-tabs-font-weight-active`: `500`
- `--switch-tabs-ink-bar-height`: `2px`
- `--switch-tabs-panel-min-height`: `40px`

---

## 7. 自适应收纳规则（more）

- 当 `tabs` 可视宽度不足时，选项会按顺序逐个收纳到 `more` 下拉菜单。
- `TypeTabs` / 设计稿 `store_tabs` 的“更多平台”是独立业务项，可被收纳；并非收纳按钮本身。
- 收纳按钮为纯图标（无“更多”文字）。
- 若当前激活项位于收纳菜单中，`more` 按钮进入 active 态，且 `ink-bar` 跟随到 `more` 下方。
