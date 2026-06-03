import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as ExpoLocation from 'expo-location';
import { API_BASE } from '../constants/api';

export default function BroadcastScreen() {
  const [broadcasting, setBroadcasting] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function requestPermissions() {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async function sendLocation() {
    try {
      const pos = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      const res = await fetch(`${API_BASE}/api/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setLastSent(new Date().toLocaleTimeString());
      setError(null);
    } catch (e: any) {
      setError(e.message ?? 'Failed to send location');
    }
  }

  async function startBroadcast() {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert('Permission denied', 'Location permission is required to broadcast.');
      return;
    }
    setBroadcasting(true);
    await sendLocation();
    intervalRef.current = setInterval(sendLocation, 10_000);
  }

  function stopBroadcast() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setBroadcasting(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Baker Mode 🍞</Text>
        <Text style={styles.subtitle}>
          Share your location every 10 seconds so the family can track you.
        </Text>

        {Platform.OS !== 'web' && (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              On native, background location requires additional permissions in a production build.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, broadcasting ? styles.buttonStop : styles.buttonStart]}
          onPress={broadcasting ? stopBroadcast : startBroadcast}
        >
          <Text style={styles.buttonText}>
            {broadcasting ? '⏹ Stop Broadcasting' : '📡 Start Broadcasting'}
          </Text>
        </TouchableOpacity>

        {broadcasting && (
          <View style={styles.statusBox}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>Broadcasting live</Text>
          </View>
        )}

        {lastSent && (
          <Text style={styles.lastSent}>Last sent: {lastSent}</Text>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#c2410c',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 22,
  },
  noticeBox: {
    backgroundColor: '#fef9c3',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  noticeText: {
    color: '#854d0e',
    fontSize: 13,
  },
  button: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  buttonStart: {
    backgroundColor: '#c2410c',
  },
  buttonStop: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  statusText: {
    color: '#10b981',
    fontWeight: '600',
  },
  lastSent: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 12,
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
  },
});
