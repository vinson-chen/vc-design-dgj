# 实施计划：业务组件可发布化与页面拼装落地

> **使用方式**：本计划供 AI/研发在用户明确回复「同意按该计划实施」后，**按阶段顺序执行**。  
> **关联文档**：`docs/prd-biz-components-page-composition.md`  
> **当前状态**：仅计划，**未自动改代码**。

---

## 0. 实施前确认（需用户拍板）

执行第 1 阶段前，建议用户确认以下 3 点（可与 PRD「开放问题」合并决策）：

| # | 问题 | 选项示例 |
|---|------|----------|
| A | 业务组件包位置 | 同仓 `packages/vc-biz` monorepo / 独立仓库 |
| B | 列表页模板 | 纳入业务包 `ListPageShell` / 仅文档示例、不导出 |
| C | 表格 v1 范围 | 仅当前自研壳能力 / 需虚拟滚动时间表 |

若用户未指定，计划中的**默认假设**为：**同仓 `packages/vc-biz`**、**先导出区块组件暂不导出整页模板**、**表格 v1 对齐当前 demo 能力**。

---

## 1. 目标摘要

将现有 `demo/src/biz-components/` 中已成熟的区块，整理为**可独立安装、类型完整、与 Demo 解耦**的业务组件包；Demo 改为**薄引用**；补充 **peerDependencies、导出清单、CHANGELOG 约定**；文档与 PRD 对齐。

---

## 2. 阶段划分与依赖顺序

```
阶段 1 — 工程与包骨架
    ↓
阶段 2 — 迁移与导出（按组件逐个）
    ↓
阶段 3 — Demo 瘦身与文档
    ↓
阶段 4 — （可选）列表页串联示例 / 第二项目验证清单
```

---

## 3. 阶段 1：工程与包骨架

**目标**：新增可发布的 npm 包结构，不改变业务行为。

| 序号 | 任务 | 产出/备注 |
|------|------|-----------|
| 1.1 | 在仓库根配置 workspaces（若尚无），新增 `packages/vc-biz`（名称以用户最终命名为准） | `package.json` + `tsconfig` |
| 1.2 | 配置构建：`tsup` 或 `tsup`+`dts`，输出 `dist`、`.d.ts`，`main`/`module`/`types` | 与 `vc-design` 构建方式尽量一致 |
| 1.3 | 声明 `peerDependencies`：`react`、`react-dom`、`antd`、`vc-design`（版本范围与根仓对齐） | 写入子包 `package.json` |
| 1.4 | 子包 `src/index.ts` 先做**空导出或占位**，保证 `pnpm/npm install` + build 通过 | CI 可增量加 `build:vc-biz` |

**阶段完成标准**：根目录可 `npm run build -w vc-biz`（或等价命令）成功，无业务逻辑迁移。

---

## 4. 阶段 2：组件迁移（建议顺序）

**原则**：每迁一个组件，**同时**更新 Demo 引用路径、补全子包导出、本地 build + 手动打开 demo 冒烟。

建议顺序（依赖由弱到强）：

1. `VOperationBar` + `operation/VOverflowActions`（若有私有依赖一并迁入）
2. `VFilterGroup` + `filter/*` + CSS
3. `switch-tabs/*`（SwitchTabs + iconResolver + 资源引用策略）
4. `menu/*`（VMenu 等）+ `dispatchSidebarMenuData` 等
5. `table/*` + `TableArea` 拆出的 **可发布 API**（见 4.1）

### 4.1 表格区特殊处理

| 任务 | 说明 |
|------|------|
| 将 `useTableAreaDemoState` / `TableAreaConfigPanel` **保留在 demo** 或 `demo-only` 目录 | 避免生产包导出「演示用 Slider」 |
| 子包导出：`TableAreaTableInstance` 的核心可复用部分 → 收敛为 **`BizTable`（或 `BizDataGrid`）** 之类稳定组件名 + 清晰 Props | 与 PRD F-10～F-12 对齐 |
| 静态资源（如图标图片）：明确从包内 `import` 或 `publishConfig.files` 包含 `assets` | 避免消费方打包失败 |

### 4.2 每个组件迁完检查

- [ ] 无对 `demo/src` 的反向依赖  
- [ ] 样式路径在包内可解析  
- [ ] 导出类型公开且命名稳定  
- [ ] `vc-design` 仅作 peer，不打进 bundle（按构建配置验证）

**阶段完成标准**：子包导出所有约定区块组件；`demo` 全部从 `@xxx/vc-biz`（或 `vc-biz`）引用；设计 token 仍来自 `vc-design`。

---

## 5. 阶段 3：Demo 瘦身与文档

| 序号 | 任务 |
|------|------|
| 3.1 | `demo/package.json` 将 `file:../` 从指向根设计包扩展/改为同时依赖业务子包（依 workspaces 策略） |
| 3.2 | 各 `*Demo.tsx` 仅保留：页面结构、h1/h2、假数据、`ConfigPanel`（若有） |
| 3.3 | 在 `docs/` 或包内 `README.md` 增加：**安装、peer、最小示例、Figma 映射表 v0** |
| 3.4 | 建立 `packages/vc-biz/CHANGELOG.md` 模板与首条记录 |

**阶段完成标准**：新同学可按 README 在空项目中安装并渲染至少一个业务组件（可用最小 sandbox 验证）。

---

## 6. 阶段 4（可选）：串联与验证

| 序号 | 任务 |
|------|------|
| 4.1 | 在 `demo` 增加「列表页串联」路由或单页：筛选 + 切换 + 操作 + 表格壳（全用子包组件） |
| 4.2 | 文档增加「版本矩阵」：已验证的 React/antd/vc-design 组合 |
| 4.3 | （若用户有第二仓库）按 checklist 做一轮试接入，记录摩擦点并回写 PRD/计划 |

---

## 7. 风险与回滚

| 风险 | 应对 |
|------|------|
| SwitchTabs / Menu 依赖 demo 内图片路径 | 统一改为包内 `assets` 或公开 CDN，并在构建中复制 |
| 循环依赖（biz ↔ design） | 业务包只 peer `vc-design`，禁止 design 依赖 biz |
| 构建体积 | 业务包保持 external peer，不做整包打包 antd |

回滚：保留迁移前 `demo/src/biz-components` 的 git 分支或 tag，子包可单独下线路由引用。

---

## 8. 用户同意后的执行约定（给 AI）

当用户回复 **同意按 `docs/plan-biz-components-implementation.md` 实施**（并可附带对「0. 实施前确认」的选项）时：

1. 先根据用户选择修正计划中默认假设（包名、模板、表格范围）。  
2. **严格按阶段 1 → 2 → 3 →（可选）4** 顺序改代码，每阶段结束给出简短变更说明与自测结果。  
3. 不在单 PR 内混合「无关重构」与「大范围格式化」。  
4. 若某任务依赖用户额外密钥/仓库权限，则暂停该条并列出阻塞项。

---

## 9. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-03-30 | 初稿，待用户确认后执行 |
| v0.2 | 2026-03-30 | **阶段 1 已落地**：根目录 `workspaces: packages/*`，子包 `packages/vc-biz`（tsup + 占位导出 + peer），脚本 `build:vc-biz`；子包 `devDependencies` 含 `vc-design: file:../..` 以满足本地安装 |
| v0.3 | 2026-03-30 | **阶段 2 已落地**：业务组件迁入 `packages/vc-biz/src`；店铺图标仅保留于 `packages/vc-biz/assets/store_logo`，构建时生成 `storeLogoUrls`；Demo 依赖 `file:../packages/vc-biz` 并引入 `vc-biz/style.css`；根目录 `npm run demo` 会先 `build:vc-biz` |
| v0.4 | 2026-03-30 | **阶段 4 已落地（阶段 4.1 + 4.2）**：新增 `ListPageShell 列表页串联` 页面，把筛选 + 切换 + 操作 + 表格壳串联；补充 `docs/version-matrix-v0.md` 用于集成验证口径。 |
