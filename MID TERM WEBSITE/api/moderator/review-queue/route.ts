import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';

export const GET = withAuth(async (req: Request, user: UserSession) => {
  try {
    const { data: queue, error } = await supabase
      .from('ads')
      .select('*, users(id, name, email)')
      .eq('status', 'SUBMITTED')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch review queue' }, { status: 500 });
    }

    return NextResponse.json({ queue }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['MODERATOR', 'ADMIN', 'SUPER_ADMIN']);
