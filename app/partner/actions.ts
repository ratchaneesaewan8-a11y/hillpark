"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// สมัครเป็นพาร์ทเนอร์ (ผู้ใช้ที่ล็อกอินอยู่)
export async function applyPartner(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fields = {
    business_name: ((formData.get("business_name") as string) || "").trim() || null,
    phone: ((formData.get("phone") as string) || "").trim() || null,
    note: ((formData.get("note") as string) || "").trim() || null,
  };

  // มีใบสมัครอยู่แล้วไหม (1 user = 1 ใบสมัคร)
  const { data: existing } = await supabase
    .from("partners")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // สมัครใหม่ได้เฉพาะกรณีเคยถูกปฏิเสธ -> ตั้งกลับเป็น pending
    if (existing.status === "rejected") {
      const { error } = await supabase
        .from("partners")
        .update({ ...fields, status: "pending" })
        .eq("id", existing.id);
      if (error) throw new Error(`ส่งใบสมัครไม่สำเร็จ: ${error.message}`);
    }
    // pending/approved -> ไม่ต้องทำอะไร แค่พากลับไปหน้าสถานะ
  } else {
    const { error } = await supabase
      .from("partners")
      .insert({ user_id: user.id, status: "pending", ...fields });
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

  const { data: partner } = await supabase
    .from("partners")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!partner || partner.status !== "approved") throw new Error("คุณยังไม่ใช่พาร์ทเนอร์ที่อนุมัติแล้ว");

  const amount = Math.floor(Number(formData.get("amount") || 0));
  const bankInfo = ((formData.get("bank_info") as string) || "").trim();
  if (amount <= 0) throw new Error("จำนวนเงินไม่ถูกต้อง");
  if (!bankInfo) throw new Error("กรุณากรอกข้อมูลบัญชีรับเงิน");

  // คำนวณยอดที่ถอนได้ฝั่ง server (กันถอนเกิน)
  const [{ data: comms }, { data: payouts }] = await Promise.all([
    supabase.from("partner_commissions").select("amount").eq("partner_id", partner.id),
    supabase.from("partner_payouts").select("amount, status").eq("partner_id", partner.id),
  ]);
  const earned = (comms ?? []).reduce((s, c: any) => s + (c.amount || 0), 0);
  const used = (payouts ?? [])
    .filter((p: any) => p.status !== "rejected")
    .reduce((s, p: any) => s + (p.amount || 0), 0);
  const available = earned - used;
  if (amount > available) throw new Error(`ยอดที่ถอนได้มีเพียง ${available} บาท`);

  const { error } = await supabase.from("partner_payouts").insert({
    partner_id: partner.id,
    amount,
    bank_info: bankInfo,
    status: "pending",
  });
  if (error) throw new Error(`ส่งคำขอถอนไม่สำเร็จ: ${error.message}`);

  revalidatePath("/partner");
}
