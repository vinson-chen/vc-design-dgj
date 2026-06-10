import React, { useCallback, useRef, useState } from 'react';
import { Button, Dropdown, Image, Input, Space, VcIcon, vcTokens } from 'vc-design';
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
  appendImageUrls: (bodyRowIndex: number, colIndex: number, urls: readonly string[]) => void;
  removeImageAt: (bodyRowIndex: number, colIndex: number, imageIndex: number) => void;
}>;

/** 图片加载状态 */
type ImageLoadStatus = 'loading' | 'loaded' | 'error';

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
  appendImageUrls,
  removeImageAt,
}: TableCellImageProps) {
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const showAddButton = isAnchor && enableEditMode;

  // 追踪预览是否打开
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // 追踪每张图片的加载状态
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, ImageLoadStatus>>({});

  // 下拉面板状态
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

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

  // 预览状态变化时更新状态
  const onPreviewVisibleChange = useCallback((visible: boolean) => {
    setIsPreviewVisible(visible);
  }, []);

  // 图片加载成功
  const onImageLoad = useCallback((url: string) => {
    setImageLoadStatus((prev) => ({ ...prev, [url]: 'loaded' }));
  }, []);

  // 图片加载失败
  const onImageError = useCallback((url: string) => {
    setImageLoadStatus((prev) => ({ ...prev, [url]: 'error' }));
  }, []);

  // 点击添加按钮，打开面板
  const onAddButtonClick = useCallback((e: React.MouseEvent) => {
    if (!enableEditMode) return;
    e.stopPropagation();
    setLinkUrl('');
    setUrlError(null);
    setAddPanelOpen(true);
  }, [enableEditMode]);

  // 本地上传按钮点击
  const onLocalUploadClick = useCallback(() => {
    setAddPanelOpen(false);
    setLinkUrl('');
    setUrlError(null);
    imageFileInputRef.current?.click();
  }, []);

  // URL 格式校验
  const validateUrl = useCallback((url: string): string | null => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      // 检查协议是否为 http 或 https
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return '链接协议仅支持 http 或 https';
      }
      return null;
    } catch {
      return '请输入有效的图片链接地址';
    }
  }, []);

  // 链接输入变化
  const onLinkUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLinkUrl(e.target.value);
    // 输入变化时清除错误状态
    if (urlError) {
      setUrlError(null);
    }
  }, [urlError]);

  // 保存链接
  const onSaveLink = useCallback(() => {
    const url = linkUrl.trim();
    if (!url) return;
    // URL 格式校验
    const error = validateUrl(url);
    if (error) {
      setUrlError(error);
      return;
    }
    // 标记为加载中
    setImageLoadStatus((prev) => ({ ...prev, [url]: 'loading' }));
    appendImageUrls(bodyRowIndex, colIndex, [url]);
    setAddPanelOpen(false);
    setLinkUrl('');
    setUrlError(null);
  }, [linkUrl, validateUrl, appendImageUrls, bodyRowIndex, colIndex]);

  // 取消
  const onCancel = useCallback(() => {
    setAddPanelOpen(false);
    setLinkUrl('');
    setUrlError(null);
  }, []);

  // 渲染添加图片面板
  const renderAddPanel = useCallback(() => (
    <div
      className="vc-biz-table-image-add-panel"
      data-keep-table-selection=""
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="vc-biz-table-image-add-panel-title">
        添加图片
      </div>
      <div className="vc-biz-table-image-add-panel-fields">
        {/* 本地上传按钮 */}
        <div className="vc-biz-table-image-add-panel-field">
          <label className="vc-biz-table-image-add-panel-label">本地图片</label>
          <Button
            icon={<VcIcon type="upload" fontSize={14} />}
            onClick={onLocalUploadClick}
          >
            选择文件
          </Button>
        </div>
        {/* 图片链接输入 */}
        <div className="vc-biz-table-image-add-panel-field">
          <label className="vc-biz-table-image-add-panel-label">图片链接</label>
          <Input
            placeholder="请输入图片链接地址"
            value={linkUrl}
            onChange={onLinkUrlChange}
            onKeyDown={(e) => e.stopPropagation()}
            status={urlError ? 'error' : undefined}
          />
          {urlError ? (
            <div className="vc-biz-table-image-add-panel-error">
              {urlError}
            </div>
          ) : null}
        </div>
      </div>
      <div className="vc-biz-table-image-add-panel-actions">
        <Space size={8}>
          <Button type="primary" disabled={!linkUrl.trim()} onClick={onSaveLink}>
            保存
          </Button>
          <Button onClick={onCancel}>
            取消
          </Button>
        </Space>
      </div>
    </div>
  ), [linkUrl, urlError, onLocalUploadClick, onLinkUrlChange, onSaveLink, onCancel]);

  return (
    <Dropdown
      open={addPanelOpen}
      onOpenChange={setAddPanelOpen}
      placement="bottomLeft"
      overlayClassName="vc-biz-table-image-add-dropdown"
      overlayStyle={{
        boxShadow: vcTokens.style.boxShadowSecondary,
        minWidth: 280,
        width: 280,
      }}
      align={{ offset: [0, 4] }}
      autoAdjustOverflow={false}
      transitionName=""
      trigger={[]}
      getPopupContainer={() => document.body}
      popupRender={renderAddPanel}
    >
      <div
        className={
          'vc-biz-table-image-cell-wrap' +
          (isAnchor ? ' vc-biz-table-image-cell-wrap--hover-locked' : '') +
          (isPreviewVisible ? ' vc-biz-table-image-cell-wrap--preview-visible' : '')
        }
        style={{ minHeight: imagePreviewSize } as React.CSSProperties}
      >
        <Image.PreviewGroup
          preview={{
            onVisibleChange: onPreviewVisibleChange,
            maskClosable: false,
          }}
        >
          {imageUrls.map((url, idx) => {
            const status = imageLoadStatus[url] ?? 'loading';
            const isError = status === 'error';
            return (
              <div
                key={`${url}-${idx}`}
                className={
                  'vc-biz-table-image-item' +
                  (isError ? ' vc-biz-table-image-item--error' : '')
                }
                style={{ width: imagePreviewSize, height: imagePreviewSize }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {isError ? (
                  // 加载失败占位图
                  <div
                    className="vc-biz-table-image-error-placeholder"
                    style={{ width: imagePreviewSize, height: imagePreviewSize }}
                  >
                    <VcIcon type="error-circle-filled" fontSize={16} />
                  </div>
                ) : (
                  <Image
                    src={url}
                    alt={`图片 ${idx + 1}`}
                    width={imagePreviewSize}
                    height={imagePreviewSize}
                    className="vc-biz-table-image-item-preview"
                    style={{ objectFit: 'cover', borderRadius: 6 }}
                    preview={{
                      mask: false,
                    }}
                    onLoad={() => onImageLoad(url)}
                    onError={() => onImageError(url)}
                  />
                )}
                {enableEditMode && isAnchor && !isPreviewVisible ? (
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
            );
          })}
        </Image.PreviewGroup>
        {showAddButton && !isPreviewVisible ? (
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
            onClick={onAddButtonClick}
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
    </Dropdown>
  );
}