# Affix 组件规范（vc-design）

基于 Ant Design 5 的 Affix（固钉），用于将元素固定在页面可视区域的指定位置（通常为顶部），在滚动时保持可见，通过偏移与目标容器控制行为。

---

## 1. 用途

- 固定操作区（如操作按钮、过滤条）在页面顶部，避免滚动后需要回到顶部才能操作。
- 固定导航、回到顶部按钮等。

---

## 2. API

| 属性 | 说明 |
|------|------|
| **offsetTop** | 距离窗口顶部达到该偏移量后触发固定（如 `offsetTop={80}`） |
| **offsetBottom** | 距离窗口底部达到该偏移量后触发固定（与 offsetTop 互斥） |
| **target** | 设置 Affix 监听其滚动事件的容器，函数返回对应 DOM 元素，默认 `window` |
| **onChange** | 固定状态改变时回调，参数为 `affixed?: boolean` |
| **style** / **className** / **rootClassName** | 控制 Affix 外层容器样式与类名 |

子节点为需要固定的内容，如按钮、导航栏等。

---

## 3. 使用建议

- 固定区域高度不宜过大，避免占用过多可视区域。
- 与 Anchor 搭配时，可使用 Anchor 的 `affix` 配置，由 Anchor 内部使用 Affix 实现固定导航。

---

## 4. Token 与样式

- Affix 本身仅负责定位，不直接控制子内容样式；子内容的颜色、背景等由对应组件（如 Button、Card）及 `vcTokens` 控制。

