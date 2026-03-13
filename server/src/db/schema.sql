CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  owner_name VARCHAR(100),
  owner_email VARCHAR(150),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
  category VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  condition VARCHAR(100) NOT NULL,
  seller_type VARCHAR(50) NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  image_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings (category);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings (location);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings (created_at DESC);