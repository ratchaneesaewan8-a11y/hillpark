"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

const statuses = ["PENDING_PAYMENT", "PAID", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED", "PAYMENT_FAILED"];
export async function updateBookingStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id")); const booking_status = String(formData.get("booking_status"));
  if (!id || !statuses.includes(booking_status)) return;
  await createClient().from("bookings").update({ booking_status }).eq("id", id);
  revalidatePath("/admin/bookings"); revalidatePath("/admin/partners");
}
