# Progress 组件规范（vc-design）

基于 Ant Design 5 的 Progress（进度条），用于展示任务完成度或加载进度，通过 VC Tokens 与主题统一颜色与尺寸。

---

## 1. 类型（type）

| 类型 | 说明 |
|------|------|
| **line** | 直线型进度条（默认） |
| **circle** | 环形进度条 |
| **dashboard** | 仪表盘型（带缺口的环形） |

---

## 2. 进度与状态

| 属性 | 说明 |
|------|------|
| **percent** | 进度百分比，0–100 |
| **status** | 状态：`normal`、`success`、`exception`、`active`（动态条纹） |
| **showInfo** | 是否显示百分比文字，默认 true |
| **format** | 自定义文字，如 `(percent) => percent + '%'` |
| **success** | 成功段配置，如 `{ percent: 30 }` 表示已完成 30% 的次要进度 |

- 成功态使用 `vcTokens.color.success.default`，异常态使用 `vcTokens.color.error.default`，默认态使用 `vcTokens.color.primary.default`。

---

## 3. 样式与尺寸

| 属性 | 说明 |
|------|------|
| **strokeWidth** | 线宽（线型为高度，环形为描边宽度） |
| **strokeColor** | 进度条颜色，可为字符串、渐变色或数组 |
| **railColor** | 轨道（背景）颜色 |
| **size** | 线型为 `small`/`default` 或 [width, height]；环形为数字（直径）或 [width, strokeWidth] |
| **strokeLinecap** | 线型端点形状：`round`、`square`、`butt` |

- 圆角、线宽与设计规范一致时可参考 `vcTokens.style.borderRadius.sm`。

---

## 4. 环形与仪表盘

- **circle**：通过 `size` 设置直径；`gapDegree`、`gapPlacement` 控制缺口（仪表盘效果也可用 type="dashboard"）。
- **dashboard**：默认带缺口，适合展示如 0–100 的完成度。

---

## 5. 步骤条进度（steps）

- **steps**：将进度条拆成若干小格，如 `steps={10}`，适合离散步骤展示。
- **rounding**：每格舍入方式。

---

## 6. 其他

- **percentPosition**：百分比文字位置（inner/outer、start/center/end）。
- 无障碍：可设置 `aria-label` 等描述进度含义。
