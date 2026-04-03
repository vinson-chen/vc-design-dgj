# Image 图片 组件规范（vc-design）

基于 Ant Design 5 的 Image，可预览的图片展示。

---

## 1. 何时使用

- 需要展示图片时使用。
- 需要加载大图预览或加载失败容错时。

---

## 2. API

### Image

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **src** | 图片地址 | string | - |
| **alt** | 图像描述 | string | - |
| **width** / **height** | 宽/高 | string \| number | - |
| **fallback** | 加载失败时的容错地址 | string | - |
| **placeholder** | 加载占位，`true` 为默认占位 | ReactNode | - |
| **preview** | 预览配置，`false` 禁用预览 | boolean \| PreviewType | true |
| **onError** | 加载错误回调 | (event: Event) => void | - |
| **classNames** / **styles** | 语义化结构 | 见文档 | - |

### PreviewType（preview 为对象时）

open、onOpenChange、src、mask、getContainer、minScale/maxScale、movable、imageRender、actionsRender 等。

### Image.PreviewGroup

多图预览。items（string[] 或 对象数组）、preview、fallback、classNames。

---

## 3. Token

由全局/组件 Token 控制，可由 theme 覆盖。
