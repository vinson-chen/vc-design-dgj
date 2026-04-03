# vc-biz

基于 **vc-design** 与 **Ant Design 5** 的业务 UI 组件包（多项目复用）。

## 状态

业务组件源码位于本包 `src/`；迁移与后续计划见仓库根目录 `docs/plan-biz-components-implementation.md`。

## Peer 依赖

- `react` >= 18
- `react-dom` >= 18
- `antd` >= 5 &lt; 6
- `vc-design` >= 1.0.0

## 样式

在应用入口（如 Vite `main.tsx`）在 `vc-design` 样式之后引入：

```ts
import 'vc-design/dist/index.css';
import 'vc-biz/style.css';
```

## 本地构建（在 monorepo 根目录）

```bash
npm install
npm run build:vc-biz
```

或在子包目录：

```bash
cd packages/vc-biz && npm run build
```

`prebuild` 会根据 `assets/store_logo` 生成 `src/generated/storeLogoUrls.ts`（切换区店铺图标）；该文件可纳入版本控制或在 CI 中依赖 `prebuild` 重新生成。

---

## 安装与使用（开发态）

### 1) 引入样式

在应用入口（如 Vite `main.tsx`）在 `vc-design` 样式之后引入：

```ts
import 'vc-design/dist/index.css';
import 'vc-biz/style.css';
```

### 2) 最小示例：SwitchArea（带图标）

```tsx
import React, { useState } from 'react';
import { SwitchTabs, type SwitchTabItemData } from 'vc-biz';

const storeItems: SwitchTabItemData[] = [
  { key: '精选平台', label: '精选平台', icon: 'otherstore.jpg' },
  { key: '抖音', label: '抖音', icon: 'douyin.jpg' },
];

export function SwitchAreaMini() {
  const [activeKey, setActiveKey] = useState('精选平台');
  return (
    <SwitchTabs
      items={storeItems}
      activeKey={activeKey}
      onChange={setActiveKey}
      showIcon
      showPanel={false}
    />
  );
}
```

---

## Figma 映射表（v0）

见：`docs/figma-biz-components-mapping-v0.md`
