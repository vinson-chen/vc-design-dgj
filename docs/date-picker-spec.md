# DatePicker 日期选择框 组件规范（vc-design）

基于 Ant Design 5 的 DatePicker，用于输入或选择日期。当用户需要输入一个日期时，可点击输入框弹出日期面板选择。

---

## 1. 何时使用

当用户需要输入一个日期时，可点击标准输入框，弹出日期面板进行选择。

---

## 2. 形式

- **DatePicker**：单日期
- **DatePicker picker="year" | "quarter" | "month" | "week"**：年/季/月/周选择
- **RangePicker**：`DatePicker.RangePicker` 日期范围

---

## 3. 共同 API（DatePicker / RangePicker）

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **value** / **defaultValue** | 日期 / 默认日期 | Dayjs / [Dayjs, Dayjs] | - |
| **format** | 展示格式（[dayjs format](https://day.js.org/docs/zh-CN/display/format)） | string \| (Dayjs)=>string \| Array \| { format, type?: 'mask' } | 见各 picker |
| **picker** | 类型 | `'date'` \| `'week'` \| `'month'` \| `'quarter'` \| `'year'` | `'date'` |
| **size** | 输入框大小 | `'large'` \| `'middle'` \| `'small'` | - |
| **disabled** | 禁用 | boolean | false |
| **allowClear** | 允许清除 | boolean \| { clearIcon } | true |
| **placeholder** | 占位 | string \| [string, string] | - |
| **placement** | 弹出位置 | bottomLeft / bottomRight / topLeft / topRight | bottomLeft |
| **open** | 是否展开弹层 | boolean | - |
| **disabledDate** | 不可选日期 | (current, info) => boolean | - |
| **presets** | 预设范围（RangePicker） | { label, value: Dayjs \| ()=>Dayjs }[] | - |
| **showTime** | 是否显示时间 | boolean \| TimePicker 配置 | - |
| **onChange** | 变化回调 | (date, dateString) => void | - |
| **onOpenChange** | 弹层显隐 | (open) => void | - |

日期值使用 **dayjs**，需在项目中安装并配置 locale（如中文用 ConfigProvider + dayjs locale）。

---

## 4. DatePicker 独有

**renderExtraFooter**、**showNow**、**showTime**、**multiple**（5.14.0）、**needConfirm** 等。

---

## 5. RangePicker 独有

**allowEmpty**、**separator**、**onCalendarChange** 等。

---

## 6. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
