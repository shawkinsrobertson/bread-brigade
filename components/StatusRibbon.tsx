import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const H = 36; // ribbon height

export default function StatusRibbon({ label }: { label: string }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const dotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });

  return (
    <View style={styles.wrapper}>
      <View style={styles.leftPoint} />
      <View style={styles.body}>
        <Animated.View style={[styles.dot, { opacity: dotOpacity }]} />
        <Text style={styles.text}>{label}</Text>
      </View>
      <View style={styles.rightPoint} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#281e0f',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  leftPoint: {
    width: 0, height: 0,
    borderTopWidth: H / 2, borderBottomWidth: H / 2, borderRightWidth: 13,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderRightColor: '#B5482E',
  },
  body: {
    backgroundColor: '#B5482E',
    height: H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  rightPoint: {
    width: 0, height: 0,
    borderTopWidth: H / 2, borderBottomWidth: H / 2, borderLeftWidth: 13,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderLeftColor: '#B5482E',
  },
  dot: {
    width: 7, height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F4EBD9',
  },
  text: {
    color: '#F4EBD9',
    fontFamily: 'Oswald',
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 2,
  },
});
