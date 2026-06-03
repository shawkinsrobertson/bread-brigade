import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import locationRouter from './routes/location';
import deliveryRouter from './routes/delivery';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/location', locationRouter);
app.use('/api/delivery', deliveryRouter);

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Bread Brigade server running on http://localhost:${PORT}`);
  });
});
