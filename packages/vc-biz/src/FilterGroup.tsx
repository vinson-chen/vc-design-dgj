import React, { useLayoutEffect, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Button,
  DatePicker,
  VcIcon,
  Input,
  Select,
  Space,
  vcTokens,
} from 'vc-design';
import {
  FILTER_GAP,
  FILTER_ITEM_MAX,
  FILTER_ITEM_MIN,
  useFilterGroupLayout,
  useFilterRowsMetrics,
} from './filter/filterLayout';
import './FilterGroup.css';

export type FilterFieldType = 'input' | 'select' | 'datePicker';

export interface FilterFieldConfig {
  key: string;
  type: FilterFieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  allowClear?: boolean;
}

export interface FilterGroupProps {
  fields: FilterFieldConfig[];
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  onSearch?: () => void;
  onReset?: () => void;
  /** demo 交互：当筛选项行数大于 maxRows 时展示折叠按钮；折叠后仅显示 1 行 */
  collapsible?: {
    maxRows: number;
    defaultCollapsed?: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
}

function renderCellStyle(pinRight: boolean): React.CSSProperties {
  const base: React.CSSProperties = { boxSizing: 'border-box' };
  if (pinRight) {
    return {
      ...base,
      width: '100%',
      minWidth: FILTER_ITEM_MIN,
      maxWidth: FILTER_ITEM_MAX,
    };
  }
  return {
    ...base,
    flex: '1 1 0',
    minWidth: FILTER_ITEM_MIN,
    maxWidth: FILTER_ITEM_MAX,
  };
}

function renderField(
  f: FilterFieldConfig,
  raw: Record<string, unknown>,
  onFieldChange: (key: string, v: unknown) => void,
  pinRight: boolean,
) {
  const cellStyle: React.CSSProperties = renderCellStyle(pinRight);
  const common = { size: 'middle' as const, allowClear: f.allowClear !== false };

  if (f.type === 'input') {
    return (
      <div key={f.key} style={cellStyle}>
        <Input
          {...common}
          style={{ width: '100%' }}
          placeholder={f.placeholder}
          value={(raw[f.key] as string) ?? ''}
          onChange={(e) => onFieldChange(f.key, e.target.value)}
        />
      </div>
    );
  }

  if (f.type === 'select') {
    return (
      <div key={f.key} style={cellStyle}>
        <Select
          {...common}
          placeholder={f.placeholder ?? '请选择'}
          options={f.options ?? []}
          suffixIcon={<VcIcon type="chevron-down" />}
          style={{ width: '100%' }}
          value={raw[f.key] === '' || raw[f.key] == null ? undefined : (raw[f.key] as string)}
          onChange={(v) => onFieldChange(f.key, v)}
        />
      </div>
    );
  }

  const d = raw[f.key];
  const dayVal: Dayjs | null =
    d == null || d === ''
      ? null
      : typeof d === 'string' && dayjs(d).isValid()
        ? dayjs(d)
        : null;

  return (
    <div key={f.key} style={cellStyle}>
      <DatePicker
        {...common}
        placeholder={f.placeholder ?? '选择日期'}
        style={{ width: '100%' }}
        value={dayVal}
        onChange={(date) => onFieldChange(f.key, date ? date.format('YYYY-MM-DD') : null)}
      />
    </div>
  );
}

/**
 * 分单筛选区：筛选项 + 查询 / 重置。
 * - 窄屏时筛选项无法在第一行满足 minWidth：筛选项区占满剩余宽度并等分（每项宽 160~328），按钮贴第一行右侧。
 * - 否则：筛选项紧跟按钮（不占满整行）。
 * - 内容行宽 < 320px 时：筛选项与按钮换行，查询/重置单独一行右对齐，避免与表单项重叠。
 */
export default function FilterGroup({
  fields,
  value,
  onChange,
  onSearch,
  onReset,
  collapsible,
  className,
  style,
}: FilterGroupProps) {
  const fieldsKey = fields.map((f) => `${f.key}:${f.type}`).join('|');
  const { rowRef, filtersRef, actionsRef, pinRight, gridCols, stackActionsBelow } = useFilterGroupLayout(
    fieldsKey,
    fields.length,
  );
  const { rows, collapsedMaxH } = useFilterRowsMetrics(filtersRef, fieldsKey, pinRight, gridCols);

  const [collapsed, setCollapsed] = useState<boolean>(collapsible?.defaultCollapsed ?? false);

  const onFieldChange = (key: string, v: unknown) => {
    onChange({ ...value, [key]: v });
  };

  useLayoutEffect(() => {
    if (!collapsible) {
      setCollapsed(false);
      return;
    }
    setCollapsed(collapsible.defaultCollapsed ?? false);
  }, [collapsible?.maxRows, collapsible?.defaultCollapsed]);

  const showCollapse = !!collapsible && rows >= collapsible.maxRows;
  const shouldCollapse = showCollapse && collapsed;

  const collapseVars = {
    '--filter-collapse-border': vcTokens.color.neutral.border.default,
    '--filter-collapse-border-hover': vcTokens.color.primary.default,
    '--filter-collapse-color': vcTokens.color.neutral.text.icon,
    '--filter-collapse-color-hover': vcTokens.color.primary.default,
    '--filter-collapse-icon': vcTokens.color.neutral.text.icon,
    '--filter-collapse-icon-hover': vcTokens.color.primary.default,
  } as React.CSSProperties;

  return (
    <div
      className={className}
      style={{
        padding: 16,
        position: 'relative',
        background: vcTokens.color.neutral.background.container,
          borderRadius: 0,
        border: `1px solid ${vcTokens.color.neutral.border.secondary}`,
        paddingBottom: showCollapse ? 24 : 16,
        ...collapseVars,
        ...style,
      }}
    >
      <div
        ref={rowRef}
        style={{
          display: 'flex',
          flexWrap: stackActionsBelow ? 'wrap' : 'nowrap',
          alignItems: 'flex-start',
          gap: FILTER_GAP,
          width: '100%',
        }}
      >
        <div
          ref={filtersRef}
          style={{
            display: pinRight ? 'grid' : 'flex',
            gridTemplateColumns: pinRight ? `repeat(${gridCols}, 1fr)` : undefined,
            gap: FILTER_GAP,
            flexWrap: pinRight ? undefined : 'wrap',
            flex: pinRight ? '1 1 0' : stackActionsBelow ? '1 1 100%' : '0 1 auto',
            minWidth: stackActionsBelow ? undefined : 0,
            width: stackActionsBelow ? '100%' : undefined,
            maxWidth: stackActionsBelow ? '100%' : undefined,
            alignItems: 'flex-start',
            alignContent: pinRight ? 'start' : undefined,
            overflow: shouldCollapse ? 'hidden' : undefined,
            maxHeight: shouldCollapse ? collapsedMaxH : undefined,
            transition: collapsible ? 'max-height 180ms ease' : undefined,
          }}
        >
          {fields.map((f) => renderField(f, value, onFieldChange, pinRight))}
        </div>

        <div
          ref={actionsRef}
          style={{
            flexShrink: 0,
            width: stackActionsBelow ? '100%' : undefined,
            display: stackActionsBelow ? 'flex' : undefined,
            justifyContent: stackActionsBelow ? 'flex-end' : undefined,
          }}
        >
          <Space size={8}>
            <Button type="primary" onClick={() => onSearch?.()}>
              查询
            </Button>
            <Button type="default" onClick={() => onReset?.()}>
              重置
            </Button>
          </Space>
        </div>
      </div>

      {showCollapse ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: -8,
            transform: 'translateX(-50%)',
            zIndex: 2,
          }}
        >
          <button
            type="button"
            className="biz-filter-group-collapse-btn"
            aria-label={collapsed ? '展开筛选项' : '收起筛选项'}
            onClick={() => setCollapsed((v) => !v)}
          >
            <VcIcon
              type={collapsed ? 'chevron-down' : 'chevron-up'}
              fontSize={16}
              className="biz-filter-group-collapse-icon"
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}
