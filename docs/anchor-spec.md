# Anchor 锚点 组件规范（vc-design）

基于 Ant Design 5 的 Anchor，用于跳转到页面指定位置，展示当前页可供跳转的锚点链接并快速在锚点间跳转。

---

## 1. 何时使用

- 需展示当前页面的锚点链接列表。
- 需在锚点之间快速跳转（如长文档、表单分步）。

---

## 2. Anchor API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **items** | 数据化配置，支持 children 嵌套（水平方向不支持嵌套） | AnchorItem[] | - |
| **direction** | 导航方向 | `vertical` \| `horizontal` | `vertical` |
| **affix** | 是否固定模式；可传对象以配置 Affix | boolean \| Omit&lt;AffixProps, ...&gt; | true |
| **offsetTop** | 距离窗口顶部达到该偏移量后触发 | number | - |
| **targetOffset** | 锚点滚动偏移量（如滚动后目标居中） | number | 同 offsetTop |
| **bounds** | 锚点区域边界 | number | 5 |
| **getContainer** | 指定滚动容器 | () => HTMLElement | () => window |
| **getCurrentAnchor** | 自定义高亮锚点 (activeLink) => string | function | - |
| **showInkInFixed** | affix=false 时是否显示小方块 | boolean | false |
| **replace** | 替换历史记录中的 href 而非 push | boolean | false |
| **onChange** | 锚点链接改变回调 (currentActiveLink) => void | function | - |
| **onClick** | 点击回调 (e, link) => void | function | - |

---

## 3. AnchorItem / Link

| 参数 | 说明 | 类型 |
|------|------|------|
| **key** | 唯一标志 | string \| number |
| **href** | 锚点链接（如 `#section-1`） | string |
| **title** | 文字内容 | ReactNode |
| **target** | 链接打开目标 | string |
| **children** | 嵌套项（水平 direction 不支持） | AnchorItem[] |
| **replace** | 是否替换历史 | boolean |

---

## 4. 使用方式

```ts
import { Anchor } from 'vc-design';

<Anchor
  items={[
    { key: '1', href: '#part-1', title: 'Part 1' },
    { key: '2', href: '#part-2', title: 'Part 2', children: [{ key: '2-1', href: '#part-2-1', title: 'Part 2-1' }] },
  ]}
/>
```

页面中需有对应 id 的元素（如 `<div id="part-1">`）。

---

## 5. Token

组件 Token：linkPaddingBlock、linkPaddingInlineStart 等，可由 theme.components.Anchor 覆盖。
