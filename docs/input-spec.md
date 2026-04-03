# Input 输入框 组件规范（vc-design）

基于 Ant Design 5 的 Input，通过鼠标或键盘输入内容，是最基础的表单域包装。

---

## 1. 何时使用

- 需要用户输入表单域内容时。
- 可提供组合型输入框（前缀/后缀、搜索、密码等）及尺寸选择。

---

## 2. Input API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **value** / **defaultValue** | 输入内容 / 默认内容 | string | - |
| **size** | 控件大小 | `'large'` \| `'middle'` \| `'small'` | - |
| **disabled** | 禁用 | boolean | false |
| **allowClear** | 可点击清除 | boolean \| { clearIcon } | - |
| **prefix** / **suffix** | 前缀/后缀（如图标） | ReactNode | - |
| **maxLength** | 最大长度 | number | - |
| **showCount** | 展示字数 | boolean \| { formatter } | false |
| **status** | 校验状态 | `'error'` \| `'warning'` | - |
| **variant** | 形态 | `'outlined'` \| `'borderless'` \| `'filled'` \| `'underlined'` | `'outlined'` |
| **onChange** | 内容变化 | (e) => void | - |
| **onPressEnter** | 按下回车 | (e) => void | - |
| **onClear** | 点击清除 | () => void | - |

其他属性与原生 [input](https://zh-hans.react.dev/reference/react-dom/components/input) 一致。

---

## 3. Input.TextArea

在 Input 基础上增加 **autoSize**：`true` \| `false` \| `{ minRows, maxRows }`，其他与 Input 一致。

---

## 4. Input.Search

在 Input 基础上增加 **enterButton**（ReactNode，如按钮文字）、**loading**、**onSearch**(value, event, { source })。

---

## 5. Input.Password

**visibilityToggle**：是否显示切换显隐；**iconRender**：(visible) => ReactNode 自定义切换图标。

---

## 6. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
