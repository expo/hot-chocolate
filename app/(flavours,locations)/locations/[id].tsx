import { Column, FieldGroup, Host, Picker, Row, Text } from '@expo/ui';
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
        <Column style={{ padding: 16 }}>
          <Text>Location not found</Text>
        </Column>
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
        <Column alignment="start">
          <Column
            style={{
              padding: 16,
              width: windowWidth,
              backgroundColor: colorScheme === 'dark' ? 'black' : 'white',
            }}
            alignment="start"
            spacing={4}>
            {!title ? (
              <Text textStyle={{ fontSize: 26, fontWeight: '600' }}>{location.name}</Text>
            ) : null}
            {location.stores.length > 1 && selectedStoreName != null ? (
              <Row>
                <Text>Store: </Text>
                <Picker
                  appearance="menu"
                  selectedValue={selectedStoreName}
                  onValueChange={(value) => setSelectedStoreName(String(value))}>
                  {location.stores.map((store) => (
                    <Picker.Item key={store.name} label={store.name} value={store.name} />
                  ))}
                </Picker>
              </Row>
            ) : null}
            <Row
              onPress={() =>
                Linking.openURL(
                  `https://maps.apple.com/?ll=${selectedStore?.point[0]},${selectedStore?.point[1]}`
                )
              }>
              <Text textStyle={{ color: '#007AFF' }}>{selectedStore?.address ?? ''}</Text>
            </Row>
            <Text>{selectedStore?.hours ?? ''}</Text>
          </Column>
          <FieldGroup style={process.env.EXPO_OS === 'web' ? { width: '100%' } : undefined}>
            {flavours.map((flavour) => (
              <FlavourGroup key={flavour.id} flavour={flavour} />
            ))}
          </FieldGroup>
        </Column>
      </Host>
    </>
  );
}
