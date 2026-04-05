import { useLayoutEffect, useRef, useState } from 'react';

export type UseTableBodyScrollMaxHeightOptions = Readonly<{
  /**
   * 为表格外底部区域预留高度（px），例如 BizTable 下方「编辑快捷键」说明，
   * 避免量到整块 flex 区却把 bodyScrollMaxHeight 撑满导致总高度溢出。
   */
  reserveBottomPx?: number;
  /** 扣除 TableArea 外框边框等（默认与 demo 一致） */
  borderFudgePx?: number;
  /** 表体虚拟区最小高度 */
  minScrollPx?: number;
}>;

/**
 * 将宿主元素在布局中的高度同步为 `TableRows` 的 `bodyScrollMaxHeight`，
 * 使 BizTable 在 flex / 侧栏布局下随浏览器与容器宽高自适应（与 vc-design BizTableDemo 一致）。
 */
export function useTableBodyScrollMaxHeight(options?: UseTableBodyScrollMaxHeightOptions) {
  const reserveBottomPx = options?.reserveBottomPx ?? 0;
  const borderFudgePx = options?.borderFudgePx ?? 2;
  const minScrollPx = options?.minScrollPx ?? 160;

  const hostRef = useRef<HTMLDivElement>(null);
  const [bodyScrollMaxHeight, setBodyScrollMaxHeight] = useState(() =>
    typeof window !== 'undefined'
      ? Math.max(240, Math.floor(window.innerHeight - 200))
      : 400
  );

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const apply = () => {
      const h = Math.floor(el.getBoundingClientRect().height);
      if (h > 0) {
        setBodyScrollMaxHeight(
          Math.max(minScrollPx, h - borderFudgePx - reserveBottomPx)
        );
      }
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener('resize', apply);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, [reserveBottomPx, borderFudgePx, minScrollPx]);

  return { hostRef, bodyScrollMaxHeight };
}
