# InputNumber 数字输入框 组件规范（vc-design）

基于 Ant Design 5 的 InputNumber，通过鼠标或键盘输入范围内的数值。

---

## 1. 何时使用

当需要获取标准数值时使用。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **value** / **defaultValue** | 当前值 / 初始值 | number | - |
| **min** / **max** | 最小值 / 最大值 | number | MIN/MAX_SAFE_INTEGER |
| **step** | 步长 | number \| string | 1 |
| **precision** | 数值精度（小数位数） | number | - |
| **size** | 输入框大小 | `'large'` \| `'middle'` \| `'small'` | - |
| **disabled** | 禁用 | boolean | false |
| **controls** | 是否显示增减按钮，可设自定义箭头 | boolean \| { upIcon, downIcon } | - |
| **prefix** / **suffix** | 前缀/后缀 | ReactNode | - |
| **formatter** | 展示格式 | (value, info) => string | - |
| **parser** | 从 formatter 转回数字 | (string) => number | - |
| **stringMode** | 字符值模式，高精度小数，onChange 返回 string | boolean | false |
| **keyboard** | 是否启用键盘快捷 | boolean | true |
| **changeOnWheel** | 是否允许滚轮改变数值 | boolean | - |
| **status** | 校验状态 | `'error'` \| `'warning'` | - |
| **variant** | 形态 | `'outlined'` \| `'borderless'` \| `'filled'` \| `'underlined'` | `'outlined'` |
| **onChange** | 变化回调 | (value: number \| string \| null) => void | - |

---

## 3. 说明

- 受控时 value 可超出 min/max，组件以警告样式展示，不自动裁切，避免与外部数据不一致。
- 通过 `onChange` 获取当前值，勿依赖 onBlur 等事件的 event.target.value。

---

## 4. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
