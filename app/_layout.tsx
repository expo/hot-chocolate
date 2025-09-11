import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NativeTabs>
        <NativeTabs.Trigger name="(flavours)">
          <Icon sf={{ default: 'cup.and.saucer', selected: 'cup.and.saucer.fill' }} />
          <Label>Flavours</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(locations)">
          <Icon sf={{ default: 'mappin.and.ellipse', selected: 'mappin.and.ellipse' }} />
          <Label>Locations</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(map)">
          <Icon sf={{ default: 'map', selected: 'map.fill' }} />
          <Label>Map</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(about)">
          <Icon sf={{ default: 'info.circle', selected: 'info.circle.fill' }} />
          <Label>About</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
