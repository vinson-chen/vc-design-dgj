import React from 'react';
import { VcIcon } from 'vc-design';
import { iconTypes } from '../internal/vcIconTypeNames';
import { storeLogoUrlByKey } from '../generated/storeLogoUrls';

const iconTypeSet = new Set(iconTypes.map((v) => v.toLowerCase()));

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function parseIcon(value?: string): { kind: 'svg' | 'img' | 'none'; name?: string } {
  if (!value) return { kind: 'none' };
  const raw = normalize(value);
  const ext = raw.match(/\.(svg|png|jpg|jpeg|gif)$/i)?.[1]?.toLowerCase();
  if (!ext) return { kind: 'svg', name: raw };
  if (ext === 'svg') return { kind: 'svg', name: raw.replace(/\.svg$/i, '') };
  return { kind: 'img', name: raw.replace(/\.(png|jpg|jpeg|gif)$/i, '') };
}

function pickStoreLogoUrl(name: string): string | undefined {
  const lower = name.toLowerCase();
  return storeLogoUrlByKey[lower] ?? storeLogoUrlByKey.otherstore;
}

function resolveAssetUrl(url: string): string {
  // 如果已经是绝对 URL（http/https/file/blob/data），直接返回，避免运行时基准异常导致回退成相对路径。
  if (/^(data:|https?:|file:|blob:)/i.test(url)) return url;

  // 仅对相对路径做解析。
  try {
    return new URL(url, import.meta.url).href;
  } catch {
    return url;
  }
}

export function renderSwitchTabIcon(icon?: string): React.ReactNode {
  const parsed = parseIcon(icon);
  if (parsed.kind === 'none' || !parsed.name) return null;

  if (parsed.kind === 'svg') {
    const iconType = iconTypeSet.has(parsed.name) ? parsed.name : 'help-circle';
    return <VcIcon type={iconType} fontSize={16} />;
  }

  const src = pickStoreLogoUrl(parsed.name);
  if (!src) return <VcIcon type="help-circle" fontSize={16} />;
  return (
    <img
      src={resolveAssetUrl(src)}
      alt={parsed.name}
      width={16}
      height={16}
      style={{ borderRadius: 4, display: 'block' }}
    />
  );
}
