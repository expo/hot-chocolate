import { Button, HStack, Host, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useColorScheme } from 'react-native';

import { FlavourList, LocationList } from '@/model';

export default function FlavourDetails() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();

  const flavour = FlavourList.find((item) => item.id === Number(id));
  const location = LocationList.find((item) => item.id === flavour?.location);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isTasted, setIsTasted] = useState(false);

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
      <Stack.Screen options={{ title: label }} />
      <Host style={{ flex: 1 }} colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <VStack
          modifiers={[padding({ top: 16, leading: 16, bottom: 16, trailing: 16 })]}
          spacing={16}
          alignment="leading">
          {location ? (
            <Link href={`/locations/${location.id}?hideStorePicker=true`} asChild>
              <Button>
                <HStack>
                  <Text modifiers={[font({ size: 20 }), foregroundStyle('#007AFF')]}>
                    {location.name}
                  </Text>
                </HStack>
              </Button>
            </Link>
          ) : null}
          <HStack spacing={8}>
            <Text modifiers={[font({ size: 24, weight: 'bold' })]}>{label}</Text>
            <Image
              systemName={isFavourite ? 'star.fill' : 'star'}
              size={18}
              color={isFavourite ? '#FFD700' : 'secondary'}
              onPress={() => setIsFavourite(!isFavourite)}
            />
            <Image
              systemName={isTasted ? 'checkmark.seal.fill' : 'checkmark.seal'}
              size={18}
              color={isTasted ? '#007AFF' : 'secondary'}
              onPress={() => setIsTasted(!isTasted)}
            />
          </HStack>

          <Text
            modifiers={[
              font({ size: 14 }),
              foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
            ]}>
            {dateRange}
          </Text>

          <Text modifiers={[font({ size: 16 })]}>{flavour.description}</Text>
          <Spacer />
        </VStack>
      </Host>
    </>
  );
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString();
}
