import { NextResponse } from 'next/server';
import { decodeSessionFromToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const token = getTokenFromRequest(req);
  const user = decodeSessionFromToken(token);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user }, { status: 200 });
}
