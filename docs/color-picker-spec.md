# ColorPicker 颜色选择器 组件规范（vc-design）

基于 Ant Design 5（自 5.5.0）的 ColorPicker，用于选择颜色。当用户需要自定义颜色时使用。

---

## 1. 何时使用

当用户需要自定义颜色选择时使用。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **value** | 颜色值（受控） | string \| Color | - |
| **defaultValue** | 默认颜色 | string \| Color | - |
| **format** | 颜色格式 | `'rgb'` \| `'hex'` \| `'hsb'` | - |
| **defaultFormat** | 默认格式 | 同上 | `'hex'` |
| **size** | 触发器尺寸 | `'large'` \| `'middle'` \| `'small'` | `'middle'` |
| **trigger** | 触发方式 | `'click'` \| `'hover'` | `'click'` |
| **disabled** | 禁用 | boolean | false |
| **disabledAlpha** | 禁用透明度 | boolean | false |
| **allowClear** | 允许清除 | boolean | false |
| **showText** | 显示颜色文本 | boolean \| (color: Color) => ReactNode | false |
| **presets** | 预设颜色 | `{ label, colors, defaultOpen?, key? }[]` | - |
| **placement** | 弹出位置 | 同 Tooltip | `'bottomLeft'` |
| **open** | 是否显示弹出层 | boolean | - |
| **onChange** | 颜色变化 | (value: Color, css: string) => void | - |
| **onChangeComplete** | 选择完成（受控时用可锁定展示） | (value: Color) => void | - |
| **onOpenChange** | 弹出层显隐 | (open: boolean) => void | - |
| **onClear** | 清除回调 | () => void | - |
| **children** | 自定义触发器 | ReactNode | - |
| **panelRender** | 自定义面板 | (panel, extra) => ReactNode | - |

---

## 3. Color 对象

选择器生成的 `Color` 实例方法：`toHex()`、`toHexString()`、`toRgb()`、`toRgbString()`、`toHsb()`、`toHsbString()`、`toCssString()`。受控场景推荐用 `Color` 对象赋值，避免字符串格式转换的精度误差。

---

## 4. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
