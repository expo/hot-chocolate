import { BottomSheet, Button, Form, Group, Host, HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { background, font, foregroundStyle, onTapGesture, padding, presentationBackgroundInteraction, presentationDetents, presentationDragIndicator } from '@expo/ui/swift-ui/modifiers';
import * as Haptics from 'expo-haptics';
import { AppleMaps } from 'expo-maps';
import { useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';

import FlavourGroup from '@/components/FlavourGroup';
import { useFavourites } from '@/context/FavouritesContext';
import { type Flavour, FlavourList, LocationList, type Store } from '@/model';

function parseTime(timeStr: string): { hours: number; minutes: number } | null {
  const lower = timeStr.toLowerCase().trim();
  if (lower === 'noon') return { hours: 12, minutes: 0 };
  if (lower === 'midnight') return { hours: 0, minutes: 0 };

  const match = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const isPM = match[3].startsWith('p');

  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;

  return { hours, minutes };
}

function isOpenNow(hoursStr: string): boolean {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  const lower = hoursStr.toLowerCase();
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const fullDayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayName = dayNames[currentDay];
  const currentFullDayName = fullDayNames[currentDay];

  if (lower.includes(`closed ${currentDayName}`) ||
      lower.includes(`closed ${currentFullDayName}`) ||
      lower.includes(`closed on ${currentDayName}`)) {
    return false;
  }

  const timeRangeMatch = hoursStr.match(/(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))\s*(?:–|-|to)\s*(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))/i);

  if (timeRangeMatch) {
    const openTime = parseTime(timeRangeMatch[1]);
    const closeTime = parseTime(timeRangeMatch[2]);

    if (openTime && closeTime) {
      const currentTotalMinutes = currentHours * 60 + currentMinutes;
      const openTotalMinutes = openTime.hours * 60 + openTime.minutes;
      const closeTotalMinutes = closeTime.hours * 60 + closeTime.minutes;

      return currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
    }
  }

  return true;
}

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
  const [isLoading, setIsLoading] = useState(false);
  const { favourites } = useFavourites();

  // Derive markers from stores and favourites
  // React Compiler will automatically memoize this
  const markers = STORES.map((store) => {
    const hasFavouriteFlavour = store.locationFlavours.some((f) => favourites.has(f.id));
    const isClosed = !isOpenNow(store.hours);

    // Determine icon: star for favourites, cup for regular
    const systemImage = hasFavouriteFlavour ? 'star.fill' : 'cup.and.saucer.fill';

    // Determine color: gray if closed, yellow if favourite, default (red) otherwise
    // Using #AARRGGBB format for alpha support
    const tintColor = isClosed
      ? '#808E8E93' // iOS systemGray at 50% opacity
      : hasFavouriteFlavour
        ? '#FFD60A' // iOS systemYellow
        : undefined;

    return {
      id: String(store.locationId),
      coordinates: {
        latitude: store.point[0],
        longitude: store.point[1],
      },
      systemImage,
      tintColor,
      title: `${store.locationName} - ${store.name}`,
    };
  });

  return (
    <>
      <AppleMaps.View
        style={{ flex: 1 }}
        markers={markers}
        onMarkerClick={(e) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsLoading(true);
          setSelectedStore(STORES.find((store) => String(store.locationId) === e.id));
          setTimeout(() => setIsLoading(false), 500);
        }}
        cameraPosition={{
          // At proper place to cover most of the stores
          coordinates: {
            latitude: 49.2204375,
            longitude: -123.1236355,
          },
          zoom: 10,
        }}
        uiSettings={{
          myLocationButtonEnabled: true,
          compassEnabled: true,
          scaleBarEnabled: true,
          togglePitchEnabled: true,
        }}
        properties={{ isMyLocationEnabled: true }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      <Host>
        <BottomSheet
          isPresented={!!selectedStore}
          onIsPresentedChange={(isPresented) => setSelectedStore(isPresented ? selectedStore : null)}>
          <Group
            modifiers={[
              presentationDetents(['medium', 'large']),
              presentationDragIndicator('visible'),
              presentationBackgroundInteraction('enabled'),
            ]}>
            <VStack alignment="leading" spacing={16}>
              <HStack modifiers={[padding({ top: 16, trailing: 16 })]}>
                <Spacer />
                <Image
                  systemName="xmark.circle.fill"
                  color="secondary"
                  size={28}
                  onPress={() => setSelectedStore(null)}
                />
              </HStack>
              <VStack
                alignment="leading"
                spacing={4}
                modifiers={[padding({ leading: 16, trailing: 16 })]}>
                <Text modifiers={[font({ size: 26, weight: 'semibold' })]}>{selectedStore?.locationName ?? ''}</Text>
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
                {selectedStore?.locationFlavours.map((flavour) => (
                  <FlavourGroup key={flavour.id} flavour={flavour} />
                ))}
              </Form>
            </VStack>
          </Group>
        </BottomSheet>
      </Host>
    </>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
