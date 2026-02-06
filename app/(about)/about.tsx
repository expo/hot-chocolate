import {
  Button,
  Form,
  Host,
  RNHostView,
  Section,
  Text,
  Image as UIImage,
  VStack,
} from '@expo/ui/swift-ui';
import { containerRelativeFrame, font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import { Image, useColorScheme } from 'react-native';

export default function AboutPage() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Stack.Screen options={{ title: 'About', headerLargeTitle: true }} />
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <Form>
          <Section>
            <VStack
              alignment="center"
              modifiers={[padding({ vertical: 20 }), containerRelativeFrame({ axes: 'horizontal', alignment: 'center' })]}
              spacing={8}>
              <RNHostView matchContents>
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: 'red' }}
                />
              </RNHostView>
              <UIImage systemName="sparkles" size={28} color="#007AFF" />
              <Text modifiers={[font({ size: 20, weight: 'semibold' })]}>Expo UI Demo</Text>
              <Text modifiers={[foregroundStyle({ type: 'color', color: 'secondaryLabel' })]}>
                Built with @expo/ui
              </Text>
            </VStack>
          </Section>

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
              Festival 2026. The design is inspired by the official YVR Hot Chocolate Fest app.
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
                    foregroundStyle({ type: 'color', color: 'secondaryLabel' }),
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
