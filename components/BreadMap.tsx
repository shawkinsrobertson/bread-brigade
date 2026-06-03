import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  latitude: number;
  longitude: number;
}

// Leaflet-based map for web. Loaded dynamically to avoid SSR issues.
export default function BreadMap({ latitude, longitude }: Props) {
  const mapId = 'bread-map';

  useEffect(() => {
    // Skip if coordinates are the placeholder (0,0)
    if (latitude === 0 && longitude === 0) return;

    let map: any;
    let marker: any;

    async function init() {
      const L = (await import('leaflet')).default;

      // Fix default marker icons (webpack/bundler strips the URLs)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const container = document.getElementById(mapId);
      if (!container) return;

      if ((container as any)._leaflet_id) {
        // Map already initialised — just move the marker
        const existingMap = (container as any)._map;
        if (existingMap) {
          existingMap.setView([latitude, longitude]);
          existingMap._marker?.setLatLng([latitude, longitude]);
        }
        return;
      }

      map = L.map(mapId).setView([latitude, longitude], 14);
      (container as any)._map = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      marker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup('🍞 Bread is here!')
        .openPopup();
      (container as any)._map._marker = marker;
    }

    init();
    return () => {
      map?.remove();
    };
  }, [latitude, longitude]);

  if (latitude === 0 && longitude === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>📍 Waiting for location...</Text>
      </View>
    );
  }

  return (
    <>
      <style>{`@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');`}</style>
      <div id={mapId} style={{ width: '100%', height: '100%', minHeight: 320 }} />
    </>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    minHeight: 320,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
});
