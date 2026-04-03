# Rate 评分 组件规范（vc-design）

基于 Ant Design 5 的 Rate，用于对事物进行评分操作。

---

## 1. 何时使用

- 对评价进行展示。
- 对事物进行快速的评级操作。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **value** / **defaultValue** | 当前分数 / 默认分数 | number | 0 |
| **count** | 星星总数 | number | 5 |
| **allowHalf** | 是否允许半选 | boolean | false |
| **allowClear** | 是否允许再次点击清除 | boolean | true |
| **disabled** | 只读，无法交互 | boolean | false |
| **character** | 自定义字符 | ReactNode \| (props) => ReactNode | \<StarFilled /\> |
| **tooltips** | 每项提示文案 | string[] | - |
| **onChange** | 选择时回调 | (value: number) => void | - |
| **onHoverChange** | 悬停时数值变化 | (value: number) => void | - |

---

## 3. Token

使用全局/组件 Token（starBg、starColor、starSize 等），可由 theme 覆盖，与 vc-design 品牌色一致。
