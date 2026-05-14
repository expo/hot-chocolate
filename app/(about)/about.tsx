import { Button, Column, FieldGroup, Host, Text } from '@expo/ui';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AboutPage() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Hot Chocolate App' }} />
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <FieldGroup>
          <FieldGroup.Section title="ABOUT">
            <Text>
              This demo app showcases Expo UI components using data from the Vancouver Hot Chocolate
              Festival 2026. The design is inspired by the official YVR Hot Chocolate Fest app. The
              creators of this app are not in any way affiliated with the festival.
            </Text>
          </FieldGroup.Section>

          <FieldGroup.Section title="LINKS">
            <Button
              variant="text"
              onPress={() =>
                Linking.openURL('https://apps.apple.com/ca/app/yvr-hot-chocolate-fest/id1670251126')
              }>
              <Column alignment="start" spacing={2}>
                <Text textStyle={{ color: '#007AFF' }}>Official App on App Store</Text>
                <Text textStyle={{ fontSize: 13, color: 'gray' }}>Not updated for 2026</Text>
              </Column>
            </Button>
            <Button variant="text" onPress={() => Linking.openURL('https://hotchocolatefest.com')}>
              <Text textStyle={{ color: '#007AFF' }}>Hot Chocolate Festival Website</Text>
            </Button>
          </FieldGroup.Section>
        </FieldGroup>
      </Host>
    </>
  );
}
