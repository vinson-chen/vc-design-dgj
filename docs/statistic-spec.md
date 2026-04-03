# Statistic 统计数值 组件规范（vc-design）

基于 Ant Design 5 的 Statistic，展示统计数值。

---

## 1. 何时使用

- 需要突出某个或某组数字时。
- 需要展示带描述的统计类数据时。

---

## 2. API

### Statistic

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **title** | 标题 | ReactNode | - |
| **value** | 数值 | string \| number | - |
| **prefix** / **suffix** | 前缀/后缀 | ReactNode | - |
| **formatter** | 自定义数值展示 | (value) => ReactNode | - |
| **precision** | 数值精度（小数位数） | number | - |
| **decimalSeparator** | 小数点符号 | string | `.` |
| **groupSeparator** | 千分位符号 | string | `,` |
| **valueStyle** | 数值区域样式 | CSSProperties | - |
| **loading** | 加载中 | boolean | false |
| **classNames** / **styles** | 语义化结构 | 见文档 | - |

### Statistic.Timer（5.25.0+）

正计时/倒计时。Countdown 已废弃，用 Timer 替代。

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **type** | 类型 | `'countdown'` \| `'countup'` | - |
| **value** | 目标时间戳（毫秒） | number | - |
| **format** | 展示格式（dayjs） | string | `HH:mm:ss` |
| **title** / **prefix** / **suffix** | 标题/前缀/后缀 | ReactNode | - |
| **onFinish** | 倒计时结束回调 | () => void | - |
| **onChange** | 时间变化回调 | (value: number) => void | - |

---

## 3. Token

contentFontSize、titleFontSize 等，可由 theme 覆盖。
