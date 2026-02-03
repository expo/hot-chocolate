import { Button, ContextMenu, HStack, Host, Image, List, Spacer, Text } from '@expo/ui/swift-ui';
import { font, foregroundStyle, frame } from '@expo/ui/swift-ui/modifiers';
import { Link, Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { FlavourList } from '@/model';

export default function Index() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Flavour List',
          headerLargeTitle: true,
          headerSearchBarOptions: {
            hideWhenScrolling: true,
          },
          headerRight: () => {
            return (
              <Host matchContents>
                <ContextMenu>
                  <ContextMenu.Items>
                    <Button onPress={() => {}} label="Show Favourites Only" />
                    <Button onPress={() => {}} label="Hide Tasted" />
                    <Button onPress={() => {}} label="Show Current Only" />
                    <Button onPress={() => {}} label="Show Vegan Only" />
                    <Button onPress={() => {}} label="Show Dairy Free Only" />
                    <Button onPress={() => {}} label="Show Gluten Free Only" />
                    <Button onPress={() => {}} label="Show Nut Free Only" />
                    <Button onPress={() => {}} label="Show Alcohol Free Only" />
                  </ContextMenu.Items>
                  <ContextMenu.Trigger>
                    {/* iOS 26 header buttons have height and width of 36, so we add static width
                    and height to keep the entire area tappable */}
                    <HStack modifiers={[frame({ width: 36, height: 36 })]}>
                      <Image systemName="line.3.horizontal.decrease.circle" size={28} />
                    </HStack>
                  </ContextMenu.Trigger>
                </ContextMenu>
              </Host>
            );
          },
        }}
      />
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <List>
          {FlavourList.map((item, index) => (
            <Link href={`/flavours/${item.id}`} asChild key={index}>
              <Button>
                <HStack spacing={8}>
                  <Text
                    modifiers={[
                      font({ size: 14 }),
                      foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                    ]}>{`#${index + 1}:`}</Text>
                  <Text modifiers={[font({ size: 14 })]}>{`${item.name}`}</Text>
                  <Spacer />
                  <Image systemName="chevron.right" size={14} color="secondary" />
                </HStack>
              </Button>
            </Link>
          ))}
        </List>
      </Host>
    </>
  );
}
