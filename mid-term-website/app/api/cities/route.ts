import { NextResponse } from "next/server";
import { mockGetCities } from "@/lib/mock-db";

export async function GET() {
  return NextResponse.json({ cities: mockGetCities() }, { status: 200 });
}
