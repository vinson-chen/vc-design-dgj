export interface PageCaseComponentItem {
  component: string;
  variant: string;
  interaction: string;
}

export interface PageCaseColorItem {
  role: string;
  tokenPath: string;
  hex: string;
}

export interface PageCaseIconItem {
  figmaName: string;
  vcIconType: string;
  fallback: boolean;
}

export interface PageCaseManifest {
  source: {
    figmaLink: string;
    nodeId: string;
    generatedAt?: string;
  };
  note: string;
  components: PageCaseComponentItem[];
  colors: PageCaseColorItem[];
  icons: PageCaseIconItem[];
}

export const pageCaseManifest: PageCaseManifest = {
  source: {
    figmaLink:
      'https://www.figma.com/design/a4w8JupybLqnEXPkxRs4wL/VC-Design?node-id=663-11500&t=GbwvUkmgYHG3vmT3-1',
    nodeId: '663:11500',
    generatedAt: '2026-03-24T08:34:18.535Z',
  },
  note:
    '已基于 TalkToFigma channel=2c7mgp67 实时读取 663:11500 节点并生成清单；共识别节点 346 个（INSTANCE 176 / TEXT 78 / SLOT 49 / FRAME 35）。',
  components: [
    { component: 'Layout', variant: '左侧菜单 + 顶部操作区', interaction: '导航切换与区域分层' },
    { component: 'Menu', variant: '深色侧边菜单 + 选中项高亮', interaction: '一级/二级导航切换' },
    { component: 'Input', variant: 'prefix + suffix, size=middle/small', interaction: '关键词输入与行内编辑' },
    { component: 'Select', variant: 'single + suffixIcon', interaction: '状态筛选/分页条数切换' },
    { component: 'DatePicker', variant: 'range-like placeholder', interaction: '日期筛选' },
    { component: 'Button', variant: 'primary/default/link/icon', interaction: '查询、重置、新建、导入、删除等动作' },
    { component: 'Segmented', variant: '4项状态分段', interaction: '全部/进行中/已完成/已关闭切换' },
    { component: 'Alert', variant: 'info with close', interaction: '顶部提示信息展示' },
    { component: 'Table', variant: 'header + selectable rows + operation cells', interaction: '表格查看、选择与操作' },
    { component: 'Checkbox', variant: 'default', interaction: '行选择与批量选择' },
    { component: 'Tag', variant: 'default/info/error', interaction: '标签态展示' },
    { component: 'Badge', variant: 'status dot', interaction: '状态点展示' },
    { component: 'Switch', variant: 'small', interaction: '开关状态切换' },
    { component: 'Dropdown', variant: 'button trigger', interaction: '更多操作下拉' },
    { component: 'Pagination', variant: 'number + quick jumper', interaction: '分页跳转与每页条数切换' },
    { component: 'Modal', variant: 'default', interaction: '点击新建打开对话框（案例页已实现）' },
  ],
  colors: [
    { role: '主操作按钮/高亮', tokenPath: 'vcTokens.color.primary.default', hex: '#0888FF' },
    { role: '页面底色', tokenPath: 'vcTokens.color.neutral.background.layout', hex: '#F0F1F2' },
    { role: '容器背景', tokenPath: 'vcTokens.color.neutral.background.container', hex: '#FFFFFF' },
    { role: '深色导航底', tokenPath: 'vcTokens.color.neutral.text.default（近似深色背景）', hex: '#424A57' },
    { role: '边框线', tokenPath: 'vcTokens.color.neutral.border.default', hex: '#E1E2E4' },
    { role: '信息提示背景', tokenPath: 'vcTokens.color.info.bg', hex: '#ECF6FF' },
    { role: '危险态文本', tokenPath: 'vcTokens.color.error.default', hex: '#EA572E' },
    { role: '危险态背景', tokenPath: 'vcTokens.color.error.bg', hex: '#FEF2EF' },
    { role: '成功态', tokenPath: 'vcTokens.color.success.default', hex: '#73AC1F' },
  ],
  icons: [
    { figmaName: 'search', vcIconType: 'search', fallback: false },
    { figmaName: 'add', vcIconType: 'add', fallback: false },
    { figmaName: 'close', vcIconType: 'close', fallback: false },
    { figmaName: 'edit', vcIconType: 'edit', fallback: false },
    { figmaName: 'delete', vcIconType: 'delete', fallback: false },
    { figmaName: 'chevron-down', vcIconType: 'chevron-down', fallback: false },
    { figmaName: 'chevron-left', vcIconType: 'chevron-left', fallback: false },
    { figmaName: 'chevron-right', vcIconType: 'chevron-right', fallback: false },
    { figmaName: '🎰 icon / icon（语义不明确）', vcIconType: 'help-circle', fallback: true },
  ],
};
