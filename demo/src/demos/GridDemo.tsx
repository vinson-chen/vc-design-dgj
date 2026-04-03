import React from 'react';
import { Row, Col, vcTokens } from 'vc-design';

function Block({ children, label }: { children?: React.ReactNode; label?: string }) {
  return (
    <div
      style={{
        background: vcTokens.color.primary.default,
        color: '#fff',
        padding: '12px 16px',
        borderRadius: vcTokens.style.borderRadius.sm,
        minHeight: 48,
        textAlign: 'center',
      }}
    >
      {label != null ? label : children}
    </div>
  );
}

export default function GridDemo() {
  return (
    <>
      <h1 style={{ marginBottom: 8, fontWeight: 600 }}>Grid 栅格</h1>
      <p style={{ color: vcTokens.color.neutral.text.description, marginBottom: 24 }}>
        24 栅格系统，基于 Row/Col，支持间隔、偏移、排序与响应式。规范见 docs/grid-spec.md。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          基础栅格
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Row>
            <Col span={12}><Block label="col-12" /></Col>
            <Col span={12}><Block label="col-12" /></Col>
          </Row>
          <Row style={{ marginTop: 16 }}>
            <Col span={8}><Block label="col-8" /></Col>
            <Col span={8}><Block label="col-8" /></Col>
            <Col span={8}><Block label="col-8" /></Col>
          </Row>
          <Row style={{ marginTop: 16 }}>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
          </Row>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          区块间隔（gutter）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Row gutter={16}>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
          </Row>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          左右偏移（offset）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Row>
            <Col span={6} offset={6}><Block label="col-6 offset-6" /></Col>
            <Col span={6}><Block label="col-6" /></Col>
          </Row>
          <Row style={{ marginTop: 16 }}>
            <Col span={12} offset={6}><Block label="col-12 offset-6" /></Col>
          </Row>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          栅格排序（push / pull）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Row>
            <Col span={18} push={6}><Block label="col-18 push-6" /></Col>
            <Col span={6} pull={18}><Block label="col-6 pull-18" /></Col>
          </Row>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          排版（justify）与对齐（align）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Row justify="center" style={{ marginBottom: 16 }}>
            <Col span={4}><Block label="col-4" /></Col>
            <Col span={4}><Block label="col-4" /></Col>
            <Col span={4}><Block label="col-4" /></Col>
            <Col span={4}><Block label="col-4" /></Col>
          </Row>
          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col span={4}><Block label="col-4" /></Col>
            <Col span={4}><Block label="col-4" /></Col>
            <Col span={4}><Block label="col-4" /></Col>
            <Col span={4}><Block label="col-4" /></Col>
          </Row>
          <Row align="middle" gutter={8}>
            <Col span={4}><Block label="col-4" /></Col>
            <Col span={4}><Block label="col-4" /></Col>
            <Col span={4}><Block label="col-4" /></Col>
            <Col span={4}><Block label="col-4" /></Col>
          </Row>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          排序（order）
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Row>
            <Col span={6} order={4}><Block label="1 order-4" /></Col>
            <Col span={6} order={3}><Block label="2 order-3" /></Col>
            <Col span={6} order={2}><Block label="3 order-2" /></Col>
            <Col span={6} order={1}><Block label="4 order-1" /></Col>
          </Row>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12, color: vcTokens.color.neutral.text.label }}>
          响应式布局
        </h2>
        <div
          style={{
            background: vcTokens.color.neutral.background.layout,
            borderRadius: vcTokens.style.borderRadius.lg,
            padding: 24,
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Block label="Col" />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Block label="Col" />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Block label="Col" />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Block label="Col" />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Block label="Col" />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Block label="Col" />
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
}
