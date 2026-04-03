import React, { useMemo, useState } from 'react';
import { Checkbox, Pagination, Segmented, vcTokens, message } from 'vc-design';
import {
  FilterGroup,
  type FilterFieldConfig,
  SwitchTabs,
  type SwitchTabItemData,
  OperationBar,
  OverflowActions,
  type OverflowActionItem,
  TableAreaTableInstance,
  useTableAreaDemoState,
} from 'vc-biz';

const pageBoxStyle: React.CSSProperties = {
  background: vcTokens.color.neutral.background.layout,
  borderRadius: vcTokens.style.borderRadius.lg,
  padding: 0,
};

export default function BizListPageCompositionDemo() {
  // 筛选区状态（假数据）
  const [filterValue, setFilterValue] = useState<Record<string, unknown>>({});

  const filterFields = useMemo<FilterFieldConfig[]>(
    () => [
      { key: 'goodsName', type: 'input', placeholder: '请输入商品名' },
      {
        key: 'status',
        type: 'select',
        placeholder: '请选择状态',
        options: [
          { label: '待处理', value: 'pending' },
          { label: '已完成', value: 'done' },
        ],
      },
      { key: 'bizDate', type: 'datePicker', placeholder: '选择日期' },
    ],
    [],
  );

  // 切换区状态（共享给 operation bar 的 segmented）
  const [storeActiveKey, setStoreActiveKey] = useState('精选平台');
  const [stateActiveKey, setStateActiveKey] = useState('全部');

  const storeItems = useMemo<SwitchTabItemData[]>(
    () => [
      { key: '精选平台', label: '精选平台', icon: 'otherstore.jpg' },
      { key: '抖音', label: '抖音', icon: 'douyin.jpg' },
      { key: '拼多多', label: '拼多多', icon: 'pdd.jpg' },
      { key: '京东', label: '京东', icon: 'jingdong.jpg' },
      { key: '更多平台', label: '更多平台', icon: 'add.svg' },
    ],
    [],
  );

  const stateItems = useMemo<SwitchTabItemData[]>(
    () => [
      { key: '全部', label: '全部' },
      { key: '进行中', label: '进行中' },
      { key: '已完成', label: '已完成' },
      { key: '已关闭', label: '已关闭' },
    ],
    [],
  );

  const handleStoreChange = (key: string) => {
    if (key === '更多平台') {
      message.info('更多平台：此处仅做串联演示（可接 Drawer/弹窗）');
      return;
    }
    setStoreActiveKey(key);
  };

  // 操作区（table_operation 风格）
  const [opSegValue, setOpSegValue] = useState(stateActiveKey);
  // 保持 segmented 与 tabs 同步
  React.useEffect(() => setOpSegValue(stateActiveKey), [stateActiveKey]);

  const actionItems = useMemo<OverflowActionItem[]>(
    () => [
      { key: 'export', label: '导出', icon: 'cloud-upload', onClick: () => message.info('点击：导出') },
      { key: 'setting', label: '设置', icon: 'setting', onClick: () => message.info('点击：设置') },
    ],
    [],
  );

  const tableDemo = useTableAreaDemoState();
  const [batchChecked, setBatchChecked] = useState(false);
  const bodyRowCount = Math.max(0, tableDemo.rowCount - 1);

  const checkedCount = useMemo(() => {
    let c = 0;
    for (let i = 0; i < bodyRowCount; i += 1) if (tableDemo.checkedByBodyRow[i]) c += 1;
    return c;
  }, [bodyRowCount, tableDemo.checkedByBodyRow]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const batchItems = useMemo<OverflowActionItem[]>(
    () => [
      { key: 'batch-edit', label: '批量编辑', icon: 'edit', type: 'primary', onClick: () => message.info('点击：批量编辑') },
      { key: 'batch-copy', label: '批量复制', icon: 'file-copy', onClick: () => message.info('点击：批量复制') },
      { key: 'batch-delete', label: '批量删除', icon: 'delete', danger: true, onClick: () => message.info('点击：批量删除') },
    ],
    [],
  );

  const handleBatchCheckedChange = (next: boolean) => {
    setBatchChecked(next);
    tableDemo.setCheckedByBodyRow((prev) => {
      const nextMap: Record<number, boolean> = { ...prev };
      for (let i = 0; i < bodyRowCount; i += 1) nextMap[i] = next;
      return nextMap;
    });
  };

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>ListPageShell 列表页串联</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        本例将业务组件按常见列表页顺序串联：`SwitchTabs` + `FilterGroup` + `OperationBar(table)` + `BizTable` + `OperationBar(batch)`。
        用于验证区块级复用与组件间视觉/间距一致。
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section>
          <div style={pageBoxStyle}>
            <div style={{ background: vcTokens.color.neutral.background.container, padding: 0 }}>
              <SwitchTabs
                items={storeItems}
                activeKey={storeActiveKey}
                onChange={handleStoreChange}
                showIcon
                showPanel={false}
              />
            </div>
          </div>
        </section>

        <section>
          <div style={pageBoxStyle}>
            <FilterGroup
              fields={filterFields}
              value={filterValue}
              onChange={setFilterValue}
              onSearch={() => message.info(`查询：${JSON.stringify(filterValue)}`)}
              onReset={() => setFilterValue({})}
            />
          </div>
        </section>

        <section>
          <div style={pageBoxStyle}>
            <OperationBar
              style={{ borderBottom: 'none' }}
              left={
                <Segmented
                  options={stateItems.map((i) => i.key)}
                  value={opSegValue}
                  onChange={(v) => {
                    const next = String(v);
                    setOpSegValue(next);
                    setStateActiveKey(next);
                  }}
                />
              }
              right={
                <div style={{ minWidth: 0, width: '100%' }}>
                  <OverflowActions items={actionItems} iconOnlyMore align="right" />
                </div>
              }
            />
          </div>
        </section>

        <section>
          <div style={pageBoxStyle}>
            <TableAreaTableInstance {...tableDemo} />
          </div>
        </section>

        <section>
          <div style={pageBoxStyle}>
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
              <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 auto' }}>
                <Checkbox
                  checked={checkedCount > 0 && checkedCount === bodyRowCount}
                  indeterminate={checkedCount > 0 && checkedCount < bodyRowCount}
                  onChange={(e) => handleBatchCheckedChange(e.target.checked)}
                >
                  已选 {checkedCount} 条
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
      </div>
    </>
  );
}

