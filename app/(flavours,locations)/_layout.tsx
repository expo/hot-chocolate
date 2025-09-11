import { Stack } from 'expo-router';

import { SystemScreenStackPreset } from '@/components/StackPreset';

export default function RootLayout() {
  return <Stack screenOptions={SystemScreenStackPreset} />;
}
