import React, { useState } from 'react';
import { Tree, vcTokens, VcIcon } from 'vc-design';
import type { TreeDataNode } from 'antd';

const treeData: TreeDataNode[] = [
  {
    title: '一级 1',
    key: '1',
    children: [
      {
        title: '二级 1-1',
        key: '1-1',
        children: [
          { title: '三级 1-1-1', key: '1-1-1' },
          { title: '三级 1-1-2', key: '1-1-2' },
        ],
      },
      { title: '二级 1-2', key: '1-2' },
    ],
  },
  {
    title: '一级 2',
    key: '2',
    children: [
      { title: '二级 2-1', key: '2-1' },
      { title: '二级 2-2', key: '2-2' },
    ],
  },
];

const treeDataWithIcon: TreeDataNode[] = [
  {
    title: '文档',
    key: 'doc',
    icon: <VcIcon type="file" />,
    children: [
      { title: '说明.md', key: 'doc-readme', isLeaf: true, icon: <VcIcon type="file" /> },
      { title: '规范', key: 'doc-spec', isLeaf: true, icon: <VcIcon type="file" /> },
    ],
  },
  {
    title: '组件',
    key: 'comp',
    icon: <VcIcon type="appstore" />,
    children: [
      { title: 'Button', key: 'comp-btn', isLeaf: true },
      { title: 'Input', key: 'comp-input', isLeaf: true },
    ],
  },
];

export default function TreeDemo() {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(['1-1']);
  const [halfCheckedKeys, setHalfCheckedKeys] = useState<React.Key[]>([]);

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Tree 树形控件</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        展示层级数据，支持展开、选中、勾选与自定义图标。规范见 docs/tree-spec.md。
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
          <Tree
            treeData={treeData}
            defaultExpandAll
            selectedKeys={selectedKeys}
            onSelect={(_, { selectedKeys: keys }) => setSelectedKeys(keys)}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带连接线（showLine）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Tree treeData={treeData} showLine defaultExpandAll />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          可勾选（checkable）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Tree
            treeData={treeData}
            checkable
            defaultExpandAll
            checkedKeys={{ checked: checkedKeys, halfChecked: halfCheckedKeys }}
            onCheck={(checked, info) => {
              const keys = (Array.isArray(checked) ? checked : checked.checked) as React.Key[];
              setCheckedKeys(keys);
              setHalfCheckedKeys((info.halfCheckedKeys ?? []) as React.Key[]);
            }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          自定义图标
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Tree treeData={treeDataWithIcon} showIcon defaultExpandAll />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          目录树（DirectoryTree）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Tree.DirectoryTree treeData={treeData} defaultExpandAll />
        </div>
      </section>
    </>
  );
}
