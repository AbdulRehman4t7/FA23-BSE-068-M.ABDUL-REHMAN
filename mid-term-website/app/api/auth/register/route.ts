import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';
import { registerSchema } from '@/lib/validations/auth';
import { AUTH_COOKIE_NAME, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);
    const db = getSupabaseAdmin() ?? supabase;
    const normalizedRole = 'client';

    // Check if user exists
    const { data: existingUser } = await db
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    // Insert user
    const { data: newUser, error } = await db
      .from('users')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        password_hash: passwordHash,
        role: normalizedRole,
      })
      .select('id, email, role, name')
      .single();

    if (error || !newUser) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Generate JWT
    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json({
      message: 'User registered successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      token,
    }, { status: 201 });

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
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
