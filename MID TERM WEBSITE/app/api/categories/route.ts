import { NextResponse } from "next/server";
import { mockGetCategories } from "@/lib/mock-db";

export async function GET() {
  return NextResponse.json({ categories: mockGetCategories() }, { status: 200 });
}
