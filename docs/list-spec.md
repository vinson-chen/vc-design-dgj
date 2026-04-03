# List 列表 组件规范（vc-design）

基于 Ant Design 5 的 List，最基础的列表展示，可承载文字、图片、段落。

---

## 1. 何时使用

- 最基础的列表展示，常用于后台数据展示页面。
- 注意：Ant Design List 已进入废弃阶段，下个 major 版本将移除，后续可由 Listy 等替代。

---

## 2. API

### List

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **dataSource** | 数据源 | any[] | - |
| **renderItem** | 自定义列表项渲染 | (item, index) => ReactNode | - |
| **rowKey** | 行 key 的获取方式 | keyof T \| (item) => Key | `'key'` |
| **header** / **footer** | 列表头/底 | ReactNode | - |
| **bordered** | 是否展示边框 | boolean | false |
| **split** | 是否展示分割线 | boolean | true |
| **size** | 尺寸 | `'default'` \| `'large'` \| `'small'` | `'default'` |
| **itemLayout** | 项布局 | `'horizontal'` \| `'vertical'` | 横排 |
| **loading** | 加载中 | boolean \| SpinProps | false |
| **loadMore** | 加载更多区域 | ReactNode | - |
| **pagination** | 分页配置，false 不显示 | false \| object | false |
| **grid** | 栅格配置（column、gutter、xs/sm/md…） | object | - |
| **locale** | 文案（如 emptyText） | object | { emptyText: '暂无数据' } |

### List.Item

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **actions** | 操作组（底部或右侧） | ReactNode[] | - |
| **extra** | 额外内容 | ReactNode | - |

### List.Item.Meta

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **avatar** | 图标/头像 | ReactNode | - |
| **title** | 标题 | ReactNode | - |
| **description** | 描述 | ReactNode | - |

---

## 3. Token

avatarMarginRight、contentWidth、descriptionFontSize、itemPadding 系列、headerBg、footerBg 等，可由 theme 覆盖。
