import React, { useCallback, useEffect, useState } from 'react';
import { Button, Dropdown, Input, Space, VcIcon, vcTokens } from 'vc-design';
import type { TableGridEditingState } from './useTableGridEditing';
import type { CellLinkData } from './tableGridTypes';
import './tableBodyLinkCell.css';

export type TableCellLinkProps = Readonly<{
  bodyRowIndex: number;
  colIndex: number;
  linkData: ReadonlyArray<CellLinkData>;
  isAnchor: boolean;
  enableEditMode: boolean;
  editingApi: TableGridEditingState;
  appendLink: (bodyRowIndex: number, colIndex: number, data: CellLinkData) => void;
  updateLink: (bodyRowIndex: number, colIndex: number, linkIndex: number, data: CellLinkData) => void;
  removeLink: (bodyRowIndex: number, colIndex: number, linkIndex: number) => void;
}>;

/** 链接列单元格：链接按钮列表 + 添加/编辑/删除 */
export function TableCellLink({
  bodyRowIndex,
  colIndex,
  linkData,
  isAnchor,
  enableEditMode,
  editingApi,
  appendLink,
  updateLink,
  removeLink,
}: TableCellLinkProps) {
  const showAddButton = isAnchor && enableEditMode;
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // 监听 linkPanelCloseNonce 变化，关闭面板
  useEffect(() => {
    if (editingApi.linkPanelCloseNonce > 0) {
      setAddPanelOpen(false);
      setEditingIndex(null);
      setLinkName('');
      setLinkUrl('');
    }
  }, [editingApi.linkPanelCloseNonce]);

  // 打开添加面板
  const onAddButtonClick = useCallback((e: React.MouseEvent) => {
    if (!enableEditMode) return;
    e.stopPropagation();
    setEditingIndex(null);
    setLinkName('');
    setLinkUrl('');
    setAddPanelOpen(true);
  }, [enableEditMode]);

  // 打开编辑面板
  const onEditLink = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const data = linkData[index];
    setEditingIndex(index);
    setLinkName(data?.name ?? '');
    setLinkUrl(data?.url ?? '');
    setAddPanelOpen(true);
  }, [linkData]);

  // 删除链接
  const onRemoveLink = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeLink(bodyRowIndex, colIndex, index);
  }, [removeLink, bodyRowIndex, colIndex]);

  // 保存链接
  const onSaveLink = useCallback(() => {
    if (!linkName.trim() || !linkUrl.trim()) return;
    const data: CellLinkData = { name: linkName.trim(), url: linkUrl.trim() };
    if (editingIndex !== null) {
      updateLink(bodyRowIndex, colIndex, editingIndex, data);
    } else {
      appendLink(bodyRowIndex, colIndex, data);
    }
    setAddPanelOpen(false);
    setEditingIndex(null);
    setLinkName('');
    setLinkUrl('');
  }, [linkName, linkUrl, editingIndex, appendLink, updateLink, bodyRowIndex, colIndex]);

  // 取消编辑
  const onCancelEdit = useCallback(() => {
    setAddPanelOpen(false);
    setEditingIndex(null);
    setLinkName('');
    setLinkUrl('');
  }, []);

  // 点击链接按钮跳转
  const onLinkClick = useCallback((url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // 锚点态时不跳转，让用户可以编辑/删除
    if (isAnchor) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [isAnchor]);

  // 渲染添加/编辑面板
  const renderLinkPanel = () => (
    <div
      className="vc-biz-table-link-add-panel"
      data-keep-table-selection=""
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="vc-biz-table-link-add-panel-title">
        {editingIndex !== null ? '编辑链接' : '添加链接'}
      </div>
      <div className="vc-biz-table-link-add-panel-fields">
        <div className="vc-biz-table-link-add-panel-field">
          <label className="vc-biz-table-link-add-panel-label">链接名</label>
          <Input
            placeholder="请输入链接名"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            autoFocus
          />
        </div>
        <div className="vc-biz-table-link-add-panel-field">
          <label className="vc-biz-table-link-add-panel-label">超链接</label>
          <Input
            placeholder="请输入超链接地址"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      <div className="vc-biz-table-link-add-panel-actions">
        <Space size={8}>
          <Button type="primary" disabled={!linkName.trim() || !linkUrl.trim()} onClick={onSaveLink}>
            保存
          </Button>
          <Button onClick={onCancelEdit}>
            取消
          </Button>
        </Space>
      </div>
    </div>
  );

  return (
    <Dropdown
      open={addPanelOpen}
      onOpenChange={setAddPanelOpen}
      placement="bottomLeft"
      overlayClassName="vc-biz-table-link-add-dropdown"
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
      popupRender={renderLinkPanel}
    >
      <div
        className={'vc-biz-table-link-cell-wrap' + (isAnchor ? ' vc-biz-table-link-cell-wrap--hover-locked' : '')}
        onClick={(e) => e.stopPropagation()}
      >
        {linkData.map((link, idx) => (
          <div
            key={`${link.url}-${idx}`}
            className="vc-biz-table-link-item"
          >
            <Button
              type="default"
              className="vc-biz-table-link-btn"
              onClick={(e) => onLinkClick(link.url, e)}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {link.name}
            </Button>
            {enableEditMode && isAnchor ? (
              <>
                <div className="vc-biz-table-link-item-mask" />
                <div className="vc-biz-table-link-item-actions">
                  <button
                    type="button"
                    className="vc-biz-table-link-edit-btn"
                    aria-label="编辑链接"
                    onClick={(e) => onEditLink(idx, e)}
                  >
                    <VcIcon type="edit" fontSize={16} />
                  </button>
                  <button
                    type="button"
                    className="vc-biz-table-link-remove-btn"
                    aria-label="删除链接"
                    onClick={(e) => onRemoveLink(idx, e)}
                  >
                    <VcIcon type="close-circle-filled" fontSize={16} />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ))}
        {showAddButton ? (
          <Button
            type="default"
            className="vc-biz-table-link-add-btn"
            aria-label="添加链接"
            icon={<VcIcon type="add" fontSize={16} />}
            style={{
              width: 32,
              minWidth: 32,
              height: 32,
              padding: 0,
            } as React.CSSProperties}
            onClick={onAddButtonClick}
          />
        ) : null}
      </div>
    </Dropdown>
  );
}