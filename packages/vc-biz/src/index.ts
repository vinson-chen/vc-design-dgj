/**
 * VC 业务组件（多项目复用），基于 vc-design 与 Ant Design 5。
 */

export { VC_BIZ_VERSION } from './version';

export { default as OperationBar } from './OperationBar';
export type { OperationBarProps } from './OperationBar';

export { default as TopBar } from './operation/TopBar';
export type { TopBarProps } from './operation/TopBar';

export { default as TopOperationBar } from './operation/TopOperationBar';
export type { TopOperationBarProps } from './operation/TopOperationBar';

export { default as TableOperationBar } from './operation/TableOperationBar';
export type { TableOperationBarProps } from './operation/TableOperationBar';

export { default as BatchOperationBar } from './operation/BatchOperationBar';
export type { BatchOperationBarProps } from './operation/BatchOperationBar';

export { default as FilterGroup } from './FilterGroup';
export type { FilterFieldConfig, FilterFieldType, FilterGroupProps } from './FilterGroup';

export { default as FilterArea } from './FilterArea';
export type { FilterAreaProps } from './FilterArea';

export { default as OverflowActions } from './operation/OverflowActions';
export type { OverflowActionItem, OverflowActionsProps } from './operation/OverflowActions';

export { default as SwitchTabs } from './switch-tabs/SwitchTabs';
export type { SwitchTabItemData, SwitchTabsProps } from './switch-tabs/SwitchTabs';

export { default as StoreTabs } from './switch-tabs/StoreTabs';
export type { StoreTabsProps } from './switch-tabs/StoreTabs';

export { default as StateTabs } from './switch-tabs/StateTabs';
export type { StateTabsProps } from './switch-tabs/StateTabs';

export { default as BizMenu } from './menu/BizMenu';
export { default as BizMenuGroup } from './menu/BizMenuGroup';
export { default as BizMenuItem } from './menu/BizMenuItem';
export type { BizMenuGroupItem, BizMenuGroupProps } from './menu/BizMenuGroup';
export type { BizMenuItemAlign, BizMenuItemProps, BizMenuItemState } from './menu/BizMenuItem';

export {
  DISPATCH_SIDEBAR_MENU_GROUPS,
  type DispatchSidebarMenuGroup,
} from './menu/dispatchSidebarMenuData';

export { default as DispatchSiderMenu } from './DispatchSiderMenu';

export {
  useTableAreaDemoState,
  TableAreaConfigPanel,
  TableAreaTableInstance,
  type TableAreaDemoModel,
  type TableAreaDemoOptions,
} from './TableArea';

export { default as BizTable } from './BizTable';
export type { BizTableProps } from './BizTable';

export { BIZ_TABLE_EDIT_KEYBOARD_HINT_LINES } from './table/tableEditKeyboardHelp';
export {
  useTableBodyScrollMaxHeight,
  type UseTableBodyScrollMaxHeightOptions,
} from './table/useTableBodyScrollMaxHeight';

export { default as VcellTable, VCELL_ROW_DRAG_COLUMN_ID } from './vcell-table/VcellTable';
export type { VcellTableProps } from './vcell-table/VcellTable';
export type {
  ColumnDef,
  VcellCellAddress,
  VcellColumnMeta,
  VcellTableHandle,
  VcellTableStateSnapshot,
} from './vcell-table/vcellTableTypes';

export { BizTableCell } from './table/BizTableCell';
export type { BizTableCellProps, BizTableCellVariant } from './table/BizTableCell';

/** 与 Icon Demo 对齐；图标集变更时请同步 demo 与 vc-design 资源 */
export { iconTypes } from './internal/vcIconTypeNames';
