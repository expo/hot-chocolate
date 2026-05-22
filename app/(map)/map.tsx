import { BottomSheet, Column, FieldGroup, Host, Icon, Row, Spacer, Text } from '@expo/ui';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';

import FlavourGroup from '@/components/FlavourGroup';
import { SECONDARY_ICON_COLOR } from '@/components/icons';
import StoreMap from '@/components/StoreMap';
import { useFavourites } from '@/context/FavouritesContext';
import { type Flavour, FlavourList, LocationList, type Store } from '@/model';

// iOS-only swift-ui escape hatch; tree-shaken on other platforms.
const BOTTOM_SHEET_MODIFIERS =
  process.env.EXPO_OS === 'ios'
    ? [require('@expo/ui/swift-ui/modifiers').presentationBackgroundInteraction('enabled')]
    : [];

const XMARK_CIRCLE_FILLED = Icon.select({
  ios: 'xmark.circle.fill',
  android: require('@expo/material-symbols/cancel.xml'),
});

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
  const fullDayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const currentDayName = dayNames[currentDay];
  const currentFullDayName = fullDayNames[currentDay];

  if (
    lower.includes(`closed ${currentDayName}`) ||
    lower.includes(`closed ${currentFullDayName}`) ||
    lower.includes(`closed on ${currentDayName}`)
  ) {
    return false;
  }

  const timeRangeMatch = hoursStr.match(
    /(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))\s*(?:–|-|to)\s*(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))/i
  );

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
      id: `${store.locationId}-${store.name}`,
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
      <StoreMap
        markers={markers}
        onMarkerClick={(id) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsLoading(true);
          setSelectedStore(STORES.find((store) => `${store.locationId}-${store.name}` === id));
          setTimeout(() => setIsLoading(false), 500);
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      <Host>
        <BottomSheet
          isPresented={!!selectedStore}
          onDismiss={() => setSelectedStore(null)}
          snapPoints={['half', 'full']}
          modifiers={BOTTOM_SHEET_MODIFIERS}>
          <Column alignment="start" spacing={16}>
            <Row>
              <Spacer />
              <Icon
                name={XMARK_CIRCLE_FILLED}
                color={SECONDARY_ICON_COLOR}
                size={28}
                onPress={() => setSelectedStore(null)}
              />
            </Row>
            <Column alignment="start" spacing={4}>
              <Text textStyle={{ fontSize: 26, fontWeight: '600' }}>
                {selectedStore?.locationName ?? ''}
              </Text>
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
              {selectedStore?.locationFlavours.map((flavour) => (
                <FlavourGroup key={flavour.id} flavour={flavour} />
              ))}
            </FieldGroup>
          </Column>
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
