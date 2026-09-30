"use server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

const statuses = ["PENDING_PAYMENT", "PAID", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED", "PAYMENT_FAILED"];
export async function updateBookingStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id")); const booking_status = String(formData.get("booking_status"));
  if (!id || !statuses.includes(booking_status)) return;
  const db = createAdminClient();
  const { data: booking } = await db.from("bookings").select("booking_number").eq("id", id).maybeSingle();
  await db.from("bookings").update({ booking_status }).eq("id", id);
  if (booking?.booking_number) {
    if (["CANCELLED", "REFUNDED"].includes(booking_status)) {
      await db.from("partner_commissions").update({ status: "void" }).eq("booking_ref", booking.booking_number).in("status", ["pending", "available"]);
    }
    if (["CANCELLED", "REFUNDED"].includes(booking_status)) await db.from("booking_revenue_splits").update({ status: "void", updated_at: new Date().toISOString() }).eq("booking_id", id);
  }
  revalidatePath("/admin/bookings"); revalidatePath("/admin/partners"); revalidatePath("/partner");
}

// ลบรายการจองในระบบ Hillpark พร้อมเครดิตพาร์ทเนอร์ที่ผูกกับรายการนั้น
// ไม่ลบหรือคืนเงินจริงใน Stripe (ต้องดำเนินการผ่าน Stripe แยกต่างหาก)
export async function deleteBooking(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const db = createAdminClient();
  const { data: booking } = await db.from("bookings").select("booking_number").eq("id", id).maybeSingle();
  if (!booking) return;

  const { data: paidCommission } = await db
    .from("partner_commissions")
    .select("id")
    .eq("booking_ref", booking.booking_number)
    .eq("status", "paid")
    .maybeSingle();
  if (paidCommission) throw new Error("ลบไม่ได้ เพราะเครดิตของรายการนี้ถูกโอนจ่ายไปแล้ว");

  await db.from("partner_commissions").delete().eq("booking_ref", booking.booking_number);
  await db.from("commissions").delete().eq("booking_id", id);
  const { error } = await db.from("bookings").delete().eq("id", id);
  if (error) throw new Error(`ลบรายการจองไม่สำเร็จ: ${error.message}`);
  revalidatePath("/admin"); revalidatePath("/admin/bookings"); revalidatePath("/admin/partners"); revalidatePath("/partner");
}
