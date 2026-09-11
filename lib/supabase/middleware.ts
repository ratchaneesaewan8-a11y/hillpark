import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// รีเฟรช session ของ Supabase ในทุก request (ให้ cookie อัปเดตเสมอ)
export async function updateSession(request: NextRequest) {
  // ถ้ายังไม่ตั้งค่า Supabase (dev ในเครื่องก่อนต่อ DB) ให้ผ่านไปเฉย ๆ ไม่พังเว็บ
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
}
