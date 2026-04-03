# Calendar 日历 组件规范（vc-design）

基于 Ant Design 5 的 Calendar，按日历形式展示数据的容器。

---

## 1. 何时使用

- 当数据按日期或日期划分时，如日程、课表、价格日历等。
- 支持年/月切换；可按需配合农历等。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **value** / **defaultValue** | 当前展示日期（受控/非受控） | Dayjs | - |
| **mode** | 初始模式 | `'month'` \| `'year'` | `'month'` |
| **fullscreen** | 是否全屏显示 | boolean | true |
| **showWeek** | 是否显示周数列 | boolean | false |
| **disabledDate** | 不可选日期 | (current: Dayjs) => boolean | - |
| **validRange** | 可显示的日期范围 | [Dayjs, Dayjs] | - |
| **locale** | 国际化配置 | object | 默认配置 |
| **headerRender** | 自定义头部 | (obj) => ReactNode | - |
| **cellRender** / **fullCellRender** | 自定义单元格内容 | function | - |
| **onChange** | 日期变化 | (date: Dayjs) => void | - |
| **onPanelChange** | 面板变化（年月切换） | (date: Dayjs, mode: string) => void | - |
| **onSelect** | 选择日期 | (date: Dayjs, info: { source }) => void | - |

> 日期使用 dayjs；Calendar 部分 locale 从 value 读取，需正确设置 dayjs 的 locale。

---

## 3. Token

fullBg、fullPanelBg、itemActiveBg、miniContentHeight、monthControlWidth、yearControlWidth 等，可由 theme 覆盖。
