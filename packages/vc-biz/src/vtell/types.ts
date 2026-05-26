/** VTell 对话区组件类型定义 */

import type { VInputLlmOption, VInputAttachedFile, VInputCommandTag } from '../vcell-input/VInput';

// 导出 VInputCommandTag 供外部使用
export type { VInputCommandTag };

/** 对话消息角色 */
export type VTellMessageRole = 'user' | 'assistant';
/** @deprecated Use VTellMessageRole instead */
export type VtellMessageRole = VTellMessageRole;

/** 对话消息 */
export interface VTellMessage {
  /** 消息唯一标识 */
  id: string;
  /** 消息角色 */
  role: VTellMessageRole;
  /** 消息内容 */
  content: string;
  /** 消息状态（仅 assistant 消息可设置） */
  status?: 'loading';
  /** 消息携带的指令标签（仅 user 消息） */
  tags?: VInputCommandTag[];
  /** 消息携带的附件文件（仅 user 消息） */
  files?: VTellAttachedFile[];
}
/** @deprecated Use VTellMessage instead */
export type VtellMessage = VTellMessage;

/** LLM 模型选项（复用 VInput 类型） */
export type VTellLlmOption = VInputLlmOption;
/** @deprecated Use VTellLlmOption instead */
export type VtellLlmOption = VTellLlmOption;

/** 附件文件（复用 VInput 类型） */
export type VTellAttachedFile = VInputAttachedFile;
/** @deprecated Use VTellAttachedFile instead */
export type VtellAttachedFile = VTellAttachedFile;

/** VTell 主组件 Props */
export interface VTellProps {
  /** 对话消息历史（外部管理，支持多表格切换） */
  messages: VTellMessage[];
  /** 当前对话是否正在发送 */
  sending?: boolean;
  /** 发送消息回调 */
  onSend: (text: string, files: VTellAttachedFile[], tags: VInputCommandTag[]) => void;
  /** 取消发送回调（sending 时点击撤回按钮触发） */
  onCancel?: () => void;
  /** 组件宽度（像素） */
  widthPx?: number;
  /** 最小宽度（像素） */
  minWidthPx?: number;
  /** LLM 模型选项列表（必填，VInput 需要） */
  llmOptions: VTellLlmOption[];
  /** 当前选中的 LLM 模型（必填，VInput 需要） */
  llmValue: string;
  /** LLM 模型变更回调（必填，VInput 需要） */
  onLlmChange: (value: string) => void;
  /** 输入框占位文本 */
  placeholder?: string;
  /** L0 句式补全池（可选） */
  l0Completions?: VTellCompletionItem[];
  /** L0 补全项点击回调 */
  onL0CompletionPick?: (text: string) => void;
  /** hashtag 选择范围补全池（可选） */
  hashtagCompletions?: VTellCompletionItem[];
  /** hashtag 补全项点击回调 */
  onHashtagPick?: (text: string) => void;
  /** 命令标签列表（受控，与 onCommandTagsChange 成对使用） */
  commandTags?: VInputCommandTag[];
  /** 命令标签变更回调 */
  onCommandTagsChange?: (tags: VInputCommandTag[]) => void;
  /** 是否禁用输入 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式（用于布局自适应） */
  style?: React.CSSProperties;
}
/** @deprecated Use VTellProps instead */
export type VtellProps = VTellProps;

/** 消息气泡 Props */
export interface VTellMessageBubbleProps {
  /** 消息数据 */
  message: VTellMessage;
  /** 是否为最新用户消息（用于滚动定位） */
  isLatestUser?: boolean;
  /** 消息气泡 ref（用于滚动定位） */
  bubbleRef?: React.RefObject<HTMLDivElement | null>;
}
/** @deprecated Use VTellMessageBubbleProps instead */
export type VtellMessageBubbleProps = VTellMessageBubbleProps;

/** 消息列表 Props */
export interface VTellMessageListProps {
  /** 消息列表 */
  messages: VTellMessage[];
  /** 最新用户消息 ID（用于滚动定位） */
  lastUserMessageId?: string;
}
/** @deprecated Use VTellMessageListProps instead */
export type VtellMessageListProps = VTellMessageListProps;

/** 补全菜单 Props */
export interface VTellCompletionMenuProps {
  /** 是否可见 */
  visible: boolean;
  /** 补全项列表 */
  completions: VTellCompletionItem[];
  /** 当前高亮索引 */
  highlightIndex: number;
  /** 高亮索引变更回调 */
  onHighlightChange: (index: number) => void;
  /** 选择补全项回调 */
  onPick: (text: string) => void;
  /** 输入框是否为空（用于显示提示） */
  inputEmpty?: boolean;
}

/** 补全项 */
export interface VTellCompletionItem {
  /** 唯一标识 */
  key: string;
  /** 显示文本 */
  label: string;
  /** 图标名称（可选，用于 VcIcon） */
  icon?: string;
  /** 同义词列表（用于模糊匹配） */
  synonyms?: string[];
}
/** @deprecated Use VTellCompletionMenuProps instead */
export type VtellCompletionMenuProps = VTellCompletionMenuProps;