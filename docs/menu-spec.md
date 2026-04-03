# Menu 导航菜单 组件规范（vc-design）

基于 Ant Design 5 的 Menu，为页面和功能提供导航的菜单列表。支持顶部导航、侧边导航与内嵌模式。

---

## 1. 何时使用

- 顶部导航：提供全局类目与功能。
- 侧边导航：多级结构收纳与排列，可与 Layout.Sider 配合。
- 内嵌菜单：侧栏内联展开子菜单。

---

## 2. Menu API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **items** | 菜单项配置 | ItemType[] | - |
| **mode** | 菜单类型 | `vertical` \| `horizontal` \| `inline` | `vertical` |
| **theme** | 主题 | `light` \| `dark` | `light` |
| **selectedKeys** | 当前选中项（受控） | string[] | - |
| **defaultSelectedKeys** | 默认选中项 | string[] | - |
| **openKeys** | 当前展开子菜单（受控） | string[] | - |
| **defaultOpenKeys** | 默认展开子菜单 | string[] | - |
| **inlineCollapsed** | inline 时是否收起 | boolean | - |
| **inlineIndent** | inline 缩进宽度 | number | 24 |
| **triggerSubMenuAction** | 子菜单展开触发 | `hover` \| `click` | `hover` |
| **selectable** | 是否允许选中 | boolean | true |
| **multiple** | 是否多选 | boolean | false |
| **onClick** | 点击菜单项 | ({ item, key, keyPath, domEvent }) => void | - |
| **onSelect** | 选中时 | ({ item, key, keyPath, selectedKeys, domEvent }) => void | - |
| **onOpenChange** | 子菜单展开/关闭 | (openKeys: string[]) => void | - |
| **expandIcon** | 自定义展开图标 | ReactNode \| (props) => ReactNode | - |

---

## 3. ItemType

- **菜单项**：key、label、icon、disabled、danger、title（收起时悬浮标题）、extra。
- **子菜单**：key、label、icon、children（ItemType[]）、disabled、theme、popupClassName、popupOffset、onTitleClick。
- **分组**：`type: 'group'`、label、children。
- **分割线**：`type: 'divider'`、dashed。

---

## 4. 使用方式

```ts
import { Menu } from 'vc-design';

<Menu
  mode="inline"
  items={[
    { key: '1', label: '选项 1', icon: <VcIcon type="home" /> },
    { key: '2', label: '选项 2', children: [{ key: '2-1', label: '子项' }] },
  ]}
/>
```

---

## 5. Token

组件 Token 众多（itemBg、itemColor、itemSelectedBg、darkItemBg 等），可由 theme.components.Menu 覆盖，与 vc-design 规范一致。
