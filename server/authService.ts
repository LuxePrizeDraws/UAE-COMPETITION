/**
 * Auth helpers – JWT + bcrypt
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/** Express middleware – attaches req.user if a valid ****** is present. */
import type { Request, Response, NextFunction } from 'express';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorised – missing or invalid token' });
    return;
  }
  try {
    const token = header.slice(7);
    const payload = verifyToken(token);
    (req as Request & { user: TokenPayload }).user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorised – token expired or invalid' });
  }
}

/** Same as authenticate but optional – attaches user if token is present, continues either way. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(header.slice(7));
      (req as Request & { user?: TokenPayload }).user = payload;
    } catch {
      // ignore invalid token in optional auth
    }
  }
  next();
}
