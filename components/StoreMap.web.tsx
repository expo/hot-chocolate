/// <reference types="google.maps" />
import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';

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

const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 49.282729, lng: -123.120735 };

function MapView({ markers, onMarkerClick }: StoreMapProps) {
  const colorScheme = useColorScheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerInstancesRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = new google.maps.Map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      colorScheme: colorScheme === 'dark' ? 'DARK' : 'LIGHT',
    });
    // Captured once at mount; runtime theme toggles won't restyle the existing map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerInstancesRef.current.forEach((m) => m.setMap(null));
    markerInstancesRef.current = markers.map((m) => {
      const marker = new google.maps.Marker({
        position: { lat: m.coordinates.latitude, lng: m.coordinates.longitude },
        map,
        title: m.title,
      });
      marker.addListener('click', () => onMarkerClick(m.id));
      return marker;
    });

    return () => {
      markerInstancesRef.current.forEach((m) => m.setMap(null));
      markerInstancesRef.current = [];
    };
  }, [markers, onMarkerClick]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

function renderStatus(status: Status) {
  if (status === Status.FAILURE) {
    return <div style={{ padding: 16, color: '#888' }}>Failed to load Google Maps.</div>;
  }
  return <div style={{ width: '100%', height: '100%' }} />;
}

export default function StoreMap({ markers, onMarkerClick }: StoreMapProps) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_WEB;
  if (!apiKey) {
    return (
      <div style={{ padding: 16, color: '#888' }}>
        Set <code>EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_WEB</code> in your environment to enable the web
        map.
      </div>
    );
  }
  return (
    <Wrapper apiKey={apiKey} render={renderStatus}>
      <MapView markers={markers} onMarkerClick={onMarkerClick} />
    </Wrapper>
  );
}
