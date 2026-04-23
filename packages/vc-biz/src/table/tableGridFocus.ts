import type { RefObject } from 'react';

/** 表体编辑区：原生 `<textarea>` ref（与表头单行 `<input>` 对称） */
export type BodyEditTextAreaRef = RefObject<HTMLTextAreaElement | null>;

export function focusBodyEditTextareaWithoutScroll(ref: BodyEditTextAreaRef): void {
  ref.current?.focus({ preventScroll: true });
}
