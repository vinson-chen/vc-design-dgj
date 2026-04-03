import React, { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  VcIcon,
  Input,
  Pagination,
  Segmented,
  vcTokens,
  message,
} from 'vc-design';
import { OperationBar, OverflowActions, type OverflowActionItem } from 'vc-biz';

const actionGapPx = 8;

const topBarActions = [
  { key: 'notify', label: '通知', icon: 'notification' },
  { key: 'complaint', label: '投诉', icon: 'mail' },
  { key: 'service', label: '客服', icon: 'service' },
  { key: 'order', label: '订购', icon: 'rocket' },
  { key: 'phone', label: '15014050905', icon: 'user' },
];

export default function OperationBarDemo() {
  const [segValue, setSegValue] = useState('全部');
  const [batchChecked, setBatchChecked] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const topRightItems = useMemo<OverflowActionItem[]>(
    () =>
      topBarActions.map((a) => ({
        ...a,
        type: 'text',
        onClick: () => message.info(`点击：${a.label}`),
      })),
    [],
  );
  const tablePrimaryItems = useMemo<OverflowActionItem[]>(
    () => [
      { key: 'new', label: '新建', icon: 'add', type: 'primary', onClick: () => message.info('点击：新建') },
      { key: 'import', label: '导入', icon: 'cloud-download', onClick: () => message.info('点击：导入') },
    ],
    [],
  );
  const tableMenuOnlyItems = useMemo<OverflowActionItem[]>(
    () => [
      { key: 'export', label: '导出', icon: 'cloud-upload', onClick: () => message.info('点击：导出') },
      { key: 'log', label: '日志', icon: 'history', onClick: () => message.info('点击：日志') },
      { key: 'setting', label: '设置', icon: 'setting', onClick: () => message.info('点击：设置') },
    ],
    [],
  );
  const batchItems = useMemo<OverflowActionItem[]>(
    () => [
      { key: 'batch-edit', label: '批量编辑', icon: 'edit', type: 'primary', onClick: () => message.info('点击：批量编辑') },
      { key: 'batch-tag', label: '批量标记', icon: 'tag', onClick: () => message.info('点击：批量标记') },
      { key: 'batch-copy', label: '批量复制', icon: 'file-copy', onClick: () => message.info('点击：批量复制') },
      { key: 'batch-delete', label: '批量删除', icon: 'delete', danger: true, onClick: () => message.info('点击：批量删除') },
    ],
    [],
  );

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>OperationBar 操作区</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        基于 Figma <code>operation_bar</code> 的左右插槽布局，在 demo 中给出 top / table / batch 三种实例。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          top_bar 实例
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <OperationBar
            left={
              <Input.Search
                placeholder="请输入"
                style={{ width: 320 }}
                allowClear
                enterButton={<Button icon={<VcIcon type="search" fontSize={16} />} />}
                onSearch={(v) => message.info(`搜索：${v || '(空)'}`)}
              />
            }
            right={
              <div style={{ minWidth: 0, width: '100%' }}>
                <OverflowActions items={topRightItems} iconOnlyMore />
              </div>
            }
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          table_operation 实例
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <OperationBar
            style={{ borderBottom: 'none' }}
            left={
              <Segmented
                options={['全部', '进行中', '已完成', '已关闭']}
                value={segValue}
                onChange={(v) => setSegValue(String(v))}
              />
            }
            right={
              <div style={{ minWidth: 0, width: '100%' }}>
                <OverflowActions
                  items={tablePrimaryItems}
                  menuOnlyItems={tableMenuOnlyItems}
                  maxVisibleWithMore={3}
                  iconOnlyMore
                  align="right"
                />
              </div>
            }
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          batch_operation 实例
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: 400,
            rowGap: 8,
            columnGap: 16,
            minHeight: 48,
            padding: '8px 16px',
            boxSizing: 'border-box',
            background: vcTokens.color.neutral.background.container,
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: actionGapPx, flex: '1 1 auto' }}>
            <Checkbox
              checked={batchChecked}
              onChange={(e) => setBatchChecked(e.target.checked)}
            >
              已选 {batchChecked ? 20 : 0} 条
            </Checkbox>
            <div style={{ minWidth: 0, flex: '0 1 auto' }}>
              <OverflowActions items={batchItems} maxVisibleWithMore={4} iconOnlyMore align="left" />
            </div>
          </div>
          <div style={{ marginLeft: 'auto', flex: '0 0 auto' }}>
            <Pagination
              simple
              current={page}
              pageSize={pageSize}
              total={500}
              onChange={(p, ps) => {
                setPage(p);
                setPageSize(ps);
                message.info(`分页：第 ${p} 页 / ${ps} 条每页`);
              }}
            />
          </div>
        </div>
        </div>
      </section>
    </>
  );
}

