# QRCode 二维码 组件规范（vc-design）

基于 Ant Design 5 的 QRCode，将文本转换为二维码，支持自定义配色与 Logo。

---

## 1. 何时使用

- 需要将文本转换为二维码供扫描时使用。

---

## 2. API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **value** | 编码内容（扫描后的文本） | string \| string[] | - |
| **size** | 二维码尺寸（px） | number | 160 |
| **type** | 渲染类型 | `'canvas'` \| `'svg'` | `'canvas'` |
| **color** | 二维码颜色 | string | `#000` |
| **bgColor** | 背景色 | string | transparent |
| **icon** | 中心图片地址 | string | - |
| **iconSize** | 中心图尺寸 | number \| { width, height } | 40 |
| **bordered** | 是否显示边框 | boolean | true |
| **errorLevel** | 纠错等级 | `'L'` \| `'M'` \| `'Q'` \| `'H'` | `'M'` |
| **marginSize** | 留白（安静区）模块数 | number | 0 |
| **status** | 状态 | `'active'` \| `'expired'` \| `'loading'` \| `'scanned'` | `'active'` |
| **statusRender** | 自定义状态渲染 | (info: StatusRenderInfo) => ReactNode | - |
| **boostLevel** | 自动提升纠错等级 | boolean | true |
| **classNames** / **styles** | 语义化结构 | 见文档 | - |

> 链接过长会导致像素过密难以扫描，可增大 size 或使用短链。

---

## 3. Token

由组件/全局 Token 控制，可由 theme 覆盖。
