# TimePicker 时间选择框 组件规范（vc-design）

基于 Ant Design 5 的 TimePicker，用于输入或选择时间。时间值使用 **dayjs**，需在项目中安装并配置 locale。

---

## 1. 何时使用

当用户需要输入一个时间时，可点击标准输入框，弹出时间面板进行选择。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **value** / **defaultValue** | 当前时间 / 默认时间 | Dayjs | - |
| **format** | 展示格式 | string | `'HH:mm:ss'` |
| **size** | 输入框大小 | `'large'` \| `'middle'` \| `'small'` | - |
| **disabled** | 禁用 | boolean | false |
| **allowClear** | 允许清除 | boolean \| { clearIcon } | true |
| **hourStep** / **minuteStep** / **secondStep** | 时/分/秒步长 | number | 1 |
| **use12Hours** | 12 小时制 | boolean | false |
| **needConfirm** | 是否需要确认按钮 | boolean | - |
| **showNow** | 是否显示「此刻」 | boolean | - |
| **disabledTime** | 不可选时间 | (now) => { disabledHours?, disabledMinutes?, disabledSeconds? } | - |
| **onChange** | 时间变化 | (time: Dayjs, timeString: string) => void | - |

---

## 3. TimePicker.RangePicker

时间范围选择，除与 DatePicker.RangePicker 共有属性外，还有 **disabledTime**（RangeDisabledTime）、**order**（始末是否自动排序）等。

---

## 4. Token

使用全局/组件 Token，可由 theme 覆盖，与 vc-design 品牌色一致。
