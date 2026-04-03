import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, VcIcon, Dropdown, vcTokens } from 'vc-design';
import { useOverflowLayout } from './useOverflowLayout';

export interface OverflowActionItem {
  key: string;
  label: string;
  icon: string;
  type?: 'default' | 'primary' | 'text';
  danger?: boolean;
  onClick: () => void;
}

export interface OverflowActionsProps {
  items: OverflowActionItem[];
  menuOnlyItems?: OverflowActionItem[];
  maxVisibleWithMore?: number;
  iconOnlyMore?: boolean;
  /** 非 icon-only 时「更多」按钮文案，默认空（不展示「更多」类文字，仅图标/下拉） */
  moreLabel?: string;
  /** 优先保留在可见区的 action key（按数组顺序靠前；其余在宽度不足时先入下拉） */
  priorityKeys?: string[];
  align?: 'left' | 'right';
}

const actionGapPx = 8;

function reorderByPriority<T extends { key: string }>(items: T[], priorityKeys?: string[]): T[] {
  if (!priorityKeys?.length) return items;
  const byKey = new Map(items.map((i) => [i.key, i] as const));
  const seen = new Set<string>();
  const front: T[] = [];
  for (const k of priorityKeys) {
    const it = byKey.get(k);
    if (it && !seen.has(k)) {
      front.push(it);
      seen.add(k);
    }
  }
  return [...front, ...items.filter((i) => !seen.has(i.key))];
}

export default function OverflowActions({
  items,
  menuOnlyItems = [],
  maxVisibleWithMore,
  iconOnlyMore = true,
  moreLabel = '',
  priorityKeys,
  align = 'right',
}: OverflowActionsProps) {
  const displayItems = useMemo(() => reorderByPriority(items, priorityKeys), [items, priorityKeys]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemMeasureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const moreMeasureRef = useRef<HTMLSpanElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  const [moreWidth, setMoreWidth] = useState(32);

  useLayoutEffect(() => {
    setItemWidths(displayItems.map((_, i) => itemMeasureRefs.current[i]?.offsetWidth ?? 0));
    setMoreWidth(moreMeasureRef.current?.offsetWidth ?? 32);
  }, [displayItems, iconOnlyMore, moreLabel]);

  useEffect(() => {
    if (!containerRef.current) return;
    const node = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(node);
    setContainerWidth(node.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const visibleCount = useOverflowLayout({
    itemCount: displayItems.length,
    containerWidth,
    itemWidths,
    moreWidth,
    menuOnlyCount: menuOnlyItems.length,
    maxVisibleWithMore,
  });

  const hiddenItems = useMemo(
    () => [...displayItems.slice(visibleCount), ...menuOnlyItems],
    [displayItems, menuOnlyItems, visibleCount]
  );
  const showMore = hiddenItems.length > 0;

  return (
    <>
      <div
        ref={containerRef}
        style={{
          minWidth: 0,
          width: align === 'right' ? '100%' : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
          gap: actionGapPx,
          /* 不要用 overflow:hidden，否则会裁切 AntD 主按钮水波纹 */
          overflow: 'visible',
        }}
      >
        {displayItems.slice(0, visibleCount).map((a) => (
          <Button
            key={a.key}
            type={a.type}
            danger={a.danger}
            icon={
              <VcIcon
                type={a.icon}
                fontSize={16}
                style={a.type === 'text' ? { color: vcTokens.color.neutral.text.icon } : undefined}
              />
            }
            onClick={a.onClick}
          >
            {a.label}
          </Button>
        ))}
        {showMore ? (
          <Dropdown
            menu={{
              items: hiddenItems.map((a) => ({
                key: a.key,
                label: a.label,
                icon: <VcIcon type={a.icon} fontSize={16} />,
                danger: a.danger,
              })),
              onClick: ({ key }) => {
                hiddenItems.find((a) => a.key === key)?.onClick();
              },
            }}
            trigger={['click']}
          >
            {iconOnlyMore ? (
              <Button icon={<VcIcon type="more" fontSize={16} />} onClick={(e) => e.preventDefault()} />
            ) : (
              <Button onClick={(e) => e.preventDefault()}>
                {moreLabel}
                {moreLabel ? ' ' : null}
                <VcIcon type="chevron-down" fontSize={16} />
              </Button>
            )}
          </Dropdown>
        ) : null}
      </div>

      <div
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          left: -9999,
          top: -9999,
          display: 'flex',
          alignItems: 'center',
          gap: actionGapPx,
        }}
      >
        {displayItems.map((a, i) => (
          <span
            key={a.key}
            ref={(el) => {
              itemMeasureRefs.current[i] = el;
            }}
          >
            <Button type={a.type} danger={a.danger} icon={<VcIcon type={a.icon} fontSize={16} />}>
              {a.label}
            </Button>
          </span>
        ))}
        <span ref={moreMeasureRef}>
          {iconOnlyMore ? (
            <Button icon={<VcIcon type="more" fontSize={16} />} />
          ) : (
            <Button>
              {moreLabel}
              {moreLabel ? ' ' : null}
              <VcIcon type="chevron-down" fontSize={16} />
            </Button>
          )}
        </span>
      </div>
    </>
  );
}
