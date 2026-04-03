# Layout 布局 组件规范（vc-design）

基于 Ant Design 5 的 Layout，用于页面级整体布局。采用 Flex 布局，可嵌套 Header、Sider、Content、Footer。

---

## 1. 组件概述

| 子组件 | 说明 | 放置位置 |
|--------|------|----------|
| **Layout** | 布局容器，可嵌套 Header / Sider / Content / Footer 或 Layout 本身 | 任意父容器 |
| **Layout.Header** | 顶部布局，自带默认样式 | 仅放在 Layout 内 |
| **Layout.Sider** | 侧边栏，可收起、响应式、主题 light/dark | 仅放在 Layout 内 |
| **Layout.Content** | 内容区，自带默认样式 | 仅放在 Layout 内 |
| **Layout.Footer** | 底部布局，自带默认样式 | 仅放在 Layout 内 |

---

## 2. Layout 容器

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| hasSider | 子元素含 Sider 时设为 true，可用于 SSR 避免样式闪动 | boolean | - |
| className / style | 容器样式 | string / CSSProperties | - |

---

## 3. Layout.Sider 侧边栏

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **width** | 宽度 | number \| string | 200 |
| **collapsed** | 当前是否收起 | boolean | - |
| **defaultCollapsed** | 默认是否收起 | boolean | false |
| **collapsible** | 是否可收起 | boolean | false |
| **collapsedWidth** | 收起后宽度，0 时出现特殊 trigger | number | 80 |
| **theme** | 主题 | `light` \| `dark` | `dark` |
| **breakpoint** | 触发响应式的断点（xs/sm/md/lg/xl/xxl） | string | - |
| **trigger** | 自定义折叠触发器，null 隐藏 | ReactNode | - |
| **reverseArrow** | 翻转箭头方向（Sider 在右侧时可用） | boolean | false |
| **onCollapse** | 展开/收起回调 (collapsed, type) => void | function | - |
| **onBreakpoint** | 断点触发回调 (broken) => void | function | - |

---

## 4. 设计约定（参考）

- 顶部导航高度：`48+8n`（如 64px）；侧边宽度：`200+8n`。
- 由 AntD Layout Token（headerBg、siderBg、bodyBg 等）控制视觉，可通过 buildAntdTheme 或 components.Layout 覆盖与 vc-design 规范一致。

---

## 5. 使用方式

```ts
import { Layout } from 'vc-design';
const { Header, Sider, Content, Footer } = Layout;
```
