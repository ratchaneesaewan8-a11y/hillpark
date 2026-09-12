"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

// -----------------------------------------------------------------------------
// จัดการผู้ใช้แอดมิน (สร้างแอดมินใหม่ / เปลี่ยนรหัสผ่าน)
// ใช้ service-role client (createAdminClient) เพราะต้องเรียก Supabase Auth Admin API
// ทุกแอ็กชันต้องผ่าน requireAdmin() ก่อน — ให้เฉพาะแอดมินที่ล็อกอินอยู่เท่านั้นทำได้
// -----------------------------------------------------------------------------

// สร้างผู้ใช้แอดมินใหม่
export async function createAdminUser(formData: FormData) {
  await requireAdmin();

  const name = ((formData.get("name") as string) || "").trim();
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const password = (formData.get("password") as string) || "";

  if (!email) throw new Error("กรุณากรอกอีเมล");
  if (password.length < 6) throw new Error("รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร");

  const admin = createAdminClient();

  // 1) สร้างบัญชีใน Supabase Auth (ยืนยันอีเมลให้เลย ไม่ต้องส่งเมลยืนยัน)
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error) throw new Error(`สร้างแอดมินไม่สำเร็จ: ${error.message}`);

  const newUserId = data.user?.id;
  if (!newUserId) throw new Error("สร้างแอดมินไม่สำเร็จ: ไม่พบ user id");

  // 2) trigger จะสร้างแถวใน public.users ให้อัตโนมัติ (role=customer) -> อัปเดตเป็น admin
  const { error: upErr } = await admin
    .from("users")
    .update({ role: "admin", name })
    .eq("id", newUserId);
  if (upErr) throw new Error(`ตั้งสิทธิ์แอดมินไม่สำเร็จ: ${upErr.message}`);

  revalidatePath("/admin/users");
}

// เปลี่ยนรหัสผ่านของผู้ใช้ (ตาม user id)
export async function changePassword(formData: FormData) {
  await requireAdmin();

  const userId = (formData.get("user_id") as string) || "";
  const password = (formData.get("password") as string) || "";

  if (!userId) throw new Error("ไม่พบผู้ใช้");
  if (password.length < 6) throw new Error("รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) throw new Error(`เปลี่ยนรหัสผ่านไม่สำเร็จ: ${error.message}`);

  revalidatePath("/admin/users");
}
