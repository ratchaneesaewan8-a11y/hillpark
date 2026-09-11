import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

// หน้า Booking Confirmation (เวอร์ชันเริ่มต้น)
// TODO: ดึง booking จริงจาก Supabase ด้วย booking_number, แสดง Voucher + ปุ่ม Download PDF
export default function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { booking?: string };
}) {
  const bookingNumber = searchParams.booking ?? "HP-2026-000000";

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <CheckCircle2 size={64} className="text-brand-teal" />
      <h1 className="mt-4 text-3xl font-bold text-brand-text">จองสำเร็จ 🎉</h1>
      <p className="mt-2 text-brand-text/70">ขอบคุณที่จองกับ HILLPARK ADVENTURE</p>

      <div className="mt-6 w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-card">
        <Row label="Booking ID" value={bookingNumber} />
        <Row label="สถานะ" value="PAID / CONFIRMED" />
        <p className="mt-4 text-sm text-brand-text/60">
          ระบบได้ส่ง e-Ticket ไปยังอีเมลของคุณแล้ว (เมื่อเชื่อมอีเมลใน Phase ถัดไป)
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/bookings" className="btn-primary">ดูการจองของฉัน</Link>
        <Link href="/" className="rounded-xl border border-black/10 px-5 py-3 font-semibold text-brand-text">
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 py-2 last:border-0">
      <span className="text-sm text-brand-text/60">{label}</span>
      <span className="font-semibold text-brand-text">{value}</span>
    </div>
  );
}
