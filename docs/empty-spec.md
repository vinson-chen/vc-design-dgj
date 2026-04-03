# Empty 空状态 组件规范（vc-design）

基于 Ant Design 5 的 Empty，空状态时的展示占位。

---

## 1. 何时使用

- 当目前没有数据时，用于显式的用户提示。
- 初始化场景时的引导创建流程。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **description** | 自定义描述 | ReactNode | - |
| **image** | 显示图片，string 为图片地址 | ReactNode | `Empty.PRESENTED_IMAGE_DEFAULT` |
| **imageStyle** | 图片样式 | CSSProperties | - |
| **classNames** / **styles** | 语义化结构 class / style | 见文档 | - |

### 内置图片

- `Empty.PRESENTED_IMAGE_DEFAULT` 默认插图
- `Empty.PRESENTED_IMAGE_SIMPLE` 简易风格

子节点可作为底部操作区（如按钮）。

---

## 3. Token

由全局/组件 Token 控制，可由 theme 覆盖。
