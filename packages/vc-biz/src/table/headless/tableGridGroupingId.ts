import type { HeaderCellValue } from '../tableGridTypes';

/** 生成唯一分组 ID */
export function generateGroupId(): string {
  return `group-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 解析表头值：支持 string（旧格式或 JSON 序列化的对象） */
export function parseHeaderCellValue(value: string | undefined): HeaderCellValue {
  if (value == null) return { title: '' };
  // 尝试解析 JSON
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && 'title' in parsed) {
      return parsed as HeaderCellValue;
    }
  } catch {
    // 不是 JSON，直接作为 title
  }
  return { title: value };
}

/** 将 HeaderCellValue 序列化为字符串存储 */
export function serializeHeaderCellValue(value: HeaderCellValue): string {
  // 如果只有 title，直接返回字符串（兼容旧格式）
  if (value.groupId == null) {
    return value.title;
  }
  return JSON.stringify(value);
}

/** 获取表头标题 */
export function getHeaderTitle(value: string | undefined): string {
  return parseHeaderCellValue(value).title;
}

/** 获取表头 groupId（如果存在） */
export function getHeaderGroupId(value: string | undefined): string | undefined {
  return parseHeaderCellValue(value).groupId;
}

/** 设置表头 groupId */
export function setHeaderGroupId(value: string | undefined, groupId: string | undefined): string {
  const parsed = parseHeaderCellValue(value);
  const newValue: HeaderCellValue = groupId == null
    ? { title: parsed.title }
    : { title: parsed.title, groupId };
  return serializeHeaderCellValue(newValue);
}

/** 根据 groupId 查找分组列索引 */
export function findGroupedColIndex(
  valueByCell: Record<string, string>,
  groupId: string | undefined,
  colCount: number
): number | undefined {
  if (groupId == null) return undefined;
  for (let c = 0; c < colCount; c++) {
    const headerValue = valueByCell[`header-${c}`];
    if (getHeaderGroupId(headerValue) === groupId) {
      return c;
    }
  }
  return undefined;
}

/** 检查是否存在分组列 */
export function hasGroupedColumn(
  valueByCell: Record<string, string>,
  colCount: number
): boolean {
  for (let c = 0; c < colCount; c++) {
    const headerValue = valueByCell[`header-${c}`];
    if (getHeaderGroupId(headerValue) != null) {
      return true;
    }
  }
  return false;
}