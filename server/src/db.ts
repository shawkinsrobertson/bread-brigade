import { Low, JSONFile } from 'lowdb';
import path from 'path';

interface Order {
  id: number;
  name: string;
  items: string[];
  status: 'pending' | 'baking' | 'out-for-delivery' | 'delivered';
  created_at: string;
}

interface DbSchema {
  location: {
    latitude: number;
    longitude: number;
    updated_at: string;
  };
  orders: Order[];
  nextOrderId: number;
}

const file = path.join(__dirname, '../../bread-brigade.json');
const adapter = new JSONFile<DbSchema>(file);
export const db = new Low<DbSchema>(adapter);

export async function initDb() {
  await db.read();
  if (!db.data) {
    db.data = {
      location: { latitude: 0, longitude: 0, updated_at: new Date().toISOString() },
      orders: [],
      nextOrderId: 1,
    };
    await db.write();
  }
}

export type { Order, DbSchema };
