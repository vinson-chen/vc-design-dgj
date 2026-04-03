import { useCallback, useMemo, useState } from 'react';

export type MenuOpenableGroup = { key: string; defaultOpen?: boolean };

/**
 * 分组菜单展开态：与 `groups` / `defaultGroups` 等静态配置搭配使用。
 */
export function useMenuOpenMap(source: readonly MenuOpenableGroup[]) {
  const initialOpen = useMemo(
    () => Object.fromEntries(source.map((g) => [g.key, Boolean(g.defaultOpen)])),
    [source],
  );
  const [openedMap, setOpenedMap] = useState(initialOpen);

  const toggle = useCallback((groupKey: string) => {
    setOpenedMap((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  }, []);

  return { openedMap, toggle };
}
