import React, { useState } from 'react';
import type { TableColumnsType } from 'antd';
import { Table, Space, Button, vcTokens } from 'vc-design';

interface RecordType {
  key: string;
  name: string;
  age: number;
  address: string;
}

const data: RecordType[] = [
  { key: '1', name: '张三', age: 32, address: '西湖区湖底公园1号' },
  { key: '2', name: '李四', age: 28, address: '滨江区网商路699号' },
  { key: '3', name: '王五', age: 42, address: '西湖区黄龙时代广场' },
];

export default function TableDemo() {
  const [loading, setLoading] = useState(false);

  const columns: TableColumnsType<RecordType> = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '年龄', dataIndex: 'age', key: 'age', sorter: (a, b) => a.age - b.age },
    { title: '住址', dataIndex: 'address', key: 'address' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small">
            编辑
          </Button>
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Table 表格</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        展示行列数据，支持排序、分页与自定义列。规范见 docs/table-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基本
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Table columns={columns} dataSource={data} rowKey="key" />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          边框、尺寸与分页
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Table
              columns={columns}
              dataSource={data}
              rowKey="key"
              bordered
              size="small"
              pagination={{ pageSize: 2 }}
            />
            <Table
              columns={columns.slice(0, 3)}
              dataSource={data}
              rowKey="key"
              loading={loading}
              pagination={false}
            />
            <Button onClick={() => setLoading(!loading)}>
              {loading ? '取消加载' : '加载中'}
            </Button>
          </Space>
        </div>
      </section>
    </>
  );
}
