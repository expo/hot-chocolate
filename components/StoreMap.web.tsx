import { Column, Host, ScrollView, Text } from '@expo/ui';

export interface StoreMapMarker {
  id: string;
  coordinates: { latitude: number; longitude: number };
  systemImage: string;
  tintColor?: string;
  title: string;
}

export interface StoreMapProps {
  markers: StoreMapMarker[];
  onMarkerClick: (id: string) => void;
}

export default function StoreMap({ markers, onMarkerClick }: StoreMapProps) {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView style={{ padding: 16 }}>
        <Column spacing={12} alignment="start">
          <Text textStyle={{ fontSize: 17, fontWeight: '600' }}>Map preview</Text>
          <Text textStyle={{ fontSize: 13, color: 'gray' }}>
            expo-maps isn&apos;t available on web. Tap a store to open its details.
          </Text>
          <Column spacing={8} alignment="start">
            {markers.map((marker) => (
              <Text
                key={marker.id}
                onPress={() => onMarkerClick(marker.id)}
                textStyle={{ color: '#007AFF' }}>
                {marker.title}
              </Text>
            ))}
          </Column>
        </Column>
      </ScrollView>
    </Host>
  );
}
