import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export interface AuthPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Token não fornecido'));
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, env.jwt.secret) as AuthPayload;
    req.auth = decoded;
    next();
  } catch {
    next(AppError.unauthorized('Token inválido ou expirado'));
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as any);
}
