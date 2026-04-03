# Table 表格 组件规范（vc-design）

基于 Ant Design 5 的 Table，展示行列数据。

---

## 1. 何时使用

- 大量结构化数据需要展现时。
- 需要对数据排序、搜索、分页、自定义操作等复杂行为时。

---

## 2. API

### Table

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **dataSource** | 数据源 | object[] | - |
| **columns** | 列配置（ColumnsType[]） | 见 Column | - |
| **rowKey** | 行 key，字符串或函数 | string \| (record) => string | `'key'` |
| **pagination** | 分页配置，false 不分页 | object \| false | - |
| **loading** | 加载中 | boolean \| SpinProps | false |
| **size** | 表格尺寸 | `'large'` \| `'medium'` \| `'small'` | `'large'` |
| **bordered** | 是否展示边框 | boolean | false |
| **scroll** | 滚动配置（x/y） | { x?: number \| string, y?: number \| string } | - |
| **title** / **footer** | 标题/尾部 | (currentPageData) => ReactNode | - |
| **rowSelection** | 行选择配置 | object | - |
| **expandable** | 展开行配置 | object | - |
| **showHeader** | 是否显示表头 | boolean | true |
| **onChange** | 分页、排序、筛选变化 | (pagination, filters, sorter, extra) => void | - |
| **onRow** / **onHeaderRow** | 行/表头行属性 | function | - |

### Column（columns 项）

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **title** | 列头 | ReactNode \| function | - |
| **dataIndex** | 数据字段路径 | string \| string[] | - |
| **key** | 列 key | string | - |
| **render** | 自定义渲染 | (value, record, index) => ReactNode | - |
| **width** / **minWidth** | 列宽 | number \| string | - |
| **align** | 对齐 | `'left'` \| `'center'` \| `'right'` | `'left'` |
| **fixed** | 固定列 | `true` \| `'start'` \| `'end'` | false |
| **sorter** | 排序（函数或 true） | function \| boolean \| object | - |
| **sortOrder** | 受控排序 | `'ascend'` \| `'descend'` \| null | - |
| **filters** / **filteredValue** | 筛选项/受控筛选 | 见文档 | - |
| **ellipsis** | 超出省略 | boolean \| object | false |

---

## 3. Token

由全局/组件 Token 控制，可由 theme 覆盖。
