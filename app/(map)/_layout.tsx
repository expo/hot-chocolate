import { Stack } from 'expo-router';

import { SystemScreenStackPreset } from '@/components/StackPreset';
import { PlatformColor } from 'react-native';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        ...SystemScreenStackPreset,
        headerLargeTitle: false,
        title: 'Location Map',
        headerStyle: {
          backgroundColor: PlatformColor('systemGroupedBackground') as unknown as string,
        },
      }}
    />
  );
}
