/** VTell 对话区组件导出 */

export { VTell, uid } from './VTell';
export { VTellMessageList, getLastUserMessageId } from './VTellMessageList';
export { VTellMessageBubble } from './VTellMessageBubble';
export { VTellCompletionMenu } from './VTellCompletionMenu';

export type {
  VTellProps,
  VTellMessage,
  VTellMessageRole,
  VTellAttachedFile,
  VTellLlmOption,
  VTellMessageBubbleProps,
  VTellMessageListProps,
  VTellCompletionMenuProps,
} from './types';

/** @deprecated Use VTell instead */
export { VTell as Vtell } from './VTell';
/** @deprecated Use VTellMessageList instead */
export { VTellMessageList as VtellMessageList } from './VTellMessageList';
/** @deprecated Use VTellMessageBubble instead */
export { VTellMessageBubble as VtellMessageBubble } from './VTellMessageBubble';
/** @deprecated Use VTellCompletionMenu instead */
export { VTellCompletionMenu as VtellCompletionMenu } from './VTellCompletionMenu';