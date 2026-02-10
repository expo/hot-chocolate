import { Button, HStack, Host, Image, List, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { buttonStyle, contentShape, font, foregroundStyle, shapes } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { useFavourites } from '@/context/FavouritesContext';
import { FlavourList, LocationList } from '@/model';

interface Filters {
  showFavouritesOnly: boolean;
  showCurrentOnly: boolean;
  showOpenNowOnly: boolean;
  showVeganOnly: boolean;
  showDairyFreeOnly: boolean;
  showGlutenFreeOnly: boolean;
  showNutFreeOnly: boolean;
  showAlcoholFreeOnly: boolean;
}

const defaultFilters: Filters = {
  showFavouritesOnly: false,
  showCurrentOnly: false,
  showOpenNowOnly: false,
  showVeganOnly: false,
  showDairyFreeOnly: false,
  showGlutenFreeOnly: false,
  showNutFreeOnly: false,
  showAlcoholFreeOnly: false,
};

function isCurrentlyAvailable(startDate: string, endDate: string): boolean {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
}

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

export default function Index() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { favourites } = useFavourites();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const toggleFilter = (key: keyof Filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filteredFlavours = useMemo(() => {
    let result = [...FlavourList];

    // Filter by search text
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter((item) => {
        const location = LocationList.find((l) => l.id === item.location);
        return (
          item.name.toLowerCase().includes(query) ||
          location?.name.toLowerCase().includes(query)
        );
      });
    }

    // Apply filters
    if (filters.showFavouritesOnly) {
      result = result.filter((item) => favourites.has(item.id));
    }
    if (filters.showCurrentOnly) {
      result = result.filter((item) => isCurrentlyAvailable(item.startDate, item.endDate));
    }
    if (filters.showOpenNowOnly) {
      result = result.filter((item) => {
        const location = LocationList.find((l) => l.id === item.location);
        return location?.stores.some((store) => isOpenNow(store.hours)) ?? false;
      });
    }
    if (filters.showVeganOnly) {
      result = result.filter((item) => item.tags.includes('Vegan'));
    }
    if (filters.showDairyFreeOnly) {
      result = result.filter((item) => item.tags.includes('Dairy-free'));
    }
    if (filters.showGlutenFreeOnly) {
      result = result.filter((item) => item.tags.includes('Gluten-free'));
    }
    if (filters.showNutFreeOnly) {
      result = result.filter((item) => !item.tags.includes('Nuts'));
    }
    if (filters.showAlcoholFreeOnly) {
      result = result.filter((item) => !item.tags.includes('Alcoholic'));
    }

    return result;
  }, [searchText, filters, favourites]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Flavour List',
          headerLargeTitle: true,
          headerSearchBarOptions: {
            hideWhenScrolling: true,
            barTintColor: colorScheme === 'dark' ? '#333335' : '#d0d0d5',
            onChangeText: (e) => setSearchText(e.nativeEvent.text),
          },
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          tintColor="#007AFF"
          icon={
            activeFilterCount > 0
              ? 'line.3.horizontal.decrease.circle.fill'
              : 'line.3.horizontal.decrease.circle'
          }>
          <Stack.Toolbar.MenuAction
            isOn={filters.showFavouritesOnly}
            onPress={() => toggleFilter('showFavouritesOnly')}>
            Show Favourites Only
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            isOn={filters.showCurrentOnly}
            onPress={() => toggleFilter('showCurrentOnly')}>
            Show Current Only
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            isOn={filters.showOpenNowOnly}
            onPress={() => toggleFilter('showOpenNowOnly')}>
            Show Open Now Only
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            isOn={filters.showVeganOnly}
            onPress={() => toggleFilter('showVeganOnly')}>
            Show Vegan Only
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            isOn={filters.showDairyFreeOnly}
            onPress={() => toggleFilter('showDairyFreeOnly')}>
            Show Dairy Free Only
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            isOn={filters.showGlutenFreeOnly}
            onPress={() => toggleFilter('showGlutenFreeOnly')}>
            Show Gluten Free Only
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            isOn={filters.showNutFreeOnly}
            onPress={() => toggleFilter('showNutFreeOnly')}>
            Show Nut Free Only
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            isOn={filters.showAlcoholFreeOnly}
            onPress={() => toggleFilter('showAlcoholFreeOnly')}>
            Show Alcohol Free Only
          </Stack.Toolbar.MenuAction>
          {activeFilterCount > 0 && (
            <Stack.Toolbar.MenuAction
              destructive
              onPress={() => setFilters(defaultFilters)}>
              Clear All Filters
            </Stack.Toolbar.MenuAction>
          )}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <List>
          {filteredFlavours.map((item) => (
            <Button
              key={item.id}
              onPress={() => router.push(`/flavours/${item.id}`)}
              modifiers={[buttonStyle('plain')]}>
              <HStack modifiers={[contentShape(shapes.rectangle())]} alignment="center">
                <VStack alignment="leading" spacing={2}>
                  <HStack spacing={0}>
                    <Text modifiers={[foregroundStyle({ type: 'color', color: 'gray' })]}>{`#${item.id}: `}</Text>
                    <Text>{item.name}</Text>
                  </HStack>
                  {item.tags.length > 0 && (
                    <Text modifiers={[font({ size: 13 }), foregroundStyle({ type: 'color', color: 'gray' })]}>
                      {item.tags.join(', ')}
                    </Text>
                  )}
                </VStack>
                <Spacer />
                <Image systemName="chevron.right" size={14} color="secondary" />
              </HStack>
            </Button>
          ))}
        </List>
      </Host>
    </>
  );
}
