import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { AUTH_COOKIE_NAME, signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';

function normalizeRole(role: unknown) {
  return String(role || '').trim().toUpperCase();
}

function isAllowedModeratorRole(role: string) {
  return ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(role);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);
    const db = getSupabaseAdmin() ?? supabase;

    const { data: user, error } = await db
      .from('users')
      .select('id, name, email, password_hash, role, status, created_at')
      .eq('email', validatedData.email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (String(user.status).toUpperCase() !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is disabled' }, { status: 403 });
    }

    const role = normalizeRole(user.role);

    if (!isAllowedModeratorRole(role)) {
      return NextResponse.json(
        { error: 'No moderator account found for this email. Please create moderator account first.' },
        { status: 403 }
      );
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role,
    });

    const response = NextResponse.json(
      {
        message: 'Moderator login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
          created_at: user.created_at,
        },
        token,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
