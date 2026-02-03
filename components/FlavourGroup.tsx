import { DisclosureGroup, HStack, Image, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { useState } from 'react';

import { type Flavour } from '@/model';

export default function FlavourGroup({ flavour }: { flavour: Flavour }) {
  function formatDate(isoDate: string) {
    return new Date(isoDate).toLocaleDateString();
  }

  const [isFavourite, setIsFavourite] = useState(false);
  const [isTasted, setIsTasted] = useState(false);

  const label = `#${flavour.id} - ${flavour.name}`;
  const date = `${formatDate(flavour.startDate)} to ${formatDate(flavour.endDate)}`;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <DisclosureGroup label={label} isExpanded={isExpanded} onIsExpandedChange={setIsExpanded}>
      <VStack spacing={8} alignment="leading">
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
          {date}
        </Text>
        <Text modifiers={[font({ size: 16 })]}>{flavour.description}</Text>
      </VStack>
    </DisclosureGroup>
  );
}
