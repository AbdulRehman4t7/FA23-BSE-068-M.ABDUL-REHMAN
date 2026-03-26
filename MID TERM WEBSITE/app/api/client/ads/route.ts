import { NextResponse } from 'next/server';
import { withAuth, UserSession } from '@/lib/auth';

// Temporary minimal handler for debugging.
// (We will restore the full create-ad flow after confirming the route executes.)
export const POST = withAuth(
  async (_req: Request, _user: UserSession) => {
    return NextResponse.json({ message: 'ads POST route is working (debug)' }, { status: 201 });
  },
  ['CLIENT', 'ADMIN', 'MODERATOR']
);
