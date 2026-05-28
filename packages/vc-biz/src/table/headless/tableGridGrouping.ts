import type { TableGroupTitleRowInfo } from '../tableGridTypes';

/** 空值组标识 */
const EMPTY_GROUP_KEY = '';

/**
 * 计算分组结构
 * @param valueByCell 单元格数据（key: `${bodyRowIndex}-${colIndex}`）
 * @param groupedColIndex 分组列索引
 * @param bodyRowCount 表体行数
 * @param expandedGroupKeys 展开的分组值集合
 * @returns 分组标题行信息列表（包含空值组）
 */
export function computeGroupTitleRows(
  valueByCell: Record<string, string>,
  groupedColIndex: number,
  bodyRowCount: number,
  expandedGroupKeys: ReadonlySet<string>
): Array<TableGroupTitleRowInfo> {
  if (groupedColIndex < 0 || bodyRowCount <= 0) return [];

  // 按 groupValue 收集所有 bodyRowIndex
  const groups = new Map<string, Array<number>>();

  for (let bodyRowIndex = 0; bodyRowIndex < bodyRowCount; bodyRowIndex++) {
    const cellKey = `${bodyRowIndex}-${groupedColIndex}`;
    // 空值用空字符串标识
    const groupValue = valueByCell[cellKey] ?? EMPTY_GROUP_KEY;

    if (!groups.has(groupValue)) {
      groups.set(groupValue, []);
    }
    groups.get(groupValue)!.push(bodyRowIndex);
  }

  // 按首次出现顺序排列分组（空值组排到最后）
  const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
    // 空值组排到最后
    if (a[0] === EMPTY_GROUP_KEY) return 1;
    if (b[0] === EMPTY_GROUP_KEY) return -1;
    // 其他组按首次出现顺序
    const aFirst = a[1][0];
    const bFirst = b[1][0];
    return aFirst - bFirst;
  });

  // 计算 virtualRowIndex 和返回结果
  const result: Array<TableGroupTitleRowInfo> = [];
  let virtualRowIndex = 1; // 从 1 开始（rowIndex 0 是表头）

  // 处理所有分组（包括空值组）
  for (const [groupValue, bodyRows] of sortedGroups) {
    const expanded = expandedGroupKeys.has(groupValue);

    const groupInfo: TableGroupTitleRowInfo = {
      groupValue,
      groupCount: bodyRows.length,
      bodyRows,
      expanded,
      virtualRowIndex,
      isEmptyGroup: groupValue === EMPTY_GROUP_KEY,
    };

    virtualRowIndex += 1; // 分组标题行
    if (expanded) {
      // 组内数据行
      virtualRowIndex += bodyRows.length;
      // 组内插入行
      groupInfo.groupInsertTailVirtualIndex = virtualRowIndex;
      virtualRowIndex += 1;
    }

    result.push(groupInfo);
  }

  return result;
}

/**
 * 获取空值组的 bodyRows 列表
 */
export function getEmptyGroupBodyRows(
  valueByCell: Record<string, string>,
  groupedColIndex: number,
  bodyRowCount: number
): Array<number> {
  if (groupedColIndex < 0 || bodyRowCount <= 0) return [];

  const bodyRows: Array<number> = [];
  for (let bodyRowIndex = 0; bodyRowIndex < bodyRowCount; bodyRowIndex++) {
    const cellKey = `${bodyRowIndex}-${groupedColIndex}`;
    const groupValue = valueByCell[cellKey] ?? EMPTY_GROUP_KEY;
    if (groupValue === EMPTY_GROUP_KEY) {
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