# Slider 滑动输入条 组件规范（vc-design）

基于 Ant Design 5 的 Slider，滑动型输入器，展示当前值和可选范围。

---

## 1. 何时使用

当用户需要在数值区间或自定义区间内进行选择时，可为连续或离散值。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **value** / **defaultValue** | 当前值 / 初始值 | number \| [number, number] | 0 \| [0, 0] |
| **min** / **max** | 最小值 / 最大值 | number | 0 / 100 |
| **step** | 步长，可为 null（仅 marks 取值） | number \| null | 1 |
| **disabled** | 禁用 | boolean | false |
| **range** | 双滑块；可设为对象 { draggableTrack, editable, minCount, maxCount } | boolean \| object | false |
| **marks** | 刻度标记 | { number: ReactNode } \| { number: { style, label } } | - |
| **dots** | 是否只能拖到刻度上 | boolean | false |
| **included** | marks 时 true 为包含关系，false 为并列 | boolean | true |
| **vertical** | 垂直方向 | boolean | false |
| **reverse** | 反向坐标轴 | boolean | false |
| **tooltip** | Tooltip 配置 | { formatter, open, placement, getPopupContainer } | - |
| **onChange** | 值变化 | (value) => void | - |
| **onChangeComplete** | 鼠标/键盘释放时 | (value) => void | - |

---

## 3. Token

使用全局/组件 Token（railBg、trackBg、handleSize 等），可由 theme 覆盖，与 vc-design 品牌色一致。
