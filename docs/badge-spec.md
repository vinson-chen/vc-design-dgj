# Badge 徽标数 组件规范（vc-design）

基于 Ant Design 5 的 Badge，图标或头像右上角的圆形徽标数字或状态点。

---

## 1. 何时使用

- 一般出现在通知图标或头像右上角，用于显示需要处理的消息条数。
- 通过醒目视觉形式吸引用户处理。

---

## 2. API

### Badge

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **count** | 展示的数字，大于 overflowCount 显示为 `${overflowCount}+`，为 0 时默认隐藏 | ReactNode | - |
| **showZero** | 数值为 0 时是否展示 | boolean | false |
| **overflowCount** | 封顶数字 | number | 99 |
| **dot** | 不展示数字，只显示小红点 | boolean | false |
| **status** | 状态点 | `'success'` \| `'processing'` \| `'default'` \| `'error'` \| `'warning'` | - |
| **text** | 在设置 status 时，状态点旁的文本 | ReactNode | - |
| **color** | 自定义小圆点/徽标颜色 | string | - |
| **size** | 数字徽标大小（有 count 时有效） | `'medium'` \| `'small'` | - |
| **offset** | 位置偏移 [left, top] | [number, number] | - |
| **title** | 鼠标悬停时显示的文字 | string | - |
| **classNames** / **styles** | 语义化结构的 class / style | 见文档 | - |

### Badge.Ribbon

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **text** | 缎带内容 | ReactNode | - |
| **color** | 缎带颜色 | string | - |
| **placement** | 位置 | `'start'` \| `'end'` | `'end'` |

---

## 3. Token

dotSize、indicatorHeight / indicatorHeightSM、statusSize、textFontSize 系列、indicatorZIndex、textFontWeight 等，可由 theme 覆盖。
