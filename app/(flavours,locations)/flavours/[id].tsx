import { Button, HStack, Host, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, frame, padding } from '@expo/ui/swift-ui/modifiers';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'react-native';

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
        <VStack modifiers={[padding({ top: 16, leading: 16, bottom: 16, trailing: 16 })]}>
          <Text>Flavour not found</Text>
        </VStack>
      </Host>
    );
  }

  const label = `#${flavour.id} - ${flavour.name}`;
  const dateRange = `${formatDate(flavour.startDate)} to ${formatDate(flavour.endDate)}`;
  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <VStack
          modifiers={[padding({ top: 20, leading: 20, bottom: 20, trailing: 20 })]}
          spacing={8}
          alignment="leading">
          {location ? (
            <Link href={`/locations/${location.id}?title=${encodeURIComponent(location.name)}`} asChild>
              <Button>
                <Text modifiers={[font({ size: 17 }), foregroundStyle('#007AFF')]}>
                  {location.name}
                </Text>
              </Button>
            </Link>
          ) : null}

          <HStack spacing={12} alignment="center" modifiers={[frame({ maxWidth: 9999 })]}>
            <Text modifiers={[font({ size: 26, weight: 'bold' })]}>{label}</Text>
            <Spacer />
            <Image
              systemName={isFavourite(flavourId) ? 'star.fill' : 'star'}
              size={22}
              color={isFavourite(flavourId) ? '#FFD700' : 'secondary'}
              onPress={() => toggleFavourite(flavourId)}
            />
            <Image
              systemName={isTasted(flavourId) ? 'checkmark.seal.fill' : 'checkmark.seal'}
              size={22}
              color={isTasted(flavourId) ? '#007AFF' : 'secondary'}
              onPress={() => toggleTasted(flavourId)}
            />
          </HStack>

          <Text
            modifiers={[
              font({ size: 14 }),
              foregroundStyle({ type: 'color', color: 'secondaryLabel' }),
            ]}>
            {dateRange}
          </Text>

          <Text modifiers={[font({ size: 16 }), padding({ top: 8 })]}>{flavour.description}</Text>
          <Spacer />
        </VStack>
      </Host>
    </>
  );
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString();
}
