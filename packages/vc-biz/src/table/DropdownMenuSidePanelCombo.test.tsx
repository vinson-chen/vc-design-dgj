import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { Button } from 'antd';
import { DropdownMenuSidePanelCombo } from './DropdownMenuSidePanelCombo';

/**
 * 手测清单（SubMenu 独立子弹层）：
 * - CustomTabs：主菜单打开后悬停「字段配置」；贴视口底/右时子弹层由 rc-menu 自动 flip。
 * - 表头列「编辑列」：主菜单用 click 展开子菜单；`closeSidePanelOnOverlayMouseLeave={false}` 时离开主浮层不因悬停关侧栏。
 * - 主菜单根浮层不因子弹层展开而改变宽高/位置。
 */
describe('DropdownMenuSidePanelCombo', () => {
  it('injects a submenu for the side panel trigger key', async () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      const [subOpen, setSubOpen] = useState(true);
      return (
        <ConfigProvider>
          <DropdownMenuSidePanelCombo
            open={open}
            onOpenChange={(o) => setOpen(o)}
            menuItems={[
              { key: 'a', label: 'A' },
              { key: 'panel', label: 'Panel row', className: 'vc-biz-dropdown-side-panel-trigger-row' },
            ]}
            onMenuClick={vi.fn()}
            sidePanelTriggerKey="panel"
            sidePanelOpen={subOpen}
            onSidePanelOpenChange={setSubOpen}
            showSidePanel
            renderSidePanel={() => <div data-testid="side-slot">Side</div>}
            sidePanelTriggerRowClassName="vc-biz-dropdown-side-panel-trigger-row"
          >
            <Button type="primary">Trigger</Button>
          </DropdownMenuSidePanelCombo>
        </ConfigProvider>
      );
    }
    render(<Harness />);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('side-slot')).toBeInTheDocument();
    });
  });

  it('keeps side panel open when clicking trigger row while expanded', async () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      const [subOpen, setSubOpen] = useState(true);
      return (
        <ConfigProvider>
          <DropdownMenuSidePanelCombo
            open={open}
            onOpenChange={(o) => setOpen(o)}
            menuItems={[
              { key: 'a', label: 'A' },
              { key: 'panel', label: 'Panel row', className: 'vc-biz-dropdown-side-panel-trigger-row' },
            ]}
            onMenuClick={vi.fn()}
            sidePanelTriggerKey="panel"
            sidePanelOpen={subOpen}
            onSidePanelOpenChange={setSubOpen}
            showSidePanel
            renderSidePanel={() => <div data-testid="side-slot">Side</div>}
            sidePanelTriggerRowClassName="vc-biz-dropdown-side-panel-trigger-row"
          >
            <Button type="primary">Trigger</Button>
          </DropdownMenuSidePanelCombo>
        </ConfigProvider>
      );
    }

    render(<Harness />);

    const triggerRow = await screen.findByText('Panel row');
    const submenuTitle = triggerRow.closest(
      '.ant-menu-submenu-title, .ant-dropdown-menu-submenu-title',
    ) as HTMLElement | null;
    expect(submenuTitle).not.toBeNull();
    expect(submenuTitle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(triggerRow);

    await waitFor(() => {
      expect(submenuTitle).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByTestId('side-slot')).toBeInTheDocument();
    });
  });

  it('replacePrimaryWithSidePanel: opening side closes primary menu but keeps overlay', async () => {
    function Harness() {
      const [mainOpen, setMainOpen] = useState(true);
      const [subOpen, setSubOpen] = useState(false);
      return (
        <ConfigProvider>
          <DropdownMenuSidePanelCombo
            open={mainOpen}
            onOpenChange={(o, info) => {
              setMainOpen(o);
              if (o) setSubOpen(false);
              else if (!info?.keepSidePanel) setSubOpen(false);
            }}
            menuItems={[
              { key: 'a', label: 'A' },
              { key: 'panel', label: 'Panel row', className: 'vc-biz-dropdown-side-panel-trigger-row' },
            ]}
            onMenuClick={vi.fn()}
            sidePanelTriggerKey="panel"
            sidePanelOpen={subOpen}
            onSidePanelOpenChange={setSubOpen}
            showSidePanel
            replacePrimaryWithSidePanel
            subMenuTriggerAction="click"
            renderSidePanel={() => <div data-testid="side-slot">Side</div>}
            sidePanelTriggerRowClassName="vc-biz-dropdown-side-panel-trigger-row"
          >
            <Button type="primary">Trigger</Button>
          </DropdownMenuSidePanelCombo>
        </ConfigProvider>
      );
    }

    render(<Harness />);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    const triggerRow = await screen.findByText('Panel row');
    fireEvent.click(triggerRow);

    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
      expect(screen.getByTestId('side-slot')).toBeInTheDocument();
    });
  });
});
