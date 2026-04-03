# Select 选择器 组件规范（vc-design）

基于 Ant Design 5 的 Select，下拉选择器。用于弹出一个下拉菜单供用户选择；选项少时（少于 5 项）建议用 Radio；可输可选时考虑 AutoComplete。

---

## 1. 何时使用

- 弹出一个下拉菜单给用户选择，用于代替原生选择器或需要更优雅的多选时。
- 选项少时建议用 Radio；可输可选时考虑 AutoComplete。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **options** | 选项数据（推荐 5.11.0+） | { label, value, disabled? }[] | - |
| **value** / **defaultValue** | 当前值 / 默认值 | string \| string[] \| number \| number[] | - |
| **mode** | 多选或标签 | `'multiple'` \| `'tags'` | - |
| **placeholder** | 占位 | string | - |
| **disabled** | 禁用 | boolean | false |
| **allowClear** | 可清除 | boolean \| { clearIcon } | false |
| **showSearch** | 是否可搜索 | boolean | 单选 false，多选 true |
| **filterOption** | 筛选逻辑 | boolean \| (inputValue, option) => boolean | true |
| **size** | 尺寸 | `'large'` \| `'middle'` \| `'small'` | `'middle'` |
| **loading** | 加载中 | boolean | false |
| **notFoundContent** | 无数据时内容 | ReactNode | `'Not Found'` |
| **placement** | 弹出位置 | bottomLeft / bottomRight / topLeft / topRight | bottomLeft |
| **onChange** | 选项变化 | (value, option \| option[]) => void | - |

---

## 3. Option

通过 **options** 传入时：`{ label: ReactNode, value: string | number, disabled?: boolean }`。也可使用 `Select.Option` 子元素（旧写法，将废弃）。

---

## 4. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
