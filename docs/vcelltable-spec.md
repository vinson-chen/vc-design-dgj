# VcellTable 组件规范（vc-biz）

高自由度、可配置数据表；引擎为 **TanStack Table v8**，样式变量由 **`vc-design` `vcTokens`** 注入根节点（与 BizTable 分源实现）。

## 能力概览

| 能力 | 说明 |
|------|------|
| 列 | 拖拽排序、列宽拖拽、显示/隐藏、左/右固定 |
| 行 | 行高可配、大数据量虚拟滚动、拖拽排序（首列抓手） |
| 单元格 | 文本 / 数字 / 下拉编辑（`meta.vcell`） |
| 交互 | 框选、方向键与 Shift+方向键扩选、Tab、Enter/F2 编辑、复制/粘贴 TSV、撤销/重做 |

## Token 映射（根节点 CSS 变量）

| 语义 | vcTokens 路径 |
|------|----------------|
| 边框 | `color.neutral.border.default` |
| 单元格背景 | `color.neutral.background.container` |
| 表头背景 | `color.neutral.fill.secondary` |
| 行 hover | `color.neutral.background.controlItemBgHover` |
| 选区背景 | `color.primary.bg` |
| 焦点/强调边线 | `color.primary.default` |
| 正文色 | `color.neutral.text.default` |
| 次要说明 | `color.neutral.text.description` |
| 圆角 | `style.borderRadius.sm` |
| 字号/行高 | `style.font.size.base` / `style.font.lineHeight.base` |

## 列定义约定

- 使用 TanStack `ColumnDef`，通过 `meta.vcell` 配置：`cellType`、`selectOptions`、`editable`、`patchRow`（无 `accessorKey` 时写回行数据）。
- 行拖拽列 ID 常量：`VCELL_ROW_DRAG_COLUMN_ID`（内部自动插入，勿与业务列 id 冲突）。

## 大模型 / 外部控制

- `ref`：`getData`、`undo`、`redo`、`getUiState`、`setUiState`、`focusContainer`。
- 数据流：受控 `data` + `onDataChange`；撤销栈在组件内按步记录 `data` 快照。
