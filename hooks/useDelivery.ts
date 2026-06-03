import { useState, useEffect } from 'react';
import { supabase, type DeliveryRow, type DeliveryStatus } from '../lib/supabase';

export type { DeliveryStatus, DeliveryRow as Delivery };

export function useDelivery() {
  const [delivery, setDelivery] = useState<DeliveryRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('delivery')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError('Could not reach server');
        else setDelivery(data);
      });

    const channel = supabase
      .channel('delivery-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'delivery' },
        (payload) => setDelivery(payload.new as DeliveryRow))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function startDelivery(items: string, etaMinutes: number) {
    const { data, error: err } = await supabase
      .from('delivery')
      .update({
        items,
        status: 'on-the-way',
        eta_minutes: etaMinutes,
        started_at: new Date().toISOString(),
        delivered_at: null,
      })
      .eq('id', 1)
      .select()
      .single();
    if (err) throw err;
    setDelivery(data);
  }

  async function updateStatus(status: DeliveryStatus) {
    const patch: Partial<DeliveryRow> = { status };
    if (status === 'delivered') patch.delivered_at = new Date().toISOString();
    if (status === 'idle') {
      Object.assign(patch, { items: '', started_at: null, delivered_at: null, eta_minutes: 15 });
    }
    const { data, error: err } = await supabase
      .from('delivery')
      .update(patch)
      .eq('id', 1)
      .select()
      .single();
    if (err) throw err;
    setDelivery(data);
  }

  async function pushLocation(latitude: number, longitude: number) {
    await supabase
      .from('location')
      .update({ latitude, longitude, updated_at: new Date().toISOString() })
      .eq('id', 1);
  }

  return { delivery, error, startDelivery, updateStatus, pushLocation };
}
