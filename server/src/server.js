import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { initializeDatabase } from './db/database.js';
import authRoutes from './routes/auth.js';
import marketplaceRoutes from './routes/marketplace.js';
import { initializeListings } from './utils/listingStore.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', marketplaceRoutes);

initializeDatabase()
  .then(() => initializeListings())
  .then(() => {
    app.listen(port, () => {
      console.log(`Marketplace API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Could not initialize listings storage.', error);
    process.exit(1);
  });
