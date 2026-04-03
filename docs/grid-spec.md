# Grid 栅格 组件规范（vc-design）

基于 Ant Design 5 的 Grid，24 栅格系统。基于行（Row）和列（Col）定义信息区块，基于 Flex 布局，支持对齐、排序与响应式。

---

## 1. 设计约定

- 将设计区域按 **24 等分**；横向盒子建议 1～4 个。
- 只有 **Col** 可作为 **Row** 的直接子元素；内容放在 Col 内。
- 列用 1～24 表示跨度，如 `<Col span={8} />` 表示占 8 份；一行内 Col 总 span 超过 24 会换行。

---

## 2. Row API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **align** | 垂直对齐 | `top` \| `middle` \| `bottom` \| `stretch` 或响应式对象 | `top` |
| **gutter** | 栅格间隔（水平，或 [水平, 垂直]）；可数字、字符串单位、或响应式对象 `{ xs, sm, md, lg, xl, xxl }` | number \| string \| object \| [number, number] | 0 |
| **justify** | 水平排列 | `start` \| `end` \| `center` \| `space-around` \| `space-between` \| `space-evenly` 或响应式对象 | `start` |
| **wrap** | 是否自动换行 | boolean | true |

- 推荐间隔使用 (16+8n)px；响应式如 `{ xs: 8, sm: 16, md: 24, lg: 32 }`。

---

## 3. Col API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **span** | 占位格数（0 相当于 display: none） | number | - |
| **offset** | 左侧间隔格数 | number | 0 |
| **order** | 排序（flex order） | number | 0 |
| **push** | 向右推格数 | number | 0 |
| **pull** | 向左拉格数 | number | 0 |
| **flex** | flex 布局属性（如 `"1 1 200px"`） | string \| number | - |
| **xs/sm/md/lg/xl/xxl** | 响应式栅格（断点同 antd 默认） | number \| { span, offset, order, push, pull } | - |

- 断点：xs &lt; 576, sm ≥ 576, md ≥ 768, lg ≥ 992, xl ≥ 1200, xxl ≥ 1600（可通过主题 screen 定制）。

---

## 4. 使用方式

antd 的 `Grid` 默认导出仅含 `useBreakpoint`，`Row`、`Col` 需从主入口单独引入：

```ts
import { Row, Col } from 'vc-design';
// 若需 useBreakpoint：import { Grid } from 'vc-design'; Grid.useBreakpoint()
```

---

## 5. Token

- 栅格断点使用 AntD 全局 token `screenXS`～`screenXXL`，与 vc-design 约定一致时可保持默认，无需单独覆盖。
