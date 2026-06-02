import React, { useEffect, useLayoutEffect, useState } from 'react';
import { vcTokens } from 'vc-design';
import { TABLE_BODY_BG_DEFAULT } from './tableGridConstants';

export type VTableCellVariant = 'thead' | 'tbody';
/** @deprecated Use VTableCellVariant instead */
export type BizTableCellVariant = VTableCellVariant;
let globalColumnResizeDragging = false;

export interface VTableCellProps {
  variant: VTableCellVariant;
  /** tbody：该行 checkbox 勾选态 */
  active?: boolean;
  /** 整行 hover（tbody） */
  hovered?: boolean;
  /** thead：是否按单元格 hover（否则使用 hovered） */
  hoverByCell?: boolean;
  /** thead：展示 zoom 拖拽视觉/热区 */
  zoom?: boolean;
  /** thead：列宽拖拽开始（仅响应在 zoom 热区） */
  onColumnResizeStart?: (event: React.MouseEvent) => void;
  /** 非 zoom 分支内容上下 padding */
  contentPaddingY?: number;
  /** 非 zoom 分支内容左右 padding */
  contentPaddingX?: number;
  /** 左 padding 覆盖（优先级高于内部逻辑，用于表头单独控制） */
  contentPaddingLeft?: number;
  /** 非 zoom 分支内容垂直对齐 */
  contentAlignY?: 'center' | 'flex-start';
  /** 非 compact、非 zoom 时内容槽主轴对齐（水平）；checkbox/序号窄列用 center */
  contentAlignX?: 'flex-start' | 'center';
  /** 是否为最后一行（控制底部分割线） */
  isLastRow?: boolean;
  /** 是否显示右侧描边（颜色与底部分割线一致） */
  showRightBorder?: boolean;
  /** 右描边颜色覆盖（用于末列强调等） */
  rightBorderColor?: string;
  /**
   * 内容槽纵向居中并去掉上下 padding（窄列表头图标等，避免多层 flex + padding 导致视觉上偏上）
   */
  compactVerticalContent?: boolean;
  /** 冻结列：避免 sticky 叠层时透明背景透出 */
  isFrozen?: boolean;
  /** 为 true 时不画底部分割线（如插入列表体整列连成一条） */
  suppressBottomBorder?: boolean;
  /** 表头行最小高度（随常规字号加大，默认 36） */
  theadMinHeightPx?: number;
  /** 表体单元格最小高度（与表头行高对齐，避免无窄列时行高塌缩） */
  tbodyMinHeightPx?: number;
  /** 与 TableRows 同步：递增时清空按格悬停（仅 hoverByCell 时有效） */
  pointerHoverResetNonce?: number;
  /** 表体：锚点态单元格（单击选中/框选锚点）；不叠加 hover overlay，外部用 inset panel 包蓝框 */
  isAnchor?: boolean;
  /** 表体：鼠标是否悬停在本行（用于选中态叠加 hover） */
  bodyRowHovered?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** 点击事件（用于组内插入行等） */
  onClick?: (e: React.MouseEvent) => void;
}

/** @deprecated Use VTableCellProps instead */
export type BizTableCellProps = VTableCellProps;

function theadBaseBackground() {
  return vcTokens.color.neutral.background.layout;
}

function tbodyBaseBackground(active: boolean) {
  if (active) return vcTokens.color.primary.bg;
  return TABLE_BODY_BG_DEFAULT;
}

function tbodyBorder() {
  // 表体统一使用中性加深描边：选中行仅改变底色，不改变描边颜色
  return vcTokens.color.neutral.border.default;
}

function theadBorder() {
  return vcTokens.color.neutral.border.default;
}

function isGlobalColumnResizing(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('vc-biz-col-resizing');
}

function isGlobalColumnOrderDragging(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('vc-biz-col-order-dragging');
}

export function VTableCell({
  variant,
  active = false,
  hovered,
  hoverByCell = false,
  zoom = false,
  onColumnResizeStart,
  contentPaddingY = 8,
  contentPaddingX = 8,
  contentPaddingLeft,
  contentAlignY = 'center',
  contentAlignX = 'flex-start',
  isLastRow = false,
  showRightBorder = false,
  rightBorderColor,
  compactVerticalContent = false,
  isFrozen = false,
  suppressBottomBorder = false,
  theadMinHeightPx,
  tbodyMinHeightPx,
  pointerHoverResetNonce = 0,
  isAnchor = false,
  bodyRowHovered = false,
  children,
  className,
  style,
  onClick,
}: VTableCellProps) {
  const [cellHovered, setCellHovered] = useState(false);
  const [resizeHandleHovered, setResizeHandleHovered] = useState(false);
  const [resizeDragging, setResizeDragging] = useState(false);
  const hoverSuppressed = isGlobalColumnResizing() || isGlobalColumnOrderDragging();
  const hoverEffective = hoverSuppressed ? false : hoverByCell ? cellHovered : !!hovered;

  const baseBg =
    variant === 'thead'
      ? theadBaseBackground()
      : tbodyBaseBackground(active);
  // 锚点态不叠加 hover overlay（外部用 inset panel 包蓝框）
  const hoverFillOverlay =
    hoverEffective &&
    !(variant === 'tbody' && active) &&
    !(variant === 'tbody' && isAnchor) &&
    vcTokens.color.neutral.fill.secondary;
  const borderColor = variant === 'thead' ? theadBorder() : tbodyBorder();

  const contentPaddingRight =
    variant === 'thead' && zoom
      ? 8
      : variant === 'thead' && !zoom && onColumnResizeStart
        ? 18
        : contentPaddingX;

  const effectivePaddingLeft = contentPaddingLeft ?? contentPaddingX;

  const contentLayout: React.CSSProperties = compactVerticalContent
    ? {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: effectivePaddingLeft,
        paddingRight: contentPaddingRight,
      }
    : {
        display: 'flex',
        flexDirection: 'row',
        alignItems: contentAlignY,
        justifyContent: contentAlignX,
        paddingTop: contentPaddingY,
        paddingBottom: contentPaddingY,
        paddingLeft: effectivePaddingLeft,
        paddingRight: contentPaddingRight,
      };

  const activeResizeHighlight =
    variant === 'thead' &&
    zoom &&
    (resizeDragging || (resizeHandleHovered && !globalColumnResizeDragging && !isGlobalColumnOrderDragging()));

  const bottomDividerShadow = suppressBottomBorder
    ? undefined
    : `inset 0 -1px 0 ${borderColor}`;
  const mergedBoxShadow =
    style?.boxShadow && bottomDividerShadow
      ? `${style.boxShadow}, ${bottomDividerShadow}`
      : style?.boxShadow ?? bottomDividerShadow;

  /** 单层：边框/背景与内容区 padding+flex 合并，少一层 div */
  const rootStyle: React.CSSProperties = {
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
    minHeight:
      variant === 'thead'
        ? (theadMinHeightPx ?? 36)
        : tbodyMinHeightPx != null
          ? tbodyMinHeightPx
          : undefined,
    height: '100%',
    alignSelf: 'stretch',
    backgroundColor: baseBg,
    backgroundImage: hoverFillOverlay
      ? `linear-gradient(${hoverFillOverlay}, ${hoverFillOverlay})`
      : undefined,
    ...contentLayout,
    ...style,
    boxShadow: mergedBoxShadow,
    borderRight: showRightBorder
      ? `1px solid ${rightBorderColor ?? borderColor}`
      : undefined,
    borderBottom: 'none',
  };

  useEffect(() => {
    if (!resizeDragging) return;
    globalColumnResizeDragging = true;
    const root = document.documentElement;
    const prev = document.body.style.cursor;
    root.classList.add('vc-biz-col-resizing');
    document.body.style.cursor = 'col-resize';
    const onUp = () => setResizeDragging(false);
    window.addEventListener('mouseup', onUp);
    return () => {
      globalColumnResizeDragging = false;
      window.removeEventListener('mouseup', onUp);
      root.classList.remove('vc-biz-col-resizing');
      document.body.style.cursor = prev;
    };
  }, [resizeDragging]);

  useEffect(() => {
    if (!hoverSuppressed) return;
    setCellHovered(false);
  }, [hoverSuppressed]);

  useLayoutEffect(() => {
    if (!hoverByCell) return;
    setCellHovered(false);
  }, [hoverByCell, pointerHoverResetNonce]);

  return (
    <div
      className={`vc-biz-vtable-cell${className ? ` ${className}` : ''}`}
      style={rootStyle}
      data-is-anchor={isAnchor ? '' : undefined}
      onMouseEnter={() => {
        if (hoverSuppressed) return;
        setCellHovered(true);
      }}
      onMouseLeave={() => setCellHovered(false)}
      onClick={onClick}
    >
      {children}

      {variant === 'thead' && zoom ? (
        <>
          {activeResizeHighlight ? (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                // 盖住原 1px border-right（absolute 的 right:0 贕的是内容盒边缘）
                right: -1,
                top: 0,
                bottom: 0,
                width: 2,
                background: vcTokens.color.primary.default,
                zIndex: 30,
                pointerEvents: 'none',
              }}
            />
          ) : null}
          {/* 拖拽热区：跨越边线并向右扩展，避免边缘闪动 */}
          <span
            role="separator"
            aria-orientation="vertical"
            onMouseDown={(e) => {
              if (!onColumnResizeStart) return;
              setResizeHandleHovered(true);
              setResizeDragging(true);
              onColumnResizeStart(e);
            }}
            onMouseEnter={() => {
              if (globalColumnResizeDragging || isGlobalColumnOrderDragging()) return;
              setResizeHandleHovered(true);
            }}
            onMouseLeave={() => setResizeHandleHovered(false)}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: 8,
              cursor: onColumnResizeStart || resizeDragging ? 'col-resize' : 'default',
              zIndex: 2,
              background: 'transparent',
            }}
          />
        </>
      ) : null}
    </div>
  );
}

/** @deprecated Use VTableCell instead */
export const BizTableCell = VTableCell;