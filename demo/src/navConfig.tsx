/**
 * 左侧导航配置，结构与 Ant Design 5 组件总览一致
 * https://5x.ant.design/components/overview-cn
 */
export interface NavItem {
  key: string;
  label: string;
}

export interface NavGroup {
  category: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    category: '',
    items: [{ key: 'overview', label: '组件总览' }],
  },
  {
    category: '通用',
    items: [
      { key: 'button', label: 'Button 按钮' },
      { key: 'float-button', label: 'FloatButton 悬浮按钮' },
      { key: 'icon', label: 'Icon 图标' },
      { key: 'typography', label: 'Typography 排版' },
    ],
  },
  {
    category: '布局',
    items: [
      { key: 'divider', label: 'Divider 分割线' },
      { key: 'flex', label: 'Flex 弹性布局' },
      { key: 'grid', label: 'Grid 栅格' },
      { key: 'layout', label: 'Layout 布局' },
      { key: 'space', label: 'Space 间距' },
      { key: 'splitter', label: 'Splitter 分隔面板' },
    ],
  },
  {
    category: '导航',
    items: [
      { key: 'anchor', label: 'Anchor 锚点' },
      { key: 'breadcrumb', label: 'Breadcrumb 面包屑' },
      { key: 'dropdown', label: 'Dropdown 下拉菜单' },
      { key: 'menu', label: 'Menu 导航菜单' },
      { key: 'pagination', label: 'Pagination 分页' },
      { key: 'steps', label: 'Steps 步骤条' },
      { key: 'tabs', label: 'Tabs 标签页' },
    ],
  },
  {
    category: '数据录入',
    items: [
      { key: 'auto-complete', label: 'AutoComplete 自动完成' },
      { key: 'cascader', label: 'Cascader 级联选择' },
      { key: 'checkbox', label: 'Checkbox 多选框' },
      { key: 'color-picker', label: 'ColorPicker 颜色选择器' },
      { key: 'date-picker', label: 'DatePicker 日期选择框' },
      { key: 'form', label: 'Form 表单' },
      { key: 'input', label: 'Input 输入框' },
      { key: 'input-number', label: 'InputNumber 数字输入框' },
      { key: 'mentions', label: 'Mentions 提及' },
      { key: 'radio', label: 'Radio 单选框' },
      { key: 'rate', label: 'Rate 评分' },
      { key: 'select', label: 'Select 选择器' },
      { key: 'slider', label: 'Slider 滑动输入条' },
      { key: 'switch', label: 'Switch 开关' },
      { key: 'time-picker', label: 'TimePicker 时间选择框' },
      { key: 'transfer', label: 'Transfer 穿梭框' },
      { key: 'tree-select', label: 'TreeSelect 树选择' },
      { key: 'upload', label: 'Upload 上传' },
    ],
  },
  {
    category: '数据展示',
    items: [
      { key: 'avatar', label: 'Avatar 头像' },
      { key: 'badge', label: 'Badge 徽标数' },
      { key: 'calendar', label: 'Calendar 日历' },
      { key: 'card', label: 'Card 卡片' },
      { key: 'carousel', label: 'Carousel 走马灯' },
      { key: 'collapse', label: 'Collapse 折叠面板' },
      { key: 'descriptions', label: 'Descriptions 描述列表' },
      { key: 'empty', label: 'Empty 空状态' },
      { key: 'image', label: 'Image 图片' },
      { key: 'list', label: 'List 列表' },
      { key: 'popover', label: 'Popover 气泡卡片' },
      { key: 'qrcode', label: 'QRCode 二维码' },
      { key: 'segmented', label: 'Segmented 分段控制器' },
      { key: 'statistic', label: 'Statistic 统计数值' },
      { key: 'table', label: 'Table 表格' },
      { key: 'tag', label: 'Tag 标签' },
      { key: 'timeline', label: 'Timeline 时间轴' },
      { key: 'tooltip', label: 'Tooltip 文字提示' },
      { key: 'tour', label: 'Tour 漫游式引导' },
      { key: 'tree', label: 'Tree 树形控件' },
    ],
  },
  {
    category: '反馈',
    items: [
      { key: 'alert', label: 'Alert 警告提示' },
      { key: 'drawer', label: 'Drawer 抽屉' },
      { key: 'message', label: 'Message 全局提示' },
      { key: 'modal', label: 'Modal 对话框' },
      { key: 'notification', label: 'Notification 通知提醒框' },
      { key: 'popconfirm', label: 'Popconfirm 气泡确认框' },
      { key: 'progress', label: 'Progress 进度条' },
      { key: 'result', label: 'Result 结果' },
      { key: 'skeleton', label: 'Skeleton 骨架屏' },
      { key: 'spin', label: 'Spin 加载中' },
    ],
  },
  {
    category: '其他',
    items: [
      { key: 'affix', label: 'Affix 固钉' },
      { key: 'app', label: 'App 包裹组件' },
      { key: 'config-provider', label: 'ConfigProvider 全局化配置' },
      { key: 'util', label: 'Util 工具类' },
    ],
  },
  {
    category: '业务组件',
    items: [
      { key: 'dispatch-sider-nav', label: 'VMenu 导航区' },
      { key: 'dispatch-filter-area', label: 'VFilterArea 筛选区' },
      { key: 'switch-area', label: 'VTypeTabs / VStateTabs / VCustomTabs 切换区' },
      { key: 'operation-bar', label: 'VTopOperationBar 等操作区' },
      { key: 'biz-table', label: 'VTable 表格区' },
      { key: 'table-cell', label: 'TableCellEditing / TableCellImage / TableHeaderCell' },
      { key: 'vtell', label: 'VTell 对话区' },
      { key: 'list-page-shell', label: '列表页串联（多组件）' },
    ],
  },
];

export const defaultSelectedKey = 'overview';
