import type { ThemeConfig } from 'antd';
import { vcTokens, type VcTokens } from './vcTokens';

export const baseVcTheme: VcTokens = vcTokens;

export function buildAntdTheme(tokens: VcTokens = vcTokens): ThemeConfig {
  const { color, size, style } = tokens;

  const theme: ThemeConfig = {
    token: {
      // brand & primary
      colorPrimary: color.primary.default,
      colorPrimaryBg: color.primary.bg,
      colorPrimaryBgHover: color.primary.bgHover,
      colorPrimaryHover: color.primary.hover,
      colorPrimaryActive: color.primary.active,
      colorPrimaryBorder: color.primary.border,
      colorPrimaryBorderHover: color.primary.borderHover,
      colorPrimaryText: color.primary.text,
      colorPrimaryTextHover: color.primary.textHover,
      colorPrimaryTextActive: color.primary.textActive,

      // neutral background
      colorBgContainer: color.neutral.background.container,
      colorBgElevated: color.neutral.background.elevated,
      colorBgLayout: color.neutral.background.layout,
      colorBgMask: color.neutral.background.mask,

      // neutral text
      colorText: color.neutral.text.default,
      colorTextSecondary: color.neutral.text.label,
      colorTextTertiary: color.neutral.text.description,
      colorTextQuaternary: color.neutral.text.placeholder,
      colorIcon: color.neutral.text.icon,
      colorIconHover: color.neutral.text.iconHover,

      // borders & split line
      colorBorder: color.neutral.border.default,
      colorBorderSecondary: color.neutral.border.secondary,
      colorSplit: color.neutral.border.split,

      // semantic colors
      colorSuccess: color.success.default,
      colorSuccessBg: color.success.bg,
      colorSuccessBorder: color.success.border,
      colorWarning: color.warning.default,
      colorWarningBg: color.warning.bg,
      colorWarningBorder: color.warning.border,
      colorError: color.error.default,
      colorErrorBg: color.error.bg,
      colorErrorBorder: color.error.border,
      colorInfo: color.info.default,
      colorInfoBg: color.info.bg,
      colorInfoBorder: color.info.border,

      // font
      fontFamily: style.font.family.primary,
      fontSize: style.font.size.base,
      fontSizeSM: style.font.size.sm,
      fontSizeLG: style.font.size.md,

      // radius
      borderRadius: style.borderRadius.md,
      borderRadiusSM: style.borderRadius.sm,
      borderRadiusLG: style.borderRadius.lg,

      // control sizes
      controlHeight: size.controlHeight.md,
      controlHeightLG: size.controlHeight.lg,
      controlHeightSM: size.controlHeight.sm,

      paddingXS: size.padding.xs,
      paddingSM: size.padding.sm,
      padding: size.padding.md,
      paddingLG: size.padding.lg,
      paddingXL: size.padding.xl
    },
    components: {
      Input: {
        controlHeight: size.controlHeight.md,
        controlHeightLG: size.controlHeight.md,
        controlHeightSM: size.controlHeight.sm,
        fontSize: style.font.size.base,
        fontSizeLG: style.font.size.base,
        fontSizeSM: style.font.size.sm
      },
      Select: {
        controlHeight: size.controlHeight.md,
        controlHeightLG: size.controlHeight.md,
        controlHeightSM: size.controlHeight.sm,
        fontSize: style.font.size.base,
        fontSizeLG: style.font.size.base,
        fontSizeSM: style.font.size.sm
      },
      Button: {
        // 尺寸
        controlHeight: size.controlHeight.md,
        controlHeightLG: size.controlHeight.lg,
        controlHeightSM: size.controlHeight.sm,
        fontSize: style.font.size.base,
        fontSizeLG: style.font.size.md,
        fontSizeSM: style.font.size.sm,
        borderRadius: style.borderRadius.md,
        borderRadiusLG: style.borderRadius.lg,
        borderRadiusSM: style.borderRadius.sm,
        paddingContentHorizontal: 12,
        paddingContentHorizontalSM: 8,
        paddingContentHorizontalLG: 16,

        // Default 按钮
        defaultBg: 'transparent',
        defaultHoverBg: color.neutral.fill.tertiary,
        defaultActiveBg: color.neutral.fill.secondary,
        defaultBorderColor: color.neutral.border.default,
        defaultHoverBorderColor: color.neutral.border.default,
        defaultActiveBorderColor: color.neutral.border.default,
        defaultColor: color.neutral.text.default,
        defaultHoverColor: color.neutral.text.default,
        defaultActiveColor: color.neutral.text.default,

        // Text 按钮
        textHoverBg: color.neutral.fill.secondary
      }
    }
  };

  return theme;
}

