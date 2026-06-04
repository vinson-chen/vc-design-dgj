/**
 * VC 业务组件（多项目复用），基于 vc-design 与 Ant Design 5。
 */

export { VC_BIZ_VERSION } from './version';

/** VOperationBar 操作区组件 */
export { default as VOperationBar } from './VOperationBar';
export type { VOperationBarProps } from './VOperationBar';
/** @deprecated Use VOperationBar instead */
export { default as OperationBar } from './VOperationBar';
/** @deprecated Use VOperationBarProps instead */
export type { OperationBarProps } from './VOperationBar';

export { default as VTopBar } from './operation/VTopBar';
export type { VTopBarProps } from './operation/VTopBar';
/** @deprecated Use VTopBar instead */
export { default as TopBar } from './operation/VTopBar';
/** @deprecated Use VTopBarProps instead */
export type { TopBarProps } from './operation/VTopBar';

export { default as VTopOperationBar } from './operation/VTopOperationBar';
export type { VTopOperationBarProps } from './operation/VTopOperationBar';
/** @deprecated Use VTopOperationBar instead */
export { default as TopOperationBar } from './operation/VTopOperationBar';
/** @deprecated Use VTopOperationBarProps instead */
export type { TopOperationBarProps } from './operation/VTopOperationBar';

export { default as VTableOperationBar } from './operation/VTableOperationBar';
export type { VTableOperationBarProps } from './operation/VTableOperationBar';
/** @deprecated Use VTableOperationBar instead */
export { default as TableOperationBar } from './operation/VTableOperationBar';
/** @deprecated Use VTableOperationBarProps instead */
export type { TableOperationBarProps } from './operation/VTableOperationBar';

export { default as VBatchOperationBar } from './operation/VBatchOperationBar';
export type { VBatchOperationBarProps } from './operation/VBatchOperationBar';
/** @deprecated Use VBatchOperationBar instead */
export { default as BatchOperationBar } from './operation/VBatchOperationBar';
/** @deprecated Use VBatchOperationBarProps instead */
export type { BatchOperationBarProps } from './operation/VBatchOperationBar';

export { default as VFilterGroup } from './VFilterGroup';
export type { VFilterFieldConfig, VFilterFieldType, VFilterGroupProps } from './VFilterGroup';
/** @deprecated Use VFilterGroup instead */
export { default as FilterGroup } from './VFilterGroup';
/** @deprecated Use VFilterFieldConfig, VFilterFieldType, VFilterGroupProps instead */
export type { FilterFieldConfig, FilterFieldType, FilterGroupProps } from './VFilterGroup';

export { default as VFilterArea } from './VFilterArea';
export type { VFilterAreaProps } from './VFilterArea';
/** @deprecated Use VFilterArea instead */
export { default as FilterArea } from './VFilterArea';
/** @deprecated Use VFilterAreaProps instead */
export type { FilterAreaProps } from './VFilterArea';

export { default as VOverflowActions } from './operation/VOverflowActions';
export type { VOverflowActionItem, VOverflowActionsProps } from './operation/VOverflowActions';
/** @deprecated Use VOverflowActions instead */
export { default as OverflowActions } from './operation/VOverflowActions';
/** @deprecated Use VOverflowActionItem, VOverflowActionsProps instead */
export type { OverflowActionItem, OverflowActionsProps } from './operation/VOverflowActions';

export { default as VSwitchTabs } from './switch-tabs/VSwitchTabs';
export type { VSwitchTabItemData, VSwitchTabsProps } from './switch-tabs/VSwitchTabs';
/** @deprecated Use VSwitchTabs instead */
export { default as SwitchTabs } from './switch-tabs/VSwitchTabs';
/** @deprecated Use VSwitchTabItemData, VSwitchTabsProps instead */
export type { SwitchTabItemData, SwitchTabsProps } from './switch-tabs/VSwitchTabs';

export { default as VTypeTabs } from './switch-tabs/VTypeTabs';
export type { VTypeTabsProps } from './switch-tabs/VTypeTabs';
/** @deprecated Use VTypeTabs instead */
export { default as TypeTabs } from './switch-tabs/VTypeTabs';
/** @deprecated Use VTypeTabsProps instead */
export type { TypeTabsProps } from './switch-tabs/VTypeTabs';

export { default as VStateTabs } from './switch-tabs/VStateTabs';
export type { VStateTabsProps } from './switch-tabs/VStateTabs';
/** @deprecated Use VStateTabs instead */
export { default as StateTabs } from './switch-tabs/VStateTabs';
/** @deprecated Use VStateTabsProps instead */
export type { StateTabsProps } from './switch-tabs/VStateTabs';

export { default as VCustomTabs, useVCustomTabsState } from './switch-tabs/VCustomTabs';
export type {
  VCustomTabItem,
  VCustomTabKind,
  VCustomTabsActiveTabFieldConfig,
  VCustomTabsProps,
} from './switch-tabs/VCustomTabs';
/** @deprecated Use VCustomTabs, useVCustomTabsState instead */
export { default as CustomTabs, useCustomTabsState } from './switch-tabs/VCustomTabs';
/** @deprecated Use VCustomTabItem, VCustomTabKind, VCustomTabsActiveTabFieldConfig, VCustomTabsProps instead */
export type {
  CustomTabItem,
  CustomTabKind,
  CustomTabsActiveTabFieldConfig,
  CustomTabsProps,
} from './switch-tabs/VCustomTabs';

export { TableFieldConfigPanel } from './table/TableFieldConfigPanel';
export type { TableFieldConfigPanelProps } from './table/TableFieldConfigPanel';

export { TableCellLink } from './table/TableCellLink';
export type { TableCellLinkProps } from './table/TableCellLink';
export type { CellLinkData } from './table/tableGridTypes';

export { DropdownMenuSidePanelCombo } from './table/DropdownMenuSidePanelCombo';
export type {
  DropdownMenuSidePanelComboProps,
  DropdownMenuSidePanelOpenChangeInfo,
  DropdownMenuSidePanelPlacement,
  RcTriggerAlignInfo,
} from './table/DropdownMenuSidePanelCombo';

/** VMenu 导航区组件 */
export { default as VMenu } from './menu/VMenu';
/** @deprecated Use VMenu instead */
export { default as BizMenu } from './menu/VMenu';

export { default as VMenuGroup } from './menu/VMenuGroup';
export type { VMenuGroupItem, VMenuGroupProps } from './menu/VMenuGroup';
/** @deprecated Use VMenuGroup instead */
export { default as BizMenuGroup } from './menu/VMenuGroup';
/** @deprecated Use VMenuGroupItem instead */
export type { BizMenuGroupItem, BizMenuGroupProps } from './menu/VMenuGroup';

export { default as VMenuItem } from './menu/VMenuItem';
export type { VMenuItemAlign, VMenuItemProps, VMenuItemState } from './menu/VMenuItem';
/** @deprecated Use VMenuItem instead */
export { default as BizMenuItem } from './menu/VMenuItem';
/** @deprecated Use VMenuItemAlign, VMenuItemProps, VMenuItemState instead */
export type { BizMenuItemAlign, BizMenuItemProps, BizMenuItemState } from './menu/VMenuItem';

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

/** VTable 表格区组件 */
export { default as VTable } from './VTable';
export type { VTableProps } from './VTable';
/** @deprecated Use VTable instead */
export { default as BizTable } from './VTable';
/** @deprecated Use VTableProps instead */
export type { BizTableProps } from './VTable';

export { V_TABLE_EDIT_KEYBOARD_HINT_LINES } from './table/tableEditKeyboardHelp';
/** @deprecated Use V_TABLE_EDIT_KEYBOARD_HINT_LINES instead */
export { BIZ_TABLE_EDIT_KEYBOARD_HINT_LINES } from './table/tableEditKeyboardHelp';
export {
  useTableBodyScrollMaxHeight,
  type UseTableBodyScrollMaxHeightOptions,
} from './table/useTableBodyScrollMaxHeight';

export { default as VInput, V_INPUT_LLM_DROPDOWN_CLASS } from './vcell-input/VInput';
export type {
  VInputAttachedFile,
  VInputLlmOption,
  VInputProps,
  VInputCommandTag,
} from './vcell-input/VInput';
/** @deprecated Use VInput instead */
export { default as VcellInput } from './vcell-input/VInput';
/** @deprecated Use V_INPUT_LLM_DROPDOWN_CLASS instead */
export { VCELL_INPUT_LLM_DROPDOWN_CLASS } from './vcell-input/VInput';
/** @deprecated Use VInputAttachedFile, VInputLlmOption, VInputProps instead */
export type {
  VcellInputAttachedFile,
  VcellInputLlmOption,
  VcellInputProps,
} from './vcell-input/VInput';

export { VTableCell, BizTableCell } from './table/VTableCell';
export type { VTableCellProps, VTableCellVariant, BizTableCellProps, BizTableCellVariant } from './table/VTableCell';

/** 表格单元格拆分组件（可独立使用） */
export { TableCellEditing, getBodyEditTextareaStyle } from './table/TableCellEditing';
export type { TableCellEditingProps } from './table/TableCellEditing';
export { TableCellImage } from './table/TableCellImage';
export type { TableCellImageProps } from './table/TableCellImage';
export { TableHeaderCell, getColLetterIndex } from './table/TableHeaderCell';
export type { TableHeaderCellProps } from './table/TableHeaderCell';

/** 与 Icon Demo 对齐；图标集变更时请同步 demo 与 vc-design 资源 */
export { iconTypes } from './internal/vcIconTypeNames';

/** 店铺 Logo 图片映射（用于演示图片列） */
export { storeLogoUrlByKey } from './generated/storeLogoUrls';

/** VTell 对话区组件 */
export {
  VTell,
  uid,
  VTellMessageList,
  getLastUserMessageId,
  VTellMessageBubble,
  VTellCompletionMenu,
  type VTellProps,
  type VTellMessage,
  type VTellMessageRole,
  type VTellAttachedFile,
  type VTellLlmOption,
  type VTellMessageBubbleProps,
  type VTellMessageListProps,
  type VTellCompletionMenuProps,
} from './vtell';
/** @deprecated Use VTell series instead */
export {
  VTell as Vtell,
  VTellMessageList as VtellMessageList,
  VTellMessageBubble as VtellMessageBubble,
  VTellCompletionMenu as VtellCompletionMenu,
} from './vtell';
/** @deprecated Use VTell series types instead */
export type {
  VTellProps as VtellProps,
  VTellMessage as VtellMessage,
  VTellMessageRole as VtellMessageRole,
  VTellAttachedFile as VtellAttachedFile,
  VTellLlmOption as VtellLlmOption,
  VTellMessageBubbleProps as VtellMessageBubbleProps,
  VTellMessageListProps as VtellMessageListProps,
  VTellCompletionMenuProps as VtellCompletionMenuProps,
} from './vtell';
