# Form 表单 组件规范（vc-design）

基于 Ant Design 5 的 Form，高性能表单控件，自带数据域管理。包含数据录入、校验及对应样式。

---

## 1. 何时使用

- 用于创建一个实体或收集信息。
- 需要对输入的数据类型进行校验时。

---

## 2. Form API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **form** | 由 `Form.useForm()` 创建的实例 | FormInstance | - |
| **layout** | 表单布局 | `'horizontal'` \| `'vertical'` \| `'inline'` | `'horizontal'` |
| **labelAlign** | label 对齐 | `'left'` \| `'right'` | `'right'` |
| **labelCol** / **wrapperCol** | label/控件布局（同 Col） | object | - |
| **initialValues** | 表单默认值（仅初始化与重置生效） | object | - |
| **size** | 字段组件尺寸 | `'small'` \| `'middle'` \| `'large'` | - |
| **disabled** | 整表禁用 | boolean | false |
| **requiredMark** | 必选样式 | boolean \| `'optional'` \| (label, info) => ReactNode | true |
| **validateTrigger** | 统一校验触发时机 | string \| string[] | `'onChange'` |
| **scrollToFirstError** | 提交失败滚动到首个错误 | boolean \| Options | false |
| **onFinish** | 提交且校验成功 | (values) => void | - |
| **onFinishFailed** | 提交且校验失败 | ({ values, errorFields, outOfDate }) => void | - |
| **onValuesChange** | 字段值变化 | (changedValues, allValues) => void | - |

---

## 3. Form.Item API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **name** | 字段名，支持数组 | NamePath | - |
| **label** | 标签 | ReactNode | - |
| **rules** | 校验规则 | Rule[] | - |
| **required** | 必填样式 | boolean | false |
| **initialValue** | 默认值 | any | - |
| **valuePropName** | 子节点值属性，Switch/Checkbox 为 `checked` | string | `'value'` |
| **trigger** | 收集值的时机 | string | `'onChange'` |
| **validateTrigger** | 校验时机 | string \| string[] | - |
| **dependencies** | 依赖字段，依赖更新时触发更新与校验 | NamePath[] | - |
| **shouldUpdate** | 自定义更新逻辑，任意变化重渲染可设为 true | boolean \| (prev, cur) => boolean | false |

---

## 4. Form.useForm

创建 form 实例，用于受控、重置、设置值等。Form 不传 `form` 时会内部自动创建。

---

## 5. 与 vc-design 约定

- Checkbox / Switch 在 Form.Item 下须设置 `valuePropName="checked"`。
- 默认值用 Form 的 `initialValues` 或 Item 的 `initialValue`，勿用控件的 `value`/`defaultValue` 设表单值。

---

## 6. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
