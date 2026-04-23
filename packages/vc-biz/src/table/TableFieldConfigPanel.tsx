import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Button, VcIcon, vcTokens } from 'vc-design';
import './tableHeaderContextMenu.css';

const FIELD_CONFIG_VIEWPORT_BOTTOM_GAP = 16;
/** 触发器底边到面板内容顶的大致间距（箭头/留白） */
const FIELD_CONFIG_TRIGGER_TO_PANEL_GAP = 10;

function fieldConfigViewportBottomPx(): number {
  const vv = window.visualViewport;
  if (vv) return vv.offsetTop + vv.height;
  return window.innerHeight;
}

export type TableFieldConfigPanelProps = Readonly<{
  colCount: number;
  valueByCell: Record<string, string>;
  hiddenColSet: ReadonlySet<number>;
  setColumnHidden: (colIndex: number, hidden: boolean) => void;
  open: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  /** 父级完成布局测量后传入，用于在 triggerRef.current 就绪后重新计算 max-height */
  layoutMeasureKey?: number;
  /** 开启「冻结末列」时，末列不可隐藏（选项禁用态） */
  enableFreezeLastCol?: boolean;
}>;

/** BizTable / TableArea 共用的「字段配置」列显隐面板 */
export function TableFieldConfigPanel({
  colCount,
  valueByCell,
  hiddenColSet,
  setColumnHidden,
  open,
  triggerRef,
  layoutMeasureKey,
  enableFreezeLastCol = false,
}: TableFieldConfigPanelProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [maxPanelHeight, setMaxPanelHeight] = useState(() =>
    typeof window !== 'undefined' ? Math.min(360, window.innerHeight - 120) : 360
  );

  const measureMaxHeight = useCallback(() => {
    const bottom = fieldConfigViewportBottomPx();
    const gap = FIELD_CONFIG_VIEWPORT_BOTTOM_GAP;

    let byPanel = Number.POSITIVE_INFINITY;
    const inner = innerRef.current;
    if (inner) {
      const top = inner.getBoundingClientRect().top;
      byPanel = bottom - top - gap;
    }

    let byTrigger = Number.POSITIVE_INFINITY;
    const tr = triggerRef.current;
    if (tr) {
      const triggerBottom = tr.getBoundingClientRect().bottom;
      byTrigger = bottom - triggerBottom - FIELD_CONFIG_TRIGGER_TO_PANEL_GAP - gap;
    }

    const raw = Math.min(byPanel, byTrigger);
    if (!Number.isFinite(raw)) {
      const vh = fieldConfigViewportBottomPx();
      setMaxPanelHeight(Math.max(120, vh - 80));
      return;
    }
    setMaxPanelHeight(Math.max(120, raw));
  }, [triggerRef]);

  useLayoutEffect(() => {
    if (!open) return;
    measureMaxHeight();
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(measureMaxHeight);
    });
    const t0 = window.setTimeout(measureMaxHeight, 0);
    const t1 = window.setTimeout(measureMaxHeight, 50);
    const t2 = window.setTimeout(measureMaxHeight, 200);
    window.addEventListener('resize', measureMaxHeight);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', measureMaxHeight);
    vv?.addEventListener('scroll', measureMaxHeight);
    let ro: ResizeObserver | null = null;
    const tRo = window.setTimeout(() => {
      const node = innerRef.current;
      if (!node || typeof ResizeObserver === 'undefined') return;
      ro = new ResizeObserver(() => measureMaxHeight());
      ro.observe(node);
    }, 0);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(tRo);
      window.removeEventListener('resize', measureMaxHeight);
      vv?.removeEventListener('resize', measureMaxHeight);
      vv?.removeEventListener('scroll', measureMaxHeight);
      ro?.disconnect();
    };
  }, [open, colCount, measureMaxHeight, layoutMeasureKey]);

  const textDefault = vcTokens.color.neutral.text.default;
  const textDescription = vcTokens.color.neutral.text.description;
  const textDisabled = vcTokens.color.neutral.text.disabled;

  return (
    <div
      ref={innerRef}
      className="vc-biz-table-field-config-inner"
      style={{
        background: vcTokens.color.neutral.background.container,
        boxShadow: vcTokens.style.boxShadowSecondary,
        maxHeight: maxPanelHeight,
        overflow: 'hidden',
      }}
    >
      <div ref={scrollRef} className="vc-biz-table-field-config-scroll">
        {Array.from({ length: colCount }, (_, c) => {
          const locked =
            c === 0 || (enableFreezeLastCol && colCount > 0 && c === colCount - 1);
          const hidden = (hiddenColSet ?? new Set<number>()).has(c);
          const label = valueByCell[`header-${c}`] ?? `列 ${c + 1}`;
          const color = locked ? textDisabled : hidden ? textDescription : textDefault;
          return (
            <Button
              key={c}
              type="text"
              className="vc-biz-table-field-config-row"
              disabled={locked}
              icon={
                <VcIcon type={hidden ? 'browse-off' : 'browse'} fontSize={16} style={{ color }} />
              }
              onClick={() => {
                if (locked) return;
                setColumnHidden(c, !hidden);
              }}
            >
              <span
                className="vc-biz-table-field-config-row-label"
                style={{ color }}
                title={label}
              >
                {label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
