# Descriptions 描述列表 组件规范（vc-design）

基于 Ant Design 5 的 Descriptions，展示多个只读字段的组合。

---

## 1. 何时使用

- 常见于详情页的信息展示。

---

## 2. API

### Descriptions

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **title** | 标题，显示在顶部 | ReactNode | - |
| **extra** | 右上角操作区域 | ReactNode | - |
| **items** | 描述项配置（推荐 5.8.0+） | DescriptionsItem[] | - |
| **bordered** | 是否展示边框 | boolean | false |
| **column** | 一行项数量，可为响应式对象 | number \| Record\<Breakpoint, number\> | 3 |
| **layout** | 布局 | `'horizontal'` \| `'vertical'` | `'horizontal'` |
| **size** | 尺寸 | `'large'` \| `'medium'` \| `'small'` | `'large'` |
| **colon** | 是否显示 label 后冒号 | boolean | true |
| **classNames** / **styles** | 语义化结构 class / style | 见文档 | - |

### Descriptions.Item / ItemType

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **label** | 标签 | ReactNode | - |
| **children** | 内容 | ReactNode | - |
| **span** | 占据列数（`filled` 铺满当前行剩余） | number \| `'filled'` \| 响应式 | 1 |

---

## 3. Token

colonMarginLeft/Right、contentColor、extraColor、labelBg、labelColor、titleColor、titleMarginBottom、itemPaddingBottom/End 等，可由 theme 覆盖。
