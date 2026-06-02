import React, { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { Pagination, Segmented, vcTokens, message } from 'vc-design';
import {
  VFilterArea,
  type VFilterFieldConfig,
  VSwitchTabs,
  type VSwitchTabItemData,
  VTableOperationBar,
  VBatchOperationBar,
  type VOverflowActionItem,
  TableAreaTableInstance,
  useTableAreaDemoState,
  VInput,
  type VInputAttachedFile,
  type VInputLlmOption,
} from 'vc-biz';

const VCELL_COMP_LLM: VInputLlmOption[] = [
  { value: 'qwen', label: 'Qwen' },
  { value: 'deepseek', label: 'DeepSeek', disabled: true },
  { value: 'automation_rules', label: '自动化规则', disabled: true },
];

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

  const tableDemo = useTableAreaDemoState();
  const { importExcelFromFile } = tableDemo;
  const bodyRowCount = Math.max(0, tableDemo.rowCount - 1);

  const [vcellDraft, setVcellDraft] = useState('');
  const [vcellExcel, setVcellExcel] = useState<VInputAttachedFile[]>([]);
  const [vcellLlm, setVcellLlm] = useState('qwen');

  const handleVcellSend = useCallback(async () => {
    const text = vcellDraft.trim();
    const files = vcellExcel;
    if (files.length > 0) {
      for (const a of files) {
        await importExcelFromFile(a.file);
      }
      setVcellExcel([]);
    }
    if (text) {
      void message.info(
        `已发送（演示）：${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`,
      );
      setVcellDraft('');
    }
  }, [importExcelFromFile, vcellDraft, vcellExcel]);

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

  const handleBatchCheckedChange = (next: boolean) => {
    tableDemo.bodyRowSelectionStore.toggleAll(next);
  };

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600, fontSize: 18 }}>组件总览</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        vc-design 基于 Ant Design 5.x，通过 VC Tokens（vcTokens）统一颜色、间距、圆角与字体。左侧导航可切换到不同组件进行规范检验。
      </p>

      <div
        style={{
          background: vcTokens.color.neutral.background.layout,
          borderRadius: vcTokens.style.borderRadius.lg,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <section>
          <div style={{ background: vcTokens.color.neutral.background.container, borderRadius: vcTokens.style.borderRadius.lg }}>
            <VSwitchTabs
              items={storeItems}
              activeKey={storeActiveKey}
              onChange={handleStoreChange}
              showIcon
              showPanel={false}
            />
          </div>
        </section>

        <section>
          <VFilterArea
            fields={filterFields}
            value={filterValue}
            onChange={setFilterValue}
            onSearch={() => message.info(`查询：${JSON.stringify(filterValue)}`)}
            onReset={() => setFilterValue({})}
          />
        </section>

        <section>
          <div style={{ background: vcTokens.color.neutral.background.container, borderRadius: vcTokens.style.borderRadius.lg }}>
            <VTableOperationBar
              segmentedOptions={stateItems.map((i) => i.key)}
              value={opSegValue}
              onChange={(next) => {
                setOpSegValue(next);
                setStateActiveKey(next);
              }}
              primaryItems={actionItems}
              maxVisibleWithMore={2}
            />
          </div>
        </section>

        <section>
          <div style={{ background: vcTokens.color.neutral.background.container, borderRadius: vcTokens.style.borderRadius.lg }}>
            <div style={{ padding: 16 }}>
              <VInput
                style={{ maxWidth: 440 }}
                value={vcellDraft}
                onChange={setVcellDraft}
                onSend={handleVcellSend}
                placeholder="输入指令，Shift+Enter 换行，Enter 发送；可附加 Excel 后点发送导入下方表格"
                llmOptions={VCELL_COMP_LLM}
                llmValue={vcellLlm}
                onLlmChange={setVcellLlm}
                attachedFiles={vcellExcel}
                onAttachedFilesChange={setVcellExcel}
              />
            </div>
            <TableAreaTableInstance {...tableDemo} />
          </div>
        </section>

        <section>
          <div style={{ background: vcTokens.color.neutral.background.container, borderRadius: vcTokens.style.borderRadius.lg }}>
            <VBatchOperationBar
              checked={checkedCount > 0 && checkedCount === bodyRowCount}
              indeterminate={checkedCount > 0 && checkedCount < bodyRowCount}
              selectedCount={checkedCount}
              onCheckedChange={handleBatchCheckedChange}
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
          </div>
        </section>
      </div>
    </>
  );
}