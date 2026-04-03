# Pagination 分页 组件规范（vc-design）

基于 Ant Design 5 的 Pagination，用于分隔长列表，每次只加载一页。适用于数据量大、需切换页码浏览的场景。

---

## 1. 何时使用

- 加载/渲染全部数据耗时较长时。
- 需通过切换页码浏览数据时。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **total** | 数据总数 | number | 0 |
| **current** | 当前页（受控） | number | - |
| **defaultCurrent** | 默认当前页 | number | 1 |
| **pageSize** | 每页条数（受控） | number | - |
| **defaultPageSize** | 默认每页条数 | number | 10 |
| **pageSizeOptions** | 每页条数选项 | number[] | [10, 20, 50, 100] |
| **showSizeChanger** | 是否展示 pageSize 切换器（total>50 时默认 true） | boolean \| SelectProps | - |
| **showQuickJumper** | 是否可快速跳转 | boolean \| { goButton: ReactNode } | false |
| **showTotal** | 显示总量与当前范围 | (total, [start, end]) => ReactNode | - |
| **size** | 尺寸 | `default` \| `small` | `default` |
| **simple** | 简洁模式（仅上一页/下一页等） | boolean \| { readOnly?: boolean } | - |
| **align** | 对齐方式 | start \| center \| end | - |
| **hideOnSinglePage** | 仅一页时是否隐藏 | boolean | false |
| **disabled** | 是否禁用 | boolean | - |
| **onChange** | 页码或 pageSize 改变 | (page, pageSize) => void | - |
| **onShowSizeChange** | pageSize 改变 | (current, size) => void | - |
| **itemRender** | 自定义页码/上一步/下一步结构 | (page, type, originalElement) => ReactNode | - |

---

## 3. Token

组件 Token：itemBg、itemActiveBg、itemActiveColor、itemSize、itemSizeSM 等，可由 theme.components.Pagination 覆盖，与 vc-design 品牌色一致。
