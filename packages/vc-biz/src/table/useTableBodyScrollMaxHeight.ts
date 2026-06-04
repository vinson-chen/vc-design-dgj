import { useEffect, useLayoutEffect, useRef, useState } from 'react';

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
 *
 * 使用 RAF 持续测量策略：在布局变化期间每帧测量，高度稳定后停止。
 * 配合 CSS transition 实现平滑过渡。
 */
export function useTableBodyScrollMaxHeight(options?: UseTableBodyScrollMaxHeightOptions) {
  const reserveBottomPx = options?.reserveBottomPx ?? 0;
  const borderFudgePx = options?.borderFudgePx ?? 2;
  const minScrollPx = options?.minScrollPx ?? 160;

  const hostRef = useRef<HTMLDivElement>(null);
  const [bodyScrollMaxHeight, setBodyScrollMaxHeight] = useState(() =>
    typeof window !== 'undefined'
      ? Math.max(minScrollPx, Math.floor(window.innerHeight - 200))
      : 400
  );

  // 测量和更新逻辑
  const measureRef = useRef<{
    lastHeight: number;
    rafId: number | null;
    isMeasuring: boolean;
    stableCount: number;
  }>({
    lastHeight: 0,
    rafId: null,
    isMeasuring: false,
    stableCount: 0,
  });

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const computeHeight = () => {
      const h = Math.floor(el.getBoundingClientRect().height);
      if (h <= 0) return null;
      return Math.max(minScrollPx, h - borderFudgePx - reserveBottomPx);
    };

    // RAF 持续测量，直到高度稳定
    const startMeasuring = () => {
      if (measureRef.current.isMeasuring) return;
      measureRef.current.isMeasuring = true;
      measureRef.current.stableCount = 0;

      const measureLoop = () => {
        const newHeight = computeHeight();
        if (newHeight === null) {
          measureRef.current.rafId = requestAnimationFrame(measureLoop);
          return;
        }

        // 高度有变化，立即更新
        if (newHeight !== measureRef.current.lastHeight) {
          measureRef.current.lastHeight = newHeight;
          measureRef.current.stableCount = 0;
          setBodyScrollMaxHeight(newHeight);
        } else {
          // 高度未变化，计数稳定帧
          measureRef.current.stableCount++;
          // 连续 5 帧高度不变，停止测量
          if (measureRef.current.stableCount >= 5) {
            measureRef.current.isMeasuring = false;
            measureRef.current.rafId = null;
            return;
          }
        }

        measureRef.current.rafId = requestAnimationFrame(measureLoop);
      };

      measureRef.current.rafId = requestAnimationFrame(measureLoop);
    };

    // 停止测量
    const stopMeasuring = () => {
      if (measureRef.current.rafId !== null) {
        cancelAnimationFrame(measureRef.current.rafId);
        measureRef.current.rafId = null;
      }
      measureRef.current.isMeasuring = false;
    };

    // ResizeObserver 触发时开始持续测量
    const ro = new ResizeObserver(() => {
      startMeasuring();
    });
    ro.observe(el);

    // 初始测量
    startMeasuring();

    // 窗口 resize 也触发测量
    window.addEventListener('resize', startMeasuring);

    return () => {
      stopMeasuring();
      ro.disconnect();
      window.removeEventListener('resize', startMeasuring);
    };
  }, [reserveBottomPx, borderFudgePx, minScrollPx]);

  return { hostRef, bodyScrollMaxHeight };
}
