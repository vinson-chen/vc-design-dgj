import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, vcTokens } from 'vc-design';
import {
  VCELL_ROW_DRAG_COLUMN_ID,
  VcellTable,
  type ColumnDef,
  type VcellTableHandle,
} from 'vc-biz';

type Row = {
  id: string;
  name: string;
  age: number | null;
  role: string;
  email: string;
  amount: number | null;
};

function makeRows(n: number): Row[] {
  const roles = ['开发', '产品', '设计', '运营'];
  return Array.from({ length: n }, (_, i) => ({
    id: `r-${i}`,
    name: `成员 ${i + 1}`,
    age: 22 + (i % 15),
    role: roles[i % roles.length],
    email: `user${i + 1}@example.com`,
    amount: Math.round((i + 1) * 137.5 * 100) / 100,
  }));
}

const sectionBox: React.CSSProperties = {
  background: vcTokens.color.neutral.background.layout,
  borderRadius: vcTokens.style.borderRadius.lg,
  padding: 24,
};

export default function VcellTableDemo() {
  const [rowCount, setRowCount] = useState(80);
  const [data, setData] = useState(() => makeRows(80));
  const tableRef = useRef<VcellTableHandle<Row>>(null);

  const setRows = useCallback((n: number) => {
    setRowCount(n);
    setData(makeRows(n));
  }, []);

  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '姓名',
        size: 140,
        meta: { vcell: { cellType: 'text' } },
      },
      {
        accessorKey: 'age',
        header: '年龄',
        size: 88,
        meta: { vcell: { cellType: 'number' } },
      },
      {
        accessorKey: 'role',
        header: '岗位',
        size: 120,
        meta: {
          vcell: {
            cellType: 'select',
            selectOptions: [
              { label: '开发', value: '开发' },
              { label: '产品', value: '产品' },
              { label: '设计', value: '设计' },
              { label: '运营', value: '运营' },
            ],
          },
        },
      },
      {
        accessorKey: 'email',
        header: '邮箱',
        size: 220,
        meta: { vcell: { cellType: 'text' } },
      },
      {
        accessorKey: 'amount',
        header: '金额',
        size: 112,
        meta: { vcell: { cellType: 'number' } },
      },
    ],
    [],
  );

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>VcellTable 高自由度表格</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        基于 TanStack Table 的可配置数据表：列宽拖拽、列拖拽排序、列显示/隐藏、左侧固定（含行拖拽列）、
        行虚拟滚动、行拖拽排序、单元格编辑（文本/数字/下拉）、框选、键盘移动、复制/粘贴（TSV）、撤销/重做。
        与 <code>BizTable</code> 独立实现，互不影响。
      </p>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>行数</h2>
        <div style={sectionBox}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {[20, 80, 200, 2000].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRows(n)}
                style={{
                  padding: '6px 12px',
                  borderRadius: vcTokens.style.borderRadius.sm,
                  border: `1px solid ${vcTokens.color.neutral.border.default}`,
                  background:
                    rowCount === n
                      ? vcTokens.color.primary.bg
                      : vcTokens.color.neutral.background.container,
                  cursor: 'pointer',
                }}
              >
                {n} 行{n >= 500 ? '（虚拟滚动）' : ''}
              </button>
            ))}
            <Button size="small" onClick={() => tableRef.current?.undo()}>
              撤销（ref）
            </Button>
            <Button size="small" onClick={() => tableRef.current?.redo()}>
              重做（ref）
            </Button>
            <span style={{ color: vcTokens.color.neutral.text.description, fontSize: 12 }}>
              点击表格区域后可用快捷键 Ctrl+Z / Ctrl+Shift+Z
            </span>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>表格</h2>
        <div style={sectionBox}>
          <VcellTable<Row>
            ref={tableRef}
            data={data}
            columns={columns}
            getRowId={(r) => r.id}
            onDataChange={setData}
            scrollHeight={440}
            rowHeight={40}
            defaultColumnPinning={{ left: [VCELL_ROW_DRAG_COLUMN_ID, 'name'], right: ['amount'] }}
          />
        </div>
      </section>
    </>
  );
}
