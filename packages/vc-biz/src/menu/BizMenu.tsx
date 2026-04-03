import React, { useState } from 'react';
import { Button, VcIcon, vcTokens } from 'vc-design';
import BizMenuGroup from './BizMenuGroup';
import { DISPATCH_SIDEBAR_MENU_GROUPS } from './dispatchSidebarMenuData';
import { figmaMenuIconNames, resolveMenuIconFromFigma } from './figmaIconResolver';
import { useMenuOpenMap } from './useMenuOpenMap';

export default function BizMenu() {
  const [small, setSmall] = useState(false);
  const [activeItemKey, setActiveItemKey] = useState('self-goods');
  const { openedMap, toggle } = useMenuOpenMap(DISPATCH_SIDEBAR_MENU_GROUPS);

  return (
    <aside
      style={{
        width: small ? 48 : 180,
        minHeight: 800,
        background: vcTokens.color.menu.navBackground,
        borderRadius: 0,
        overflow: 'hidden',
        transition: 'width 0.2s ease',
      }}
    >
      <div
        style={{
          height: 48,
          display: 'grid',
          gridTemplateColumns: small ? '48px' : '1fr 48px',
          background: vcTokens.color.menu.topNavBackground,
          borderBottom: `1px solid ${vcTokens.color.menu.topNavBorder}`,
        }}
      >
        {!small ? (
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
            <span
              style={{
                width: 112,
                height: 32,
                borderRadius: 6,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: vcTokens.color.neutral.background.layout,
                fontSize: 12,
              }}
            >
              VC-logo
            </span>
          </div>
        ) : null}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button
            type="text"
            icon={
              <VcIcon
                type={resolveMenuIconFromFigma(
                  small ? figmaMenuIconNames.topActionExpand : figmaMenuIconNames.topActionCollapse,
                )}
              />
            }
            onClick={() => setSmall((prev) => !prev)}
          />
        </div>
      </div>

      {DISPATCH_SIDEBAR_MENU_GROUPS.map((group) => (
        <BizMenuGroup
          key={group.key}
          title={group.title}
          groupIconName={group.groupIconName}
          items={group.items}
          opened={Boolean(openedMap[group.key])}
          small={small}
          dark
          activeItemKey={activeItemKey}
          onToggle={() => toggle(group.key)}
          onSelectItem={setActiveItemKey}
        />
      ))}
    </aside>
  );
}
