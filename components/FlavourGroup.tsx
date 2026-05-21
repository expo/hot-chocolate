import { Collapsible, Column, Icon, Row, Text } from '@expo/ui';
import { useState } from 'react';

import {
  SEAL_FILLED,
  SEAL_OUTLINE,
  SECONDARY_ICON_COLOR,
  STAR_FILLED,
  STAR_OUTLINE,
} from '@/components/icons';
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
    <Collapsible label={label} isOpen={isExpanded} onOpenChange={setIsExpanded}>
      <Column
        spacing={6}
        alignment="start"
        style={{ paddingTop: 16, paddingRight: 16, paddingBottom: 32 }}>
        <Row spacing={8} alignment="center">
          <Icon
            name={isFavourite(flavour.id) ? STAR_FILLED : STAR_OUTLINE}
            size={18}
            color={isFavourite(flavour.id) ? '#FFD700' : SECONDARY_ICON_COLOR}
            onPress={() => toggleFavourite(flavour.id)}
          />
          <Icon
            name={isTasted(flavour.id) ? SEAL_FILLED : SEAL_OUTLINE}
            size={18}
            color={isTasted(flavour.id) ? '#007AFF' : SECONDARY_ICON_COLOR}
            onPress={() => toggleTasted(flavour.id)}
          />
        </Row>
        <Text textStyle={{ fontSize: 15, color: 'gray' }}>{date}</Text>
        {flavour.description ? (
          <Text textStyle={{ fontSize: 15 }}>{flavour.description}</Text>
        ) : null}
      </Column>
    </Collapsible>
  );
}
