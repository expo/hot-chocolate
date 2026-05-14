import { GoogleMaps } from 'expo-maps';

export interface StoreMapMarker {
  id: string;
  coordinates: { latitude: number; longitude: number };
  // iOS-only — Google Maps uses a SharedRef `icon` for custom marker art and
  // there's no system-symbol equivalent, so these are ignored on Android and
  // the default pin is rendered.
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
    <GoogleMaps.View
      style={{ flex: 1 }}
      markers={markers.map(({ id, coordinates, title }) => ({ id, coordinates, title }))}
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
