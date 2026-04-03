# Mentions 提及 组件规范（vc-design）

基于 Ant Design 5 的 Mentions，用于在输入中提及某人或某事。常用于发布、聊天或评论。

---

## 1. 何时使用

用于在输入中提及某人或某事，常用于发布、聊天或评论功能。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **options** | 选项配置（推荐 5.1.0+） | Option[] | [] |
| **value** / **defaultValue** | 值 / 默认值 | string | - |
| **prefix** | 触发关键字 | string \| string[] | `'@'` |
| **placement** | 弹出层位置 | `'top'` \| `'bottom'` | `'bottom'` |
| **allowClear** | 可清除 | boolean \| { clearIcon } | false |
| **autoSize** | 自适应高度 | boolean \| { minRows, maxRows } | false |
| **filterOption** | 自定义过滤 | false \| (input, option) => boolean | - |
| **notFoundContent** | 无匹配时内容 | ReactNode | `'Not Found'` |
| **split** | 选中项前后分隔符 | string | '' |
| **status** | 校验状态 | `'error'` \| `'warning'` | - |
| **variant** | 形态 | `'outlined'` \| `'borderless'` \| `'filled'` \| `'underlined'` | `'outlined'` |
| **onChange** | 值变化 | (text: string) => void | - |
| **onSearch** | 搜索时 | (text, prefix) => void | - |
| **onSelect** | 选择选项时 | (option, prefix) => void | - |

---

## 3. Option

| 参数 | 说明 | 类型 |
|------|------|------|
| **value** | 选择时填充的值 | string |
| **label** | 选项标题 | ReactNode |
| **key** | 选项 key | string |
| **disabled** | 是否禁用 | boolean |

---

## 4. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
