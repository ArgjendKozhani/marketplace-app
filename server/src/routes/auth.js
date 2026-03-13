import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { getPool } from '../db/database.js';
import { authenticateRequest, createAuthToken } from '../utils/auth.js';

const router = Router();

function mapUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    city: user.city,
    phone: user.phone,
    createdAt: user.created_at instanceof Date ? user.created_at.toISOString() : user.created_at
  };
}

router.post('/register', async (req, res) => {
  const { fullName, email, password, city, phone } = req.body;

  if (!fullName || !email || !password || !city) {
    return res.status(400).json({ message: 'Full name, email, password, and city are required.' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const pool = await getPool();
  const normalizedEmail = String(email).trim().toLowerCase();
  const existingResult = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);

  const existingUser = existingResult.rows[0];

  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const insertResult = await pool.query(
    `
      INSERT INTO users (full_name, email, password_hash, city, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [String(fullName).trim(), normalizedEmail, passwordHash, String(city).trim(), phone ? String(phone).trim() : null]
  );

  const user = insertResult.rows[0];
  const token = createAuthToken(user);

  return res.status(201).json({
    message: 'Registration successful.',
    token,
    user: mapUser(user)
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const pool = await getPool();
  const normalizedEmail = String(email).trim().toLowerCase();
  const userResult = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);

  const user = userResult.rows[0];

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const matches = await bcrypt.compare(String(password), user.password_hash);

  if (!matches) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = createAuthToken(user);

  return res.json({
    message: 'Login successful.',
    token,
    user: mapUser(user)
  });
});

router.get('/me', authenticateRequest, async (req, res) => {
  const pool = await getPool();
  const result = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [Number(req.user.sub)]);

  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ user: mapUser(user) });
});

export default router;