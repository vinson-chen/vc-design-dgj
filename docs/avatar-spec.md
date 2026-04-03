# Avatar 头像 组件规范（vc-design）

基于 Ant Design 5 的 Avatar，用于代表用户或事物，支持图片、图标或字符展示。

---

## 1. 何时使用

- 需要展示用户头像时。
- 需要展示事物/品牌标识时。
- 需要头像组合展示时。

---

## 2. API

### Avatar

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **alt** | 图像无法显示时的替代文本 | string | - |
| **gap** | 字符型头像距离左右边界的像素 | number | 4 |
| **icon** | 自定义图标 | ReactNode | - |
| **shape** | 形状 | `'circle'` \| `'square'` | `'circle'` |
| **size** | 尺寸 | number \| `'large'` \| `'medium'` \| `'small'` \| 响应式对象 | `'medium'` |
| **src** | 图片地址或图片元素 | string \| ReactNode | - |
| **srcSet** | 响应式图片地址 | string | - |
| **draggable** | 图片是否可拖拽 | boolean \| `'true'` \| `'false'` | true |
| **crossOrigin** | CORS 设置 | `'anonymous'` \| `'use-credentials'` \| `''` | - |
| **onError** | 图片加载失败回调，返回 false 关闭默认 fallback | () => boolean | - |

> 图片加载失败时 fallback 优先级：`icon` > `children`。

### Avatar.Group

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **max** | 最多显示配置 | `{ count?: number; style?: CSSProperties; popover?: PopoverProps }` | - |
| **size** | 头像尺寸 | number \| `'large'` \| `'medium'` \| `'small'` \| 响应式 | `'medium'` |
| **shape** | 形状 | `'circle'` \| `'square'` | `'circle'` |

---

## 3. Token

containerSize / containerSizeLG / containerSizeSM、iconFontSize 系列、textFontSize 系列、groupBorderColor、groupOverlapping、groupSpace 等，可由 theme 覆盖。
