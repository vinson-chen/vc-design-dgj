import type { CellLinkData, TableColumnFieldKind, TableGroupTitleRowInfo } from '../tableGridTypes';
import { findGroupedColIndex } from './tableGridGroupingId';

/** 空值组标识 */
const EMPTY_GROUP_KEY = '';

/**
 * 根据列类型提取分组键和原始值
 */
function getGroupValueForCell(
  bodyRowIndex: number,
  groupedColIndex: number,
  groupColKind: TableColumnFieldKind,
  valueByCell: Record<string, string>,
  imageUrlsByCell?: Readonly<Record<string, ReadonlyArray<string>>>,
  linkDataByCell?: Readonly<Record<string, ReadonlyArray<CellLinkData>>>
): { groupKey: string; rawValue: unknown } {
  const cellKey = `${bodyRowIndex}-${groupedColIndex}`;

  if (groupColKind === 'image') {
    const imageUrls = imageUrlsByCell?.[cellKey];
    if (!imageUrls || imageUrls.length === 0) {
      return { groupKey: EMPTY_GROUP_KEY, rawValue: [] };
    }
    // 图片列：按 URL 数组的完全一致性分组
    return {
      groupKey: JSON.stringify(imageUrls),
      rawValue: imageUrls,
    };
  }

  if (groupColKind === 'link') {
    const linkData = linkDataByCell?.[cellKey];
    if (!linkData || linkData.length === 0) {
      return { groupKey: EMPTY_GROUP_KEY, rawValue: [] };
    }
    // 链接列：按 name 数组的完全一致性分组（忽略 URL）
    const linkNames = linkData.map((link) => link.name);
    return {
      groupKey: JSON.stringify(linkNames),
      rawValue: linkData,
    };
  }

  // 文本列：原有逻辑
  const textValue = valueByCell[cellKey] ?? EMPTY_GROUP_KEY;
  return { groupKey: textValue, rawValue: textValue || null };
}

/**
 * 计算分组结构（支持文本、图片、链接列）
 * @param valueByCell 单元格数据（key: `${bodyRowIndex}-${colIndex}` 或 `header-${colIndex}`）
 * @param groupedColId 分组列 groupId
 * @param colCount 列数
 * @param bodyRowCount 表体行数
 * @param expandedGroupKeys 展开的分组值集合
 * @param columnFieldKindByCol 列类型配置（用于判断分组列是 text/image/link）
 * @param imageUrlsByCell 图片列数据（key 形如 `${bodyRow}-${col}`）
 * @param linkDataByCell 链接列数据（key 形如 `${bodyRow}-${col}`）
 * @returns 分组标题行信息列表（包含空值组）
 */
export function computeGroupTitleRows(
  valueByCell: Record<string, string>,
  groupedColId: string | undefined,
  colCount: number,
  bodyRowCount: number,
  expandedGroupKeys: ReadonlySet<string>,
  columnFieldKindByCol?: Readonly<Record<number, TableColumnFieldKind>>,
  imageUrlsByCell?: Readonly<Record<string, ReadonlyArray<string>>>,
  linkDataByCell?: Readonly<Record<string, ReadonlyArray<CellLinkData>>>
): Array<TableGroupTitleRowInfo> {
  if (groupedColId == null || bodyRowCount <= 0) return [];

  // 根据 groupId 查找分组列索引
  const groupedColIndex = findGroupedColIndex(valueByCell, groupedColId, colCount);
  if (groupedColIndex == null || groupedColIndex < 0) return [];

  // 获取分组列类型
  const groupedColKind = columnFieldKindByCol?.[groupedColIndex] ?? 'text';

  // 按 groupKey 收集所有 bodyRowIndex
  const groups = new Map<string, { bodyRows: Array<number>; rawValue: unknown }>();

  for (let bodyRowIndex = 0; bodyRowIndex < bodyRowCount; bodyRowIndex++) {
    const { groupKey, rawValue } = getGroupValueForCell(
      bodyRowIndex,
      groupedColIndex,
      groupedColKind,
      valueByCell,
      imageUrlsByCell,
      linkDataByCell
    );

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { bodyRows: [], rawValue });
    }
    groups.get(groupKey)!.bodyRows.push(bodyRowIndex);
  }

  // 按首次出现顺序排列分组（空值组排到最后）
  const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
    // 空值组排到最后
    if (a[0] === EMPTY_GROUP_KEY) return 1;
    if (b[0] === EMPTY_GROUP_KEY) return -1;
    // 其他组按首次出现顺序
    const aFirst = a[1].bodyRows[0];
    const bFirst = b[1].bodyRows[0];
    return aFirst - bFirst;
  });

  // 计算 virtualRowIndex 和返回结果
  const result: Array<TableGroupTitleRowInfo> = [];
  let virtualRowIndex = 1; // 从 1 开始（rowIndex 0 是表头）

  // 处理所有分组（包括空值组）
  for (const [groupValue, { bodyRows, rawValue }] of sortedGroups) {
    const expanded = expandedGroupKeys.has(groupValue);

    // 先计算所有需要的值
    const isEmptyGroup = groupValue === EMPTY_GROUP_KEY;
    let currentVirtualRowIndex = virtualRowIndex;
    let groupInsertTailVirtualIndex: number | undefined;

    virtualRowIndex += 1; // 分组标题行
    if (expanded) {
      // 组内数据行
      virtualRowIndex += bodyRows.length;
      // 组内插入行
      groupInsertTailVirtualIndex = virtualRowIndex;
      virtualRowIndex += 1;
    }

    // 一次性创建完整的 groupInfo 对象
    const groupInfo: TableGroupTitleRowInfo = {
      groupValue,
      groupCount: bodyRows.length,
      bodyRows,
      expanded,
      virtualRowIndex: currentVirtualRowIndex,
      groupInsertTailVirtualIndex,
      isEmptyGroup,
      groupedColIndex,
      groupedColKind,
      groupRawValue: isEmptyGroup ? undefined : rawValue,
    };

    result.push(groupInfo);
  }

  return result;
}

/**
 * 获取空值组的 bodyRows 列表
 */
export function getEmptyGroupBodyRows(
  valueByCell: Record<string, string>,
  groupedColId: string | undefined,
  colCount: number,
  bodyRowCount: number,
  columnFieldKindByCol?: Readonly<Record<number, TableColumnFieldKind>>,
  imageUrlsByCell?: Readonly<Record<string, ReadonlyArray<string>>>,
  linkDataByCell?: Readonly<Record<string, ReadonlyArray<CellLinkData>>>
): Array<number> {
  if (groupedColId == null || bodyRowCount <= 0) return [];

  const groupedColIndex = findGroupedColIndex(valueByCell, groupedColId, colCount);
  if (groupedColIndex == null || groupedColIndex < 0) return [];

  const groupedColKind = columnFieldKindByCol?.[groupedColIndex] ?? 'text';

  const bodyRows: Array<number> = [];
  for (let bodyRowIndex = 0; bodyRowIndex < bodyRowCount; bodyRowIndex++) {
    const { groupKey } = getGroupValueForCell(
      bodyRowIndex,
      groupedColIndex,
      groupedColKind,
      valueByCell,
      imageUrlsByCell,
      linkDataByCell
    );
    if (groupKey === EMPTY_GROUP_KEY) {
      bodyRows.push(bodyRowIndex);
    }
  }
  return bodyRows;
}

/**
 * 解析虚拟行索引对应的行类型
 * @param virtualRowIndex 虚拟行索引
 * @param rowCount 总行数（含表头）
 * @param groupTitleRows 分组标题行信息列表（含空值组）
 * @returns 行类型及相关信息
 */
export function resolveVirtualRow(
  virtualRowIndex: number,
  rowCount: number,
  groupTitleRows: ReadonlyArray<TableGroupTitleRowInfo>
): {
  type: 'header' | 'group-title' | 'body' | 'group-insert-tail' | 'insert-tail';
  groupInfo?: TableGroupTitleRowInfo;
  bodyRowIndex?: number;
  /** 组内相对位置（用于显示组内序号） */
  groupRelativeIndex?: number;
} {
  // rowIndex 0 = 表头
  if (virtualRowIndex === 0) {
    return { type: 'header' };
  }

  // 无分组时的简单处理
  if (groupTitleRows.length === 0) {
    // 最后一行是 insert-tail
    if (virtualRowIndex === rowCount) {
      return { type: 'insert-tail' };
    }
    // 其他为表体行
    const bodyRowIndex = virtualRowIndex - 1;
    return { type: 'body', bodyRowIndex };
  }

  // 计算总虚拟行数
  const totalVirtualRows = computeTotalVirtualRows(rowCount, groupTitleRows);
  if (virtualRowIndex === totalVirtualRows - 1) {
    return { type: 'insert-tail' };
  }

  // 遍历所有分组（含空值组）
  let currentVirtualIndex = 1;

  for (const groupInfo of groupTitleRows) {
    // 匹配分组标题行
    if (virtualRowIndex === currentVirtualIndex) {
      return { type: 'group-title', groupInfo };
    }

    currentVirtualIndex += 1;

    // 匹配组内数据行（仅展开状态）
    if (groupInfo.expanded) {
      const relativeIndex = virtualRowIndex - currentVirtualIndex;
      if (relativeIndex >= 0 && relativeIndex < groupInfo.groupCount) {
        const bodyRowIndex = groupInfo.bodyRows[relativeIndex];
        return { type: 'body', bodyRowIndex, groupInfo, groupRelativeIndex: relativeIndex };
      }
      currentVirtualIndex += groupInfo.groupCount;

      // 匹配组内插入行
      if (virtualRowIndex === currentVirtualIndex) {
        return { type: 'group-insert-tail', groupInfo };
      }
      currentVirtualIndex += 1;
    }
  }

  // 兜底：返回 body 类型
  return { type: 'body', bodyRowIndex: virtualRowIndex - 1 };
}

/**
 * 计算总虚拟行数（含表头、分组标题行、数据行、组内插入行、全局insert-tail）
 * @param rowCount 总行数（含表头）
 * @param groupTitleRows 分组标题行信息列表（含空值组）
 */
export function computeTotalVirtualRows(
  rowCount: number,
  groupTitleRows: ReadonlyArray<TableGroupTitleRowInfo>
): number {
  // 无分组时：rowCount + 1（insert-tail）
  if (groupTitleRows.length === 0) {
    return rowCount + 1;
  }

  // 有分组时：
  let count = 1; // 表头

  // 所有分组（含空值组）
  count += groupTitleRows.length; // 所有分组标题行

  for (const group of groupTitleRows) {
    if (group.expanded) {
      count += group.groupCount; // 组内数据行
      count += 1; // 组内插入行
    }
  }

  count += 1; // 全局 insert-tail
  return count;
}

/**
 * 切换分组展开状态
 */
export function toggleGroupExpansion(
  groupKey: string,
  currentExpanded: ReadonlySet<string>
): Set<string> {
  const next = new Set(currentExpanded);
  if (next.has(groupKey)) {
    next.delete(groupKey);
  } else {
    next.add(groupKey);
  }
  return next;
}