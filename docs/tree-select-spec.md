# TreeSelect 树选择 组件规范（vc-design）

基于 Ant Design 5 的 TreeSelect，树型选择控件。适用于树形结构数据（如公司层级、分类目录等）。

---

## 1. 何时使用

类似 Select，但可选数据结构为树形时使用，例如公司层级、学科系统、分类目录等。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **treeData** | 树数据 | { value, title, children?, disabled? }[] | [] |
| **value** / **defaultValue** | 当前值 / 默认值 | string \| string[] | - |
| **placeholder** | 占位 | string | - |
| **allowClear** | 允许清除 | boolean \| { clearIcon } | false |
| **disabled** | 禁用 | boolean | false |
| **multiple** | 多选 | boolean | false |
| **treeCheckable** | 显示 Checkbox（多选） | boolean | false |
| **showSearch** | 是否可搜索 | boolean | 单选 false，多选 true |
| **treeDefaultExpandAll** | 默认展开所有节点 | boolean | false |
| **fieldNames** | 自定义 label、value、children 字段 | object | { label, value, children } |
| **onChange** | 选中时 | (value, label, extra) => void | - |

---

## 3. treeData 节点

默认字段：**value**（唯一）、**title**、**children**。可通过 fieldNames 映射为其他字段名。

---

## 4. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
