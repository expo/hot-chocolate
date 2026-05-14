import { Icon } from '@expo/ui';

// Material Symbols ship a single weight per icon name, so the filled / outlined
// pairs map to the same Android XML — the color difference (gold vs gray,
// blue vs gray) is what reads as the toggle state on Android.

export const STAR_FILLED = Icon.select({
  ios: 'star.fill',
  android: require('@expo/material-symbols/star.xml'),
});

export const STAR_OUTLINE = Icon.select({
  ios: 'star',
  android: require('@expo/material-symbols/star.xml'),
});

export const SEAL_FILLED = Icon.select({
  ios: 'checkmark.seal.fill',
  android: require('@expo/material-symbols/verified.xml'),
});

export const SEAL_OUTLINE = Icon.select({
  ios: 'checkmark.seal',
  android: require('@expo/material-symbols/verified.xml'),
});
