import { createClient } from "@/lib/supabase/server";
import { formatTHB } from "@/lib/utils";
import { TrendingUp, CalendarCheck, Clock, MapPinned } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient();

  const [{ data: bookings }, { count: tourCount }] = await Promise.all([
    supabase.from("bookings").select("total, booking_status, created_at"),
    supabase.from("tours").select("*", { count: "exact", head: true }),
  ]);

  const paid = (bookings ?? []).filter((b) => b.booking_status === "PAID" || b.booking_status === "CONFIRMED");
  const totalSales = paid.reduce((s, b) => s + (b.total ?? 0), 0);
  const pending = (bookings ?? []).filter((b) => b.booking_status === "PENDING_PAYMENT").length;

  const stats = [
    { label: "ยอดขายรวม (ชำระแล้ว)", value: formatTHB(totalSales), icon: TrendingUp },
    { label: "การจองทั้งหมด", value: (bookings?.length ?? 0).toLocaleString(), icon: CalendarCheck },
    { label: "รอชำระเงิน", value: pending.toLocaleString(), icon: Clock },
    { label: "ทัวร์ทั้งหมด", value: (tourCount ?? 0).toLocaleString(), icon: MapPinned },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-text">แดชบอร์ด</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-text/60">{label}</span>
              <Icon size={20} className="text-brand-teal" />
            </div>
            <div className="mt-2 text-2xl font-bold text-brand-text">{value}</div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-brand-text/50">
        กราฟยอดขายรายวัน / ทัวร์ยอดนิยม จะเพิ่มในขั้นถัดไป
      </p>
    </div>
  );
}
