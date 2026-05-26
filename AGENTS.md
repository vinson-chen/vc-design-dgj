# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Monorepo Structure

```
vc-design/               # Root package - design system (Ant Design 5 + VC tokens)
├── packages/
│   └── vc-biz/          # Business UI components (depends on vc-design + antd)
├── demo/                # Vite demo app
├── docs/                # Component specs (*.md per component)
└── src/                 # vc-design source (tokens, theme, icons, Pagination)
```

## Build & Test Commands

```bash
# Build
npm run build                  # Root vc-design package
npm run build:vc-biz           # vc-biz package

# Run demo (builds all packages first)
npm run demo                   # Starts demo at localhost:5173+

# Tests (vitest)
npm run test                   # All packages
npm run test -w vc-biz         # vc-biz only
vitest run --filter "layout"   # Run specific test file pattern

# Demo development (from demo directory)
cd demo && npm run dev
```

## Design Token System

All design values must reference `vcTokens` from `src/theme/vcTokens.ts`, not hardcoded values.

```tsx
import { vcTokens } from 'vc-design';
// Usage: vcTokens.color.primary.default, vcTokens.size.padding.md
```

Key token paths:
- Colors: `color.primary.*`, `color.neutral.*`, `color.success/warning/error/info.*`, `color.menu.*` (sidebar)
- Sizes: `size.padding.*`, `size.controlHeight.*`
- Styles: `style.borderRadius.*`, `style.font.*`, `style.boxShadowSecondary`

When implementing from Figma: use `resolveColorTokenByValue(value, role)` from `src/theme/resolveTokenByValue.ts` to find existing tokens by color value before creating new ones. MCP returns resolved color values, not variable names.

## Icon Usage

**Only use `VcIcon`**. Do not import `@ant-design/icons`.

```tsx
import { VcIcon } from 'vc-design';
<VcIcon type="search" />           // Default: no `-filled` suffix
<VcIcon type="user-filled" />      // Filled variant when needed
```

Icon type names align with Figma icon component names. See `demo/src/demos/iconTypes.ts` for available icons.

## Component Architecture

### vc-design (Root Package)
Re-exports Ant Design 5 components + adds:
- `VcConfigProvider` - wraps app to apply VC theme
- `Pagination` - custom pagination component
- `vcTokens` - design tokens
- `VcIcon` - icon component

### vc-biz (Business Components)
Key exports from `packages/vc-biz/src/index.ts`:
- Operation: `VOperationBar`, `VTopBar`, `VTopOperationBar`, `VTableOperationBar`, `VBatchOperationBar`, `VOverflowActions`
- Filter/Search: `VFilterGroup`, `VFilterArea`
- Navigation: `DispatchSiderMenu`, `VMenu`, `VMenuGroup`, `VMenuItem`
- Switch tabs: `SwitchTabs`, `TypeTabs`, `StateTabs`, `CustomTabs` (+ `useCustomTabsState`)
- Table: `VTable`, `VTableCell`, `TableFieldConfigPanel`, `DropdownMenuSidePanelCombo`
- Input: `VcellInput`
- Chat: `Vtell`, `VtellMessageList`, `VtellMessageBubble`, `VtellCompletionMenu`
- Utilities: `useTableBodyScrollMaxHeight`, `iconTypes`

### VTable Headless Layer (`packages/vc-biz/src/table/headless/`)
Pure functions for grid operations (no React/DOM). Contains:
- Cell addressing (`cellKey.ts`)
- Range operations (`range.ts`)
- Geometry calculations (`geometry.ts`)
- TSV clipboard (`tsv.ts`)

**When adding grid logic**: Implement in headless first with Vitest tests, then integrate via reducer/UI hooks. See `packages/vc-biz/src/table/ARCHITECTURE.md`.

Key implementation constraints:
- `tableGridEditingUiReducer.ts`: UI state transitions via actions (avoid stacking setState in hooks)
- `useTableGridEditing.ts`: Keyboard/clipboard/focus glue—limit to ~50 lines of untested logic per PR
- Scroll: Use `TableRows` internal `scrollport` only; `tableOuterScrollRef` is deprecated

## Demo Development

Demo route keys are defined in `demo/src/navConfig.tsx`. Each key maps to a demo component in `demo/src/demos/index.tsx`.

To add a new demo:
1. Create `demo/src/demos/XxxDemo.tsx`
2. Import in `demo/src/demos/index.tsx`
3. Add `if (selectedKey === 'key') return <XxxDemo />` branch

## Cursor Skills (Important Patterns)

Three skills in `.cursor/skills/` define key workflows:

### vc-add-component (New Components)
- Spec doc: `docs/{component}-spec.md` with token references
- Demo: `demo/src/demos/{Component}Demo.tsx`
- Use `vcTokens` and `VcIcon` exclusively
- See skill for full flow

### vc-biz-component-figma (Figma Implementation)
- Use TalkToFigma MCP to get node info (geometry + resolved styles, NOT variable names)
- For colors: call `resolveColorTokenByValue(value, role)` before inventing new token names
- Structure components to match Figma layer hierarchy
- Single demo entry per feature, not multi-step walkthroughs

### vc-biz-switch-tabs (Switch Tabs Pattern)
- Custom container (not AntD Tabs) to avoid CSS override conflicts
- CSS variables injected at root node (`--switch-tabs-*`) using `vcTokens`
- Width overflow handled by collapsing items into "more" dropdown
- Active item in "more" makes the "more" button show active state

## Key Files to Reference

- Tokens: `src/theme/vcTokens.ts`
- Theme mapping: `src/theme/buildAntdTheme.ts`
- Main exports: `src/index.ts`, `packages/vc-biz/src/index.ts`
- VTable architecture: `packages/vc-biz/src/table/ARCHITECTURE.md`
- Icon types: `demo/src/demos/iconTypes.ts`