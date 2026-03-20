import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { registerSchema } from '@/lib/validations/auth';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // Check if user exists
    const { data: existingUser } = await supabase
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
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        password_hash: passwordHash,
        role: validatedData.role,
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

    return NextResponse.json({
      message: 'User registered successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      token,
    }, { status: 201 });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
