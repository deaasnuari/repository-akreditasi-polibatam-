import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export const authenticateToken = (req, res, next) => {
  // Check for token in cookies first (for web requests)
  let token = req.cookies.token;

  // If no token in cookies, check Authorization header (for API requests)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, msg: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, msg: 'Token invalid' });
  }
};
