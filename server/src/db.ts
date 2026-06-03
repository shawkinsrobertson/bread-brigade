import { Low, JSONFile } from 'lowdb';
import path from 'path';

export type DeliveryStatus = 'idle' | 'on-the-way' | 'delivered';

interface DbSchema {
  location: {
    latitude: number;
    longitude: number;
    updated_at: string;
  };
  delivery: {
    items: string;
    status: DeliveryStatus;
    started_at: string | null;
    delivered_at: string | null;
  };
}

const file = path.join(__dirname, '../../bread-brigade.json');
const adapter = new JSONFile<DbSchema>(file);
export const db = new Low<DbSchema>(adapter);

export async function initDb() {
  await db.read();
  if (!db.data) {
    db.data = {
      location: { latitude: 0, longitude: 0, updated_at: new Date().toISOString() },
      delivery: { items: '', status: 'idle', started_at: null, delivered_at: null },
    };
    await db.write();
  }
  // Migrate old schema if needed
  if (!db.data.delivery) {
    db.data.delivery = { items: '', status: 'idle', started_at: null, delivered_at: null };
    await db.write();
  }
}

export type { DbSchema };
