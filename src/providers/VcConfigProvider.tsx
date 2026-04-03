import React, { useEffect, PropsWithChildren } from 'react';
import { ConfigProvider, type ConfigProviderProps } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { buildAntdTheme } from '../theme/buildAntdTheme';
import '../icons/iconfont.css';
import '../styles/antdButtonIconPatch.css';

export interface VcConfigProviderProps extends Omit<ConfigProviderProps, 'theme'> {
  /**
   * 是否自动为 body 设置字体（使用 VC 的主字体并带常见 fallback）
   * 默认开启
   */
  applyGlobalFont?: boolean;
}

export const VcConfigProvider: React.FC<PropsWithChildren<VcConfigProviderProps>> = ({
  children,
  applyGlobalFont = true,
  ...rest
}) => {
  useEffect(() => {
    if (!applyGlobalFont || typeof document === 'undefined') return;

    const previous = document.body.style.fontFamily;
    document.body.style.fontFamily =
      `'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`;

    return () => {
      document.body.style.fontFamily = previous;
    };
  }, [applyGlobalFont]);

  const theme = buildAntdTheme();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={theme}
      {...rest}
    >
      {children}
    </ConfigProvider>
  );
};
