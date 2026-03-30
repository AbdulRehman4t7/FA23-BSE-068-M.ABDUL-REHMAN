import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-at-least-32-chars-long';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export type UserRole = 'CLIENT' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserSession {
  id: string
  email: string
  role: UserRole | string
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
      const authHeader = req.headers.get('authorization') || '';
      const token =
        authHeader.startsWith('Bearer ')
          ? authHeader.slice('Bearer '.length).trim()
          : null;

      let user: UserSession | null = null;

      if (token) {
        const verified = verifyToken(token) as any;
        if (verified?.id && verified?.email && verified?.role) {
          user = { id: String(verified.id), email: String(verified.email), role: verified.role };
        }
      }

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
        const role = String(user.role || '');
        const normalized = role.toUpperCase();
        const ok =
          allowedRoles.map(String).includes(role) ||
          allowedRoles.map(String).map((r) => r.toUpperCase()).includes(normalized);
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
