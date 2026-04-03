---
name: vc-add-component
description: vc-design 组件库的新增流程与使用约定。新增组件时按流程写 spec、Demo、路由与导出；在业务项目中使用组件时，按本 skill 的「已导出组件」与「使用约定」稳定调用。
---

# vc-design：新增组件与使用约定

---

## 一、在业务项目中使用 vc-design（调用约定）

在**实际应用/业务项目**中引用 vc-design 时，按以下约定调用，保证风格一致、行为可预期。

### 1. 安装与入口

- 安装：依赖 `vc-design`（及 peer 如 `react`、`antd`、按需 `dayjs`）。
- 样式：入口处引入 `import 'vc-design/dist/index.css'`。
- 根节点用 `VcConfigProvider` 包裹一次，使主题与 token 生效：
  ```tsx
  import { VcConfigProvider } from 'vc-design';
  <VcConfigProvider>
    <App />
  </VcConfigProvider>
  ```

### 2. 组件与图标

- **组件**：从 `vc-design` 按名引入，API 以 **Ant Design 5** 为准，细节见仓库内 `docs/{组件英文}-spec.md`。
- **图标**：仅用 `VcIcon`，从 `vc-design` 引入；`type` 为 iconfont 后缀（如 `type="search"`、`type="user"`），同一图标有 `xxx` / `xxx-filled` 时默认用无 `-filled` 的。
  ```tsx
  import { Button, VcIcon } from 'vc-design';
  <Button icon={<VcIcon type="search" />}>搜索</Button>
  ```
- **设计 token**：需要与设计一致的颜色、间距、圆角时，从 `vc-design` 引入 `vcTokens` 使用（如 `vcTokens.color.primary.default`、`vcTokens.color.neutral.background.layout`）。**不要使用** `vcTokens.color.brand.*` 或 `vcTokens.color.neutral.border.subtle`（仓库中无此路径，已用 `primary.default` / `neutral.border.default` 等替代）。

### 3. 已导出组件清单（以 src/index.ts 为准）

以下组件均可从 `vc-design` 直接 `import { Xxx } from 'vc-design'` 使用。**新增组件并导出后，请同步更新本清单。**

| 分类     | 组件名 |
|----------|--------|
| 通用     | Button, FloatButton, Typography |
| 布局     | Divider, Flex, Grid, Row, Col, Layout, Space, Splitter |
| 导航     | Affix, Anchor, Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs |
| 数据录入 | AutoComplete, Cascader, Checkbox, ColorPicker, DatePicker, Form, Input, InputNumber, Mentions, Radio, Rate, Select, Slider, Switch, TimePicker, Transfer, TreeSelect, Upload |
| 数据展示 | Avatar, Badge, Calendar, Card, Carousel, Collapse, Descriptions, Empty, Image, List, Popover, QRCode, Segmented, Statistic, Table, Tag, Timeline, Tooltip, Tour, Tree |
| 反馈     | Alert, Drawer, message, Modal, notification, Popconfirm, Progress, Result, Skeleton, Spin |
| 其它     | ConfigProvider（VcConfigProvider）, 见 navConfig，未在上表中的暂无导出或为 Empty 占位 |

- Grid：antd 的 Grid 仅导出 `useBreakpoint`，本库额外导出 **Row、Col**，布局用 `<Row>` / `<Col>`。
- 日期时间：DatePicker、TimePicker、Calendar 使用 **dayjs**；业务项目需安装 `dayjs`，必要时 `dayjs.locale('zh-cn')`。

### 4. 常见用法注意

- **Form 内控件**：Checkbox、Switch 在 Form.Item 中须设置 `valuePropName="checked"`。
- **路由/演示页**：demo 左侧导航与 URL hash 同步（如 `#avatar`），刷新后保持当前选中；新增 Demo 时在 `demos/index.tsx` 中加对应 `selectedKey` 分支。

---

## 二、新增组件流程（在 vc-design 仓库内）

用户说「新增 xx 组件」时，按下列步骤完成：规范文档、演示页、路由与（按需）主题/导出。

## 1. 规范文档

- 在 `docs/` 下新增 `{组件英文小写}-spec.md`（如 `input-spec.md`）。
- 结构参考 `docs/button-spec.md`：
  - 标题：`# {组件名} 组件规范（vc-design）`
  - 小节：尺寸（Size）、类型（Type）、状态、Token 映射等，用表格 + 简短说明。
  - 所有尺寸/颜色/圆角必须标明对应的 `vcTokens` 路径（如 `vcTokens.size.controlHeight.md`、`vcTokens.color.primary.default`）。

## 2. 演示页（Demo）

- 在 `demo/src/demos/` 下新增 `{ComponentName}Demo.tsx`（如 `InputDemo.tsx`）。
- 内容要求：
  - 顶部：`<h1>` 组件中文名，一段简短说明。
  - 按规范分 section：类型、尺寸、状态、带图标等，每块用 `<h2>` + 可交互示例。
  - **图标一律用 `VcIcon`**，从 `vc-design` 引入；同一图标有 `xxx` / `xxx-filled` 时，**默认用无 `-filled` 后缀**（如 `type="search"`）。
  - 使用 `vcTokens` 做说明区背景色、文字色等，保持与现有 Demo 风格一致。
- 不在 `demo/package.json` 或 Demo 中引入 `@ant-design/icons`；需要图标时只用 `<VcIcon type="xxx" />`。
- **固定定位组件**（如 FloatButton）：每个演示块须为独立包含块（容器设 `transform: translateZ(0)`、合适高度、`overflow: hidden`），使固定元素落在该块右下角而非整页；布局可参考 Ant Design 对应组件文档页的演示区（如 [FloatButton](https://5x.ant.design/components/float-button-cn)）。

## 3. 路由与导航

- 左侧导航已在 `demo/src/navConfig.tsx` 中与 [Ant Design 5 组件总览](https://5x.ant.design/components/overview-cn) 对齐，**一般无需改 navConfig**（组件 key 已存在，如 `input`、`select`）。
- 在 `demo/src/demos/index.tsx` 中：
  - 若尚未导入新 Demo 组件，增加 `import {ComponentName}Demo from './{ComponentName}Demo'`。
  - 在 `DemoContent` 中为对应 `selectedKey` 增加分支：`if (selectedKey === 'xxx') return <XxxDemo />;`（`xxx` 与 `navConfig` 中该组件的 key 一致）。

## 4. 主题与 Token（按需）

- 若该组件需要覆盖 AntD 的 token（如高度、字号、圆角），在 `src/theme/buildAntdTheme.ts` 的 `theme.components` 中增加或修改对应组件 key（如 `Input`、`Select`），写法参考现有的 `Input` / `Select` 配置。
- 仅当设计规范有明确数值且与全局 token 不一致时才改；否则依赖全局 token 即可。

## 5. 库内导出（按需）

- 若业务需要从 `vc-design` 直接使用该组件（如 `import { Input } from 'vc-design'`），在 `src/index.ts` 中增加：`export { Input } from 'antd';`（组件名按 antd 导出名书写）。
- **导出后**：在本 SKILL 的「一、3. 已导出组件清单」表格中，将新组件加入对应分类，保证业务侧调用时有据可查。
- 若当前仅做演示、不对外导出，可省略本步。

## 6. 收尾

- 运行 `npm run build`（仓库根目录）确保库构建通过；运行 `npm run demo` 在浏览器中切到新组件，逐项核对规范与交互。
- 若规范文档中有表格或 Token 与实现不一致，以规范为准修正 Demo 或主题配置。

## 约定速查

| 项 | 约定 |
|----|------|
| 图标 | 仅用 `VcIcon`，`type` 默认无 `-filled` 后缀 |
| 导航 key | 与 `navConfig` 一致（如 `input`、`select`、`tabs`），小写、多词用连字符 |
| 规范文档 | `docs/{组件英文小写}-spec.md`，标明 Token 路径 |
| Demo 组件 | `demo/src/demos/{ComponentName}Demo.tsx`，section 化、可交互 |

---

## 维护说明

- **新增组件并导出后**：务必在「一、3. 已导出组件清单」中补全新组件，便于后续在业务项目中稳定调用。
- **页面/展示类改动**（如 demo 布局、hash 持久化、独立滚动等）：若影响使用方式或约定，请在本 SKILL 对应小节补充说明（如「一、4. 常见用法注意」已包含 demo 路由与 hash 的约定）。
