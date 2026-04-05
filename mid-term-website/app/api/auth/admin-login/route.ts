import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { AUTH_COOKIE_NAME, signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';

function normalizeRole(role: unknown) {
  return String(role || '').trim().toUpperCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);
    const db = getSupabaseAdmin() ?? supabase;

    if (!db) {
      return NextResponse.json(
        {
          error:
            'Authentication backend is not configured. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in deployment environment variables.',
        },
        { status: 503 }
      );
    }

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

    if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'No admin account found for this email. Please create admin account first.' },
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
        message: 'Admin login successful',
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
