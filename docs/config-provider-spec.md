# ConfigProvider 全局化配置（vc-design）

用于在应用根节点包裹一次，使主题（Token）、语言、尺寸等配置对内部所有组件生效，无需在每个页面单独设置。

---

## 1. 基本用法

在业务项目入口用 `VcConfigProvider` 包裹根组件，并引入样式：

```tsx
import { VcConfigProvider } from 'vc-design';
import 'vc-design/dist/index.css';

<VcConfigProvider>
  <App />
</VcConfigProvider>
```

- **主题**：默认使用 VC 设计 Token，通过 `buildAntdTheme(vcTokens)` 注入 Ant Design 的 `theme`，所有 antd 组件统一使用 `vcTokens` 中的颜色、字号、圆角、控制高度等。
- **语言**：默认使用中文（`antd/locale/zh_CN`），日期、日历、分页等组件文案为中文。
- **字体**：默认对 `document.body` 设置 VC 主字体：`PingFang SC` 及常见 fallback（见下方 Token）。

---

## 2. 配置项（Props）

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **applyGlobalFont** | 是否自动为 body 设置 VC 主字体 | `boolean` | `true` |
| **locale** | 语言包，同 antd ConfigProvider | `Locale` | `zh_CN` |
| **componentSize** | 全局组件尺寸 | `'small' \| 'middle' \| 'large'` | - |
| **theme** | 自定义主题（覆盖默认 VC 主题） | `ThemeConfig` | 由 `vcTokens` 生成 |
| 其他 | 与 [Ant Design ConfigProvider](https://5x.ant.design/components/config-provider-cn) 一致 | - | - |

- 主题 Token 映射见 `src/theme/buildAntdTheme.ts`，颜色、尺寸、圆角均来自 `vcTokens`（如 `vcTokens.color.primary.default`、`vcTokens.size.controlHeight.md`、`vcTokens.style.borderRadius.md`）。

---

## 3. 全局字体（applyGlobalFont）

当 `applyGlobalFont === true` 时，会在挂载时设置：

- `document.body.style.fontFamily` = `'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`
- 与 `vcTokens.style.font.family.primary` 保持一致，保证整站字体统一。

---

## 4. 与 antd ConfigProvider 的关系

`VcConfigProvider` 基于 antd 的 `ConfigProvider`，在内部固定传入由 `vcTokens` 构建的 `theme`，并可选传入默认 `locale`、`componentSize` 等。业务方可继续通过 props 覆盖 `locale`、`theme`、`componentSize`，实现多语言或局部主题。

---

## 5. 约定

- 业务项目**只需在根节点包裹一次**，所有子路由、子页面内的组件均继承该配置。
- 需要与设计稿一致的颜色、间距、圆角时，从 `vc-design` 引入 `vcTokens` 使用，不要使用 `vcTokens.color.brand.*` 或 `vcTokens.color.neutral.border.subtle`（已由 `primary.*` / `neutral.border.default` 等替代）。
