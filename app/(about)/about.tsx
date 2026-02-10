import {
  Button,
  Form,
  Host,
  Section,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AboutPage() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Hot Chocolate App' }} />
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
      <Form>
        <Section
          header={
            <Text
              modifiers={[
                font({ size: 13, weight: 'regular' }),
                foregroundStyle({ type: 'color', color: 'secondaryLabel' }),
              ]}>
              ABOUT
            </Text>
          }>
          <Text>
            This demo app showcases Expo UI components using data from the Vancouver Hot Chocolate
            Festival 2026. The design is inspired by the official YVR Hot Chocolate Fest app. The
            creators of this app are not in any way affiliated with the festival.
          </Text>
        </Section>

        <Section
          header={
            <Text
              modifiers={[
                font({ size: 13, weight: 'regular' }),
                foregroundStyle({ type: 'color', color: 'secondaryLabel' }),
              ]}>
              LINKS
            </Text>
          }>
          <Button
            onPress={() =>
              Linking.openURL('https://apps.apple.com/ca/app/yvr-hot-chocolate-fest/id1670251126')
            }>
            <VStack alignment="leading" spacing={2}>
              <Text>Official App on App Store</Text>
              <Text
                modifiers={[
                  font({ size: 13 }),
                  foregroundStyle({ type: 'color', color: 'gray' }),
                ]}>
                Not updated for 2026
              </Text>
            </VStack>
          </Button>
          <Button
            onPress={() => Linking.openURL('https://hotchocolatefest.com')}
            label="Hot Chocolate Festival Website"
          />
        </Section>
      </Form>
    </Host>
    </>
  );
}
