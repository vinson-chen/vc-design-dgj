# Carousel 走马灯 组件规范（vc-design）

基于 Ant Design 5 的 Carousel，一组轮播区域。

---

## 1. 何时使用

- 当有一组平级内容需要轮播展现时。
- 内容空间不足时，用走马灯收纳并轮播。
- 常用于一组图片或卡片轮播。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **autoplay** | 是否自动切换；可为 `{ dotDuration?: boolean }` 展示指示点进度条 | boolean \| object | false |
| **autoplaySpeed** | 自动切换间隔（毫秒） | number | 3000 |
| **arrows** | 是否显示切换箭头 | boolean | false |
| **dotPlacement** | 指示点位置 | `'top'` \| `'bottom'` \| `'start'` \| `'end'` | `'bottom'` |
| **dots** | 是否显示指示点；可为 `{ className?: string }` | boolean \| object | true |
| **draggable** | 是否启用拖拽切换 | boolean | false |
| **effect** | 动效 | `'scrollx'` \| `'fade'` | `'scrollx'` |
| **fade** | 是否使用渐显切换（与 effect 二选一） | boolean | false |
| **infinite** | 是否无限循环 | boolean | true |
| **speed** | 切换动效时长（毫秒） | number | 500 |
| **easing** | 动画缓动 | string | `'linear'` |
| **adaptiveHeight** | 高度是否自适应 | boolean | false |
| **afterChange** | 切换后回调 | (current: number) => void | - |
| **beforeChange** | 切换前回调 | (current: number, next: number) => void | - |
| **waitForAnimate** | 是否等待切换动画 | boolean | false |

更多 API 见 [react-slick](https://react-slick.neostack.com/docs/api)。

### 方法（ref）

goTo(slideNumber, dontAnimate)、next()、prev()。

---

## 3. Token

arrowOffset、arrowSize、dotActiveWidth、dotGap、dotHeight、dotOffset、dotWidth 等，可由 theme 覆盖。
