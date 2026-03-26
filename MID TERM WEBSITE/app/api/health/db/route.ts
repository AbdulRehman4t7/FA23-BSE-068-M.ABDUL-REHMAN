import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const t0 = Date.now();
  try {
    const { error } = await supabase.from('categories').select('id').limit(1);
    
    const responseMs = Date.now() - t0;
    
    if (error) {
      throw error;
    }

    // Insert health log asynchronously
    await supabase.from('system_health_logs').insert({
      source: 'api/health/db',
      response_ms: responseMs,
      status: 'OK',
    });

    return NextResponse.json({ status: 'OK', latency_ms: responseMs }, { status: 200 });
  } catch (error: any) {
    const responseMs = Date.now() - t0;
    
    await supabase.from('system_health_logs').insert({
      source: 'api/health/db',
      response_ms: responseMs,
      status: 'DOWN',
    });

    return NextResponse.json({ status: 'DOWN', latency_ms: responseMs }, { status: 503 });
  }
}
