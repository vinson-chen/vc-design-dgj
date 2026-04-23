# VTable / TableRows 维护约定

## 分层

- **`headless/`**：无 React、无 DOM 的纯函数（寻址、剪贴板、选区矩形、删行删列后的稀疏数据重映射）。新增与「格坐标 / 选区 / 粘贴矩阵」相关的规则时，**先在这里实现并写 Vitest**。
- **`tableGridEditingUiReducer.ts`**：选区与编辑相关的 UI 状态迁移；多字段同步更新优先用 **action**，避免在 `useTableGridEditing` 里再堆一串 `setState`。
- **`useTableGridEditing.ts`**：键盘/剪贴板/焦点与 ref 胶水；避免单次 PR 内在此文件新增超过约 **50 行**无单测支撑的分支——应再拆 headless 或 reducer action。

## 滚动

- 表格的横纵滚动以 **`TableRows` 内唯一 `scrollport`** 为准；`tableOuterScrollRef` 已废弃，勿再依赖外层 overflow 承担横滚。

## 相关入口

- 业务表格实例：`TableAreaTableInstance` / `VTable`（[`../TableArea.tsx`](../TableArea.tsx)）。
- Demo 控件壳：`TableAreaConfigPanel`（[`../TableAreaDemoShell.tsx`](../TableAreaDemoShell.tsx)）。
