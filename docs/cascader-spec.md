# Cascader 级联选择 组件规范（vc-design）

基于 Ant Design 5 的 Cascader，级联选择框。适用于省市区、分类层级等关联数据的选择，可在同一浮层完成多级选择。

---

## 1. 何时使用

- 从一组相关联的数据中选择（如省市区、公司层级、分类）。
- 数据集合较大时，用多级分类分隔便于选择。
- 相比 Select，同一浮层内完成多级选择，体验更好。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **options** | 可选项数据源 | Option[] | - |
| **value** | 选中项（受控） | (string \| number)[] | - |
| **defaultValue** | 默认选中项 | (string \| number)[] | [] |
| **placeholder** | 占位文本 | string | - |
| **allowClear** | 是否支持清除 | boolean \| { clearIcon? } | true |
| **changeOnSelect** | 点选任一级是否即变更（单选时） | boolean | false |
| **expandTrigger** | 次级展开方式 | `click` \| `hover` | `click` |
| **showSearch** | 是否显示搜索 | boolean \| { filter, limit, matchInputWidth, render, sort } | false |
| **displayRender** | 选择后展示的渲染 | (label, selectedOptions) => ReactNode | label.join('/') |
| **fieldNames** | 自定义 label/value/children 字段名 | object | { label, value, children } |
| **size** | 尺寸 | large \| middle \| small | - |
| **status** | 校验状态 | error \| warning | - |
| **variant** | 形态 | outlined \| filled \| borderless \| underlined | outlined |
| **multiple** | 是否多选 | boolean | - |
| **showCheckedStrategy** | 多选时回填方式 | SHOW_PARENT \| SHOW_CHILD | SHOW_PARENT |
| **loadData** | 动态加载（与 showSearch 互斥） | (selectedOptions) => void | - |
| **onChange** | 选择完成回调 | (value, selectedOptions) => void | - |
| **onOpenChange** | 浮层显隐回调 | (open) => void | - |

---

## 3. Option

| 字段 | 说明 | 类型 |
|------|------|------|
| **value** | 选项值 | string \| number |
| **label** | 选项文案 | ReactNode |
| **disabled** | 是否禁用 | boolean |
| **children** | 子选项 | Option[] |
| **isLeaf** | 是否叶子（loadData 时有效） | boolean |

---

## 4. Token

组件 Token：controlWidth、dropdownHeight、optionSelectedBg 等，可由 theme.components.Cascader 覆盖。
