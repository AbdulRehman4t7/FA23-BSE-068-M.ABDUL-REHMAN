import { NextResponse, type NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'adflow_auth';

function decodePayload(token: string | undefined) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const raw = atob(padded);
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

function normalizeRole(role: unknown) {
  return String(role || '').trim().toUpperCase();
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (!pathname.startsWith('/moderator')) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = decodePayload(token);
  const role = normalizeRole(payload?.role);
  const allowed = ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(role);

  if (!allowed) {
    const url = req.nextUrl.clone();
    url.pathname = '/unauthorized';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/moderator/:path*'],
};
