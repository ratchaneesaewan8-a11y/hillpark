import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client สำหรับฝั่ง server (Server Components / Route Handlers)
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ถูกเรียกจาก Server Component — ข้ามได้ถ้ามี middleware refresh session
          }
        },
      },
    }
  );
}

// Client ที่ใช้ service role — เฉพาะงานฝั่ง server ที่ต้องข้าม RLS (เช่น webhook)
// ห้าม import ไฟล์นี้เข้า client component เด็ดขาด
import { createClient as createSbClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
