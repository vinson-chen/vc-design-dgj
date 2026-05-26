---
name: vc-biz-switch-tabs
description: 在 vc-design demo 中基于 Figma 落地业务切换区（tabs/.tab_item/store_tabs/state_tabs）的标准流程与避坑手册。用于实现带图标/无图标切换、active ink-bar、宽度不足收纳到 more、token 映射、以及样式冲突排查与回退。
---

# vc-design：业务切换区（Switch Tabs）落地规范

面向 `packages/vc-biz/src/switch-tabs` 场景。目标是快速做出“高还原 + 可维护 + 可回退”的业务切换区。

## 1) 推荐实现策略

1. 先读 Figma 节点（`join_channel` + `get_node_info`），确认：
   - `.tab_item` 状态：`active/default/hover/pressed/disabled`
   - 尺寸：导航 `48`、item `32`、圆角 `6`
   - 文本：`14/22`，active `500`
   - 色值：active `#0888FF`，hover `#ECF6FF`，pressed `#D7ECFF`，disabled `30%`
2. 优先使用“业务专用容器”实现（非 AntD Tabs 样式继承）：
   - 自渲染 `tablist + tab + panel`
   - 自渲染 `ink-bar`（`transform + width`）
   - 避免与 AntD `:hover/:active/:focus` 规则对抗
3. 图标规则固定：
   - `svg` / 无扩展：走 `VcIcon`
   - `jpg/png/gif`：走 `packages/vc-biz/assets/store_logo` 同名资源
   - 未命中回退：图片 `otherstore`，svg `help-circle`
4. 宽度适配按“操作区 more”思路实现：
   - 测量容器宽度 + 每项宽度 + more 按钮宽度
   - 从右侧逐项收纳到 `more` 菜单
   - 激活项被收纳时，`more` 显示 active 态并承接 `ink-bar`

## 2) 目录与职责

- `packages/vc-biz/src/switch-tabs/SwitchTabs.tsx`
  - 负责 tab 渲染、active 管理、ink-bar 动效、收纳逻辑
- `packages/vc-biz/src/switch-tabs/SwitchTabs.css`
  - 负责状态样式、底描边、下划线覆盖关系
- `packages/vc-biz/src/switch-tabs/iconResolver.ts`
  - 兼容入口（避免 HMR 旧路径 404）
- `packages/vc-biz/src/switch-tabs/iconResolverView.tsx`
  - 图标解析与按需加载实现
- `demo/src/demos/SwitchAreaDemo.tsx`
  - `TypeTabs` / `StateTabs` 示例（设计稿 `store_tabs` / `state_tabs`）与“更多平台”抽屉动作

## 3) Token 映射原则（必须）

1. 在 `SwitchTabs.tsx` 根节点注入 `--switch-tabs-*` CSS 变量。
2. 变量值优先来自 `vcTokens`（颜色、字号、行高、间距、圆角）。
3. 少量“语义常量”可固定（如 `nav=48`、`ink-bar=2`），但要在文档说明。
4. 禁止在多个文件重复硬编码同一视觉值。

## 4) 验收清单（逐条过）

- 视觉：
  - active 文本主色 + `500`
  - `ink-bar` 覆盖底描边（看起来是一体）
  - hover/pressed 背景与文本符合设计口径
  - disabled 不可点击且文本衰减
- 交互：
  - `TypeTabs`（`store_tabs`）的“更多平台”是独立业务项，不等同于收纳按钮
  - 宽度不足时会逐项进入 `more`
  - 激活项在 `more` 中时，`more` 有 active 态
- 工程：
  - `npm run build`（demo）通过
  - `ReadLints` 无新增错误

## 5) 本次高频踩坑与处理

1. **JSX 放在 `.ts` 导致构建失败**
   - 现象：`Expected ">" but found "type"`
   - 处理：改为 `.tsx`，或保留 `.ts` 仅做导出转发
2. **重命名后 dev HMR 仍请求旧路径**
   - 现象：`iconResolver.ts` 404、页面白屏
   - 处理：保留兼容入口文件（`iconResolver.ts` -> re-export）
3. **沿用 AntD Tabs 时颜色规则冲突**
   - 现象：hover/pressed 文本色被 `.ant-tabs-tab:hover` 改写
   - 处理：改为业务专用容器，避免层叠权重战争
4. **active 被误覆盖**
   - 现象：非选中覆盖规则影响选中项
   - 处理：规则始终分开写：`is-active` 与 `not(is-active)` 严格隔离
5. **CSS 变量作用域不稳定**
   - 现象：主色/ink-bar 不生效
   - 处理：统一改为组件根节点注入 `--switch-tabs-*`，避免依赖外层 `--ant-*`
6. **“宽度适配”误做成“文本压缩”**
   - 现象：中文被挤压换行
   - 处理：使用收纳到 `more`，不是挤压/换行

## 6) 回退策略（必须可执行）

1. 只回退本次失败策略相关文件（优先 `SwitchTabs.css` / `SwitchTabs.tsx` 局部段落）。
2. 不影响已验证通过能力（图标解析、抽屉动作、token 变量注入）。
3. 每次回退后立即执行：
   - `ReadLints`（改动文件）
   - `npm run build`（demo）
4. 回退说明要明确“保留了什么、撤销了什么”。
