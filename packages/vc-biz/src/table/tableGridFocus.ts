import type { RefObject } from 'react';

export type AntdTextAreaRef = RefObject<{
  resizableTextArea?: { textArea?: HTMLTextAreaElement | null };
  focus?: (options?: { preventScroll?: boolean }) => void;
} | null>;

export function getNativeTextareaFromAntdRef(ref: AntdTextAreaRef): HTMLTextAreaElement | null {
  return ref.current?.resizableTextArea?.textArea ?? null;
}

/** AntD Input.TextArea 的 ref.focus 未必把 preventScroll 传到原生 textarea，直接 focus 原生节点更稳 */
export function focusAntdTextareaWithoutScroll(ref: AntdTextAreaRef): void {
  const ta = getNativeTextareaFromAntdRef(ref);
  if (ta) {
    ta.focus({ preventScroll: true });
    return;
  }
  ref.current?.focus?.({ preventScroll: true });
}
