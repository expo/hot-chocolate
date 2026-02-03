import { Button, HStack, Host, Image, List, Picker, Spacer, Text } from '@expo/ui/swift-ui';
import { font, foregroundStyle, fixedSize, frame, padding, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { useColorScheme } from 'react-native';

import { LocationList } from '@/model';

const MY_FIXED_LOCATION = {
  latitude: 49.282729,
  longitude: -123.120735,
};

function getDistance(location: { latitude: number; longitude: number }): string {
  // Convert to kilometers using the Haversine formula
  const R = 6371; // Earth's radius in kilometers
  const lat1 = (MY_FIXED_LOCATION.latitude * Math.PI) / 180;
  const lat2 = (location.latitude * Math.PI) / 180;
  const deltaLat = ((location.latitude - MY_FIXED_LOCATION.latitude) * Math.PI) / 180;
  const deltaLon = ((location.longitude - MY_FIXED_LOCATION.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInKm = R * c;

  if (distanceInKm < 1) {
    // If less than 1km, show in meters
    return `${Math.round(distanceInKm * 1000)} m`;
  }

  // Show in km with 1 decimal place
  return `${distanceInKm.toFixed(1)} km`;
}

const SORT_OPTIONS = ['Name', 'Distance'] as const;

export default function Locations() {
  const colorScheme = useColorScheme();
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>('Name');

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Location List',
          headerLargeTitle: true,
          headerSearchBarOptions: {
            hideWhenScrolling: true,
          },
          headerRight: () => {
            return (
              <Host matchContents>
                <HStack
                  modifiers={[
                    // iOS 26 header buttons have height of 36,
                    // so we set it to 36 so it aligns vertically center
                    frame({
                      height: 36,
                    }),
                    // Picker has a default padding left and right so we add padding left here
                    // to make it look horizontally center
                    padding({ leading: 12 }),
                    fixedSize(),
                  ]}
                  alignment="center">
                  <Text>Sort by:</Text>
                  <Picker
                    selection={sortBy}
                    onSelectionChange={(value) => setSortBy(value as (typeof SORT_OPTIONS)[number])}
                    modifiers={[pickerStyle('menu')]}>
                    {SORT_OPTIONS.map((option) => (
                      <Text key={option} modifiers={[tag(option)]}>
                        {option}
                      </Text>
                    ))}
                  </Picker>
                </HStack>
              </Host>
            );
          },
        }}
      />
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <List>
          {LocationList.map((item) => (
            <Link href={`/locations/${item.id}`} asChild key={item.id}>
              <Button>
                <HStack spacing={8}>
                  <Text modifiers={[font({ size: 14 })]}>{`${item.name}`}</Text>
                  <Spacer />
                  <Text
                    modifiers={[
                      font({ size: 14 }),
                      foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                    ]}>
                    {getDistance({
                      // For demo purposes, use the first store's location
                      latitude: item.stores[0].point[0],
                      longitude: item.stores[0].point[1],
                    })}
                  </Text>
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
