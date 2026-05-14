import { AppleMaps } from 'expo-maps';

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
    <AppleMaps.View
      style={{ flex: 1 }}
      markers={markers}
      onMarkerClick={(e) => {
        if (e.id != null) onMarkerClick(e.id);
      }}
      cameraPosition={{
        coordinates: { latitude: 49.2204375, longitude: -123.1236355 },
        zoom: 10,
      }}
      uiSettings={{
        myLocationButtonEnabled: true,
        compassEnabled: true,
        scaleBarEnabled: true,
        togglePitchEnabled: true,
      }}
      properties={{ isMyLocationEnabled: true }}
    />
  );
}
