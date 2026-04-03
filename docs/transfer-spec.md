# Transfer 穿梭框 组件规范（vc-design）

基于 Ant Design 5 的 Transfer，双栏穿梭选择框。**仅支持受控使用**。

---

## 1. 何时使用

- 在多个可选项中进行多选时。
- 相比 Select/TreeSelect，占据更大空间，可展示更多信息。通过左右两栏移动元素完成选择（左为 source，右为 target）。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **dataSource** | 数据源，渲染到左侧（targetKeys 除外） | { key, title }[] | [] |
| **targetKeys** | 右侧数据的 key 集合（受控） | string[] \| number[] | [] |
| **selectedKeys** | 当前选中的 key | string[] \| number[] | [] |
| **onChange** | 选项转移时 | (targetKeys, direction, moveKeys) => void | - |
| **onSelectChange** | 选中项变化 | (sourceSelectedKeys, targetSelectedKeys) => void | - |
| **titles** | 左右标题 | ReactNode[] | - |
| **operations** | 操作按钮文案，从上到下 | string[] | ['>', '<'] |
| **showSearch** | 是否显示搜索 | boolean \| { placeholder, defaultValue } | false |
| **filterOption** | 筛选函数 | (inputValue, option, direction) => boolean | - |
| **render** | 每行渲染 | (record) => ReactNode | - |
| **oneWay** | 单向样式（仅向右移） | boolean | false |
| **disabled** | 禁用 | boolean | false |
| **rowKey** | 数据主键，无 key 时指定 | (record) => string \| number | - |

---

## 3. 注意

dataSource 每项需有 **key**（或通过 rowKey 指定主键），以满足 React 列表 key 要求。

---

## 4. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
