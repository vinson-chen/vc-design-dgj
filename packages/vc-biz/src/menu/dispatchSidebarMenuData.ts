import type { BizMenuGroupItem } from './BizMenuGroup';

export interface DispatchSidebarMenuGroup {
  key: string;
  title: string;
  groupIconName: string;
  defaultOpen?: boolean;
  items: BizMenuGroupItem[];
}

/** 与《导航项.xlsx》列结构一致：组名 + 组图标 + 列内自上而下菜单项（BizMenu / DispatchSiderMenu 共用） */
export const DISPATCH_SIDEBAR_MENU_GROUPS: DispatchSidebarMenuGroup[] = [
  {
    key: 'common',
    title: '常用',
    groupIconName: 'folder',
    defaultOpen: true,
    items: [
      { key: 'home', label: '首页', iconName: 'home' },
      { key: 'export-task', label: '导出任务', iconName: 'upload' },
    ],
  },
  {
    key: 'auth',
    title: '授权管理',
    groupIconName: 'fork',
    items: [
      { key: 'shop-mgmt', label: '店铺管理', iconName: 'shop' },
      { key: 'factory-mgmt', label: '厂家管理', iconName: 'service' },
      { key: 'merchant-mgmt', label: '商家管理', iconName: 'user-list' },
    ],
  },
  {
    key: 'goods',
    title: '商品管理',
    groupIconName: 'control-platform',
    defaultOpen: true,
    items: [
      { key: 'self-goods', label: '自营商品', iconName: 'catalog' },
      { key: 'dropship-goods', label: '代发商品', iconName: 'cart' },
      { key: 'base-goods', label: '基础商品', iconName: 'tag' },
      { key: 'stock-goods', label: '库存货品', iconName: 'store' },
      { key: 'supply-center', label: '货源中心', iconName: 'browse' },
    ],
  },
  {
    key: 'orders',
    title: '订单管理',
    groupIconName: 'form',
    items: [
      { key: 'all-orders', label: '所有订单', iconName: 'form' },
      { key: 'print-ship', label: '打单发货', iconName: 'print' },
      { key: 'offline-order', label: '线下单', iconName: 'file-1' },
      { key: 'stock-up-order', label: '备货单', iconName: 'task' },
      { key: 'print-log', label: '打印记录', iconName: 'history' },
      { key: 'ship-log', label: '发货记录', iconName: 'send' },
      { key: 'after-sale-order', label: '售后单', iconName: 'rollback' },
      { key: 'logistics-alert', label: '物流预警', iconName: 'error-triangle' },
    ],
  },
  {
    key: 'finance',
    title: '财务结算',
    groupIconName: 'chart',
    items: [
      { key: 'payout-mgmt', label: '出账管理', iconName: 'bill' },
      { key: 'reconcile-center', label: '对账中心', iconName: 'chart' },
      { key: 'voucher-query', label: '底单查询', iconName: 'search' },
      { key: 'shipped-detail', label: '已发货明细', iconName: 'view-list' },
      { key: 'express-reconcile', label: '快递对账', iconName: 'wallet' },
    ],
  },
  {
    key: 'setting',
    title: '系统设置',
    groupIconName: 'adjustment',
    items: [
      { key: 'distribution-setting', label: '分销设置', iconName: 'share' },
      { key: 'inventory-setting', label: '库存设置', iconName: 'setting' },
      { key: 'print-setting', label: '打单设置', iconName: 'print' },
      { key: 'freight-setting', label: '运费设置', iconName: 'map' },
      { key: 'account-setting', label: '账号设置', iconName: 'user-setting' },
    ],
  },
];
