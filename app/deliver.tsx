import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from 'react-native';
import * as ExpoLocation from 'expo-location';
import { useDelivery } from '../hooks/useDelivery';
import { colors, fonts, shadow } from '../constants/tokens';

function InsetFrame() {
  return (
    <View pointerEvents="none" style={{
      position: 'absolute', top: 4, left: 4, right: 4, bottom: 4,
      borderRadius: 13, borderWidth: 1, borderColor: colors.green, opacity: 0.4,
    }} />
  );
}

export default function DeliverScreen() {
  const { delivery, error: fetchError, startDelivery, updateStatus, pushLocation } = useDelivery();
  const [driverName, setDriverName] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [etaText, setEtaText] = useState('15');
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isActive    = delivery?.status === 'on-the-way';
  const isDelivered = delivery?.status === 'delivered';

  async function sendLocation() {
    try {
      const pos = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced });
      await pushLocation(pos.coords.latitude, pos.coords.longitude);
    } catch { /* silent retry */ }
  }

  async function startBroadcast() {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location needed', 'Allow location access to share your position.');
      return;
    }
    await sendLocation();
    intervalRef.current = setInterval(sendLocation, 10_000);
  }

  function stopBroadcast() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  async function handleStart() {
    const name = driverName.trim() || 'Baker';
    const trimmed = itemsText.trim();
    const eta = Math.max(1, parseInt(etaText, 10) || 15);
    if (!trimmed) {
      Alert.alert('What are you delivering?', 'Enter the bread items before starting.');
      return;
    }
    setSubmitting(true);
    try {
      await startDelivery(name, trimmed, eta);
      await startBroadcast();
    } catch {
      Alert.alert('Error', 'Could not start delivery. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkDelivered() {
    stopBroadcast();
    try { await updateStatus('delivered'); }
    catch { Alert.alert('Error', 'Could not update status.'); }
  }

  async function handleReset() {
    stopBroadcast();
    setDriverName('');
    setItemsText('');
    setEtaText('15');
    try { await updateStatus('idle'); }
    catch { Alert.alert('Error', 'Could not reset delivery.'); }
  }

  // ── Delivered ──
  if (isDelivered) {
    return (
      <View style={styles.container}>
        <View style={[styles.card, shadow.card]}>
          <InsetFrame />
          <Text style={styles.bigEmoji}>🎉</Text>
          <Text style={styles.cardTitle}>Delivered!</Text>
          <Text style={styles.cardSub}>{delivery?.items}</Text>
          <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={handleReset}>
            <Text style={styles.btnText}>Start New Delivery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Active ──
  if (isActive) {
    return (
      <View style={styles.container}>
        <View style={[styles.card, shadow.card]}>
          <InsetFrame />
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveLabel}>Broadcasting live</Text>
          </View>
          <Text style={styles.itemsLabel}>DELIVERING</Text>
          <Text style={styles.itemsValue}>{delivery?.items}</Text>
          {fetchError && <Text style={styles.errorText}>{fetchError}</Text>}
          <TouchableOpacity style={[styles.btn, styles.btnTerra]} onPress={handleMarkDelivered}>
            <Text style={styles.btnText}>Mark as Delivered ✓</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={handleReset}>
            <Text style={[styles.btnText, { color: colors.green }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Idle — form ──
  return (
    <View style={styles.container}>
      <View style={[styles.card, shadow.card]}>
        <InsetFrame />
        <View style={styles.plateRule}>
          <View style={styles.ruleLine} />
          <Text style={styles.ruleText}>···</Text>
          <View style={styles.ruleLine} />
        </View>
        <Text style={styles.cardTitle}>Today's Delivery</Text>
        <Text style={styles.cardSub}>Enter what you're bringing, then go.</Text>

        <Text style={styles.fieldLabel}>YOUR NAME</Text>
        <TextInput
          style={[styles.input, styles.inputShort]}
          placeholder="e.g. Dad, Seamus"
          placeholderTextColor={colors.muted}
          value={driverName}
          onChangeText={setDriverName}
          autoCapitalize="words"
        />

        <Text style={styles.fieldLabel}>WHAT ARE YOU DELIVERING?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. sourdough, 2 rye loaves"
          placeholderTextColor={colors.muted}
          value={itemsText}
          onChangeText={setItemsText}
          multiline
          autoCapitalize="none"
        />

        <Text style={styles.fieldLabel}>ESTIMATED TIME (MIN)</Text>
        <TextInput
          style={[styles.input, styles.inputShort]}
          placeholder="15"
          placeholderTextColor={colors.muted}
          value={etaText}
          onChangeText={setEtaText}
          keyboardType="number-pad"
          maxLength={3}
        />

        {fetchError && <Text style={styles.errorText}>{fetchError}</Text>}

        <TouchableOpacity
          style={[styles.btn, styles.btnGreen, submitting && styles.btnDisabled]}
          onPress={handleStart}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color={colors.cream} />
            : <Text style={styles.btnText}>Start Delivery 🚗</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.paper,
    justifyContent: 'center', padding: 24,
  },
  card: {
    backgroundColor: colors.paper,
    borderWidth: 2, borderColor: colors.green, borderRadius: 18,
    padding: 20,
  },
  plateRule: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  ruleLine:  { flex: 1, height: 1, backgroundColor: colors.terra, opacity: 0.5 },
  ruleText:  { fontFamily: fonts.ui, fontSize: 8, letterSpacing: 3, color: colors.terra, fontWeight: '600' },

  bigEmoji:  { fontSize: 54, textAlign: 'center', marginBottom: 12 },
  cardTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.green, textAlign: 'center', marginBottom: 6 },
  cardSub:   { fontFamily: fonts.ui, fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 20, lineHeight: 20 },

  fieldLabel: {
    fontFamily: fonts.ui, fontSize: 9, letterSpacing: 2, color: colors.muted,
    fontWeight: '600', marginBottom: 5, marginTop: 4,
  },
  input: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontFamily: fonts.ui, fontSize: 15, color: colors.ink,
    backgroundColor: colors.paper2, marginBottom: 10, minHeight: 48,
  },
  inputShort: { minHeight: 0 },

  btn: { borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  btnGreen:   { backgroundColor: colors.green },
  btnTerra:   { backgroundColor: '#16a34a' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.green },
  btnDisabled:{ opacity: 0.5 },
  btnText: {
    fontFamily: fonts.ui, fontWeight: '700', fontSize: 15,
    color: colors.cream, letterSpacing: 1,
  },

  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 16 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a' },
  liveLabel: { fontFamily: fonts.ui, fontWeight: '600', color: '#16a34a', fontSize: 13, letterSpacing: 1.5 },

  itemsLabel: { fontFamily: fonts.ui, fontSize: 9, letterSpacing: 2, color: colors.muted, textAlign: 'center', marginBottom: 4 },
  itemsValue: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, textAlign: 'center', marginBottom: 20 },

  errorText: { fontFamily: fonts.ui, fontSize: 12, color: '#ef4444', textAlign: 'center', marginBottom: 8 },
});
