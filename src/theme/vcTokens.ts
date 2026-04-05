export const vcTokens = {
  color: {
    primary: {
      bg: '#ECF6FF',
      bgHover: '#D7ECFF',
      border: '#D7ECFF',
      borderHover: '#B4DBFF',
      hover: '#39A0FF',
      default: '#0888FF',
      active: '#077AE5',
      textHover: '#39A0FF',
      text: '#0888FF',
      textActive: '#077AE5'
    },
    neutral: {
      background: {
        container: '#FFFFFF',
        elevated: '#FFFFFF',
        layout: '#F0F1F2',
        spotlight: 'rgba(0,0,0,0.7)',
        mask: 'rgba(0,0,0,0.5)',
        containerDisabled: 'rgba(0,0,0,0.05)',
        controlItemBgHover: 'rgba(0,0,0,0.05)',
        controlItemBgActive: '#ECF6FF',
        controlItemBgActiveHover: '#D7ECFF',
        controlItemBgActiveDisabled: 'rgba(0,0,0,0.1)'
      },
      fill: {
        default: 'rgba(0,0,0,0.1)',
        secondary: 'rgba(0,0,0,0.05)',
        tertiary: 'rgba(0,0,0,0.02)',
        /**
         * 与 `color.menu.itemSlotFill` 一致（Figma Menu 实例 menu_item 槽位 / colorFillDK）
         */
        dk: '#3B424E'
      },
      text: {
        default: 'rgba(0,0,0,0.9)',
        label: 'rgba(0,0,0,0.7)',
        description: 'rgba(0, 0, 0, 0.5)',
        placeholder: 'rgba(0,0,0,0.3)',
        disabled: 'rgba(0,0,0,0.3)',
        icon: 'rgba(0,0,0,0.5)',
        iconHover: 'rgba(0,0,0,0.7)',
        solid: '#FFFFFF'
      },
      border: {
        default: '#E1E2E4',
        secondary: '#F0F1F2',
        split: 'rgba(0,0,0,0.05)'
      }
    },
    /**
     * 侧栏 Menu：来自 Figma「Menu / menu 实例」解析的色值与变量语义。
     */
    menu: {
      /** 导航主栏背景 */
      navBackground: '#424A57',
      /** 顶栏（logo + 收起按钮行）背景 */
      topNavBackground: '#FFFFFF',
      /** 顶栏与菜单主体分割线 */
      topNavBorder: '#E1E2E4',
      /** 分组下子项区域槽背景（Figma：menu_item SLOT / colorFillDK） */
      itemSlotFill: '#3B424E',
      /** 暗色栏上次要文案、默认态图标（Figma 约 70% 白） */
      textSecondaryOnNav: 'rgba(255,255,255,0.7)',
      /** 暗色子项 hover 填充（Figma：10% 黑叠底） */
      itemHoverOverlayOnNav: 'rgba(0,0,0,0.1)'
    },
    success: {
      bg: '#F4F9ED',
      bgHover: '#E8F2DB',
      border: '#E8F2DB',
      borderHover: '#D5E6BC',
      hover: '#8FBD4C',
      default: '#73AC1F',
      active: '#679A1C',
      textHover: '#8FBD4C',
      text: '#73AC1F',
      textActive: '#679A1C'
    },
    warning: {
      bg: '#FEF6EB',
      bgHover: '#FDECD6',
      border: '#FDECD6',
      borderHover: '#FADCB3',
      hover: '#F4A335',
      default: '#F18C03',
      active: '#D87E03',
      textHover: '#F4A335',
      text: '#F18C03',
      textActive: '#D87E03'
    },
    error: {
      bg: '#FEF2EF',
      bgHover: '#FBE4DD',
      border: '#FBE4DD',
      borderHover: '#F8CCC0',
      hover: '#EE7958',
      default: '#EA572E',
      active: '#D24E29',
      textHover: '#EE7958',
      text: '#EA572E',
      textActive: '#D24E29'
    },
    info: {
      bg: '#ECF6FF',
      bgHover: '#D7ECFF',
      border: '#D7ECFF',
      borderHover: '#B4DBFF',
      hover: '#39A0FF',
      default: '#0888FF',
      active: '#077AE5',
      textHover: '#39A0FF',
      text: '#0888FF',
      textActive: '#077AE5'
    }
  },
  size: {
    padding: {
      xxxs: 2,
      xxs: 4,
      xs: 8,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 28,
      xxxl: 32
    },
    controlHeight: {
      lg: 40,
      md: 32,
      sm: 24,
      xs: 16
    }
  },
  style: {
    borderRadius: {
      xl: 16,
      lg: 8,
      md: 6,
      sm: 4,
      xs: 2
    },
    /** 与 Ant Design `token.boxShadowSecondary` 一致，用于对话输入区等抬升层次 */
    boxShadowSecondary:
      '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    font: {
      family: {
        primary: 'PingFang SC',
        number: 'Barlow'
      },
      weight: {
        regular: 'Regular',
        medium: 'Medium',
        semibold: 'SemiBold'
      },
      size: {
        sm: 12,
        base: 14,
        md: 16,
        lg: 20,
        xl: 24,
        xxl: 32
      },
      lineHeight: {
        sm: 20,
        base: 22,
        md: 24,
        lg: 28,
        xl: 32,
        xxl: 40
      }
    }
  }
} as const;

export type VcTokens = typeof vcTokens;
