---
name: vc-biz-component-figma
description: >-
  基于 Figma 在 vc-design demo 中落地业务组件（如导航区）的高效流程：结构拆解、token 映射、MCP 局限与避免弯路。
  在用户新增业务组件、从 Figma 还原导航/侧栏/复杂实例、或讨论 TalkToFigma / 设计 token 对齐时使用。
---

# vc-design：从 Figma 落地业务组件（复盘与流程）

本文档来自「导航区」从设计到 demo 的复盘：**做对的**、**走过的弯路**、**应避免的坑**，以及后续新业务组件的推荐顺序。

---

## 一、做对了哪些（可复用）

### 1. 结构与命名对齐 Figma

- 按设计层级拆组件：`.menu_item` → `.menu_group` → `menu` 外壳，与 Figma 组件集/实例层级一致，便于对照改稿与走查。
- 图标层用 **Figma 图标组件命名** → `resolveMenuIconFromFigma` → `VcIcon type`，同名优先、未命中用占位，避免硬编码大量映射表。

### 2. 单一数据源

- 菜单 **分组与文案** 集中在一处（如 `VMenu` 的 `groups`），再按需同步到侧栏示意（如 `PageCaseDemo`、旧版 `DispatchSiderMenu`），避免三处各写一份后漂移。

### 3. 色值与 token

- 用 **TalkToFigma**（`join_channel` + `get_node_info`）从指定 `node-id` 拉实例，核对 **解析后的 fills**（如主栏 `#424A57`、子项槽 `#3B424E`）。
- 在 `vcTokens` 中增加 **语义分组**（如 `color.menu.*`）承载侧栏专用色，业务实现引用 token 而非散落 hex。
- 补充 **`resolveColorTokenByValue` / `resolveNumericTokenByValue`**：在已知「引用场景」（background / fill / text / border / menu 等）下，用数值反查已有 token，减少凭空造别名。

### 4. 交付形态

- 还原度稳定后 **收敛导航**：业务区只保留 **一个入口**（如「导航区」），去掉中间步骤与右侧「案例说明区」，避免演示与正式产品形态脱节。

### 5. 工程习惯

- 改完跑 **`demo` 的 `npm run build`**（或 dev 目测关键交互），避免类型与打包错误遗留。

---

## 二、走过的弯路（成因简述）

| 弯路 | 原因 |
|------|------|
| 新增 `topNavBackground` 等与通用 token **语义重复** | MCP 返回的是 **已解析色值**，未附带 Figma **变量绑定名**（如 `colorBgContainer`），实现侧按「界面语义」新起了名字。 |
| `colorFillDK` / `fill.dk` **色值一度不准** | 早期凭示意填了 `#2f3640`，与 Figma **menu 实例里 menu_item 槽位** 实际 `#3B424E` 不一致；应以实例为准再写 token。 |
| **Tooltip** 显示收起态全称 | 未先确认产品偏好；用户反馈后回退。 |
| **四步 Demo + 右侧案例区** | 适合过程教学，与「只要高还原成品」目标不一致；后期需再合并入口、删案例区。 |
| 依赖 **Excel 导航表** 与 Figma **并行** | 表与稿需明确以谁为准；以表更新结构时应用一次 diff，避免漏列、错列。 |

---

## 三、应避免的问题（检查清单）

1. **不要**在已知画板已绑 `vc-design` / Ant Design 变量名的情况下，仅凭色值再发明一套 **平行命名**；应先：`resolveColorTokenByValue(色值, role)` 或查 `vcTokens` 现有路径（如 `neutral.background.container` 对应顶栏容器类场景）。
2. **不要**假设 MCP 会返回 **Variables 名称**；若无绑定信息，必须接受「值反查 + 场景过滤」或人工对照变量表。
3. **不要**未经确认增加 **行为/交互**（Tooltip、动效、键盘逻辑等）；业务组件常强依赖产品口径。
4. **不要**让 **纯 CSS 文件**（如 `PageCaseDemo.css`）与 **TS 内 token** 长期各写一套色值；要么抽 token、要么在注释中标明与 `vcTokens` 对齐关系。
5. **不要**把 **规范分步 Demo** 与 **最终入口** 混为一谈；若目标是交付还原稿，优先 **一个路由 + 一个页面**，分步内容可保留文件但不挂导航。
6. **不要**在子项区域随意改 **padding/背景** 而不回 Figma；小偏差会累积成「还原度」问题。

---

## 四、新业务组件推荐流程（高效、准确）

按顺序执行；可跳过已明确的步骤。

### 0. 设计输入（开工前 5 分钟）

- 记录 **Figma file key、node-id（画板或组件集）**、**变量库**是否已链到 vc-design。
- 列出设计稿中的 **变体维度**（如 `small` / `dark` / `opened`），与 **组件集名称**（如 `.menu-group`）。

### 1. 拉取结构（机器可读）

- 使用 **TalkToFigma**：`join_channel` → `get_node_info(nodeId)`（或项目内已有提取脚本）。
- 明确：得到的是 **几何 + 解析样式**，一般 **没有** 变量名字符串。

### 2. Token 决策（先库内、后增量）

- 对每个颜色/数字：**先定引用场景**（background / fill / text / border / menu / spacing…）。
- 调用 **`resolveColorTokenByValue` / `resolveNumericTokenByValue`** 或手查 `vcTokens`。
- **仅当**无匹配且设计语义独立时，再在 `vcTokens` 增加字段（优先挂在语义对象下，如 `color.menu`），并写一句 Figma 来源注释。

### 3. 实现顺序

- **原子 → 组合 → 页面**：与 Figma 由内向外一致；props 命名尽量贴近变体名（`small`、`dark`、`opened`）。
- 数据驱动内容（菜单项、分组）与展示组件分离，便于 Excel/JSON 替换。

### 4. Demo 与导航

- 默认 **一个 `*Demo.tsx` + `navConfig` 一条**；标题与侧边文案用 **产品语言**（如「导航区」），不写「第 x 步」除非培训场景需要。
- 无需在页面侧保留大段「设计说明区」，说明进 **spec / 内部文档** 即可。

### 5. 验收

- 对 Figma：**关键色、间距、字号、圆角、状态**（默认/hover/active）抽样对比。
- `npm run build`（库 + demo）通过。

---

## 五、与本仓库其它 skill 的关系

- **`vc-add-component`**：面向 **库内正式导出组件**（spec、导出、`src/index.ts`）。业务组件若 **仅存在于 demo**、不导出，仍以本 skill 为主；若未来要导出，再补齐 `vc-add-component` 流程。
- **图标**：业务侧栏统一 **`VcIcon`** + `demo/src/demos/iconTypes.ts` 与 Figma 命名对齐。

---

## 六、相关代码路径（便于跳转）

| 用途 | 路径 |
|------|------|
| 导航区菜单外壳与数据 | `packages/vc-biz/src/menu/VMenu.tsx` |
| 分组 / 子项槽 | `packages/vc-biz/src/menu/VMenuGroup.tsx` |
| 子项 | `packages/vc-biz/src/menu/VMenuItem.tsx` |
| Figma 图标名解析 | `packages/vc-biz/src/menu/figmaIconResolver.ts` |
| 设计 token | `src/theme/vcTokens.ts` |
| 色值 + 场景反查 token | `src/theme/resolveTokenByValue.ts` |
| 演示入口 | `demo/src/demos/BizMenuCaseDemo.tsx`、`demo/src/navConfig.tsx`（`dispatch-sider-nav`） |

---

## 七、一句话原则

**结构跟图层，颜色先查库，MCP 只信解析值，交付一个入口；变量名以设计库为准，不靠猜别名。**
