# AutoComplete 自动完成 组件规范（vc-design）

基于 Ant Design 5 的 AutoComplete，输入框自动完成功能。与 Select 区别：AutoComplete 是带提示的**输入框**，关键词是辅助输入；Select 是在限定选项中**选择**。

---

## 1. 何时使用

- 需要输入框而非选择器时。
- 需要输入建议/辅助提示时。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **options** | 数据源 | { label, value }[] | - |
| **value** | 当前值（受控） | string | - |
| **defaultValue** | 默认值 | string | - |
| **placeholder** | 占位提示 | string | - |
| **filterOption** | 是否/如何筛选；函数 (inputValue, option) => boolean | boolean \| function | true |
| **onSearch** | 输入时搜索补全 | (value: string) => void | - |
| **onChange** | 值变化（受控用 onChange） | (value: string) => void | - |
| **onSelect** | 选中某项 | (value: string, option) => void | - |
| **allowClear** | 是否支持清除 | boolean \| { clearIcon? } | false |
| **size** | 尺寸 | large \| middle \| small | - |
| **status** | 校验状态 | error \| warning | - |
| **variant** | 形态 | outlined \| filled \| borderless \| underlined | outlined |
| **open** / **onOpenChange** | 下拉展开受控 | boolean / (open) => void | - |
| **getPopupContainer** | 下拉挂载节点 | (node) => HTMLElement | () => document.body |
| **notFoundContent** | 无匹配时内容 | ReactNode | - |
| **popupRender** | 自定义下拉内容 | (node) => ReactNode | - |
| **backfill** | 键盘选择时是否回填到输入框 | boolean | false |
| **children** | 自定义输入组件 | ReactElement\<InputProps\> | \<Input /\> |

---

## 3. 受控与中文输入

受控时请用 **onChange** 管理 value，不要仅用 onSearch，否则中文输入法可能异常。选中等场景也建议配合 onChange。

---

## 4. Token

组件 Token 与 Input/Select 共用（activeBorderColor、optionSelectedBg 等），由 buildAntdTheme(vcTokens) 统一注入。
