# Card 卡片 组件规范（vc-design）

基于 Ant Design 5 的 Card，通用卡片容器。

---

## 1. 何时使用

- 最基础的卡片容器，可承载文字、列表、图片、段落。
- 常用于后台概览页面。

---

## 2. API

### Card

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **title** | 卡片标题 | ReactNode | - |
| **extra** | 右上角操作区域 | ReactNode | - |
| **actions** | 底部操作组 | ReactNode[] | - |
| **cover** | 封面 | ReactNode | - |
| **variant** | 形态 | `'outlined'` \| `'borderless'` | `'outlined'` |
| **size** | 尺寸 | `'medium'` \| `'small'` | `'medium'` |
| **hoverable** | 悬停浮起 | boolean | false |
| **loading** | 加载占位 | boolean | false |
| **type** | 类型，可设为 `'inner'` 作内嵌卡片 | string | - |
| **tabList** | 页签列表 | TabItemType[] | - |
| **activeTabKey** / **defaultActiveTabKey** | 当前/默认激活页签 | string | - |
| **onTabChange** | 页签切换 | (key: string) => void | - |
| **tabBarExtraContent** / **tabProps** | 页签栏额外内容 / Tabs 透传 | ReactNode / TabsProps | - |

### Card.Grid

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **hoverable** | 悬停浮起 | boolean | true |
| **className** / **style** | 容器类名/样式 | string / CSSProperties | - |

### Card.Meta

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **avatar** | 头像/图标 | ReactNode | - |
| **title** | 标题 | ReactNode | - |
| **description** | 描述 | ReactNode | - |

---

## 3. Token

headerBg、headerHeight、headerPadding、bodyPadding、actionsBg、extraColor 等，可由 theme 覆盖。
