# Tree 组件规范（vc-design）

基于 Ant Design 5 的 Tree（树形控件），用于展示层级数据、支持展开/选择/勾选，通过 VC Tokens 与主题保持样式一致。

---

## 1. 数据与结构

- **treeData**：推荐使用数据驱动，每项为 `{ key, title, children?, isLeaf?, disabled?, ... }`。
- **fieldNames**：若后端字段非 `title`/`key`/`children`，可通过 `fieldNames` 映射。
- 每项需有唯一 `key`，子节点放在 `children` 中；`isLeaf: true` 表示叶子节点（无展开箭头）。

---

## 2. 展示与交互

| 属性 | 说明 |
|------|------|
| **showLine** | 是否显示连接线，可配 `showLeafIcon` 在叶子节点显示图标 |
| **showIcon** | 是否在节点前显示图标，图标仅用 **VcIcon** |
| **checkable** | 是否显示复选框，受控用 `checkedKeys` + `onCheck` |
| **selectable** | 是否可选中节点（默认 true），受控用 `selectedKeys` + `onSelect` |
| **multiple** | 与 checkable 配合时是否允许多选 |
| **blockNode** | 是否整行占满宽度，便于点击 |

---

## 3. 展开与默认状态

| 属性 | 说明 |
|------|------|
| **defaultExpandAll** | 默认展开所有节点 |
| **defaultExpandedKeys** | 默认展开的 key 列表 |
| **expandedKeys** | 受控展开的 key 列表，配合 `onExpand` |
| **autoExpandParent** | 展开/选中时是否自动展开父节点 |

---

## 4. 样式与 Token

- 节点高度、缩进、连接线颜色与 antd 主题一致；可选在 `src/theme/buildAntdTheme.ts` 中配置 `Tree` 的 component token。
- 选中/悬停背景：`vcTokens.color.primary.background`（选中）、`vcTokens.color.neutral.fill.secondary`（悬停）。
- 节点图标（如 `icon`、`switcherIcon`、`showLeafIcon`）仅使用 **VcIcon**。

---

## 5. 拖拽与目录树

- **draggable**：设为 `true` 或函数后可拖拽调整顺序；注意无障碍与移动端兼容。
- **Tree.DirectoryTree**：目录风格树，适用于文件树等场景，API 与 Tree 一致。

---

## 6. 其他

- **loadData**：异步加载子节点，用于懒加载大树。
- **filterAntTreeNode**：配合搜索时过滤展示的节点（已废弃的过滤方式可改用受控 `treeData` 过滤）。
