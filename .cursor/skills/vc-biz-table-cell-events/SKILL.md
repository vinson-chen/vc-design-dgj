---
name: vc-biz-table-cell-events
description: VTable 单元格事件阻止规则与拓展性指南。新增或优化单元格类型时，按本 skill 的规则处理 onClick/onMouseDown 事件，确保锚点态、拖拽框选、下拉面板等交互正确协作。
---

# VTable 单元格事件阻止规则与拓展性指南

---

## 一、表格单元格层级结构

```
VTableCell (外层容器，TableGridTextCell 渲染，带 data-hover-lock-cell 属性)
  │
  │  ├─ onMouseDown: 框选拖拽逻辑入口（设置锚点、绑定 drag 事件）
  │  ├─ onClick: 设置锚点态/编辑态（suppressNextClick 后 stopPropagation）
  │
  └─ wrapBodyTextInsetPanel (锚点态时的蓝色边框面板)
      │
      └─ 内容层（TableCellImage / TableCellLink / TableCellRadio 等）
          │
          ├─ wrap div（单元格组件根容器）
          │     ├─ onClick: 【原则：不阻止】，允许冒泡到 TableGridTextCell 设置锚点态
          │     └─ onMouseDown: 【原则：不阻止】，允许进入拖拽逻辑
          │
          ├─ 功能元素（缩略图、链接按钮、选中值显示）
          │     ├─ onClick: 阻止 stopPropagation（触发自身功能：预览、跳转）
          │     └─ onMouseDown: 阻止 stopPropagation（阻止进入拖拽逻辑）
          │
          ├─ 操作按钮（添加、删除、编辑）
          │     ├─ onClick: 阻止 + 手动控制状态（打开下拉面板）
          │     └─ onMouseDown: 可选阻止
          │
          └─ 下拉面板（Dropdown/Popover 弹出层）
                ├─ getPopupContainer: () => document.body（渲染到 body，隔离事件）
                ├─ trigger: []（空数组，完全手动控制，不依赖 Dropdown 自动触发）
                ├─ 面板内容: onClick + onMouseDown + onKeyDown 全部阻止
                ├─ data-keep-table-selection: 空字符串属性（标记：保持表格选区）
```

---

## 二、核心原则

### 1. wrap div 不阻止事件

- **onClick**：不阻止，允许冒泡到 TableGridTextCell.onClick → 设置锚点态
- **onMouseDown**：不阻止，允许冒泡到 TableGridTextCell.onMouseDown → 进入拖拽逻辑

**原因**：点击空白区域需要能进入锚点态，wrap 阻止会导致无法选中单元格。

### 2. 功能元素阻止 onClick + onMouseDown

- 缩略图、链接按钮等需要触发自身功能（预览、跳转）
- 阻止冒泡，不让 TableGridTextCell 的拖拽/锚点逻辑干扰

```tsx
// 示例：缩略图
<div
  className="image-item"
  onClick={(e) => e.stopPropagation()}
  onMouseDown={(e) => e.stopPropagation()}
>
  <Image src={url} preview={{ mask: false }} />
</div>
```

### 3. 操作按钮阻止 onClick + 手动控制

- 添加/删除/编辑按钮需要触发下拉面板或操作
- stopPropagation 阻止冒泡
- 手动调用 `setDropdownOpen(true)` 等状态控制

```tsx
// 示例：添加按钮
<Button
  onClick={(e) => {
    e.stopPropagation();
    setDropdownOpen(true);
  }}
/>
```

### 4. 下拉面板渲染到 body

- 使用 `getPopupContainer={() => document.body}`
- 阻止 Dropdown 自动触发：`trigger={[]}`
- 面板内阻止所有事件 + 添加 `data-keep-table-selection`

```tsx
// 示例：下拉面板
<Dropdown
  open={dropdownOpen}
  onOpenChange={setDropdownOpen}
  trigger={[]}
  getPopupContainer={() => document.body}
  popupRender={() => (
    <div
      data-keep-table-selection=""
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 面板内容 */}
    </div>
  )}
>
  {/* 子元素 */}
</Dropdown>
```

---

## 三、现有单元格类型规则对照

### 文本列（默认）

| 元素 | onClick | onMouseDown | 说明 |
|------|---------|-------------|------|
| wrap | 不阻止 | 不阻止 | TableGridTextCell 处理拖拽和锚点态 |
| textarea（编辑态） | 阻止 | 阻止 | 输入时不触发单元格事件 |

### 图片列（TableCellImage）

| 元素 | onClick | onMouseDown | 说明 |
|------|---------|-------------|------|
| wrap | 不阻止 | 不阻止 | 空白区域点击可进入锚点态 |
| 缩略图 | 阻止 | 阻止 | 触发预览，不进入拖拽 |
| 添加按钮 | 阻止 | - | 手动打开下拉面板 |
| 删除按钮 | 阻止 | - | 删除图片 |
| 下拉菜单面板 | 阻止 | 阻止 | 保持锚点态 |
| 链接输入面板 | 阻止 | 阻止 | 保持锚点态 |

**TableGridTextCell 特殊处理**：
- `onMouseDown`: 检测 `isImageColumnBodyCell` → 直接 return，跳过拖拽逻辑
- `onClick`: 图片列执行 stopPropagation + 设置锚点态

### 链接列（TableCellLink）

| 元素 | onClick | onMouseDown | 说明 |
|------|---------|-------------|------|
| wrap | **阻止** | 不阻止 | TableCellLink 内部处理锚点态（历史实现） |
| 链接按钮 | 阻止 | 阻止 | 触发跳转/编辑，不进入拖拽 |
| 添加按钮 | 阻止 | - | 手动打开下拉面板 |
| 编辑按钮 | 阻止 | - | 打开编辑面板 |
| 删除按钮 | 阻止 | - | 删除链接 |
| 下拉编辑面板 | 阻止 | 阻止 | 保持锚点态 |

**TableGridTextCell 特殊处理**：
- `onMouseDown`: 检测 `.vc-biz-table-link-btn` → return，跳过拖拽
- `onClick`: wrap 已阻止，TableGridTextCell.onClick 不执行

**注意**：TableCellLink 的 wrap 阻止 onClick 是历史实现，新增单元格建议采用 TableCellImage 模式（wrap 不阻止）。

---

## 四、拓展性对比

### 新增单元格场景：单选单元格

需求：点击单元格 → 出现下拉选项面板 + 设置锚点态

#### 方案 A：TableCellLink 模式（wrap 阻止 onClick）

```tsx
<Dropdown trigger={[]} open={panelOpen}>
  <div 
    className="wrap" 
    onClick={(e) => {
      e.stopPropagation();
      setPanelOpen(true);
      editingApi.setSelectedCell({ r, c });  // 手动设置锚点态
    }}
  >
    {value?.label || '请选择'}
  </div>
</Dropdown>
```

**问题**：
- 需要手动调用 `editingApi.setSelectedCell`
- 需要传入 `editingApi` prop
- TableGridTextCell.onMouseDown 可能需要特殊检测

#### 方案 B：TableCellImage 模式（wrap 不阻止 onClick）

```tsx
<Dropdown trigger={[]} open={panelOpen} onOpenChange={setPanelOpen}>
  <div className="wrap">
    {value?.label || '请选择'}
  </div>
</Dropdown>
```

**问题**：
- wrap 不阻止 → TableGridTextCell.onClick 设置锚点态 ✓
- 但如何触发面板打开？

**改进**：利用 `isAnchor` 变化自动打开面板

```tsx
// 单选单元格完整实现
export function TableCellRadio({ isAnchor, value, onChange }) {
  const [panelOpen, setPanelOpen] = useState(false);
  
  // 锚点态变化时自动打开面板
  useEffect(() => {
    if (isAnchor) {
      setPanelOpen(true);
    } else {
      setPanelOpen(false);
    }
  }, [isAnchor]);
  
  return (
    <Dropdown
      open={panelOpen}
      onOpenChange={setPanelOpen}
      trigger={[]}
      getPopupContainer={() => document.body}
      popupRender={renderRadioPanel}
    >
      <div className="wrap">
        {value?.label || '请选择'}
      </div>
    </Dropdown>
  );
}
```

### 拓展性对比表

| 方案 | wrap onClick | 锚点态设置 | 面板打开 | TableGridTextCell 改动 | 拓展性评分 |
|------|-------------|-----------|---------|----------------------|-----------|
| **Link 模式** | 阻止 | 手动调用 editingApi | onClick 内 setPanelOpen | 需要特殊检测 | ⭐⭐ 中等 |
| **Image 模式** | 不阻止 | 冒泡到 TableGridTextCell | isAnchor useEffect | 无需改动 | ⭐⭐⭐ 好 |
| **改进方案（data 属性）** | 不阻止 + data 属性 | 冒泡 + TableGridTextCell 检测属性 | isAnchor useEffect | 检测 data 属性统一处理 | ⭐⭐⭐⭐ 最佳 |

---

## 五、推荐方案：data 属性标记

### 统一处理机制

在需要特殊处理的元素上添加 data 属性，TableGridTextCell 统一检测：

```tsx
// TableGridTextCell onClick 改进
onClick: (e) => {
  const target = e.target as HTMLElement;
  
  // 检测需要打开面板的单元格
  const openPanelCell = target.closest('[data-cell-open-panel]');
  if (openPanelCell) {
    e.stopPropagation();
    ed.setSelectedCell({ r: bodyRowIndex, c: colIndex });
    return;  // 锚点态变化 → 组件内部 useEffect 打开面板
  }
  
  // 检测需要跳过拖拽的功能元素
  const skipDragElement = target.closest('[data-cell-skip-drag]');
  if (skipDragElement) {
    // 不阻止，让元素自身 onClick 执行
    // 但 TableGridTextCell.onMouseDown 已跳过拖拽逻辑
    return;
  }
  
  // 原有逻辑...
}
```

### data 属性清单

| 属性 | 用途 | 示例 |
|------|------|------|
| `data-cell-open-panel` | 点击时需要打开下拉面板 | 单选单元格 wrap |
| `data-cell-skip-drag` | 点击时跳过拖拽逻辑 | 缩略图、链接按钮 |
| `data-keep-table-selection` | 保持表格选区（已有） | 下拉面板内容 |

### 新增单元格步骤（推荐方案）

1. 创建组件，wrap 不阻止 onClick
2. 使用 `isAnchor` useEffect 自动打开面板
3. wrap 添加 `data-cell-open-panel` 属性
4. 功能元素添加 `data-cell-skip-drag` 属性
5. TableGridTextCell 无需按列类型分支，只需检测 data 属性

---

## 六、关键文件

| 文件 | 职责 |
|------|------|
| `packages/vc-biz/src/table/TableGridTextCell.tsx` | 单元格渲染、onMouseDown/onClick 事件入口 |
| `packages/vc-biz/src/table/TableCellImage.tsx` | 图片列实现参考 |
| `packages/vc-biz/src/table/TableCellLink.tsx` | 链接列实现参考（历史模式） |
| `packages/vc-biz/src/table/tableGridTypes.ts` | 列类型定义 `TableColumnFieldKind` |
| `packages/vc-biz/src/table/tableBodyImageCell.css` | 图片列样式（含下拉面板） |
| `packages/vc-biz/src/table/tableBodyLinkCell.css` | 链接列样式（含下拉面板） |