"use client";

import { Trash2 } from "lucide-react";
import { deleteBooking } from "@/app/admin/(panel)/bookings/actions";

export function DeleteBookingButton({ bookingId, bookingNumber }: { bookingId: string; bookingNumber: string }) {
  return (
    <form
      action={deleteBooking}
      onSubmit={(event) => {
        if (!window.confirm(`ลบรายการ ${bookingNumber} จากระบบ Hillpark?\nยอดขายและเครดิตพาร์ทเนอร์ของรายการนี้จะถูกลบด้วย`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={bookingId} />
      <button type="submit" className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
        <Trash2 size={14} /> ลบ
      </button>
    </form>
  );
}
