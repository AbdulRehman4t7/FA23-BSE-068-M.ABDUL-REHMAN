import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-at-least-32-chars-long';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const AUTH_COOKIE_NAME = 'adflow_auth';

export type UserRole = 'CLIENT' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserSession {
  id: string
  email: string
  role: UserRole | string
}

type CookieMap = Record<string, string>;

function parseCookieHeader(rawCookie: string) {
  return rawCookie
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<CookieMap>((acc, part) => {
      const idx = part.indexOf('=');
      if (idx <= 0) return acc;
      const key = part.slice(0, idx).trim();
      const value = decodeURIComponent(part.slice(idx + 1).trim());
      acc[key] = value;
      return acc;
    }, {});
}

function normalizeRole(role: string | undefined | null) {
  return String(role || '').trim().toUpperCase();
}

export function getTokenFromRequest(req: Request) {
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  const rawCookie = req.headers.get('cookie') || '';
  if (!rawCookie) return null;

  const cookies = parseCookieHeader(rawCookie);
  return cookies[AUTH_COOKIE_NAME] || null;
}

export function decodeSessionFromToken(token: string | null): UserSession | null {
  if (!token) return null;

  const verified = verifyToken(token) as any;
  if (!verified?.id || !verified?.email || !verified?.role) return null;

  return {
    id: String(verified.id),
    email: String(verified.email),
    role: String(verified.role),
  };
}

function isDemoAuthMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // If env still has placeholders, run a demo identity so UI flows work.
  return (
    !url ||
    url.includes('your-supabase-url') ||
    !anon ||
    anon.includes('your-anon-key')
  );
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

type AuthedHandler = (req: Request, user: UserSession, context?: any) => Promise<any>;

export function withAuth(handler: AuthedHandler, allowedRoles: string[] = []) {
  return async (req: Request, context?: any) => {
    try {
      const token = getTokenFromRequest(req);
      let user: UserSession | null = decodeSessionFromToken(token);

      // Demo fallback (so you can post ads without real JWT/Supabase setup).
      if (!user && isDemoAuthMode()) {
        user = {
          id: 'demo-user',
          email: 'demo@example.com',
          role: 'CLIENT',
        };
      }

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (allowedRoles.length > 0) {
        const normalized = normalizeRole(String(user.role || ''));
        const ok =
          allowedRoles.map(String).map((r) => normalizeRole(r)).includes(normalized);
        if (!ok) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      return handler(req, user, context);
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}
