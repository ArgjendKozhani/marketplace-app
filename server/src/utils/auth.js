import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'demo-marketplace-secret';

export function createAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      fullName: user.full_name
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

export function authenticateRequest(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}