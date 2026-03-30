import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const apiSuccess = (data: any, message = "Success", status = 200) => {
  return NextResponse.json({ success: true, message, data }, { status });
};

export const apiError = (message = "Error", status = 400, details: any = null) => {
  return NextResponse.json({ success: false, message, details }, { status });
};

export const getSessionUser = async (req: NextRequest) => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
};

export const requireRole = (user: any, ...roles: string[]) => {
  if (!user) return false;
  return roles.includes(user.user_metadata?.role || "client");
};

export const getPagination = (page: number, limit: number) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
};
