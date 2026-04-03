# Segmented 分段控制器 组件规范（vc-design）

基于 Ant Design 5 的 Segmented，用于展示多个选项并允许用户选择其中单个选项。

---

## 1. 何时使用

- 展示多个选项并允许选择其中一项。
- 切换选中项时，关联区域内容随之变化。

---

## 2. API

### Segmented

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **options** | 选项配置 | string[] \| number[] \| SegmentedItemType[] | [] |
| **value** / **defaultValue** | 当前/默认选中值 | string \| number | - |
| **onChange** | 选项变化回调 | (value: string \| number) => void | - |
| **block** | 宽度铺满父元素 | boolean | false |
| **disabled** | 是否禁用 | boolean | false |
| **size** | 尺寸 | `'large'` \| `'medium'` \| `'small'` | `'medium'` |
| **orientation** | 排列方向 | `'horizontal'` \| `'vertical'` | `'horizontal'` |
| **shape** | 形状 | `'default'` \| `'round'` | `'default'` |
| **name** | 内部 radio 的 name，用于键盘同组切换 | string | - |
| **classNames** / **styles** | 语义化结构 | 见文档 | - |

### SegmentedItemType（options 项）

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **value** | 选项值 | string \| number | - |
| **label** | 显示文本 | ReactNode | - |
| **icon** | 图标 | ReactNode | - |
| **disabled** | 禁用该项 | boolean | false |
| **tooltip** | 提示 | string \| TooltipProps | - |

---

## 3. Token

trackBg、trackPadding、itemSelectedBg、itemSelectedColor、itemHoverBg、itemHoverColor、itemColor、itemActiveBg 等，可由 theme 覆盖。
