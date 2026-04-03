# Collapse 折叠面板 组件规范（vc-design）

基于 Ant Design 5 的 Collapse，可折叠/展开的内容区域。

---

## 1. 何时使用

- 对复杂区域进行分组和隐藏，保持页面整洁。
- 手风琴模式：只允许单个内容区域展开。

---

## 2. API

### Collapse

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **activeKey** / **defaultActiveKey** | 当前/初始激活面板 key（手风琴时为 string \| number） | string[] \| string \| number[] \| number | - |
| **accordion** | 手风琴模式（仅一项展开） | boolean | false |
| **bordered** | 是否带边框 | boolean | true |
| **ghost** | 透明无边框 | boolean | false |
| **size** | 尺寸 | `'large'` \| `'medium'` \| `'small'` | `'medium'` |
| **expandIcon** | 自定义展开图标 | (panelProps) => ReactNode | - |
| **expandIconPlacement** | 图标位置 | `'start'` \| `'end'` | `'start'` |
| **collapsible** | 可折叠触发区域 | `'header'` \| `'icon'` \| `'disabled'` | - |
| **destroyOnHidden** | 隐藏时销毁面板 DOM | boolean | false |
| **items** | 面板配置（ItemType[]） | ItemType[] | - |
| **onChange** | 切换回调 | (key \| key[]) => void | - |

### ItemType（items 项）

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **key** | 对应 activeKey | string \| number | - |
| **label** | 面板标题 | ReactNode | - |
| **children** | 内容 | ReactNode | - |
| **extra** | 标题右侧额外内容 | ReactNode | - |
| **showArrow** | 是否显示箭头 | boolean | true |
| **collapsible** | 该项可折叠触发区域 | `'header'` \| `'icon'` \| `'disabled'` | - |
| **forceRender** | 隐藏时是否渲染 DOM | boolean | false |

> 5.6.0+ 推荐使用 `items`；Collapse.Panel 已废弃。

---

## 3. Token

headerBg、headerPadding、contentBg、contentPadding、borderlessContentBg、borderlessContentPadding 等，可由 theme 覆盖。
