import React, { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Button, Checkbox, Input, Pagination, Segmented, VcIcon, vcTokens, message } from 'vc-design';
import {
  VFilterGroup,
  type VFilterFieldConfig,
  VSwitchTabs,
  type VSwitchTabItemData,
  type VOverflowActionItem,
  VOperationBar,
  VOverflowActions,
  TableAreaTableInstance,
  useTableAreaDemoState,
  VMenu,
} from 'vc-biz';

export default function Overview() {
  // 筛选区状态（假数据）
  const [filterValue, setFilterValue] = useState<Record<string, unknown>>({});

  const filterFields = useMemo<VFilterFieldConfig[]>(
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

  const storeItems = useMemo<VSwitchTabItemData[]>(
    () => [
      { key: '精选平台', label: '精选平台', icon: 'otherstore.jpg' },
      { key: '抖音', label: '抖音', icon: 'douyin.jpg' },
      { key: '拼多多', label: '拼多多', icon: 'pdd.jpg' },
      { key: '京东', label: '京东', icon: 'jingdong.jpg' },
      { key: '更多平台', label: '更多平台', icon: 'add.svg' },
    ],
    [],
  );

  const stateItems = useMemo<VSwitchTabItemData[]>(
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

  const actionItems = useMemo<VOverflowActionItem[]>(
    () => [
      { key: 'export', label: '导出', icon: 'cloud-upload', onClick: () => message.info('点击：导出') },
      { key: 'setting', label: '设置', icon: 'setting', onClick: () => message.info('点击：设置') },
    ],
    [],
  );

  const topBarItems = useMemo<VOverflowActionItem[]>(
    () => [
      { key: 'notify', label: '通知', icon: 'notification', type: 'text', onClick: () => message.info('点击：通知') },
      { key: 'complaint', label: '投诉', icon: 'mail', type: 'text', onClick: () => message.info('点击：投诉') },
      { key: 'service', label: '客服', icon: 'service', type: 'text', onClick: () => message.info('点击：客服') },
      { key: 'order', label: '订购', icon: 'rocket', type: 'text', onClick: () => message.info('点击：订购') },
      { key: 'phone', label: '15014050905', icon: 'user', type: 'text', onClick: () => message.info('点击：电话') },
    ],
    [],
  );

  const tableDemo = useTableAreaDemoState();
  const bodyRowCount = Math.max(0, tableDemo.rowCount - 1);

  // 动态计算表格高度
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const filterAreaRef = useRef<HTMLDivElement | null>(null);
  const opBarRef = useRef<HTMLDivElement | null>(null);
  const [tableBodyScrollMaxHeight, setTableBodyScrollMaxHeight] = useState(520);

  // 固定消耗 = scrollArea padding(16+16) + outer gap(16) + card padding(12+12) + card gap(12) = 84px
  const HEIGHT_OVERHEAD = 84;

  useLayoutEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    const calculateHeight = () => {
      const filterH = filterAreaRef.current?.offsetHeight ?? 0;
      const opBarH = opBarRef.current?.offsetHeight ?? 0;
      const scrollAreaHeight = el.clientHeight;
      const calculated = scrollAreaHeight - HEIGHT_OVERHEAD - filterH - opBarH;
      setTableBodyScrollMaxHeight(Math.max(200, calculated));
    };

    calculateHeight();

    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => calculateHeight());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const checkedCount = useSyncExternalStore(
    (cb) => tableDemo.bodyRowSelectionStore.subscribeSelection(cb),
    () => tableDemo.bodyRowSelectionStore.getCheckedCount(),
    () => 0
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const batchItems = useMemo<VOverflowActionItem[]>(
    () => [
      { key: 'batch-edit', label: '批量编辑', icon: 'edit', type: 'primary', onClick: () => message.info('点击：批量编辑') },
      { key: 'batch-copy', label: '批量复制', icon: 'file-copy', onClick: () => message.info('点击：批量复制') },
      { key: 'batch-delete', label: '批量删除', icon: 'delete', danger: true, onClick: () => message.info('点击：批量删除') },
    ],
    [],
  );

  return (
    <div
      style={{
        background: vcTokens.color.neutral.background.layout,
        border: `1px solid ${vcTokens.color.neutral.border.default}`,
        borderRadius: vcTokens.style.borderRadius.lg,
        display: 'flex',
        height: 'calc(100vh - 48px)',
        overflow: 'hidden',
      }}
    >
        {/* 左列：导航区 */}
        <div style={{ flexShrink: 0, overflowY: 'auto', background: 'rgb(66, 74, 87)', alignSelf: 'stretch' }}>
          <VMenu />
        </div>

        {/* 右列：内容区 */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* 顶部区域：滚动时整体固定 */}
          <section style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <div style={{ background: vcTokens.color.neutral.background.layout }}>
              <VOperationBar
                left={
                  <Input.Search
                    placeholder="请输入"
                    style={{ width: 240 }}
                    allowClear
                    enterButton={<Button icon={<VcIcon type="search" fontSize={16} />} />}
                    onSearch={(v) => message.info(`搜索：${v || '(空)'}`)}
                />
              }
              right={
                <div style={{ minWidth: 0, width: '100%' }}>
                  <VOverflowActions items={topBarItems} iconOnlyMore />
                </div>
              }
              style={{ width: '100%' }}
            />
            <div style={{ background: vcTokens.color.neutral.background.container }}>
              <VSwitchTabs
                items={storeItems}
                activeKey={storeActiveKey}
                onChange={handleStoreChange}
                showIcon
                showPanel={false}
              />
            </div>
          </div>
          </section>

          {/* 中间可滚动区域 */}
          <div ref={scrollAreaRef} style={{ flex: 1, minWidth: 0, overflowY: 'auto', overscrollBehavior: 'none', display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
            <div ref={filterAreaRef}>
              <VFilterGroup
                fields={filterFields}
                value={filterValue}
                onChange={setFilterValue}
                onSearch={() => message.info(`查询：${JSON.stringify(filterValue)}`)}
                onReset={() => setFilterValue({})}
                style={{ border: 'none', borderRadius: 8, padding: 12, paddingBottom: 12 }}
              />
            </div>

            <div style={{ background: vcTokens.color.neutral.background.container, borderRadius: vcTokens.style.borderRadius.lg, padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div ref={opBarRef}>
                <VOperationBar
                  style={{ borderBottom: 'none', background: 'transparent', padding: 0, minHeight: 'unset' }}
                  left={
                    <Segmented
                      options={stateItems.map((i) => i.key)}
                      value={opSegValue}
                      onChange={(next) => {
                        setOpSegValue(String(next));
                        setStateActiveKey(String(next));
                      }}
                  />
                }
                right={
                  <div style={{ minWidth: 0, width: '100%' }}>
                    <VOverflowActions
                      items={actionItems}
                      maxVisibleWithMore={2}
                      iconOnlyMore
                      align="right"
                    />
                  </div>
                }
              />
              </div>
                <TableAreaTableInstance {...tableDemo} bodyScrollMaxHeight={tableBodyScrollMaxHeight} enablePagination={false} />
              </div>
          </div>

          {/* 底部批量操作栏：固定在页面容器底部 */}
          <section style={{ position: 'sticky', bottom: 0, zIndex: 10, background: vcTokens.color.neutral.background.container, boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)' }}>
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
              }}
            >
              <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 auto' }}>
                <Checkbox
                  checked={checkedCount > 0 && checkedCount === bodyRowCount}
                  indeterminate={checkedCount > 0 && checkedCount < bodyRowCount}
                  onChange={(e) => tableDemo.bodyRowSelectionStore.toggleAll(e.target.checked)}
                >
                  已选 {checkedCount} 条
                </Checkbox>
                <div style={{ minWidth: 0, flex: '0 1 auto' }}>
                  <VOverflowActions
                    items={batchItems}
                    maxVisibleWithMore={4}
                    iconOnlyMore
                    align="left"
                  />
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
          </section>
        </div>
      </div>
  );
}