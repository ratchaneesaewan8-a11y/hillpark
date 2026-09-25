import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  const { data } = await createAdminClient().from("partners").select("id").eq("affiliate_code", code).eq("status", "approved").maybeSingle();
  const url = new URL("/tours", request.url);
  if (!data) { url.searchParams.set("ref_error", "invalid"); return NextResponse.redirect(url); }
  const response = NextResponse.redirect(url);
  response.cookies.set("hillpark_ref", code, { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return response;
}
