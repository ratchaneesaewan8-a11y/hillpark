"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

// สร้างโค้ดแนะนำแบบสุ่มสั้นๆ เช่น HP7K3M9Q
function genRefCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `HP${s}`;
}

// อนุมัติพาร์ทเนอร์: ตั้ง ref_code, status=approved, และเปลี่ยน role ผู้ใช้เป็น partner
export async function approvePartner(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const id = formData.get("id") as string;
  const userId = formData.get("user_id") as string;
  const rate = Number(formData.get("commission_rate") || 10);

  const { error } = await admin
    .from("partners")
    .update({
      status: "approved",
      ref_code: genRefCode(),
      commission_rate: rate,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`อนุมัติไม่สำเร็จ: ${error.message}`);

  // ยกระดับ role ผู้ใช้เป็น partner (ถ้ายังไม่ใช่ admin)
  const { data: u } = await admin.from("users").select("role").eq("id", userId).single();
  if (u?.role !== "admin") {
    await admin.from("users").update({ role: "partner" }).eq("id", userId);
  }

  revalidatePath("/admin/partners");
}

// ปฏิเสธพาร์ทเนอร์
export async function rejectPartner(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const { error } = await admin.from("partners").update({ status: "rejected" }).eq("id", id);
  if (error) throw new Error(`ปฏิเสธไม่สำเร็จ: ${error.message}`);
  revalidatePath("/admin/partners");
}

// อัปเดตสถานะคำขอถอนเงิน (paid = โอนแล้ว, rejected = ปฏิเสธ)
export async function updatePayout(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string; // 'paid' | 'rejected'
  const { error } = await admin
    .from("partner_payouts")
    .update({ status, processed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`อัปเดตคำขอถอนไม่สำเร็จ: ${error.message}`);
  revalidatePath("/admin/partners");
}
