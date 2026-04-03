# Switch 开关 组件规范（vc-design）

基于 Ant Design 5 的 Switch，用于在两种状态之间切换。与 Checkbox 区别：Switch 切换会直接触发状态改变，Checkbox 多用于状态标记并配合提交。

---

## 1. 何时使用

- 需要表示开关状态或两种状态之间的切换时。
- 与 Checkbox 区别：Switch 直接触发状态改变，Checkbox 多用于状态标记、需配合提交。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **checked** / **defaultChecked** | 是否选中 / 初始是否选中 | boolean | false |
| **disabled** | 禁用 | boolean | false |
| **loading** | 加载中 | boolean | false |
| **size** | 尺寸 | `'default'` \| `'small'` | `'default'` |
| **checkedChildren** | 选中时内容 | ReactNode | - |
| **unCheckedChildren** | 未选中时内容 | ReactNode | - |
| **onChange** | 变化回调 | (checked: boolean, event: Event) => void | - |
| **onClick** | 点击回调 | (checked: boolean, event: Event) => void | - |

---

## 3. Form 中用法

Form.Item 默认绑定 `value`，Switch 的值属性为 `checked`，需设置 **valuePropName="checked"**。

---

## 4. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
