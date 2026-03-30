import { NextResponse } from 'next/server';
import { mockInsertHealthLog } from '@/lib/mock-db';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function logHealthSnapshot(status: 'OK' | 'DOWN', responseMs: number) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('system_health_logs').insert({
      source: 'api/health/db',
      response_ms: responseMs,
      status,
    });
  } catch {
    // A failed health-log insert should not take down the endpoint itself.
  }
}

export async function GET() {
  const t0 = Date.now();

  if (!isSupabaseConfigured || !supabase) {
    const health = mockInsertHealthLog();
    return NextResponse.json(
      {
        status: 'DEMO',
        latency_ms: health.db_latency_ms,
        queue_depth: health.queue_depth,
      },
      { status: 200 }
    );
  }

  try {
    const { error } = await supabase.from('categories').select('id').limit(1);

    const responseMs = Date.now() - t0;

    if (error) {
      throw error;
    }

    await logHealthSnapshot('OK', responseMs);

    return NextResponse.json({ status: 'OK', latency_ms: responseMs }, { status: 200 });
  } catch {
    const responseMs = Date.now() - t0;

    await logHealthSnapshot('DOWN', responseMs);

    return NextResponse.json({ status: 'DOWN', latency_ms: responseMs }, { status: 503 });
  }
}
