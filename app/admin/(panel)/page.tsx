import { createAdminClient } from "@/lib/supabase/server";
import { formatTHB } from "@/lib/utils";
import { TrendingUp, CalendarCheck, Clock, MapPinned, ReceiptText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [{ data: bookings }, { count: tourCount }, { data: recentPartnerBookings }] = await Promise.all([
    supabase.from("bookings").select("total, booking_status, created_at"),
    supabase.from("tours").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("id, booking_number, total, booking_status, payment_status, created_at, partners(id, full_name, business_name, affiliate_code)").not("affiliate_partner_id", "is", null).order("created_at", { ascending: false }).limit(10),
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
      <section className="mt-7 rounded-2xl bg-white p-5 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h2 className="flex items-center gap-2 text-lg font-bold text-brand-text"><ReceiptText size={20} className="text-brand-orange" /> รายการล่าสุดจากพาร์ทเนอร์</h2><p className="text-sm text-brand-text/55">10 รายการจองและสถานะการชำระเงินล่าสุด</p></div>
          <Link href="/admin/bookings" className="text-sm font-semibold text-brand-orange hover:underline">ดูทั้งหมด</Link>
        </div>
        {recentPartnerBookings?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="bg-brand-bg text-left text-xs text-brand-text/55"><tr><th className="px-3 py-3">เวลา</th><th className="px-3 py-3">การจอง</th><th className="px-3 py-3">พาร์ทเนอร์</th><th className="px-3 py-3">ยอดเงิน</th><th className="px-3 py-3">สถานะ</th></tr></thead><tbody>{recentPartnerBookings.map((b: any) => <tr key={b.id} className="border-b border-black/5"><td className="px-3 py-3 text-brand-text/60">{new Date(b.created_at).toLocaleString("th-TH")}</td><td className="px-3 py-3 font-semibold">{b.booking_number}</td><td className="px-3 py-3">{b.partners ? <Link href={`/admin/partners/${b.partners.id}`} className="text-brand-teal hover:underline">{b.partners.business_name || b.partners.full_name || b.partners.affiliate_code}</Link> : "-"}</td><td className="px-3 py-3 font-semibold">{formatTHB(b.total)}</td><td className="px-3 py-3">{b.booking_status === "PAID" || b.booking_status === "CONFIRMED" || b.booking_status === "COMPLETED" ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">ชำระแล้ว</span> : <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">{b.booking_status === "PENDING_PAYMENT" ? "รอชำระ" : b.booking_status}</span>}</td></tr>)}</tbody></table></div> : <p className="rounded-xl bg-brand-bg px-4 py-8 text-center text-sm text-brand-text/55">ยังไม่มีรายการจองผ่านพาร์ทเนอร์</p>}
      </section>
    </div>
  );
}
