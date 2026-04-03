# Notification 组件规范（vc-design）

基于 Ant Design 5 的 Notification（通知提醒框），用于角标式、带标题与描述的通知，通过 VC Tokens 与主题统一类型色与层级。

---

## 1. 类型与调用

| 类型 | 说明 | Token 映射 |
|------|------|------------|
| **success** | 成功通知 | `vcTokens.color.success.default` |
| **info** | 信息通知 | `vcTokens.color.info.default` 或主色 |
| **warning** | 警告通知 | `vcTokens.color.warning.default` |
| **error** | 错误通知 | `vcTokens.color.error.default` |

- **调用方式**：静态方法 `notification.success(config)`、`notification.info(config)` 等；或 `const [api, contextHolder] = notification.useNotification()`，渲染 `contextHolder` 后通过 `api` 调用。

---

## 2. 内容与布局

| 属性 | 说明 |
|------|------|
| **title** | 通知标题，建议简短 |
| **description** | 补充描述，可多行 |
| **icon** | 自定义图标，仅使用 **VcIcon** |
| **placement** | 展示位置：`top`、`topLeft`、`topRight`、`bottom`、`bottomLeft`、`bottomRight`，默认 `topRight` |
| **duration** | 自动关闭时间（秒），`false` 不自动关闭 |
| **closable** | 是否显示关闭按钮，可配 `closeIcon`（仅用 VcIcon） |
| **actions** | 底部操作区，如「查看」「撤销」按钮 |

- 与 Message 区别：Notification 支持 title + description，适合带标题的提醒；Message 为单行简短提示。

---

## 3. 配置与销毁

- **notification.config**：全局配置 `placement`、`top`/`bottom`、`duration`、`maxCount` 等。
- **notification.destroy(key)**：关闭指定 key 或全部通知。

---

## 4. 样式与 Token

- 背景、边框、圆角与各类型语义色一致；与 Alert、Message 体系统一。
- 支持 `style`、`className`、`classNames`、`styles` 做细粒度定制。

---

## 5. 其他

- **onClick**：点击整条通知时的回调。
- **showProgress**：是否显示关闭倒计时进度条。
- **pauseOnHover**：悬停时是否暂停倒计时。
