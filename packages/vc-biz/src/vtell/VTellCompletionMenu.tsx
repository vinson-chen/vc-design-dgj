import { useMemo } from 'react';
import type { MenuProps } from 'antd';
import { Dropdown } from 'vc-design';
import type { VTellCompletionMenuProps } from './types';
import './VTellCompletionMenu.css';

const COMPLETION_MENU_CLASS = 'vc-biz-vtell-completion-menu';

/** L0 句式补全菜单组件 */
export function VTellCompletionMenu({
  visible,
  completions,
  highlightIndex,
  onHighlightChange,
  onPick,
  children,
}: VTellCompletionMenuProps & { children: React.ReactNode }) {
  // Menu items 配置
  const menuItems: MenuProps['items'] = useMemo(
    () =>
      completions.map((item, i) => ({
        key: item.key,
        label: item.label,
        onMouseEnter: () => onHighlightChange(i),
      })),
    [completions, onHighlightChange]
  );

  // Menu 点击回调
  const onClick: MenuProps['onClick'] = ({ key }) => {
    const item = completions.find((c) => c.key === key);
    if (item) onPick(item.label);
  };

  // 高亮选中项
  const selectedKeys = useMemo(() => {
    const item = completions[highlightIndex];
    return item ? [item.key] : [];
  }, [completions, highlightIndex]);

  return (
    <Dropdown
      trigger={[]}
      open={visible}
      overlayClassName={COMPLETION_MENU_CLASS}
      menu={{
        items: menuItems,
        selectable: true,
        selectedKeys,
        onClick,
      }}
      placement="topLeft"
    >
      {children}
    </Dropdown>
  );
}