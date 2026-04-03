# Dropdown 下拉菜单 组件规范（vc-design）

基于 Ant Design 5 的 Dropdown，向下弹出的列表，用于收纳一组操作命令。与 Select 区别：Select 用于选择，Dropdown 用于命令集合。

---

## 1. 何时使用

- 页面操作命令过多时，用下拉收纳。
- 点击或移入触点出现下拉菜单，在列表中选择并执行命令。

---

## 2. Dropdown API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **menu** | 菜单配置（items、onClick、selectable 等） | MenuProps | - |
| **trigger** | 触发方式 | Array&lt;`click` \| `hover` \| `contextMenu`&gt; | [`hover`] |
| **placement** | 弹出位置 | bottomLeft \| bottom \| bottomRight \| topLeft \| top \| topRight | bottomLeft |
| **arrow** | 是否显示箭头；可传 `{ pointAtCenter: true }` | boolean \| object | false |
| **open** | 是否显示（受控） | boolean | - |
| **onOpenChange** | 显示状态变化回调 (open, info) => void | function | - |
| **disabled** | 是否禁用 | boolean | - |
| **getPopupContainer** | 菜单挂载的父节点 | (triggerNode) => HTMLElement | () => document.body |
| **popupRender** | 自定义弹出内容 (menus) => ReactNode | function | - |
| **destroyOnHidden** | 关闭后是否销毁 | boolean | false |
| **overlayClassName** / **overlayStyle** | 下拉根节点样式 | string / CSSProperties | - |

---

## 3. Dropdown.Button

左侧主按钮 + 右侧下拉，继承 Dropdown 属性，并支持：

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **type** | 按钮类型 | primary \| default \| dashed \| link \| text | default |
| **size** | 按钮尺寸 | large \| middle \| small | middle |
| **danger** | 危险按钮 | boolean | - |
| **loading** | 加载状态 | boolean \| { delay, icon } | false |
| **icon** | 右侧图标 | ReactNode | - |
| **onClick** | 左侧按钮点击 | (e) => void | - |
| **buttonsRender** | 自定义左右按钮 | (buttons) => ReactNode[] | - |

---

## 4. Menu 配置（menu）

使用 Menu 的 items 格式：`{ key, label, icon, disabled, danger, children }` 等。onClick(item, key, keyPath) 处理点击。

---

## 5. Token

组件 Token：paddingBlock、zIndexPopup 等，可由 theme.components.Dropdown 覆盖。
