import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// -----------------------------------------------------------------------------
// GET /auth/callback
// ปลายทางหลังล็อกอินด้วย Google (OAuth) — แลก code เป็น session แล้วพากลับหน้าเว็บ
// ต้องตั้ง Redirect URL นี้ใน Supabase และ Google Cloud Console ด้วย
// -----------------------------------------------------------------------------
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // ถ้าล้มเหลว -> กลับไปหน้า login พร้อมแจ้ง error
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
