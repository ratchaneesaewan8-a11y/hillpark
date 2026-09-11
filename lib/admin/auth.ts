import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// ใช้ในหน้า/แอ็กชันฝั่ง admin — คืน user ถ้าเป็น admin, ไม่ใช่ก็เด้งไป login
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role, name, email")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/admin/login?error=not_admin");
  return { user, profile };
}
