# Tour 组件规范（vc-design）

基于 Ant Design 5 的 Tour（漫游式引导），用于分步高亮并介绍页面元素，通过 VC Tokens 与主题保持样式一致。

---

## 1. 用途与触发

- **用途**：新功能引导、关键操作说明，按步骤高亮目标元素并展示标题与描述。
- **触发**：由业务控制 `open`，通常通过「开始引导」按钮或首次进入页面时打开。
- **步骤**：通过 `steps` 配置，每步包含 `target`（目标元素）、`title`、`description`。

---

## 2. 步骤配置（steps）

| 属性 | 说明 |
|------|------|
| **target** | 目标元素：`() => HTMLElement` 或 ref 对应的 DOM，用于定位高亮与气泡位置 |
| **title** | 步骤标题 |
| **description** | 步骤描述正文 |
| **placement** | 气泡相对 target 的位置：top、bottom、left、right 等，与 Tooltip 类似 |
| **cover** | 可选，覆盖在 target 上的 React 节点（如图片） |
| **type** | 单步类型：`default`、`primary`，影响按钮与强调色 |

- 若某步不需高亮具体元素，可将 `target` 设为 `null`，气泡居中或按 placement 展示。

---

## 3. 类型（type）

| 值 | 说明 | Token 映射 |
|----|------|------------|
| **default** | 默认样式 | 边框与中性色，`vcTokens.color.neutral.border.default` |
| **primary** | 主色强调 | 主按钮与高亮使用 `vcTokens.color.primary.default` |

- 可在 Tour 根或单步设置 `type`；单步优先。

---

## 4. 受控与回调

- **open**：是否显示引导。
- **onClose**：关闭时回调（用户点击关闭或遮罩）。
- **current**：当前步骤索引（受控）；不传则组件内部管理。
- **onChange**：步骤切换时回调，参数为当前索引。
- **indicatorsRender**：自定义步骤指示器。
- **actionsRender**：自定义底部按钮区域（上一步、下一步、完成）。

---

## 5. 遮罩与键盘

- **mask**：是否显示遮罩（默认 true），可传对象配置颜色与样式。
- **keyboard**：是否支持键盘（如 Esc 关闭、方向键切换），默认 true。

---

## 6. 其他

- 气泡圆角、内边距与主题一致，使用 `vcTokens.style.borderRadius.md` 等。
- 步骤内若需图标，仅使用 **VcIcon**。
