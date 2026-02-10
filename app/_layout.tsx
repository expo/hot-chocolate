import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { FavouritesProvider } from '@/context/FavouritesContext';

const hasLiquidGlass = isLiquidGlassAvailable();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = hasLiquidGlass ? undefined : (colorScheme === 'dark' ? '#000000' : '#ffffff');

  return (
    <FavouritesProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <NativeTabs
          backgroundColor={backgroundColor}
          disableTransparentOnScrollEdge={!hasLiquidGlass}>
          <NativeTabs.Trigger name="(flavours)">
            <NativeTabs.Trigger.Icon sf="cup.and.saucer" />
            <NativeTabs.Trigger.Label>Flavours</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="(locations)">
            <NativeTabs.Trigger.Icon sf="mappin.and.ellipse" />
            <NativeTabs.Trigger.Label>Locations</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="(map)" disableTransparentOnScrollEdge>
            <NativeTabs.Trigger.Icon sf="map" />
            <NativeTabs.Trigger.Label>Map</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="(about)">
            <NativeTabs.Trigger.Icon sf="info.circle" />
            <NativeTabs.Trigger.Label>About</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        </NativeTabs>
        <StatusBar style="auto" />
      </ThemeProvider>
    </FavouritesProvider>
  );
}
