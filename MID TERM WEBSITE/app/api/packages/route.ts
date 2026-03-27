import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mockGetPackages } from '@/lib/mock-db';

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !anon || url.includes('your-supabase-url') || anon.includes('your-anon-key');
}

export async function GET() {
  try {
    if (isDemoMode()) {
      return NextResponse.json({ packages: mockGetPackages() }, { status: 200 });
    }

    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
    }

    return NextResponse.json({ packages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
