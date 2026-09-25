"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function updatePartner(formData: FormData) {
  const { user } = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const commission_rate = Number(formData.get("commission_rate"));
  if (!id || !["pending", "approved", "suspended", "rejected"].includes(status) || Number.isNaN(commission_rate)) return;
  const payload: { status: string; commission_rate: number; approved_by?: string } = { status, commission_rate };
  if (status === "approved") payload.approved_by = user.id;
  await createClient().from("partners").update(payload).eq("id", id);
  revalidatePath("/admin/partners");
}
