import React, { useMemo, useState } from 'react';
import { vcTokens, message } from 'vc-design';
import {
  BatchOperationBar,
  TableOperationBar,
  TopOperationBar,
  type OverflowActionItem,
} from 'vc-biz';

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
      <h1 style={{ marginBottom: 8, fontWeight: 600, fontSize: 18 }}>VOperationBar 操作区</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        本页演示 <code>VTopOperationBar</code>、<code>VTableOperationBar</code>、<code>VBatchOperationBar</code>；
        底层左右插槽为 <code>VOperationBar</code>，右侧溢出按钮行为来自 <code>VOverflowActions</code>。
        设计对齐 Figma <code>operation_bar</code>（top / table / batch 三种形态）。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          TopOperationBar
        </h2>
        <TopOperationBar
          items={topRightItems}
          onSearch={(v) => message.info(`搜索：${v || '(空)'}`)}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          TableOperationBar
        </h2>
        <TableOperationBar
          segmentedOptions={['全部', '进行中', '已完成', '已关闭']}
          value={segValue}
          onChange={(v) => setSegValue(v)}
          primaryItems={tablePrimaryItems}
          menuOnlyItems={tableMenuOnlyItems}
          maxVisibleWithMore={3}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          BatchOperationBar
        </h2>
        <BatchOperationBar
          checked={batchChecked}
          indeterminate={false}
          selectedCount={batchChecked ? 20 : 0}
          onCheckedChange={(next) => setBatchChecked(next)}
          items={batchItems}
          maxVisibleWithMore={4}
          paginationProps={{
            current: page,
            pageSize,
            total: 500,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
              message.info(`分页：第 ${p} 页 / ${ps} 条每页`);
            },
          }}
        />
      </section>
    </>
  );
}

