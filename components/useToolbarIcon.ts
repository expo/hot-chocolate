import { unstable_getMaterialSymbolSourceAsync, type AndroidSymbol } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Platform, type ImageSourcePropType } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

export interface ToolbarIconSpec {
  ios: SFSymbol;
  android: AndroidSymbol;
  size?: number;
  color?: string;
}

// Shared across all consumers — `getMaterialSymbolSourceAsync` rasterizes the
// glyph natively, so caching means we only pay that cost once per
// (symbol, size, color) tuple regardless of how many menus mount.
const cache = new Map<string, ImageSourcePropType>();

/**
 * Returns an icon value suitable for `Stack.Toolbar.Menu`'s `icon` prop.
 * On iOS, returns the SF Symbol string synchronously. On Android, returns
 * the Material symbol resolved via `expo-symbols` (async) — `undefined` on
 * the first render, the resolved `ImageSourcePropType` after.
 */
export function useToolbarIcon({
  ios,
  android,
  size = 24,
  color = '#000000',
}: ToolbarIconSpec): SFSymbol | ImageSourcePropType | undefined {
  const key = `${android}|${size}|${color}`;
  const [androidIcon, setAndroidIcon] = useState<ImageSourcePropType | undefined>(() =>
    cache.get(key)
  );

  useEffect(() => {
    if (Platform.OS !== 'android' || cache.has(key)) return;
    let cancelled = false;
    unstable_getMaterialSymbolSourceAsync(android, size, color).then((source) => {
      if (cancelled || !source) return;
      cache.set(key, source);
      setAndroidIcon(source);
    });
    return () => {
      cancelled = true;
    };
  }, [android, size, color, key]);

  return Platform.OS === 'ios' ? ios : androidIcon;
}
