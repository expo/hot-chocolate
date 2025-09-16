import { Stack } from 'expo-router';

type StackScreenOptions = React.ComponentProps<typeof Stack>['screenOptions'];

/**
 * A preset for the Stack screen options that uses the system's appearance settings.
 */
export const SystemScreenStackPreset: StackScreenOptions = {
  headerTransparent: true,
  headerLargeTitleShadowVisible: false,
};
