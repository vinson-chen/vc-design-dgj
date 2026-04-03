import React, { useState } from 'react';
import { Button, VcIcon } from 'vc-design';
import { DISPATCH_SIDEBAR_MENU_GROUPS } from './menu/dispatchSidebarMenuData';
import { figmaMenuIconNames, resolveMenuIconFromFigma } from './menu/figmaIconResolver';
import { useMenuOpenMap } from './menu/useMenuOpenMap';
import './DispatchSiderMenu.css';

export default function DispatchSiderMenu() {
  const [activeItem, setActiveItem] = useState('self-goods');
  const [collapsed, setCollapsed] = useState(false);
  const { openedMap, toggle: toggleGroup } = useMenuOpenMap(DISPATCH_SIDEBAR_MENU_GROUPS);

  return (
    <aside className={`dispatch-menu${collapsed ? ' is-collapsed' : ''}`}>
      <div className="dispatch-menu__top">
        <div className="dispatch-menu__logo">
          <span className="dispatch-menu__logo-badge">VC-logo</span>
        </div>
        <div className="dispatch-menu__top-action">
          <Button
            type="text"
            icon={
              <VcIcon
                type={resolveMenuIconFromFigma(
                  collapsed ? figmaMenuIconNames.topActionExpand : figmaMenuIconNames.topActionCollapse,
                )}
              />
            }
            onClick={() => setCollapsed((prev) => !prev)}
          />
        </div>
      </div>

      <div className="dispatch-menu__body">
        {DISPATCH_SIDEBAR_MENU_GROUPS.map((group) => {
          const isOpen = openedMap[group.key];
          return (
            <section key={group.key}>
              <button
                type="button"
                className={`dispatch-menu__group-head${isOpen ? ' is-open' : ''}`}
                onClick={() => toggleGroup(group.key)}
              >
                <VcIcon type={resolveMenuIconFromFigma(group.groupIconName)} />
                <span>{collapsed ? group.title.slice(0, 2) : group.title}</span>
                <span className="dispatch-menu__group-action">
                  <VcIcon
                    type={resolveMenuIconFromFigma(
                      isOpen ? figmaMenuIconNames.groupActionOpen : figmaMenuIconNames.groupActionClose,
                    )}
                    fontSize={16}
                  />
                </span>
              </button>

              {isOpen && group.items.length > 0 ? (
                <div className="dispatch-menu__items">
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`dispatch-menu__item${activeItem === item.key ? ' is-active' : ''}`}
                      onClick={() => setActiveItem(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
