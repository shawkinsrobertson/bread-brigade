import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useLocation } from '../hooks/useLocation';

// Leaflet map only works in a browser context
const BreadMap = Platform.OS === 'web'
  ? require('../components/BreadMap').default
  : null;

export default function TrackScreen() {
  const { location, error } = useLocation(5000);

  const lastSeen = location
    ? new Date(location.updated_at).toLocaleTimeString()
    : null;

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.mapWrapper}>
        {BreadMap && location ? (
          <BreadMap latitude={location.latitude} longitude={location.longitude} />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.emoji}>🍞</Text>
            <Text style={styles.placeholderText}>
              {location ? 'Map not available on this platform' : 'Loading location...'}
            </Text>
          </View>
        )}
      </View>

      {lastSeen && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Last updated: {lastSeen}</Text>
          {location && (
            <Text style={styles.coords}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef3c7',
  },
  errorBanner: {
    backgroundColor: '#fca5a5',
    padding: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#7f1d1d',
    fontWeight: '600',
  },
  mapWrapper: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    color: '#6b7280',
    fontSize: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 13,
  },
  coords: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'monospace',
  },
});
