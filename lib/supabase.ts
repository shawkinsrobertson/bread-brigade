import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(url, key);

export type DeliveryStatus = 'idle' | 'on-the-way' | 'delivered';

export interface LocationRow {
  id: number;
  latitude: number;
  longitude: number;
  updated_at: string;
}

export interface DeliveryRow {
  id: number;
  items: string;
  status: DeliveryStatus;
  eta_minutes: number;
  started_at: string | null;
  delivered_at: string | null;
}
