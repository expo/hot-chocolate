import { Form, HStack, Host, Picker, Text, VStack } from '@expo/ui/swift-ui';
import { background, font, foregroundStyle, frame, onTapGesture, padding, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import * as Linking from 'expo-linking';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useColorScheme, useWindowDimensions } from 'react-native';

import FlavourGroup from '@/components/FlavourGroup';
import { FlavourList, LocationList, type Store } from '@/model';

export default function LocationDetails() {
  const { id, title } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const { width: windowWidth } = useWindowDimensions();

  const location = LocationList.find((item) => item.id === Number(id));
  const [selectedStoreName, setSelectedStoreName] = useState<string | null>(null);
  const flavours = FlavourList.filter((flavour) => flavour.location === Number(id)) ?? [];

  const selectedStore = location?.stores.find((s) => s.name === selectedStoreName) ?? null;

  useEffect(() => {
    if (location) {
      setSelectedStoreName(location.stores[0]?.name ?? null);
    }
  }, [location]);

  if (!location) {
    return (
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <VStack modifiers={[padding({ top: 16, leading: 16, bottom: 16, trailing: 16 })]}>
          <Text>Location not found</Text>
        </VStack>
      </Host>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: typeof title === 'string' ? title : '',
          headerLargeStyle: {
            backgroundColor: colorScheme === 'dark' ? 'black' : 'white',
          },
        }}
      />
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <VStack alignment="leading">
          <VStack
            modifiers={[
              padding({ top: 16, leading: 16, bottom: 16, trailing: 16 }),
              frame({ maxWidth: windowWidth, alignment: 'leading' }),
              background(colorScheme === 'dark' ? 'black' : 'white'),
            ]}
            alignment="leading"
            spacing={4}>
            {!title ? (
              <Text modifiers={[font({ size: 26, weight: 'semibold' })]}>{location.name}</Text>
            ) : null}
            {location.stores.length > 1 ? (
              <HStack>
                <Text>Store: </Text>
                <Picker
                  selection={selectedStoreName}
                  onSelectionChange={(value) => setSelectedStoreName(value as string)}
                  modifiers={[pickerStyle('menu')]}>
                  {location.stores.map((store) => (
                    <Text key={store.name} modifiers={[tag(store.name)]}>
                      {store.name}
                    </Text>
                  ))}
                </Picker>
              </HStack>
            ) : null}
            <HStack
              modifiers={[
                onTapGesture(() =>
                  Linking.openURL(
                    `https://maps.apple.com/?ll=${selectedStore?.point[0]},${selectedStore?.point[1]}`
                  )
                ),
              ]}>
              <Text modifiers={[foregroundStyle('#007AFF')]}>{selectedStore?.address ?? ''}</Text>
            </HStack>
            <Text>{selectedStore?.hours ?? ''}</Text>
          </VStack>
          <Form>
            {flavours.map((flavour) => (
              <FlavourGroup key={flavour.id} flavour={flavour} />
            ))}
          </Form>
        </VStack>
      </Host>
    </>
  );
}
