# 页面案例生成流程（Figma -> vc-design）

## 1. 从 Figma 获取节点 JSON

1. 在 Figma 中选中目标画板（例如 `663:11500`）。
2. 使用 TalkToFigma 的 `get_node_info` 或 `read_my_design` 获取节点信息。
3. 将返回结果保存为本地 JSON 文件，例如 `tmp/node-663-11500.json`。

## 2. 生成初版映射清单

在仓库根目录执行：

```bash
npm run page-case:extract -- --input tmp/node-663-11500.json --node-id 663:11500 --figma-link "https://www.figma.com/design/a4w8JupybLqnEXPkxRs4wL/VC-Design?node-id=663-11500&t=GbwvUkmgYHG3vmT3-1"
```

输出文件：

- `demo/src/cases/pageCaseManifest.generated.json`

## 3. 人工校正映射

- 组件映射：把 `suggestedComponent` 修正为真实的 vc-design 组件与变体。
- 颜色映射：把 `tokenPath` 修正为准确的 `vcTokens` 路径。
- 图标映射：把占位 `help-circle` 替换为对应的 `VcIcon` type。

## 4. 落地到页面案例

将校正后的映射同步到 `demo/src/cases/pageCaseManifest.ts`，并在 `demo/src/demos/PageCaseDemo.tsx` 中接入实际交互（筛选、分页、弹窗、后续事件逻辑）。
