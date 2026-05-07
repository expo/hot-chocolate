import { Column, Icon, Row, Text } from '@expo/ui';
import { DisclosureGroup } from '@expo/ui/swift-ui';
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

  const label = flavour.name;
  const date = formatDateRange(flavour.startDate, flavour.endDate);

  return (
    <DisclosureGroup label={label} isExpanded={isExpanded} onIsExpandedChange={setIsExpanded}>
      <Column
        spacing={6}
        alignment="start"
        style={{ paddingTop: 16, paddingRight: 16, paddingBottom: 32 }}>
        <Row spacing={8} alignment="center">
          <Icon
            name={isFavourite(flavour.id) ? 'star.fill' : 'star'}
            size={18}
            color={isFavourite(flavour.id) ? '#FFD700' : 'secondary'}
            onPress={() => toggleFavourite(flavour.id)}
          />
          <Icon
            name={isTasted(flavour.id) ? 'checkmark.seal.fill' : 'checkmark.seal'}
            size={18}
            color={isTasted(flavour.id) ? '#007AFF' : 'secondary'}
            onPress={() => toggleTasted(flavour.id)}
          />
        </Row>
        <Text textStyle={{ fontSize: 15, color: 'gray' }}>{date}</Text>
        {flavour.description ? (
          <Text textStyle={{ fontSize: 15 }}>{flavour.description}</Text>
        ) : null}
      </Column>
    </DisclosureGroup>
  );
}
