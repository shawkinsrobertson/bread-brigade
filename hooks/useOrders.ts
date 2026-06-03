import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../constants/api';

export interface Order {
  id: number;
  name: string;
  items: string[];
  status: 'pending' | 'baking' | 'out-for-delivery' | 'delivered';
  created_at: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setOrders(await res.json());
      setError(null);
    } catch {
      setError('Could not load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  async function createOrder(name: string, items: string[]) {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, items }),
    });
    if (!res.ok) throw new Error('Failed to create order');
    await fetchOrders();
  }

  async function updateStatus(id: number, status: Order['status']) {
    const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order');
    await fetchOrders();
  }

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, createOrder, updateStatus, refresh: fetchOrders };
}
