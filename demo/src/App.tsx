import React, { useState, useCallback, useEffect } from 'react';
import { VcConfigProvider, vcTokens } from 'vc-design';
import { navGroups } from './navConfig';
import { DemoContent } from './demos';

const SIDEBAR_WIDTH = 220;

const allNavKeys = new Set(navGroups.flatMap((g) => g.items.map((i) => i.key)));

function getKeyFromHash(): string {
  const hash = window.location.hash.slice(1).replace(/^\/+/, '').trim();
  return hash && allNavKeys.has(hash) ? hash : 'overview';
}

export default function App() {
  const [selectedKey, setSelectedKey] = useState(getKeyFromHash);
  const resolvedSelectedKey = allNavKeys.has(selectedKey) ? selectedKey : 'overview';

  const syncFromHash = useCallback(() => {
    setSelectedKey(getKeyFromHash());
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [syncFromHash]);

  useEffect(() => {
    if (allNavKeys.has(selectedKey)) {
      return;
    }
    setSelectedKey('overview');
    window.location.hash = 'overview';
  }, [selectedKey]);

  const handleSelect = useCallback((key: string) => {
    setSelectedKey(key);
    window.location.hash = key;
  }, []);

  /** VTable：主栏不滚动，仅表格内滚动；需固定高度链才能 flex 吃满剩余视口 */
  const mainContentFillViewport = resolvedSelectedKey === 'vtable';

  return (
    <VcConfigProvider>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          background: vcTokens.color.neutral.background.layout,
        }}
      >
        {/* 左侧导航：固定高度内独立滚动 */}
        <aside
          style={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            minHeight: 0,
            background: vcTokens.color.neutral.background.container,
            borderRight: `1px solid ${vcTokens.color.neutral.border.secondary}`,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '16px 16px 12px',
              borderBottom: `1px solid ${vcTokens.color.neutral.border.secondary}`,
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            vc-design
          </div>
          <nav style={{ padding: '8px 0' }}>
            {navGroups.map((group) => (
              <div key={group.category || 'overview'}>
                {group.category ? (
                  <div
                    style={{
                      padding: '8px 16px 4px',
                      fontSize: 12,
                      color: vcTokens.color.neutral.text.description,
                      fontWeight: 500,
                    }}
                  >
                    {group.category}
                  </div>
                ) : null}
                {group.items.map((item) => {
                  const isSelected = resolvedSelectedKey === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelect(item.key)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 16px',
                        border: 'none',
                        background: isSelected ? vcTokens.color.primary.bg : 'transparent',
                        color: isSelected ? vcTokens.color.primary.text : vcTokens.color.neutral.text.default,
                        fontSize: 14,
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = vcTokens.color.neutral.fill.secondary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* 主内容区：固定高度内独立滚动 */}
        <main
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: mainContentFillViewport ? 'hidden' : 'auto',
            background: vcTokens.color.neutral.background.layout,
          }}
        >
          <div
            style={{
              padding: 24,
              boxSizing: 'border-box',
              ...(mainContentFillViewport
                ? {
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    overflow: 'hidden',
                  }
                : {}),
              maxWidth:
                resolvedSelectedKey === 'dispatch-filter-area' ||
                resolvedSelectedKey === 'switch-area' ||
                resolvedSelectedKey === 'list-page-shell'
                  ? 1440
                  : undefined,
            }}
          >
            <DemoContent selectedKey={resolvedSelectedKey} />
          </div>
        </main>
      </div>
    </VcConfigProvider>
  );
}
