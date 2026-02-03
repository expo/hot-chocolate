import { DisclosureGroup, HStack, Image, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { useState } from 'react';

import { useFavourites } from '@/context/FavouritesContext';
import { type Flavour } from '@/model';

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatMonth = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const startStr = formatMonth(start);
  const endStr = formatMonth(end);
  const year = end.getFullYear();

  return `${startStr} to ${endStr}, ${year}`;
}

export default function FlavourGroup({ flavour }: { flavour: Flavour }) {
  const { isFavourite, isTasted, toggleFavourite, toggleTasted } = useFavourites();
  const [isExpanded, setIsExpanded] = useState(false);

  const label = `#${flavour.id}: ${flavour.name}`;
  const date = formatDateRange(flavour.startDate, flavour.endDate);

  return (
    <DisclosureGroup label={label} isExpanded={isExpanded} onIsExpandedChange={setIsExpanded}>
      <VStack spacing={6} alignment="leading">
        <HStack spacing={8} alignment="center">
          <Image
            systemName={isFavourite(flavour.id) ? 'star.fill' : 'star'}
            size={18}
            color={isFavourite(flavour.id) ? '#FFD700' : 'secondary'}
            onPress={() => toggleFavourite(flavour.id)}
          />
          <Image
            systemName={isTasted(flavour.id) ? 'checkmark.seal.fill' : 'checkmark.seal'}
            size={18}
            color={isTasted(flavour.id) ? '#007AFF' : 'secondary'}
            onPress={() => toggleTasted(flavour.id)}
          />
        </HStack>
        <Text
          modifiers={[
            font({ size: 15 }),
            foregroundStyle({ type: 'color', color: 'secondaryLabel' }),
          ]}>
          {date}
        </Text>
        {flavour.description ? (
          <Text modifiers={[font({ size: 15 })]}>{flavour.description}</Text>
        ) : null}
      </VStack>
    </DisclosureGroup>
  );
}
