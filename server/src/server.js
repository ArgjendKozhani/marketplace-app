import app, { ensureStorageInitialized } from './app.js';
const port = process.env.PORT || 5000;

ensureStorageInitialized()
  .then(() => {
    app.listen(port, () => {
      console.log(`Marketplace API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Could not initialize listings storage.', error);
    process.exit(1);
  });
