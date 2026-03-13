import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { initializeDatabase } from './db/database.js';
import authRoutes from './routes/auth.js';
import marketplaceRoutes from './routes/marketplace.js';
import { initializeListings } from './utils/listingStore.js';

const app = express();

let storageInitPromise;

export function ensureStorageInitialized() {
  if (!storageInitPromise) {
    storageInitPromise = initializeDatabase().then(() => initializeListings());
  }

  return storageInitPromise;
}

app.use(cors());
app.use(express.json());

app.use(async (_req, res, next) => {
  try {
    await ensureStorageInitialized();
    next();
  } catch (error) {
    console.error('Could not initialize listings storage.', error);
    res.status(500).json({ message: 'Storage initialization failed.' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api', marketplaceRoutes);

export default app;