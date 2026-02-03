import { Button, HStack, Host, Image, List, Menu, Spacer, Text } from '@expo/ui/swift-ui';
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { useFavourites } from '@/context/FavouritesContext';
import { FlavourList, LocationList } from '@/model';

interface Filters {
  showFavouritesOnly: boolean;
  showCurrentOnly: boolean;
  showVeganOnly: boolean;
  showDairyFreeOnly: boolean;
  showGlutenFreeOnly: boolean;
  showNutFreeOnly: boolean;
  showAlcoholFreeOnly: boolean;
}

const defaultFilters: Filters = {
  showFavouritesOnly: false,
  showCurrentOnly: false,
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
          headerRight: () => {
            return (
              <Host matchContents>
                <Menu
                  label={
                    <Image
                      systemName={
                        activeFilterCount > 0
                          ? 'line.3.horizontal.decrease.circle.fill'
                          : 'line.3.horizontal.decrease.circle'
                      }
                      size={24}
                    />
                  }>
                  <Button
                    onPress={() => toggleFilter('showFavouritesOnly')}
                    label={`${filters.showFavouritesOnly ? '✓ ' : ''}Show Favourites Only`}
                  />
                  <Button
                    onPress={() => toggleFilter('showCurrentOnly')}
                    label={`${filters.showCurrentOnly ? '✓ ' : ''}Show Current Only`}
                  />
                  <Button
                    onPress={() => toggleFilter('showVeganOnly')}
                    label={`${filters.showVeganOnly ? '✓ ' : ''}Show Vegan Only`}
                  />
                  <Button
                    onPress={() => toggleFilter('showDairyFreeOnly')}
                    label={`${filters.showDairyFreeOnly ? '✓ ' : ''}Show Dairy Free Only`}
                  />
                  <Button
                    onPress={() => toggleFilter('showGlutenFreeOnly')}
                    label={`${filters.showGlutenFreeOnly ? '✓ ' : ''}Show Gluten Free Only`}
                  />
                  <Button
                    onPress={() => toggleFilter('showNutFreeOnly')}
                    label={`${filters.showNutFreeOnly ? '✓ ' : ''}Show Nut Free Only`}
                  />
                  <Button
                    onPress={() => toggleFilter('showAlcoholFreeOnly')}
                    label={`${filters.showAlcoholFreeOnly ? '✓ ' : ''}Show Alcohol Free Only`}
                  />
                  {activeFilterCount > 0 && (
                    <Button
                      onPress={() => setFilters(defaultFilters)}
                      label="Clear All Filters"
                    />
                  )}
                </Menu>
              </Host>
            );
          },
        }}
      />
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <List>
          {filteredFlavours.map((item) => (
            <Button
              key={item.id}
              onPress={() => router.push(`/flavours/${item.id}`)}
              modifiers={[buttonStyle('plain')]}>
              <HStack>
                <Text>{`#${item.id}: ${item.name}`}</Text>
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
