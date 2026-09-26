"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// สมัครเป็นพาร์ทเนอร์ (ผู้ใช้ที่ล็อกอินอยู่)
export async function applyPartner(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const val = (k: string) => ((formData.get(k) as string) || "").trim();
  const fields = {
    business_name: val("business_name") || null,
    phone: val("phone") || null,
    bank_name: val("bank_name"),
    bank_account_name: val("bank_account_name"),
    bank_account_no: val("bank_account_no").replace(/[^0-9-]/g, ""),
  };
  if (!fields.bank_name || !fields.bank_account_name || !fields.bank_account_no) {
    throw new Error("กรุณากรอกข้อมูลบัญชีธนาคารให้ครบ");
  }

  // เขียนข้อมูลผ่าน server (service role) หลังยืนยันตัวผู้ใช้แล้ว — ผู้ใช้เขียนตรงจาก browser ไม่ได้
  const db = createAdminClient();

  // มีใบสมัครอยู่แล้วไหม (1 user = 1 ใบสมัคร)
  const { data: existing } = await db
    .from("partners")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // สมัครใหม่ได้เฉพาะกรณีเคยถูกปฏิเสธ -> ตั้งกลับเป็น pending
    if (existing.status === "rejected") {
      const { error } = await db
        .from("partners")
        .update({ ...fields, status: "pending" })
        .eq("id", existing.id);
      if (error) throw new Error(`ส่งใบสมัครไม่สำเร็จ: ${error.message}`);
    }
    // pending/approved -> ไม่ต้องทำอะไร แค่พากลับไปหน้าสถานะ
  } else {
    const { error } = await db
      .from("partners")
      .insert({ user_id: user.id, status: "pending", ...fields }); // สถานะ/อัตราคอมกำหนดโดยระบบ
    if (error) throw new Error(`ส่งใบสมัครไม่สำเร็จ: ${error.message}`);
  }

  revalidatePath("/partner");
  redirect("/partner");
}

// ขอถอนค่าคอมมิชชัน
export async function requestPayout(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: partner } = await db
    .from("partners")
    .select("id, status, bank_name, bank_account_name, bank_account_no")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!partner || partner.status !== "approved") throw new Error("คุณยังไม่ใช่พาร์ทเนอร์ที่อนุมัติแล้ว");

  const amount = Math.floor(Number(formData.get("amount") || 0));
  // ใช้บัญชีธนาคารที่ลงทะเบียนไว้ตอนสมัคร
  const bankInfo = [partner.bank_name, partner.bank_account_no, partner.bank_account_name]
    .filter(Boolean)
    .join(" · ");
  if (amount <= 0) throw new Error("จำนวนเงินไม่ถูกต้อง");
  if (!bankInfo) throw new Error("ยังไม่มีข้อมูลบัญชีธนาคาร กรุณาติดต่อผู้ดูแลระบบ");

  // คำนวณยอดที่ถอนได้ฝั่ง server (กันถอนเกิน)
  const [{ data: comms }, { data: payouts }] = await Promise.all([
    db.from("partner_commissions").select("amount").eq("partner_id", partner.id).eq("status", "available"),
    db.from("partner_payouts").select("amount, status").eq("partner_id", partner.id),
  ]);
  // ถอนได้เฉพาะค่าคอมสถานะ "พร้อมถอน" หักยอดที่อยู่ในคำขอถอนที่รอโอน
  // (คำขอที่โอนแล้ว ค่าคอมส่วนนั้นถูกล็อกเป็น "จ่ายแล้ว" ไปแล้ว)
  const earned = (comms ?? []).reduce((s, c: any) => s + (c.amount || 0), 0);
  const used = (payouts ?? [])
    .filter((p: any) => p.status === "pending")
    .reduce((s, p: any) => s + (p.amount || 0), 0);
  const available = earned - used;
  if (amount > available) throw new Error(`ยอดที่ถอนได้มีเพียง ${available} บาท`);

  const { error } = await db.from("partner_payouts").insert({
    partner_id: partner.id,
    amount,
    bank_info: bankInfo,
    status: "pending",
  });
  if (error) throw new Error(`ส่งคำขอถอนไม่สำเร็จ: ${error.message}`);

  revalidatePath("/partner");
}
