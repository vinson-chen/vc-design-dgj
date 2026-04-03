import React, { useState } from 'react';
import { Card, Space, Row, Col, Avatar, VcIcon, vcTokens } from 'vc-design';

const coverImg = 'https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png';
const avatarUrl = 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png';

export default function CardDemo() {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Card 卡片</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        通用卡片容器，可承载标题、内容、封面、操作与页签。规范见 docs/card-spec.md。
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
          <Space size="middle" wrap>
            <Card title="卡片标题" style={{ width: 300 }}>
              <p>卡片内容</p>
              <p>卡片内容</p>
              <p>卡片内容</p>
            </Card>
            <Card title="带操作" extra={<a href="#">更多</a>} style={{ width: 300 }}>
              卡片内容
            </Card>
            <Card
              title="底部操作"
              actions={[
                <span key="1"><VcIcon type="setting" /> 设置</span>,
                <span key="2"><VcIcon type="edit" /> 编辑</span>,
                <span key="3"><VcIcon type="add" /> 更多</span>,
              ]}
              style={{ width: 300 }}
            >
              卡片内容
            </Card>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          无边框、简洁、尺寸与悬停
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="middle" wrap>
            <Card variant="borderless" style={{ width: 280 }}>
              无边框卡片内容
            </Card>
            <Card size="small" title="小尺寸" style={{ width: 280 }}>
              小号内边距
            </Card>
            <Card hoverable title="悬停浮起" style={{ width: 280 }}>
              鼠标移入时浮起
            </Card>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          封面与 Card.Meta
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space size="middle" wrap>
            <Card cover={<img alt="封面" src={coverImg} style={{ height: 160, objectFit: 'cover' }} />} style={{ width: 280 }}>
              <Card.Meta
                avatar={<Avatar src={avatarUrl} />}
                title="卡片标题"
                description="卡片描述信息"
              />
            </Card>
            <Card style={{ width: 280 }}>
              <Card.Meta
                avatar={<Avatar icon={<VcIcon type="user" />} />}
                title="仅 Meta"
                description="无封面，仅头像+标题+描述"
              />
            </Card>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          带页签与加载
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card
              title="页签卡片"
              activeTabKey={activeTab}
              onTabChange={setActiveTab}
              tabList={[
                { key: 'tab1', label: '页签一' },
                { key: 'tab2', label: '页签二' },
              ]}
              style={{ maxWidth: 400 }}
            >
              {activeTab === 'tab1' && <p>页签一内容</p>}
              {activeTab === 'tab2' && <p>页签二内容</p>}
            </Card>
            <Card title="加载中" loading style={{ maxWidth: 400 }}>
              内容加载完成后显示
            </Card>
          </Space>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          栅格与 Card.Grid
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Card title="概览一">内容</Card>
            </Col>
            <Col span={8}>
              <Card title="概览二">内容</Card>
            </Col>
            <Col span={8}>
              <Card title="概览三">内容</Card>
            </Col>
          </Row>
          <Card title="网格内嵌" style={{ marginTop: 16 }}>
            <Card.Grid style={{ width: '33.33%', textAlign: 'center' }}>区块1</Card.Grid>
            <Card.Grid style={{ width: '33.33%', textAlign: 'center' }}>区块2</Card.Grid>
            <Card.Grid style={{ width: '33.33%', textAlign: 'center' }}>区块3</Card.Grid>
          </Card>
        </div>
      </section>
    </>
  );
}
