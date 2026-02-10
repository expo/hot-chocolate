import {
  Button,
  HStack,
  Host,
  Image,
  List,
  Spacer,
  Text,
} from '@expo/ui/swift-ui';
import { buttonStyle, contentShape, font, foregroundStyle, refreshable, shapes } from '@expo/ui/swift-ui/modifiers';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { LocationList } from '@/model';

const DEFAULT_LOCATION = {
  latitude: 49.282729,
  longitude: -123.120735,
};

function parseTime(timeStr: string): { hours: number; minutes: number } | null {
  // Parse times like "8 a.m.", "8:30 p.m.", "6 p.m.", "noon", "midnight"
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
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  const lower = hoursStr.toLowerCase();

  // Check if closed today
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const fullDayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayName = dayNames[currentDay];
  const currentFullDayName = fullDayNames[currentDay];

  // Check for explicit closure
  if (lower.includes(`closed ${currentDayName}`) ||
      lower.includes(`closed ${currentFullDayName}`) ||
      lower.includes(`closed on ${currentDayName}`)) {
    return false;
  }

  // Try to find time range - look for patterns like "8 a.m. – 6 p.m." or "8am-6pm"
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

  // Default: assume open if we couldn't parse
  return true;
}

function getDistanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const deltaLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const deltaLon = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

const SORT_OPTIONS = ['Name', 'Distance'] as const;

export default function Locations() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>('Name');
  const [searchText, setSearchText] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>(DEFAULT_LOCATION);

  const updateLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  }, []);

  useEffect(() => {
    updateLocation();
  }, [updateLocation]);

  const filteredAndSortedLocations = useMemo(() => {
    let result = [...LocationList];

    // Filter by search text
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.stores.some((store) => store.address.toLowerCase().includes(query))
      );
    }

    // Filter by open now
    if (showOpenOnly) {
      result = result.filter((item) =>
        item.stores.some((store) => isOpenNow(store.hours))
      );
    }

    // Sort
    if (sortBy === 'Name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'Distance') {
      result.sort((a, b) => {
        const distA = getDistanceKm(userLocation, {
          latitude: a.stores[0].point[0],
          longitude: a.stores[0].point[1],
        });
        const distB = getDistanceKm(userLocation, {
          latitude: b.stores[0].point[0],
          longitude: b.stores[0].point[1],
        });
        return distA - distB;
      });
    }

    return result;
  }, [sortBy, searchText, showOpenOnly, userLocation]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Location List',
          headerLargeTitle: true,
          headerSearchBarOptions: {
            hideWhenScrolling: true,
            barTintColor: colorScheme === 'dark' ? '#333335' : '#d0d0d5',
            onChangeText: (e) => setSearchText(e.nativeEvent.text),
          },
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu icon="arrow.up.arrow.down.circle" tintColor="#007AFF">
          {SORT_OPTIONS.map((option) => (
            <Stack.Toolbar.MenuAction
              key={option}
              isOn={sortBy === option}
              onPress={() => setSortBy(option)}>
              {option}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.Menu
          tintColor="#007AFF"
          icon={
            showOpenOnly
              ? 'line.3.horizontal.decrease.circle.fill'
              : 'line.3.horizontal.decrease.circle'
          }>
          <Stack.Toolbar.MenuAction
            isOn={showOpenOnly}
            onPress={() => setShowOpenOnly(!showOpenOnly)}>
            Show Open Now Only
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <List modifiers={[refreshable(updateLocation)]}>
          {filteredAndSortedLocations.map((item) => (
            <Button
              key={item.id}
              onPress={() => router.push(`/locations/${item.id}`)}
              modifiers={[buttonStyle('plain')]}>
              <HStack modifiers={[contentShape(shapes.rectangle())]}>
                <Text>{item.name}</Text>
                <Spacer />
                <HStack spacing={8} alignment="center">
                  <Text modifiers={[font({ size: 14 }), foregroundStyle('#8E8E93')]}>
                    {formatDistance(
                      getDistanceKm(userLocation, {
                        latitude: item.stores[0].point[0],
                        longitude: item.stores[0].point[1],
                      })
                    )}
                  </Text>
                  <Image systemName="chevron.right" size={14} color="secondary" />
                </HStack>
              </HStack>
            </Button>
          ))}
        </List>
      </Host>
    </>
  );
}
