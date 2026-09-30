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
    if (booking_status === "COMPLETED") {
      await db.from("partner_commissions").update({ status: "available" }).eq("booking_ref", booking.booking_number).eq("status", "pending");
    } else if (["CANCELLED", "REFUNDED"].includes(booking_status)) {
      await db.from("partner_commissions").update({ status: "void" }).eq("booking_ref", booking.booking_number).in("status", ["pending", "available"]);
    }
  }
  revalidatePath("/admin/bookings"); revalidatePath("/admin/partners"); revalidatePath("/partner");
}
