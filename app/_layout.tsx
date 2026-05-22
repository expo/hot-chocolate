import 'expo-sqlite/localStorage/install';
import '@/styles/tabs.css';

import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { FavouritesProvider } from '@/context/FavouritesContext';

const hasLiquidGlass = isLiquidGlassAvailable();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = hasLiquidGlass
    ? undefined
    : colorScheme === 'dark'
      ? '#000000'
      : '#ffffff';

  return (
    <FavouritesProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <NativeTabs
          backgroundColor={backgroundColor}
          disableTransparentOnScrollEdge={!hasLiquidGlass}>
          <NativeTabs.Trigger name="(flavours)">
            <NativeTabs.Trigger.Icon sf="cup.and.saucer" md="local_cafe" />
            <NativeTabs.Trigger.Label>Flavours</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="(locations)">
            <NativeTabs.Trigger.Icon sf="mappin.and.ellipse" md="location_on" />
            <NativeTabs.Trigger.Label>Locations</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="(map)" disableTransparentOnScrollEdge>
            <NativeTabs.Trigger.Icon sf="map" md="map" />
            <NativeTabs.Trigger.Label>Map</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="(about)">
            <NativeTabs.Trigger.Icon sf="info.circle" md="info" />
            <NativeTabs.Trigger.Label>About</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        </NativeTabs>
        <StatusBar style="auto" />
      </ThemeProvider>
    </FavouritesProvider>
  );
}
