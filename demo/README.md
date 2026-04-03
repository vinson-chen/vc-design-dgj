# vc-design 演示

用于检验组件规范的可交互页面。

## 运行方式

在**仓库根目录**执行（会先构建库再启动 demo）：

```bash
npm run demo
```

或在已构建库的情况下，在 demo 目录执行：

```bash
cd demo && npm install && npm run dev
```

浏览器访问：**http://localhost:5173/**

## 当前内容

- **Button 规范检验**：类型（primary / default / dashed / link / text）、尺寸（large / middle / small）、状态（禁用 / Loading）、危险按钮、带图标，可点击查看反馈。

规范文档见根目录 `docs/button-spec.md`。

## 图标

演示页使用 vc-design 内置的 **VcIcon**（基于你的 iconfont），所有组件图标均来自同一图标库。若图标不显示，请检查 `demo/index.html` 中的 iconfont「Font class」在线链接是否与你的项目一致（Project id 5131978）。
