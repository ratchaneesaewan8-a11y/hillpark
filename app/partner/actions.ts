"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function requestWithdrawal(formData: FormData) {
  const amount = Number(formData.get("amount"));
  const partnerId = String(formData.get("partner_id"));
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !partnerId || !Number.isFinite(amount) || amount <= 0) return;
  const { data: partner } = await supabase.from("partners").select("id").eq("id", partnerId).eq("user_id", user.id).maybeSingle();
  if (!partner) return;
  const [{ data: credits }, { data: withdrawals }] = await Promise.all([
    supabase.from("commissions").select("amount").eq("partner_id", partnerId).eq("status", "available"),
    supabase.from("withdrawals").select("amount").eq("partner_id", partnerId).in("status", ["requested", "approved"]),
  ]);
  const balance = (credits ?? []).reduce((sum, c) => sum + c.amount, 0) - (withdrawals ?? []).reduce((sum, w) => sum + w.amount, 0);
  if (amount > balance) return;
  await supabase.from("withdrawals").insert({ partner_id: partnerId, amount });
  revalidatePath("/partner");
}
