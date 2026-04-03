# Radio 单选框 组件规范（vc-design）

基于 Ant Design 5 的 Radio，用于在多个备选项中选中单个状态。与 Select 区别：Radio 所有选项默认可见，适合选项不宜过多的场景。

---

## 1. 何时使用

- 用于在多个备选项中选中单个状态。
- 选项默认全部可见，方便比较选择，选项不宜过多。

---

## 2. Radio / Radio.Button API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **checked** / **defaultChecked** | 是否选中 | boolean | false |
| **value** | 选项值，用于与 Group 比较 | any | - |
| **disabled** | 禁用 | boolean | false |

---

## 3. Radio.Group API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **options** | 选项（推荐） | string[] \| number[] \| Option[] | - |
| **value** / **defaultValue** | 当前选中值 / 默认值 | any | - |
| **disabled** | 整组禁用 | boolean | false |
| **name** | 内部 input name | string | - |
| **optionType** | 选项展示类型 | `'default'` \| `'button'` | `'default'` |
| **buttonStyle** | 按钮风格（optionType=button 时） | `'outline'` \| `'solid'` | `'outline'` |
| **size** | 尺寸（按钮样式生效） | `'large'` \| `'middle'` \| `'small'` | - |
| **block** | 撑满父宽度 | boolean | false |
| **onChange** | 选项变化 | (e) => void | - |

Option: `{ label, value, disabled?, style?, className? }`。

---

## 4. Form 中用法

Form.Item 默认绑定 `value`，Radio 的值通过 Group 的 value 体现，无需单独设置 valuePropName。

---

## 5. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
