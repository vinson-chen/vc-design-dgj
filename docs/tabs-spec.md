# Tabs 标签页 组件规范（vc-design）

基于 Ant Design 5 的 Tabs，选项卡切换组件。用于平级收纳与展示大块内容，保持界面整洁。

---

## 1. 何时使用

- 平级区域收纳与展现内容。
- 卡片式页签：可关闭，常用于容器顶部。
- 通用线型页签：可用于容器顶部或内部。
- 更次级可用 Radio.Button 等。

---

## 2. Tabs API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **items** | 选项卡配置 | TabItemType[] | [] |
| **activeKey** | 当前激活面板 key（受控） | string | - |
| **defaultActiveKey** | 默认激活面板 key | string | 第一项 key |
| **type** | 样式类型 | `line` \| `card` \| `editable-card` | `line` |
| **size** | 尺寸 | `large` \| `middle` \| `small` | `middle` |
| **tabPosition** | 页签位置 | `top` \| `right` \| `bottom` \| `left` | `top` |
| **centered** | 标签是否居中 | boolean | false |
| **tabBarExtraContent** | 标签栏额外内容 | ReactNode \| { left?, right? } | - |
| **tabBarGutter** | 标签间距 | number | - |
| **destroyOnHidden** | 隐藏时是否销毁 DOM | boolean | false |
| **onChange** | 切换回调 | (activeKey: string) => void | - |
| **onTabClick** | 标签点击 | (key, event) => void | - |
| **onEdit** | 新增/删除（editable-card） | (targetKey, action) => void | - |
| **indicator** | 指示条大小与对齐 | { size?, align } | - |
| **addIcon** / **removeIcon** | 可编辑卡片时的图标 | ReactNode | - |

---

## 3. TabItemType（items 项）

| 参数 | 说明 | 类型 |
|------|------|------|
| **key** | 对应 activeKey | string |
| **label** | 标签头文字 | ReactNode |
| **icon** | 标签头图标 | ReactNode |
| **children** | 面板内容 | ReactNode |
| **disabled** | 是否禁用 | boolean |
| **destroyOnHidden** | 隐藏时是否销毁 | boolean |
| **forceRender** | 隐藏时是否仍渲染 | boolean |
| **closable** | 是否显示关闭按钮（editable-card） | boolean |

---

## 4. Token

组件 Token：inkBarColor、itemColor、itemSelectedColor、cardBg、cardHeight 等，可由 theme.components.Tabs 覆盖，与 vc-design 品牌色一致。
