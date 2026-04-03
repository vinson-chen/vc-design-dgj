# Splitter 分隔面板 组件规范（vc-design）

基于 Ant Design 5 的 Splitter，用于自由切分指定区域，可水平/垂直分隔、拖拽调整大小、限制 min/max、可折叠。子元素仅支持 **Splitter.Panel**。

---

## 1. 何时使用

- 水平或垂直分隔区域。
- 需拖拽调整各区域大小。
- 需指定区域最大/最小宽高或可折叠。

---

## 2. Splitter API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **layout** | 布局方向 | `horizontal` \| `vertical` | `horizontal` |
| **onResize** | 面板大小变化回调 (sizes: number[]) | function | - |
| **onResizeStart** | 开始拖拽前回调 (sizes: number[]) | function | - |
| **onResizeEnd** | 拖拽结束回调 (sizes: number[]) | function | - |
| **onCollapse** | 展开/收起回调 (collapsed: boolean[], sizes: number[]) | function | 5.28.0 |
| **lazy** | 延迟渲染模式（松手后才更新大小） | boolean | false |

---

## 3. Splitter.Panel API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **defaultSize** | 初始大小（px 或 `'百分比%'`） | number \| string | - |
| **size** | 受控大小（px 或 `'百分比%'`） | number \| string | - |
| **min** | 最小阈值（px 或 `'百分比%'`） | number \| string | - |
| **max** | 最大阈值（px 或 `'百分比%'`） | number \| string | - |
| **resizable** | 是否可拖拽伸缩 | boolean | true |
| **collapsible** | 是否可折叠；可配置 `{ start?, end?, showCollapsibleIcon?: boolean \| 'auto' }` | boolean \| object | false |

---

## 4. Token

组件 Token：splitBarSize、splitBarDraggableSize、splitTriggerSize 等，可由 theme.components.Splitter 覆盖，与 vc-design 规范一致时无需单独配置。
