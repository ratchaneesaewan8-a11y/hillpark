"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
export async function updateWithdrawal(formData: FormData) { const { user } = await requireAdmin(); const id = String(formData.get("id")); const status = String(formData.get("status")); if (!id || !["requested","approved","paid","rejected"].includes(status)) return; await createClient().from("withdrawals").update({ status, processed_at: status === "requested" ? null : new Date().toISOString(), processed_by: status === "requested" ? null : user.id }).eq("id", id); revalidatePath("/admin/withdrawals"); }
