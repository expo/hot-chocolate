import { Button, Column, Host, Icon, Row, Spacer, Text } from '@expo/ui';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'react-native';

import {
  SEAL_FILLED,
  SEAL_OUTLINE,
  SECONDARY_ICON_COLOR,
  STAR_FILLED,
  STAR_OUTLINE,
} from '@/components/icons';
import { useFavourites } from '@/context/FavouritesContext';
import { FlavourList, LocationList } from '@/model';

export default function FlavourDetails() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const { isFavourite, isTasted, toggleFavourite, toggleTasted } = useFavourites();

  const flavour = FlavourList.find((item) => item.id === Number(id));
  const location = LocationList.find((item) => item.id === flavour?.location);
  const flavourId = Number(id);

  if (!flavour) {
    return (
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <Column style={{ padding: 16 }}>
          <Text>Flavour not found</Text>
        </Column>
      </Host>
    );
  }

  const label = `#${flavour.id} - ${flavour.name}`;
  const dateRange = `${formatDate(flavour.startDate)} to ${formatDate(flavour.endDate)}`;
  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <Column style={{ padding: 20 }} spacing={8} alignment="start">
          {location ? (
            <Link
              href={`/locations/${location.id}?title=${encodeURIComponent(location.name)}`}
              asChild>
              <Button variant="text">
                <Text textStyle={{ fontSize: 17, color: '#007AFF' }}>{location.name}</Text>
              </Button>
            </Link>
          ) : null}

          <Row spacing={12} alignment="center">
            <Text textStyle={{ fontSize: 26, fontWeight: 'bold' }}>{label}</Text>
            <Spacer />
            <Icon
              name={isFavourite(flavourId) ? STAR_FILLED : STAR_OUTLINE}
              size={22}
              color={isFavourite(flavourId) ? '#FFD700' : SECONDARY_ICON_COLOR}
              onPress={() => toggleFavourite(flavourId)}
            />
            <Icon
              name={isTasted(flavourId) ? SEAL_FILLED : SEAL_OUTLINE}
              size={22}
              color={isTasted(flavourId) ? '#007AFF' : SECONDARY_ICON_COLOR}
              onPress={() => toggleTasted(flavourId)}
            />
          </Row>

          <Text textStyle={{ fontSize: 14, color: 'gray' }}>{dateRange}</Text>

          <Text textStyle={{ fontSize: 16 }} style={{ paddingTop: 8 }}>
            {flavour.description}
          </Text>
          <Spacer />
        </Column>
      </Host>
    </>
  );
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString();
}
