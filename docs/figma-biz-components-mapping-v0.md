# Figma 映射表（v0）

说明：用于阶段 3 的"可追溯映射"验收口径。由于本项目目前更多文档集中在具体区块 spec（如切换区），本表以现有 spec / skill 及 demo 的口径为准，尚未补齐所有 node-id。

---

## 区块级映射（建议）

| 业务区块/组件 | Figma 模块 / 实例命名 | 关键约定 | 代码落点（当前实现） |
|---|---|---|---|
| 导航区（DispatchSiderNav） | `Menu` / `.menu_item` / `.menu_group` / `menu` 实例 | 分组与 item 层级与 Figma 对齐；图标按 Figma 名解析后走 `VcIcon` | `packages/vc-biz/src/menu/VMenu.tsx`、`VMenuGroup.tsx`、`VMenuItem.tsx`、`dispatchSidebarMenuData.ts`、`figmaIconResolver.ts`、`useMenuOpenMap.ts` |
| 筛选区（VFilterArea） | `filter_group` | 筛选项布局与折叠规则来自 filter_group；按钮贴右/跟随规则在 demo 中固定口径 | `packages/vc-biz/src/VFilterGroup.tsx`（与 `filter/filterLayout.ts`） |
| 切换区（SwitchArea） | `tabs / .tab_item / store_tabs / state_tabs` | `tab_item` 负责交互态；图标 `svg` 赋 `VcIcon`，`jpg/png/gif` 赋 `packages/vc-biz/assets/store_logo`；设计稿 `store_tabs`/`state_tabs` 对应实现 `VTypeTabs`/`VStateTabs`（底层 `VSwitchTabs`） | `VTypeTabs.tsx`、`VStateTabs.tsx`、`VSwitchTabs.tsx`、`iconResolver.ts`、`iconResolverView.tsx` |
| 操作区（VOperationBar） | `operation_bar` | 左右插槽、对齐与高度节奏与 Figma 一致 | `packages/vc-biz/src/VOperationBar.tsx`、`operation/VOverflowActions.tsx` |
| 表格区（VTable） | `cell / row / column`（表格实例规范） | 列宽拖拽、冻结列、整行 hover/active 等由表体自研网格负责 | `packages/vc-biz/src/TableArea.tsx`、`table/TableRows.tsx`、`table/VTableCell.tsx`、`table/useTableGridState.ts` |

---

## 图标与资源口径补充

### VSwitchTabs 图标（jpg/png/gif）

- 识别到 `jpg/png/gif` 时，从 `packages/vc-biz/assets/store_logo` 按同名资源加载。
- 构建阶段由 `packages/vc-biz/scripts/generate-store-logo-map.mjs` 生成 `src/generated/storeLogoUrls.ts`。

### Menu 图标（Figma icon component name）

- 侧栏菜单图标：调用 `resolveMenuIconFromFigma`，同名优先，未命中回退 `help-circle`。