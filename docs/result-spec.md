# Result 组件规范（vc-design）

基于 Ant Design 5 的 Result（结果），用于展示操作结果页或模块，包括图标/插图、标题、副标题与操作区，通过 VC Tokens 与主题统一语义色。

---

## 1. 状态（status）

| 状态值 | 说明 |
|--------|------|
| **success** | 操作成功 |
| **info** | 普通提示或中性结果 |
| **warning** | 提示注意或风险 |
| **error** | 操作失败或错误 |
| **404** | 404 未找到 |
| **403** | 403 无权限 |
| **500** | 500 服务器错误 |

- 未指定时默认为 `info` 或主题默认样式。

---

## 2. 内容结构

| 属性 | 说明 |
|------|------|
| **icon** | 自定义图标或插图，默认根据 `status` 显示内置图标/插图 |
| **title** | 结果标题（主文案），如「提交成功」「页面不存在」 |
| **subTitle** | 副标题/说明文案，可多行，常用于解释原因或下一步指引 |
| **extra** | 操作区，通常为一个或多个按钮（如「返回首页」「重新加载」） |
| **children** | 可选，自由插入额外内容（如列表、表格等） |

- 图标与标题颜色与语义色对应：success 使用 `vcTokens.color.success.default`，error 使用 `vcTokens.color.error.default` 等。

---

## 3. 使用场景

- **页面级结果**：单独结果页，如 404/403/500、支付成功页等。
- **模块级结果**：页内某个卡片或区域，用于展示当前步骤结果。

---

## 4. 样式与 Token

- 背景通常使用 `vcTokens.color.neutral.background.layout` 或白色，保持与页面背景一致。
- 标题文本使用 `vcTokens.color.neutral.text.default`，副标题使用 `vcTokens.color.neutral.text.description`。
- 可通过 `classNames` / `styles` 精细控制 `root`、`title`、`subTitle`、`extra` 区域样式。

---

## 5. 其他

- 内置插图：可使用 `Result.PRESENTED_IMAGE_404` 等作为自定义 `icon`，适配不同错误页风格。

