import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { useDelivery } from '../hooks/useDelivery';
import { useLocation } from '../hooks/useLocation';
import StatusRibbon from '../components/StatusRibbon';
import StarburstSeal from '../components/StarburstSeal';
import { colors, fonts, shadow } from '../constants/tokens';

const BreadMap = Platform.OS === 'web'
  ? require('../components/BreadMap').default
  : null;

// Bread logo — placed at assets/bread-logo.png by the user
let breadLogo: any;
try { breadLogo = require('../assets/bread-logo.png'); } catch { breadLogo = null; }

// ── Derive progress (0–1) from delivery state + current time
function computeProgress(
  status: string,
  startedAt: string | null,
  etaMinutes: number,
  now: number,
): number {
  if (status === 'idle') return 0;
  if (status === 'delivered') return 1;
  if (!startedAt) return 0.01;
  const elapsed = (now - new Date(startedAt).getTime()) / 1000 / 60;
  return Math.min(0.97, Math.max(0.01, elapsed / etaMinutes));
}

function statusLabel(p: number): string {
  if (p < 0.05) return 'BAKING';
  if (p < 0.11) return 'BOXING UP';
  if (p < 0.80) return 'EN ROUTE';
  if (p < 0.97) return 'ALMOST THERE';
  return 'ARRIVED';
}

function etaRemaining(startedAt: string | null, etaMinutes: number, now: number): number {
  if (!startedAt) return etaMinutes;
  const elapsed = (now - new Date(startedAt).getTime()) / 1000 / 60;
  return Math.max(0, Math.ceil(etaMinutes - elapsed));
}

// ── Inset border frame (double-border card effect)
function InsetFrame({ inset = 4, radius = 13, opacity = 0.4 }) {
  return (
    <View pointerEvents="none" style={{
      position: 'absolute', top: inset, left: inset, right: inset, bottom: inset,
      borderRadius: radius, borderWidth: 1, borderColor: colors.green,
      opacity,
    }} />
  );
}

// ── 5-stamp progress row
function StampsRow({ p }: { p: number }) {
  const passed  = Math.min(5, Math.floor(p * 5 + 0.0001));
  const current = Math.min(4, passed);
  const fillPct = Math.min(100, p * 100);

  return (
    <View>
      <View style={ss.stampsRow}>
        {/* Track line */}
        <View style={ss.trackLine} />
        {/* Green fill */}
        <View style={[ss.trackFill, { width: `${fillPct}%` as any }]} />
        {/* Stamps */}
        {[0, 1, 2, 3, 4].map(i => {
          const done = i < passed;
          const cur  = i === current && p < 0.97;
          return (
            <View key={i} style={[
              ss.stamp,
              done && ss.stampDone,
              cur  && ss.stampCur,
            ]}>
              {/* Checkmark */}
              <View style={[ss.checkA, { borderColor: done ? colors.cream : cur ? colors.terra : '#cbbf9f' }]} />
              <View style={[ss.checkB, { borderColor: done ? colors.cream : cur ? colors.terra : '#cbbf9f' }]} />
            </View>
          );
        })}
      </View>
      <View style={ss.stepLabels}>
        <Text style={ss.labelMuted}>My oven</Text>
        <Text style={ss.labelGreen}>Your door</Text>
      </View>
    </View>
  );
}

// ── Idle / No delivery state
function IdleScreen() {
  return (
    <View style={[styles.container, { backgroundColor: colors.paper, justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
      <View style={styles.plate}>
        <InsetFrame inset={4} radius={10} opacity={0.45} />
        <View style={styles.plateRule}>
          <View style={styles.ruleLine} />
          <Text style={styles.ruleText}>···</Text>
          <View style={styles.ruleLine} />
        </View>
        <Text style={styles.wordmark}>Bread Brigade</Text>
        <Text style={styles.tagline}>FAMILY DELIVERY CO · EST 2026</Text>
      </View>
      <Text style={[styles.idleEmoji]}>🕐</Text>
      <Text style={styles.idleTitle}>No active delivery</Text>
      <Text style={styles.idleSub}>Check back once the baker is on the way!</Text>
    </View>
  );
}

// ── Delivered state
function DeliveredScreen({ items }: { items: string }) {
  return (
    <View style={[styles.container, { backgroundColor: colors.paper, justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
      <Text style={styles.idleEmoji}>🎉</Text>
      <Text style={styles.deliveredTitle}>Your bread has arrived!</Text>
      {!!items && <Text style={styles.deliveredItems}>{items}</Text>}
    </View>
  );
}

// ── Main tracking screen
export default function TrackScreen() {
  const { delivery, error } = useDelivery();
  const { location } = useLocation();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (delivery?.status !== 'on-the-way') return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [delivery?.status]);

  if (error || !delivery) return <IdleScreen />;
  if (delivery.status === 'idle') return <IdleScreen />;
  if (delivery.status === 'delivered') return <DeliveredScreen items={delivery.items} />;

  const p    = computeProgress(delivery.status, delivery.started_at, delivery.eta_minutes, now);
  const eta  = etaRemaining(delivery.started_at, delivery.eta_minutes, now);
  const slabel = statusLabel(p);
  const passed = Math.min(5, Math.floor(p * 5 + 0.0001));
  const currentStop = Math.min(5, passed + (p >= 0.97 ? 0 : 1));
  const hasLoc = location && location.latitude !== 0;

  return (
    <View style={styles.container}>
      {/* ── Full-bleed map ── */}
      <View style={StyleSheet.absoluteFill}>
        {BreadMap && hasLoc ? (
          <BreadMap latitude={location!.latitude} longitude={location!.longitude} />
        ) : (
          <View style={{ flex: 1, backgroundColor: '#E0E1D7' }} />
        )}
      </View>

      {/* ── Top letterhead row ── */}
      <View style={styles.topRow}>
        {/* Logo button */}
        <View style={styles.iconBtn}>
          {breadLogo
            ? <Image source={breadLogo} style={styles.logoImg} />
            : <Text style={{ fontSize: 24 }}>🍞</Text>
          }
          <InsetFrame inset={3} radius={10} opacity={0.45} />
        </View>

        {/* Letterhead plate */}
        <View style={styles.plate}>
          <InsetFrame inset={3} radius={10} opacity={0.45} />
          <View style={styles.plateRule}>
            <View style={styles.ruleLine} />
            <Text style={styles.ruleText}>···</Text>
            <View style={styles.ruleLine} />
          </View>
          <Text style={styles.wordmark}>Bread Brigade</Text>
          <Text style={styles.tagline}>FAMILY DELIVERY CO · EST 2026</Text>
        </View>

        {/* Share button */}
        <View style={styles.iconBtn}>
          <Text style={{ color: colors.green, fontSize: 18 }}>⎙</Text>
          <InsetFrame inset={3} radius={10} opacity={0.45} />
        </View>
      </View>

      {/* ── Status ribbon ── */}
      <View style={styles.ribbonWrap}>
        <StatusRibbon label={slabel} />
      </View>

      {/* ── ETA starburst ── */}
      <View style={[styles.sealWrap, shadow.seal]}>
        <StarburstSeal eta={eta} />
      </View>

      {/* ── Bottom ticket card ── */}
      <View style={[styles.card, shadow.card]}>
        <InsetFrame inset={4} radius={13} opacity={0.4} />

        {/* Card top row */}
        <View style={styles.cardTop}>
          {/* Avatar */}
          <View style={styles.avatar}>
            {breadLogo
              ? <Image source={breadLogo} style={styles.avatarImg} />
              : <Text style={{ fontSize: 28 }}>🍞</Text>
            }
          </View>

          {/* Who + items */}
          <View style={styles.who}>
            <Text style={styles.whoName}>Dad's on the way</Text>
            <Text style={styles.whoItems} numberOfLines={1}>
              {delivery.items.toUpperCase()}
            </Text>
          </View>

          {/* Stop seal */}
          <View style={styles.stopSeal}>
            <Text style={styles.stopNum}>{currentStop}</Text>
            <Text style={styles.stopOf}>OF 5</Text>
          </View>
        </View>

        {/* Progress stamps */}
        <View style={styles.progressWrap}>
          <StampsRow p={p} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },

  // Top row
  topRow: {
    position: 'absolute', top: 14, left: 14, right: 14,
    flexDirection: 'row', alignItems: 'stretch', gap: 10, zIndex: 5,
  },
  iconBtn: {
    width: 46, borderRadius: 14,
    backgroundColor: colors.paper,
    borderWidth: 1.5, borderColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.float,
  },
  logoImg: { width: 32, height: 32, borderRadius: 16 },
  plate: {
    flex: 1, backgroundColor: colors.paper,
    borderWidth: 1.5, borderColor: colors.green, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 7, paddingHorizontal: 6,
    ...shadow.float,
  },
  plateRule: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 1 },
  ruleLine: { width: 14, height: 1, backgroundColor: colors.terra, opacity: 0.6 },
  ruleText: { fontSize: 7.5, letterSpacing: 2.5, color: colors.terra, fontFamily: fonts.ui, fontWeight: '600' },
  wordmark: { fontFamily: fonts.display, fontSize: 18, color: colors.green, lineHeight: 20, letterSpacing: 0.4 },
  tagline:  { fontFamily: fonts.ui, fontSize: 7, letterSpacing: 1.8, color: colors.muted, fontWeight: '500', marginTop: 2 },

  // Ribbon
  ribbonWrap: {
    position: 'absolute', top: 84, zIndex: 5,
    alignSelf: 'center',
  },

  // Seal
  sealWrap: {
    position: 'absolute', top: 128, right: 18, zIndex: 5,
  },

  // Card
  card: {
    position: 'absolute', left: 14, right: 14, bottom: 16, zIndex: 5,
    backgroundColor: colors.paper,
    borderWidth: 2, borderColor: colors.green, borderRadius: 18,
    padding: 15,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatar: {
    width: 50, height: 50, borderRadius: 13,
    backgroundColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 42, height: 42, borderRadius: 21 },
  who: { flex: 1, minWidth: 0 },
  whoName: {
    fontFamily: fonts.display, fontSize: 19, color: colors.ink,
    lineHeight: 22, fontWeight: '400',
  },
  whoItems: {
    fontFamily: fonts.ui, fontSize: 10.5, letterSpacing: 1.5,
    color: colors.terra, fontWeight: '600', marginTop: 3,
  },
  stopSeal: {
    borderLeftWidth: 1, borderLeftColor: colors.line,
    borderStyle: 'dashed', paddingLeft: 13,
    alignItems: 'center',
  },
  stopNum: { fontFamily: fonts.display, fontSize: 22, color: colors.green, lineHeight: 24 },
  stopOf:  { fontFamily: fonts.ui, fontSize: 8.5, letterSpacing: 1.5, color: colors.muted },

  progressWrap: { marginTop: 14 },

  // Idle / delivered
  idleEmoji:      { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  idleTitle:      { fontFamily: fonts.display, fontSize: 24, color: colors.green, textAlign: 'center', marginBottom: 8 },
  idleSub:        { fontFamily: fonts.ui, fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 22 },
  deliveredTitle: { fontFamily: fonts.display, fontSize: 26, color: colors.green, textAlign: 'center', marginBottom: 10 },
  deliveredItems: { fontFamily: fonts.ui, fontSize: 16, color: colors.terra, textAlign: 'center', letterSpacing: 1 },
});

// Stamps styles
const ss = StyleSheet.create({
  stampsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', position: 'relative', paddingHorizontal: 2,
  },
  trackLine: {
    position: 'absolute', left: 10, right: 10, top: '50%' as any,
    height: 2, backgroundColor: '#e2dccf', zIndex: 0,
    transform: [{ translateY: -1 }],
  },
  trackFill: {
    position: 'absolute', left: 10, top: '50%' as any,
    height: 2, backgroundColor: colors.green, zIndex: 1,
    transform: [{ translateY: -1 }],
  },
  stamp: {
    width: 21, height: 21, borderRadius: 10.5,
    borderWidth: 2, borderColor: '#cbbf9f',
    backgroundColor: colors.paper,
    zIndex: 2, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  stampDone: { backgroundColor: colors.green, borderColor: colors.green },
  stampCur:  {
    borderColor: colors.terra,
    shadowColor: colors.terra,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 2,
  },
  // Simple checkmark using two lines (border trick)
  checkA: {
    position: 'absolute', width: 5, height: 2,
    borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#cbbf9f',
    transform: [{ rotate: '-45deg' }, { translateX: -1 }, { translateY: 1 }],
  },
  checkB: {
    position: 'absolute', width: 8, height: 2,
    borderBottomWidth: 2, borderColor: '#cbbf9f',
    transform: [{ rotate: '45deg' }, { translateX: 2 }, { translateY: 0 }],
  },
  stepLabels: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 7,
  },
  labelMuted: {
    fontFamily: fonts.ui, fontSize: 8.5, letterSpacing: 0.8,
    textTransform: 'uppercase', color: colors.muted,
  },
  labelGreen: {
    fontFamily: fonts.ui, fontSize: 8.5, letterSpacing: 0.8,
    textTransform: 'uppercase', color: colors.green, fontWeight: '600',
  },
});
