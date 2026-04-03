# Space 间距 组件规范（vc-design）

基于 Ant Design 5 的 Space，用于设置组件之间的间距。为内联元素提供等距排列，会为每个子元素添加包裹元素；与 Flex 区别见下。

---

## 1. 何时使用

- 避免组件紧贴，需要统一间距。
- 适合行内元素的水平/垂直间距。
- 可设置对齐方式（align）。
- 表单组件需紧凑连接、合并边框时使用 **Space.Compact**。

## 2. 与 Flex 的区别

- **Space**：为内联元素提供间距，会为每个子元素添加包裹元素，适用于行/列中等距排列。
- **Flex**：块级、不添加包裹元素，适用于更灵活的布局控制。

---

## 3. Space API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **direction** | 间距方向 | `horizontal` \| `vertical` | `horizontal` |
| **size** | 间距大小，可为数组 [水平, 垂直] | `small` \| `middle` \| `large` \| number \| [Size, Size] | `small` |
| **align** | 对齐方式 | `start` \| `end` \| `center` \| `baseline` | - |
| **wrap** | 是否自动换行（仅 horizontal 有效） | boolean | false |
| **split** | 分隔符（如 Divider） | ReactNode | - |
| **classNames** / **styles** | 语义化 className/style | Record&lt;SemanticDOM, string&gt; | - |

---

## 4. Space.Compact

表单组件紧凑连接、合并边框时使用。支持 Button、Input、Select、DatePicker 等。

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **direction** | 排列方向 | `horizontal` \| `vertical` | `horizontal` |
| **size** | 子组件尺寸 | `small` \| `middle` \| `large` | `middle` |
| **block** | 宽度是否撑满父元素 | boolean | false |

---

## 5. Token

Space 使用 AntD 间距 token（marginXS、marginSM、margin 等）对应 size 预设，由 buildAntdTheme(vcTokens) 全局注入，与 vc-design 间距体系一致。
