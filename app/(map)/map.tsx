import { BottomSheet, Button, Form, Host, HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { background, font, foregroundStyle, frame, onTapGesture, padding } from '@expo/ui/swift-ui/modifiers';
import { AppleMaps } from 'expo-maps';
import { useState } from 'react';
import { Linking, useWindowDimensions } from 'react-native';

import FlavourGroup from '@/components/FlavourGroup';
import { type Flavour, FlavourList, LocationList, type Store } from '@/model';

// Add backtraced location data to the store.
// When clicking on a store, we can display the location metadata directly.
interface ExtendedStore extends Store {
  locationName: string;
  locationId: number;
  locationDescription: string;
  locationInstagram: string;
  locationWebsite: string;
  locationFlavours: Flavour[];
}

const STORES: ExtendedStore[] = LocationList.flatMap((location) =>
  location.stores.map((store) => ({
    ...store,
    point: [store.point[0], store.point[1]],
    locationName: location.name,
    locationId: location.id,
    locationDescription: location.description,
    locationInstagram: location.instagram,
    locationWebsite: location.website,
    locationFlavours: FlavourList.filter((flavour) => flavour.location === location.id),
  }))
);

export default function Tab() {
  const [selectedStore, setSelectedStore] = useState<ExtendedStore | null | undefined>(null);
  const { height: windowHeight } = useWindowDimensions();

  return (
    <>
      <AppleMaps.View
        style={{ flex: 1 }}
        markers={STORES.map((store) => ({
          id: String(store.locationId),
          coordinates: {
            latitude: store.point[0],
            longitude: store.point[1],
          },
          systemImage: 'cup.and.saucer.fill',
          title: `${store.locationName} - ${store.name}`,
        }))}
        onMarkerClick={(e) => {
          setSelectedStore(STORES.find((store) => String(store.locationId) === e.id));
        }}
        cameraPosition={{
          // At proper place to cover most of the stores
          coordinates: {
            latitude: 49.2204375,
            longitude: -123.1236355,
          },
          zoom: 10,
        }}
        uiSettings={{ myLocationButtonEnabled: false }}
      />
      <Host>
        <BottomSheet
          isPresented={!!selectedStore}
          onIsPresentedChange={(isPresented) => setSelectedStore(isPresented ? selectedStore : null)}>
          <VStack
            modifiers={[frame({ height: windowHeight * 0.5 })]}
            alignment="leading"
            spacing={16}>
            <HStack modifiers={[padding({ top: 16, trailing: 16 })]}>
              <Spacer />
              <Image
                systemName="xmark.circle.fill"
                color="secondary"
                size={24}
                onPress={() => setSelectedStore(null)}
              />
            </HStack>
            <VStack
              alignment="leading"
              spacing={4}
              modifiers={[padding({ leading: 16, trailing: 16 })]}>
              <Text modifiers={[font({ size: 32 })]}>{selectedStore?.locationName ?? ''}</Text>
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
              <Text
                modifiers={[
                  font({ size: 16 }),
                  foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                ]}>
                {selectedStore?.hours ?? ''}
              </Text>
            </VStack>
            <Form modifiers={[background('white')]}>
              {selectedStore?.locationFlavours.map((flavour) => (
                <FlavourGroup key={flavour.id} flavour={flavour} />
              ))}
            </Form>
          </VStack>
        </BottomSheet>
      </Host>
    </>
  );
}
