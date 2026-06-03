import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, shadow } from '../constants/tokens';

let breadLogo: any;
try { breadLogo = require('../assets/bread-logo.png'); } catch { breadLogo = null; }

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Letterhead block */}
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          {breadLogo
            ? <Image source={breadLogo} style={styles.logoImg} />
            : <Text style={styles.logoFallback}>🍞</Text>
          }
        </View>
        <View style={styles.titleRule}>
          <View style={styles.ruleLine} />
          <Text style={styles.ruleText}>···</Text>
          <View style={styles.ruleLine} />
        </View>
        <Text style={styles.title}>Bread Brigade</Text>
        <Text style={styles.tagline}>FAMILY DELIVERY CO · EST 2026</Text>
      </View>

      {/* Role buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, styles.btnDeliver, shadow.card]}
          onPress={() => router.push('/deliver')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnEmoji}>🚗</Text>
          <Text style={[styles.btnTitle, { color: colors.cream }]}>I'm Delivering</Text>
          <Text style={[styles.btnSub, { color: '#fde68a' }]}>Baker mode · share your location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnTrack, shadow.card]}
          onPress={() => router.push('/track')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnEmoji}>📍</Text>
          <Text style={[styles.btnTitle, { color: colors.green }]}>I'm Waiting</Text>
          <Text style={[styles.btnSub, { color: colors.muted }]}>See where your bread is</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>FAMILY DELIVERY CO · EST 2026</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.paper,
    justifyContent: 'center', padding: 28,
  },
  hero: { alignItems: 'center', marginBottom: 40 },
  logoWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3, borderColor: colors.cream,
    ...shadow.seal,
  },
  logoImg: { width: 90, height: 90, borderRadius: 45 },
  logoFallback: { fontSize: 52 },
  titleRule: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  ruleLine:  { flex: 1, height: 1.5, backgroundColor: colors.terra, opacity: 0.5 },
  ruleText:  { fontFamily: fonts.ui, fontSize: 9, letterSpacing: 3, color: colors.terra, fontWeight: '600' },
  title: {
    fontFamily: fonts.display, fontSize: 36, color: colors.green,
    lineHeight: 40, textAlign: 'center',
  },
  tagline: {
    fontFamily: fonts.ui, fontSize: 9, letterSpacing: 2.5, color: colors.muted,
    fontWeight: '500', marginTop: 4, textAlign: 'center',
  },

  buttons: { gap: 14 },
  btn: {
    borderRadius: 16, paddingVertical: 22, paddingHorizontal: 20,
    alignItems: 'center',
  },
  btnDeliver: { backgroundColor: colors.green, borderWidth: 2, borderColor: colors.greenDk },
  btnTrack: {
    backgroundColor: colors.paper,
    borderWidth: 2, borderColor: colors.green,
  },
  btnEmoji: { fontSize: 34, marginBottom: 6 },
  btnTitle: { fontFamily: fonts.display, fontSize: 20, marginBottom: 3 },
  btnSub:   { fontFamily: fonts.ui, fontSize: 12, letterSpacing: 0.5 },

  footer: {
    fontFamily: fonts.ui, fontSize: 9, letterSpacing: 2, color: colors.line,
    textAlign: 'center', marginTop: 32, fontWeight: '500',
  },
});
