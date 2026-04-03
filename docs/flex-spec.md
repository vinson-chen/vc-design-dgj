# Flex 弹性布局 组件规范（vc-design）

基于 Ant Design 5 的 Flex，用于对齐的弹性布局容器。适用于设置元素间距与水平/垂直对齐（与 Space 区别：Flex 为块级、不包裹子元素，控制力更强）。

---

## 1. 何时使用

- 设置元素之间的间距（`gap`）。
- 设置各种水平、垂直对齐方式（`justify`、`align`）。

## 2. 与 Space 的区别

- **Space**：为内联元素提供间距，会为每个子元素添加包裹元素，适用于行/列中等距排列。
- **Flex**：为块级元素提供间距，不添加包裹元素，适用于垂直或水平方向布局，灵活性与控制能力更强。

---

## 3. 方向与换行

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **vertical** | 主轴是否垂直（`flex-direction: column`） | boolean | false |
| **wrap** | 单行或多行（对应 CSS flex-wrap） | flex-wrap \| boolean | nowrap |

---

## 4. 对齐与弹性

| 属性 | 说明 | 类型 |
|------|------|------|
| **justify** | 主轴对齐（justify-content） | normal \| flex-start \| center \| flex-end \| space-between \| space-around \| space-evenly 等 |
| **align** | 交叉轴对齐（align-items） | normal \| flex-start \| center \| flex-end \| stretch \| baseline 等 |
| **flex** | flex CSS 简写 | string |

---

## 5. 间距（gap）

| 值 | 说明 |
|----|------|
| **small** \| **middle** \| **large** | 预设尺寸，与 vc-design/antd 间距体系一致 |
| string \| number | 自定义（如 `8`、`'16px'`） |

---

## 6. 其他

| 属性 | 说明 | 默认值 |
|------|------|--------|
| **component** | 根元素类型 | `div` |

- 默认：水平模式下向上对齐，垂直模式下拉伸对齐，可通过 `justify` / `align` 调整。

---

## 7. Token

Flex 使用 AntD 通用间距 token（如 marginXS、marginSM、margin 等）用于 gap 预设，由 `buildAntdTheme(vcTokens)` 全局注入，无需单独覆盖。
