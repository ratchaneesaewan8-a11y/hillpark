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

function refresh(partnerId?: string) {
  revalidatePath("/admin/partners");
  if (partnerId) revalidatePath(`/admin/partners/${partnerId}`);
  revalidatePath("/partner");
}

// อนุมัติพาร์ทเนอร์: ตั้ง ref_code (ถ้ายังไม่มี), status=approved, เปลี่ยน role เป็น partner
export async function approvePartner(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const id = formData.get("id") as string;
  const userId = formData.get("user_id") as string;
  const rate = Number(formData.get("commission_rate") || 10);

  const { data: current } = await admin.from("partners").select("ref_code").eq("id", id).single();

  const { error } = await admin
    .from("partners")
    .update({
      status: "approved",
      ref_code: current?.ref_code || genRefCode(), // อนุมัติซ้ำ (หลังระงับ) ใช้โค้ดเดิม
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

  refresh(id);
}

// ปฏิเสธพาร์ทเนอร์
export async function rejectPartner(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const { error } = await admin.from("partners").update({ status: "rejected" }).eq("id", id);
  if (error) throw new Error(`ปฏิเสธไม่สำเร็จ: ${error.message}`);
  refresh(id);
}

// แก้ไขข้อมูลพาร์ทเนอร์ (ข้อมูลติดต่อ, บัญชีธนาคาร, อัตราคอม, สถานะ)
export async function updatePartner(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const val = (k: string) => ((formData.get(k) as string) || "").trim();

  const status = val("status");
  const allowed = ["pending", "approved", "suspended", "rejected"];
  if (!allowed.includes(status)) throw new Error("สถานะไม่ถูกต้อง");

  const { error } = await admin
    .from("partners")
    .update({
      business_name: val("business_name") || null,
      phone: val("phone") || null,
      bank_name: val("bank_name") || null,
      bank_account_name: val("bank_account_name") || null,
      bank_account_no: val("bank_account_no") || null,
      commission_rate: Math.max(0, Math.min(100, Number(val("commission_rate") || 0))),
      status,
    })
    .eq("id", id);
  if (error) throw new Error(`บันทึกข้อมูลพาร์ทเนอร์ไม่สำเร็จ: ${error.message}`);
  refresh(id);
}

// เพิ่มรายการค่าคอมด้วยมือ (ใช้ระหว่างที่ยังไม่มีการบันทึกอัตโนมัติจากการจอง)
export async function addCommission(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const partnerId = formData.get("partner_id") as string;
  const bookingRef = ((formData.get("booking_ref") as string) || "").trim() || null;
  const orderAmount = Math.floor(Number(formData.get("order_amount") || 0));
  const rate = Number(formData.get("rate") || 0);
  const status = (formData.get("status") as string) || "pending";
  if (orderAmount <= 0) throw new Error("ยอดจองไม่ถูกต้อง");

  const { error } = await admin.from("partner_commissions").insert({
    partner_id: partnerId,
    booking_ref: bookingRef,
    order_amount: orderAmount,
    rate_at_booking: rate, // ล็อกอัตรา ณ วันจอง
    amount: Math.round((orderAmount * rate) / 100),
    status,
  });
  if (error) throw new Error(`เพิ่มค่าคอมไม่สำเร็จ: ${error.message}`);
  refresh(partnerId);
}

// ตั้งสถานะค่าคอมแต่ละรายการ (pending / available / paid / void)
export async function updateCommissionStatus(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const partnerId = formData.get("partner_id") as string;
  const status = formData.get("status") as string;
  if (!["pending", "available", "paid", "void"].includes(status)) throw new Error("สถานะไม่ถูกต้อง");
  const voidReason = ((formData.get("void_reason") as string) || "").trim() || null;

  const { error } = await admin
    .from("partner_commissions")
    .update({ status, void_reason: status === "void" ? voidReason : null })
    .eq("id", id);
  if (error) throw new Error(`อัปเดตสถานะค่าคอมไม่สำเร็จ: ${error.message}`);
  refresh(partnerId);
}

// อัปเดตสถานะคำขอถอนเงิน (paid = โอนแล้ว, rejected = ปฏิเสธ)
export async function updatePayout(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  const partnerId = (formData.get("partner_id") as string) || undefined;
  const status = formData.get("status") as string; // 'paid' | 'rejected'
  if (!["paid", "rejected"].includes(status)) throw new Error("สถานะไม่ถูกต้อง");

  const { data: payout } = await admin
    .from("partner_payouts")
    .select("id, partner_id, amount, status")
    .eq("id", id)
    .single();
  if (!payout) throw new Error("ไม่พบคำขอถอน");
  if (payout.status !== "pending") throw new Error("คำขอนี้ดำเนินการไปแล้ว");

  // โอนแล้ว -> ล็อกค่าคอม "พร้อมถอน" ตามยอดที่โอนให้เป็น "จ่ายแล้ว" (กันถอนซ้ำ)
  if (status === "paid") {
    const { data: avail } = await admin
      .from("partner_commissions")
      .select("*")
      .eq("partner_id", payout.partner_id)
      .eq("status", "available")
      .order("created_at", { ascending: true });

    const total = (avail ?? []).reduce((s, c: any) => s + (c.amount || 0), 0);
    if (total < payout.amount) {
      throw new Error(`ค่าคอมพร้อมถอนมีเพียง ${total} บาท ไม่พอกับยอดโอน ${payout.amount} บาท`);
    }

    let remaining = payout.amount;
    for (const c of avail ?? []) {
      if (remaining <= 0) break;
      if (c.amount <= remaining) {
        // ใช้ทั้งรายการ
        await admin.from("partner_commissions").update({ status: "paid" }).eq("id", c.id);
        remaining -= c.amount;
      } else {
        // ใช้บางส่วน -> แยกรายการ: ส่วนที่จ่ายแล้ว + ส่วนที่เหลือยังพร้อมถอน
        await admin.from("partner_commissions").update({ amount: c.amount - remaining }).eq("id", c.id);
        await admin.from("partner_commissions").insert({
          partner_id: c.partner_id,
          booking_ref: c.booking_ref,
          order_amount: 0,
          rate_at_booking: c.rate_at_booking,
          amount: remaining,
          status: "paid",
        });
        remaining = 0;
      }
    }
  }

  const { error } = await admin
    .from("partner_payouts")
    .update({
      status,
      processed_at: new Date().toISOString(),
      transfer_ref: ((formData.get("transfer_ref") as string) || "").trim() || null,
      admin_note: ((formData.get("admin_note") as string) || "").trim() || null,
    })
    .eq("id", id);
  if (error) throw new Error(`อัปเดตคำขอถอนไม่สำเร็จ: ${error.message}`);
  refresh(partnerId || payout.partner_id);
}
