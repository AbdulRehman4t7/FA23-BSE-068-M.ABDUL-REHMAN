import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';

const ALLOWED_ROLES = new Set(['CLIENT', 'USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']);
const ALLOWED_STATUS = new Set(['ACTIVE', 'SUSPENDED', 'DISABLED']);

function toDbRole(role: string) {
  const normalized = String(role || '').trim().toUpperCase();
  if (normalized === 'USER') return 'client';
  return normalized.toLowerCase();
}

export const GET = withAuth(async () => {
  try {
    const db = getSupabaseAdmin() ?? supabase;
    const { data, error } = await db
      .from('users')
      .select('id, name, email, role, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users: data || [] }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['ADMIN', 'SUPER_ADMIN']);

export const PATCH = withAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const userId = String(body.userId || '').trim();
    const role = String(body.role || '').trim().toUpperCase();
    const status = String(body.status || '').trim().toUpperCase();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const updatePayload: Record<string, string> = {};
    if (role) {
      if (!ALLOWED_ROLES.has(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      updatePayload.role = toDbRole(role);
    }

    if (status) {
      if (!ALLOWED_STATUS.has(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updatePayload.status = status;
    }

    if (!Object.keys(updatePayload).length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const db = getSupabaseAdmin() ?? supabase;

    const { data, error } = await db
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select('id, name, email, role, status, created_at')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ user: data, message: 'User updated successfully' }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['ADMIN', 'SUPER_ADMIN']);
