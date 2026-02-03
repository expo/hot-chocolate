import { Button, Form, Host, Section, Text, VStack } from '@expo/ui/swift-ui';
import { bold, font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import * as Linking from 'expo-linking';
import { useColorScheme } from 'react-native';

function openOriginalApp() {
  Linking.openURL('https://apps.apple.com/ca/app/yvr-hot-chocolate-fest/id1670251126');
}

export default function AboutPage() {
  const colorScheme = useColorScheme();

  return (
    <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
      <VStack spacing={16}>
        <Text modifiers={[font({ size: 28, weight: 'bold' })]}>Expo UI Demo</Text>

        <Form>
          <Section title="About">
            <Text modifiers={[font({ size: 16 })]}>
              This is a demo application showcasing the capabilities of Expo UI components. The
              design is inspired by the YVR Hot Chocolate Fest app, which is a real application
              available on the App Store.
            </Text>
          </Section>

          <Section title="Components">
            <VStack spacing={8}>
              <Text modifiers={[font({ size: 18, weight: 'semibold' }), foregroundStyle('#8B4513')]}>
                @expo/ui/swift-ui
              </Text>
              <Text modifiers={[font({ size: 15 }), foregroundStyle('#666')]}>
                Showcases SwiftUI primitive UI components and styling capabilities
              </Text>
            </VStack>
          </Section>

          <Section>
            <Button onPress={openOriginalApp} label="View Original App on App Store" />
          </Section>
        </Form>
      </VStack>
    </Host>
  );
}
