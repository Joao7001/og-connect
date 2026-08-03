import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthRequest = Request & { user?: { id: string; role: string } };
export function requireAuth(request: AuthRequest, response: Response, next: NextFunction) {
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (!token) return response.status(401).json({ message: 'Authentication required.' });
  try { request.user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }; next(); }
  catch { return response.status(401).json({ message: 'Invalid or expired token.' }); }
}
