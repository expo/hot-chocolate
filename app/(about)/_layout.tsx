import { Stack } from 'expo-router';
import { PlatformColor } from 'react-native';

import { SystemScreenStackPreset } from '@/components/StackPreset';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        ...SystemScreenStackPreset,
        headerLargeTitle: false,
        title: 'Hot Chocolate App',
        headerStyle: {
          backgroundColor: PlatformColor('systemGroupedBackground') as unknown as string,
        },
      }}
    />
  );
}
