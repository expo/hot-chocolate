import { systemGroupedBackground } from '@bacons/apple-colors';
import { Stack } from 'expo-router';

import { SystemScreenStackPreset } from '@/components/StackPreset';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        ...SystemScreenStackPreset,
        headerLargeTitle: false,
        title: 'Hot Chocolate App',
        headerStyle: {
          backgroundColor: systemGroupedBackground,
        },
      }}
    />
  );
}
