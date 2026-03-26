import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Demo sanity response (temporary).
  return NextResponse.json({ message: 'demo create-ad route is working' }, { status: 201 })
}

