# 版本矩阵（v0）

用于阶段 4 的"集成验证口径"：当前已在本仓库 `demo` 场景中通过生产构建（`vite build`）。

## 已验证的依赖组合

| 类别 | 版本 |
|---|---|
| React | `18.3.1` |
| antd | `^5.22.0`（实际安装以 lock 文件为准） |
| vc-design | `file:..`（本仓版本） |
| vc-biz | `file:../packages/vc-biz`（`1.0.0`） |
| dayjs | `^1.11.11` |
| Vite | `^6.0.3`（实际构建以 lock 为准） |

## 集成验证方式

- 在 `demo/` 执行：`npm run build`（生产构建）
- 通过页面入口：`VSwitchArea`、`VTopOperationBar`、`VTable`、本次新增的 `列表页串联（多组件）`