# Checkbox 多选框 组件规范（vc-design）

基于 Ant Design 5 的 Checkbox，用于收集用户的多项选择。可单独使用表示两种状态切换（与 Switch 区别：Checkbox 多用于状态标记，需配合提交）。

---

## 1. 何时使用

- 在一组可选项中进行多项选择时。
- 单独使用表示两种状态切换时（常与提交配合）。

---

## 2. Checkbox API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **checked** | 当前是否选中（受控） | boolean | false |
| **defaultChecked** | 初始是否选中 | boolean | false |
| **disabled** | 是否禁用 | boolean | false |
| **indeterminate** | 半选样式（仅样式，不表示值） | boolean | false |
| **onChange** | 变化回调 | (e: CheckboxChangeEvent) => void | - |
| **onBlur** / **onFocus** | 失焦/获焦 | function | - |
| **autoFocus** | 自动聚焦 | boolean | false |

---

## 3. Checkbox.Group API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **options** | 可选项 | string[] \| number[] \| Option[] | [] |
| **value** | 选中项（受控） | (string \| number \| boolean)[] | [] |
| **defaultValue** | 默认选中项 | (string \| number)[] | [] |
| **disabled** | 整组禁用 | boolean | false |
| **name** | 内部 input name | string | - |
| **onChange** | 变化回调 | (checkedValue: T[]) => void | - |

Option: `{ label: string; value: string; disabled?: boolean }`。

---

## 4. Form 中用法

Form.Item 默认绑定 `value`，Checkbox 的值属性为 `checked`，需设置 `valuePropName="checked"`。

---

## 5. Token

使用全局/组件 Token，可由 theme.components.Checkbox 覆盖，与 vc-design 品牌色一致。
