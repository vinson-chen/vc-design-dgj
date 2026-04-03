# Steps 步骤条 组件规范（vc-design）

基于 Ant Design 5 的 Steps，引导用户按流程完成任务的导航条。当任务复杂或存在先后关系时，可拆成一系列步骤。

---

## 1. 何时使用

- 任务复杂或存在先后关系时，拆成步骤以简化任务。
- 流程类页面（如提交订单、开通服务）的进度展示。

---

## 2. Steps API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **items** | 步骤项配置 | StepItem[] | [] |
| **current** | 当前步骤（从 0 开始） | number | 0 |
| **direction** | 方向 | `horizontal` \| `vertical` | `horizontal` |
| **size** | 尺寸 | `default` \| `small` | `default` |
| **status** | 当前步骤状态 | `wait` \| `process` \| `finish` \| `error` | `process` |
| **type** | 类型 | `default` \| `navigation` \| `inline` | `default` |
| **labelPlacement** | 标签位置 | `horizontal` \| `vertical` | `horizontal` |
| **progressDot** | 点状步骤条 | boolean \| (iconDot, info) => ReactNode | false |
| **percent** | 当前 process 步骤的进度条进度（仅 default 类型） | number | - |
| **initial** | 起始序号 | number | 0 |
| **responsive** | 窄屏时是否自动垂直 | boolean | true |
| **onChange** | 点击切换步骤（可点击时） | (current) => void | - |

---

## 3. StepItem

| 参数 | 说明 | 类型 |
|------|------|------|
| **title** | 标题 | ReactNode |
| **description** | 描述 | ReactNode |
| **subTitle** | 子标题 | ReactNode |
| **icon** | 自定义图标 | ReactNode |
| **status** | 该项状态（覆盖 Steps 的 current 推导） | wait \| process \| finish \| error |
| **disabled** | 是否禁用点击 | boolean |

---

## 4. Token

组件 Token：iconSize、iconFontSize、dotSize、titleLineHeight 等，可由 theme.components.Steps 覆盖。
