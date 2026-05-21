import { secondaryLabel } from '@bacons/apple-colors';
import { Icon } from '@expo/ui';
import { Platform, type ColorValue } from 'react-native';

// `@expo/ui`'s Icon `tint` prop on Android only accepts plain color values
// (hex/rgb string or int) — it doesn't run through React Native's PlatformColor
// resolver, so passing the iOS-style `secondaryLabel` throws "Unknown argument
// type: Map". Approximate iOS's `secondaryLabel` (≈60% opacity gray) on Android.
export const SECONDARY_ICON_COLOR: ColorValue =
  Platform.OS === 'ios' ? secondaryLabel : '#3C3C4399';

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

// Toolbar icons — Stack.Toolbar.Menu's Android renderer requires a synchronous
// ImageSourcePropType (it warns and bails on the first render when given
// `undefined`). The menu tints these via its own `tintColor` prop, so no need
// to bake color into the asset.

export const TOOLBAR_SORT_ICON = Icon.select({
  ios: 'arrow.up.arrow.down.circle',
  android: require('@expo/material-symbols/swap_vert.xml'),
});

export const TOOLBAR_FILTER_ACTIVE_ICON = Icon.select({
  ios: 'line.3.horizontal.decrease.circle.fill',
  android: require('@expo/material-symbols/filter_alt.xml'),
});

export const TOOLBAR_FILTER_INACTIVE_ICON = Icon.select({
  ios: 'line.3.horizontal.decrease.circle',
  android: require('@expo/material-symbols/filter_list.xml'),
});
