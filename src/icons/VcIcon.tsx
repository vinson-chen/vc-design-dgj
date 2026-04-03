import React, { forwardRef } from 'react';

export interface VcIconProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * 图标类型，对应 iconfont 的 class 后缀，最终渲染为 className="iconfont icon-{type}"
   * 例如 type="search" → icon-search。同一图标若有 search / search-filled 两种，默认使用无 -filled 后缀的。
   */
  type: string;
  /** 图标字号，便于与文案对齐 */
  fontSize?: number | string;
}

const ICON_TYPE_ALIASES: Record<string, string> = {
  // iconfont occasionally prefixes some glyph names with "a-"
  'chevron-left.double': 'a-chevron-leftdouble',
  'chevron-right.double': 'a-chevron-rightdouble',
  'order-adjustment.column': 'a-order-adjustmentcolumn',
  // keep common semantic names working in demos/business code
  info: 'info-circle',
  warning: 'error-triangle',
  question: 'help-circle',
  clock: 'time',
};

const VcIcon = forwardRef<HTMLElement, VcIconProps>(function VcIcon(
  { type, className = '', style, fontSize, ...rest },
  ref
) {
  const resolvedType = ICON_TYPE_ALIASES[type] ?? type;
  const iconClassName = `iconfont icon-${resolvedType} ${className}`.trim();
  const combinedStyle = { ...style, ...(fontSize != null ? { fontSize } : {}) };
  return (
    <i
      ref={ref as React.Ref<HTMLSpanElement>}
      className={iconClassName}
      style={combinedStyle}
      aria-hidden
      {...rest}
    />
  );
});

export { VcIcon };
