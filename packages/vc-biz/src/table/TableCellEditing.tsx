import React, { useCallback, useRef } from 'react';
import { vcTokens } from 'vc-design';
import type { TableGridTypographyMetrics } from './tableGridTypography';
import type { TableGridEditingState } from './useTableGridEditing';
import { syncBodyEditTextareaHeight } from './bodyEditTextareaAutosize';
import { EDIT_TEXTAREA_MAX_ROWS } from './tableGridConstants';
import './tableBodyEditNativeTextarea.css';

export type TableCellEditingProps = Readonly<{
  bodyRowIndex: number;
  colIndex: number;
  cellKey: string;
  editingDraft: string;
  typography: TableGridTypographyMetrics;
  editingApi: TableGridEditingState;
  rowCount: number;
  onEnterNavigateDown?: (nextR: number, nextC: number) => void;
  /** 是否用 inset panel 包装（锁定态时的蓝色描边容器） */
  wrapWithInsetPanel?: boolean;
}>;

/** 编辑态 textarea 样式：无 padding，与展示态对齐 */
export function getBodyEditTextareaStyle(m: TableGridTypographyMetrics): React.CSSProperties {
  return {
    fontSize: m.fontSizePx,
    lineHeight: `${m.lineHeightPx}px`,
    padding: 0,
    boxSizing: 'border-box',
    borderRadius: 0,
    transition: 'none',
    backgroundColor: 'transparent',
    minHeight: m.lineHeightPx,
    color: vcTokens.color.neutral.text.default,
  };
}

/** 表体单元格编辑态：原生 textarea + 高度同步 */
export function TableCellEditing({
  bodyRowIndex,
  colIndex,
  cellKey,
  editingDraft,
  typography,
  editingApi,
  rowCount,
  onEnterNavigateDown,
  wrapWithInsetPanel = false,
}: TableCellEditingProps) {
  const textareaRef = editingApi.editTextAreaRef;
  const style = getBodyEditTextareaStyle(typography);

  const syncHeight = useCallback(
    (el: HTMLTextAreaElement) => {
      syncBodyEditTextareaHeight(el, {
        minRows: 1,
        maxRows: EDIT_TEXTAREA_MAX_ROWS,
        lineHeightPx: typography.lineHeightPx,
      });
    },
    [typography.lineHeightPx]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter（无修饰键）→ 保存并导航到下一行
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !(e.nativeEvent as KeyboardEvent & { isComposing?: boolean }).isComposing
    ) {
      e.preventDefault();
      const v = editingApi.getEditingValueForSave();
      editingApi.setValueByCell((prev) => ({ ...prev, [cellKey]: v }));
      editingApi.pendingBlurIgnoreCellKeyRef.current = cellKey;
      editingApi.suppressDuplicatePrevCellClickSaveRef.current = true;
      editingApi.scheduleClearEditCommitGuards();
      editingApi.setEditingCell(null);
      editingApi.editingDraftRef.current = '';

      const maxBodyR = rowCount >= 2 ? rowCount - 2 : 0;
      const nextR = Math.min(maxBodyR, bodyRowIndex + 1);
      const next = { r: nextR, c: colIndex };
      editingApi.setSelectedCell(next);
      editingApi.setSelectedCells(new Set([`${next.r}:${next.c}`]));
      editingApi.setSelectionAnchor(next);
      editingApi.setHoverLockedCell(next);
      onEnterNavigateDown?.(nextR, colIndex);
      return;
    }

    // Escape / Ctrl+Enter / Cmd+Enter → 退出编辑
    const exit = e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey));
    if (!exit) return;
    e.preventDefault();
    const v = editingApi.getEditingValueForSave();
    editingApi.setValueByCell((prev) => ({ ...prev, [cellKey]: v }));
    editingApi.pendingBlurIgnoreCellKeyRef.current = cellKey;
    editingApi.scheduleClearEditCommitGuards();
    editingApi.setSelectedCell({ r: bodyRowIndex, c: colIndex });
    editingApi.setSelectedCells(new Set([`${bodyRowIndex}:${colIndex}`]));
    editingApi.setSelectionAnchor({ r: bodyRowIndex, c: colIndex });
    editingApi.setEditingCell(null);
    editingApi.editingDraftRef.current = '';
  };

  const textarea = (
    <textarea
      key={`edit-${bodyRowIndex}-${colIndex}`}
      ref={textareaRef}
      className="vc-biz-table-body-edit-native-textarea"
      rows={1}
      defaultValue={editingDraft}
      style={style}
      onInput={(e) => {
        editingApi.editingDraftRef.current = e.currentTarget.value;
        syncHeight(e.currentTarget);
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onBlur={() => {
        if (editingApi.pendingBlurIgnoreCellKeyRef.current === cellKey) return;
        const v = editingApi.getEditingValueForSave();
        editingApi.setValueByCell((prev) => ({ ...prev, [cellKey]: v }));
      }}
      onKeyDown={onKeyDown}
    />
  );

  if (wrapWithInsetPanel) {
    return (
      <div
        style={{
          width: '100%',
          minWidth: 0,
          minHeight: '100%',
          alignSelf: 'stretch',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'flex-start',
          paddingTop: 6,
          paddingRight: 6,
          paddingBottom: 5,
          paddingLeft: 6,
          borderRadius: 0,
          border: `2px solid ${vcTokens.color.primary.default}`,
          background: vcTokens.color.neutral.background.container,
        }}
      >
        {textarea}
      </div>
    );
  }

  return textarea;
}