# Breadcrumb 面包屑 组件规范（vc-design）

基于 Ant Design 5 的 Breadcrumb，用于显示当前页面在系统层级结构中的位置，并支持向上返回。适用于超过两级以上的层级、需告知用户「你在哪里」或需向上导航的场景。

---

## 1. 何时使用

- 系统拥有超过两级以上的层级结构时。
- 需告知用户当前所在位置时。
- 需提供向上导航时。

---

## 2. Breadcrumb API

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| **items** | 数据化配置（推荐，≥5.3.0） | ItemType[] | - |
| **separator** | 分隔符 | ReactNode | `/` |
| **itemRender** | 自定义渲染函数，可与 react-router 配合 | (route, params, routes, paths) => ReactNode | - |
| **params** | 路由参数 | object | - |

---

## 3. ItemType（items 项）

| 参数 | 说明 | 类型 |
|------|------|------|
| **title** | 名称 | ReactNode |
| **href** | 链接地址（与 path 二选一） | string |
| **path** | 拼接路径，会与前一层 path 拼接（与 href 二选一） | string |
| **menu** | 下拉菜单配置（MenuProps），该项显示为下拉 | MenuProps |
| **dropdownProps** | 下拉框配置 | Dropdown props |
| **onClick** | 点击回调 | (e: MouseEvent) => void |
| **className** | 自定义类名 | string |

分隔符项：`{ type: 'separator', separator: ReactNode }`，用于自定义单独分隔符。

---

## 4. 使用方式

```ts
import { Breadcrumb } from 'vc-design';

<Breadcrumb
  items={[
    { title: '首页', href: '/' },
    { title: '列表', href: '/list' },
    { title: '详情' },
  ]}
/>
```

---

## 5. Token

组件 Token：itemColor、lastItemColor、linkColor、linkHoverColor、separatorColor、separatorMargin、iconFontSize 等，可由 theme.components.Breadcrumb 覆盖，与 vc-design 中性色一致。
