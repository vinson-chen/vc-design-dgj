import React, { useState } from 'react';
import { vcTokens } from 'vc-design';
import { TABLE_HEADER_BG_DEFAULT, TABLE_HEADER_BG_HOVER } from './tableGridConstants';

export type BizTableCellVariant = 'thead' | 'tbody';

export interface BizTableCellProps {
  variant: BizTableCellVariant;
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
  /** 非 zoom 分支内容垂直对齐 */
  contentAlignY?: 'center' | 'flex-start';
  /** 非 compact、非 zoom 时内容槽主轴对齐（水平）；checkbox/序号窄列用 center */
  contentAlignX?: 'flex-start' | 'center';
  /** 是否为最后一行（控制底部分割线） */
  isLastRow?: boolean;
  /** 是否显示右侧描边（颜色与底部分割线一致） */
  showRightBorder?: boolean;
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
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function theadBackground(hover: boolean) {
  return hover ? TABLE_HEADER_BG_HOVER : TABLE_HEADER_BG_DEFAULT;
}

function tbodyBackground(
  hover: boolean,
  active: boolean,
  isFrozen: boolean | undefined
) {
  if (active) return hover ? vcTokens.color.primary.bgHover : vcTokens.color.primary.bg;
  if (isFrozen) return hover ? vcTokens.color.neutral.background.layout : vcTokens.color.neutral.background.container;
  return hover ? vcTokens.color.neutral.fill.secondary : vcTokens.color.neutral.background.container;
}

function tbodyBorder(hover: boolean, active: boolean) {
  if (active) return hover ? vcTokens.color.primary.borderHover : vcTokens.color.primary.border;
  return hover ? vcTokens.color.neutral.border.default : vcTokens.color.neutral.border.secondary;
}

function theadBorder() {
  return vcTokens.color.neutral.border.default;
}

export function BizTableCell({
  variant,
  active = false,
  hovered,
  hoverByCell = false,
  zoom = false,
  onColumnResizeStart,
  contentPaddingY = 8,
  contentPaddingX = 12,
  contentAlignY = 'center',
  contentAlignX = 'flex-start',
  isLastRow = false,
  showRightBorder = false,
  compactVerticalContent = false,
  isFrozen = false,
  suppressBottomBorder = false,
  theadMinHeightPx,
  children,
  className,
  style,
}: BizTableCellProps) {
  const [cellHovered, setCellHovered] = useState(false);
  const hoverEffective = hoverByCell ? cellHovered : !!hovered;

  const bg =
    variant === 'thead'
      ? theadBackground(hoverEffective)
      : tbodyBackground(hoverEffective, active, isFrozen);
  const borderColor =
    variant === 'thead' ? theadBorder() : tbodyBorder(hoverEffective, active);

  const zoomStrokeColor = hoverEffective
    ? vcTokens.color.primary.default
    : vcTokens.color.neutral.border.default;

  const contentPaddingRight =
    variant === 'thead' && zoom
      ? 12
      : variant === 'thead' && !zoom && onColumnResizeStart
        ? 18
        : contentPaddingX;

  const contentLayout: React.CSSProperties = compactVerticalContent
    ? {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: contentPaddingX,
        paddingRight: contentPaddingRight,
      }
    : {
        display: 'flex',
        flexDirection: 'row',
        alignItems: contentAlignY,
        justifyContent: contentAlignX,
        paddingTop: contentPaddingY,
        paddingBottom: contentPaddingY,
        paddingLeft: contentPaddingX,
        paddingRight: contentPaddingRight,
      };

  /** 单层：边框/背景与内容区 padding+flex 合并，少一层 div */
  const rootStyle: React.CSSProperties = {
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
    minHeight: variant === 'thead' ? (theadMinHeightPx ?? 36) : undefined,
    height: '100%',
    alignSelf: 'stretch',
    background: bg,
    ...contentLayout,
    ...style,
    borderRight: showRightBorder ? `1px solid ${borderColor}` : undefined,
    borderBottom: suppressBottomBorder
      ? 'none'
      : isLastRow
        ? undefined
        : `1px solid ${borderColor}`,
  };

  return (
    <div
      className={className}
      style={rootStyle}
      onMouseEnter={() => setCellHovered(true)}
      onMouseLeave={() => setCellHovered(false)}
    >
      {children}

      {variant === 'thead' && zoom ? (
        <>
          {/* Figma zoom_cell：右边缘 2px 内描边（默认/hover 颜色不同），高度跟随单元格内容区 */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              height: 20,
              width: 0,
              borderRight: `2px solid ${zoomStrokeColor}`,
              pointerEvents: 'none',
            }}
          />
          {/* 拖拽热区：8px 宽 */}
          <span
            role="separator"
            aria-orientation="vertical"
            onMouseDown={onColumnResizeStart}
            style={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              height: 20,
              width: 8,
              cursor: onColumnResizeStart ? 'col-resize' : 'default',
              zIndex: 2,
              background: 'transparent',
            }}
          />
        </>
      ) : null}
    </div>
  );
}

