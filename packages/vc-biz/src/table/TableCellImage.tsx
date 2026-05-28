import React, { useCallback, useRef } from 'react';
import { Button, VcIcon, vcTokens } from 'vc-design';
import type { TableGridEditingState } from './useTableGridEditing';
import './tableBodyImageCell.css';

export type TableCellImageProps = Readonly<{
  bodyRowIndex: number;
  colIndex: number;
  imageUrls: ReadonlyArray<string>;
  isAnchor: boolean;
  enableEditMode: boolean;
  imagePreviewSize?: number;
  addButtonSize?: number;
  editingApi: TableGridEditingState;
  appendImageFiles: (bodyRowIndex: number, colIndex: number, files: readonly File[]) => void;
  removeImageAt: (bodyRowIndex: number, colIndex: number, imageIndex: number) => void;
}>;

/** 图片列单元格：预览缩略图 + 添加/删除按钮 */
export function TableCellImage({
  bodyRowIndex,
  colIndex,
  imageUrls,
  isAnchor,
  enableEditMode,
  imagePreviewSize = 32,
  addButtonSize = 32,
  editingApi,
  appendImageFiles,
  removeImageAt,
}: TableCellImageProps) {
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const showAddButton = isAnchor && enableEditMode;

  const onOpenFilePicker = useCallback(
    (e: React.MouseEvent) => {
      if (!enableEditMode) return;
      e.stopPropagation();
      imageFileInputRef.current?.click();
    },
    [enableEditMode]
  );

  const onFilesSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const files = Array.from(e.currentTarget.files ?? []);
      if (files.length === 0) return;
      appendImageFiles(bodyRowIndex, colIndex, files);
      e.currentTarget.value = '';
    },
    [appendImageFiles, bodyRowIndex, colIndex]
  );

  const onRemoveAt = useCallback(
    (imageIndex: number, e: React.MouseEvent) => {
      e.stopPropagation();
      removeImageAt(bodyRowIndex, colIndex, imageIndex);
    },
    [removeImageAt, bodyRowIndex, colIndex]
  );

  return (
    <div
      className={'vc-biz-table-image-cell-wrap' + (isAnchor ? ' vc-biz-table-image-cell-wrap--hover-locked' : '')}
      style={{ minHeight: imagePreviewSize } as React.CSSProperties}
    >
      {imageUrls.map((url, idx) => (
        <div
          key={`${url}-${idx}`}
          className="vc-biz-table-image-item"
          style={{ width: imagePreviewSize, height: imagePreviewSize }}
        >
          <img
            src={url}
            alt={`图片 ${idx + 1}`}
            draggable={false}
            className="vc-biz-table-image-item-preview"
          />
          {enableEditMode && isAnchor ? (
            <button
              type="button"
              className="vc-biz-table-image-remove-btn"
              aria-label="删除图片"
              onClick={(e) => onRemoveAt(idx, e)}
            >
              <VcIcon type="close-circle-filled" fontSize={14} />
            </button>
          ) : null}
        </div>
      ))}
      {showAddButton ? (
        <Button
          type="default"
          className="vc-biz-table-image-add-btn"
          aria-label="添加图片"
          icon={<VcIcon type="add" fontSize={16} />}
          style={{
            width: addButtonSize,
            minWidth: addButtonSize,
            height: addButtonSize,
            padding: 0,
          } as React.CSSProperties}
          onClick={onOpenFilePicker}
        />
      ) : null}
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="vc-biz-table-image-file-input"
        onChange={onFilesSelected}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}