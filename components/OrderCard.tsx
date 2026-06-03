import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Order } from '../hooks/useOrders';

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: '🕐 Pending',
  baking: '🔥 Baking',
  'out-for-delivery': '🚗 On the way',
  delivered: '✅ Delivered',
};

const STATUS_COLOR: Record<Order['status'], string> = {
  pending: '#f59e0b',
  baking: '#ef4444',
  'out-for-delivery': '#3b82f6',
  delivered: '#10b981',
};

interface Props {
  order: Order;
  onStatusChange?: (status: Order['status']) => void;
}

export default function OrderCard({ order }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{order.name}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[order.status] }]}>
          <Text style={styles.badgeText}>{STATUS_LABEL[order.status]}</Text>
        </View>
      </View>
      <Text style={styles.items}>{order.items.join(', ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  items: {
    color: '#6b7280',
    fontSize: 14,
  },
});
