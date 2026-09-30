import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, X, Plus, Save, Landmark, Wallet, ReceiptText, CalendarDays, Users } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { formatTHB } from "@/lib/utils";
import { THAI_BANKS, PARTNER_TYPES, partnerTypeLabel } from "@/lib/partner/banks";
import {
  approvePartner,
  updatePartner,
  addCommission,
  updateCommissionStatus,
  updatePayout,
} from "../actions";

export const dynamic = "force-dynamic";

const PARTNER_STATUS: Record<string, { text: string; cls: string }> = {
  pending: { text: "รออนุมัติ", cls: "bg-brand-orange/10 text-brand-orange" },
  approved: { text: "อนุมัติแล้ว", cls: "bg-brand-teal/10 text-brand-teal" },
  suspended: { text: "ระงับ", cls: "bg-black/10 text-brand-text/60" },
  rejected: { text: "ปฏิเสธ", cls: "bg-red-100 text-red-600" },
};

const COMM_STATUS: Record<string, { text: string; cls: string }> = {
  pending: { text: "รอใช้บริการ", cls: "bg-brand-orange/10 text-brand-orange" },
  available: { text: "พร้อมถอน", cls: "bg-brand-teal/10 text-brand-teal" },
  paid: { text: "จ่ายแล้ว", cls: "bg-black/5 text-brand-text/60" },
  void: { text: "ยกเลิก", cls: "bg-red-100 text-red-500" },
};

const PAYOUT_STATUS: Record<string, { text: string; cls: string }> = {
  pending: { text: "รอโอน", cls: "text-brand-orange" },
  paid: { text: "โอนแล้ว", cls: "text-brand-teal" },
  rejected: { text: "ปฏิเสธ", cls: "text-red-500" },
};

const BOOKING_STATUS: Record<string, { text: string; cls: string }> = {
  PENDING_PAYMENT: { text: "รอชำระเงิน", cls: "bg-amber-100 text-amber-700" },
  PAID: { text: "ชำระแล้ว", cls: "bg-sky-100 text-sky-700" },
  CONFIRMED: { text: "ยืนยันแล้ว", cls: "bg-indigo-100 text-indigo-700" },
  COMPLETED: { text: "ใช้บริการแล้ว", cls: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { text: "ยกเลิก", cls: "bg-red-100 text-red-600" },
  REFUNDED: { text: "คืนเงินแล้ว", cls: "bg-red-100 text-red-600" },
  PAYMENT_FAILED: { text: "ชำระไม่สำเร็จ", cls: "bg-red-100 text-red-600" },
};

export default async function AdminPartnerDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: p } = await admin.from("partners").select("*").eq("id", params.id).single();
  if (!p) return notFound();

  const [{ data: u }, { data: comms }, { data: pos }, { data: bookingRows }] = await Promise.all([
    admin.from("users").select("name, email").eq("id", p.user_id).single(),
    admin.from("partner_commissions").select("*").eq("partner_id", p.id).order("created_at", { ascending: false }),
    admin.from("partner_payouts").select("*").eq("partner_id", p.id).order("requested_at", { ascending: false }),
    admin.from("bookings").select("id, booking_number, booking_date, start_time, adults, children, infants, total, booking_status, payment_status, affiliate_commission, created_at, packages(name_th)").eq("affiliate_partner_id", p.id).order("created_at", { ascending: false }),
  ]);
  const commissions = comms ?? [];
  const payouts = pos ?? [];
  const bookings = bookingRows ?? [];
  const bookingIds = bookings.map((b: any) => b.id);
  const { data: contacts } = bookingIds.length ? await admin.from("booking_contacts").select("booking_id, first_name, last_name, phone").in("booking_id", bookingIds) : { data: [] as any[] };
  const contactByBooking = new Map((contacts ?? []).map((c: any) => [c.booking_id, c]));

  const sum = (arr: any[], f: (x: any) => boolean, k = "amount") =>
    arr.filter(f).reduce((s, x) => s + (x[k] || 0), 0);
  const sales = bookings.filter((b: any) => !["CANCELLED", "REFUNDED", "PAYMENT_FAILED"].includes(b.booking_status)).reduce((s: number, b: any) => s + (b.total || 0), 0);
  const paidBookings = bookings.filter((b: any) => ["PAID", "CONFIRMED", "COMPLETED"].includes(b.booking_status));
  const commissionByBooking = new Map(commissions.map((c: any) => [c.booking_ref, c.status === "void" ? 0 : c.amount || 0]));
  const paidSales = paidBookings.reduce((s: number, b: any) => s + (b.total || 0), 0);
  const partnerCredit = paidBookings.reduce((s: number, b: any) => s + (b.affiliate_commission ?? commissionByBooking.get(b.booking_number) ?? 0), 0);
  const companyReceived = paidSales - partnerCredit;
  const systemFee = paidBookings.reduce((s: number, b: any) => s + ((b.adults || 0) * 200), 0);
  const operatingNet = Math.max(0, companyReceived - systemFee);
  const pendingComm = sum(commissions, (c) => c.status === "pending");
  const availableComm = sum(commissions, (c) => c.status === "available");
  const paidComm = sum(commissions, (c) => c.status === "paid");
  const pendingPayout = sum(payouts, (x) => x.status === "pending");
  const withdrawable = availableComm - pendingPayout;

  const st = PARTNER_STATUS[p.status] ?? PARTNER_STATUS.pending;
  const displayName = p.business_name || p.full_name || u?.name || u?.email || "(ไม่มีชื่อ)";
  const refCode = p.ref_code || p.affiliate_code;
  const accountNo = p.bank_account_no || p.bank_account_number;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/partners" className="mb-3 inline-flex items-center gap-1 text-sm text-brand-text/60 hover:text-brand-orange">
          <ArrowLeft size={16} /> กลับ
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-brand-text">{displayName}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>{st.text}</span>
        </div>
        <div className="mt-1 text-sm text-brand-text/60">
          {p.full_name && `${p.full_name} · `}{partnerTypeLabel(p.partner_type)} · {u?.email} {p.phone && `· โทร ${p.phone}`}
          {refCode && <> · โค้ด <b className="text-brand-text">{refCode}</b></>}
          {" "}· สมัครเมื่อ {new Date(p.created_at).toLocaleDateString("th-TH")}
        </div>
      </div>

      {/* อนุมัติด่วน (ถ้ายังรออนุมัติ) */}
      {p.status === "pending" && (
        <form action={approvePartner} className="flex flex-wrap items-center gap-2 rounded-2xl bg-brand-orange/5 p-4">
          <input type="hidden" name="id" value={p.id} />
          <input type="hidden" name="user_id" value={p.user_id} />
          <span className="text-sm font-medium text-brand-text">อนุมัติพาร์ทเนอร์นี้ (รับเครดิตจากส่วนต่างราคาขาย)</span>
          <button className="inline-flex items-center gap-1 rounded-xl bg-brand-teal px-4 py-2 text-sm font-semibold text-white">
            <Check size={16} /> อนุมัติ
          </button>
        </form>
      )}

      {/* สรุปยอด */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat label="ยอดขายจากลิงก์" value={formatTHB(sales)} />
        <Stat label="ยอดชำระแล้ว" value={formatTHB(paidSales)} />
        <Stat label="เครดิตพาร์ทเนอร์" value={formatTHB(partnerCredit)} />
        <Stat label="เงินเข้าบริษัท" value={formatTHB(companyReceived)} />
        <Stat label="ค่าบริหารระบบ" value={formatTHB(systemFee)} />
        <Stat label="คงเหลือดำเนินงาน" value={formatTHB(operatingNet)} />
        <Stat label="รอใช้บริการ" value={formatTHB(pendingComm)} />
        <Stat label="พร้อมถอน" value={formatTHB(withdrawable)} />
        <Stat label="รอโอน" value={formatTHB(pendingPayout)} />
        <Stat label="จ่ายแล้ว" value={formatTHB(paidComm)} />
      </div>

      {/* ข้อมูลพาร์ทเนอร์ + บัญชีธนาคาร (แก้ไขได้) */}
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-text">
          <Landmark size={20} className="text-brand-orange" /> ข้อมูลพาร์ทเนอร์และบัญชีธนาคาร
        </h2>
        <form action={updatePartner} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="id" value={p.id} />
          <Field label="ชื่อ-นามสกุล">
            <input name="full_name" defaultValue={p.full_name ?? ""} className="input" />
          </Field>
          <Field label="ประเภทพาร์ทเนอร์">
            <select name="partner_type" defaultValue={p.partner_type ?? "agent"} className="input">
              {PARTNER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="ชื่อร้าน/ธุรกิจ">
            <input name="business_name" defaultValue={p.business_name ?? ""} className="input" />
          </Field>
          <Field label="เบอร์ติดต่อ">
            <input name="phone" defaultValue={p.phone ?? ""} className="input" />
          </Field>
          <Field label="ธนาคาร">
            <select name="bank_name" defaultValue={p.bank_name ?? ""} className="input">
              <option value="">— ไม่ระบุ —</option>
              {p.bank_name && !THAI_BANKS.includes(p.bank_name) && <option value={p.bank_name}>{p.bank_name}</option>}
              {THAI_BANKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="ชื่อบัญชี">
            <input name="bank_account_name" defaultValue={p.bank_account_name ?? ""} className="input" />
          </Field>
          <Field label="เลขบัญชี">
            <input name="bank_account_no" defaultValue={accountNo ?? ""} className="input" />
          </Field>
          <Field label="สถานะพาร์ทเนอร์">
            <select name="status" defaultValue={p.status} className="input">
              <option value="pending">รออนุมัติ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="suspended">ระงับ</option>
              <option value="rejected">ปฏิเสธ</option>
            </select>
          </Field>
          <div className="flex items-end sm:col-span-2 lg:col-span-2">
            <button className="btn-primary"><Save size={16} /> บันทึกข้อมูล</button>
          </div>
        </form>
        <p className="mt-3 text-[11px] text-brand-text/45">
          เครดิตของพาร์ทเนอร์คำนวณจากส่วนต่างราคาที่ตั้งเองกับราคา Net ของแพ็กเกจ
        </p>
      </section>

      {/* รายการจองจากลิงก์ของพาร์ทเนอร์ */}
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-brand-text"><CalendarDays size={20} className="text-brand-orange" /> รายการจองจากลิงก์พาร์ทเนอร์</h2>
        <p className="mb-4 text-sm text-brand-text/55">ข้อมูลเดียวกับที่พาร์ทเนอร์เห็น ใช้ตรวจสอบยอดชำระและการให้เครดิต</p>
        {bookings.length ? <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead className="bg-brand-bg text-left text-xs text-brand-text/55"><tr><th className="px-3 py-3">เลขจอง / ลูกค้า</th><th className="px-3 py-3">แพ็กเกจ</th><th className="px-3 py-3">วันใช้บริการ</th><th className="px-3 py-3">จำนวน</th><th className="px-3 py-3">ยอดชำระ</th><th className="px-3 py-3">เครดิตคู่ค้า</th><th className="px-3 py-3">เงินเข้าบริษัท</th><th className="px-3 py-3">สถานะ</th></tr></thead><tbody>{bookings.map((b: any) => { const c = contactByBooking.get(b.id); const s = BOOKING_STATUS[b.booking_status] ?? BOOKING_STATUS.PENDING_PAYMENT; const guests = (b.adults || 0) + (b.children || 0) + (b.infants || 0); const credit = b.affiliate_commission ?? commissionByBooking.get(b.booking_number) ?? 0; const companyAmount = (b.total || 0) - credit; return <tr key={b.id} className="border-b border-black/5"><td className="px-3 py-3"><div className="font-semibold">{b.booking_number}</div><div className="text-xs text-brand-text/55">{c ? `${c.first_name || ""} ${c.last_name || ""}`.trim() || "ลูกค้า" : "ลูกค้า"}{c?.phone ? ` · ${c.phone}` : ""}</div></td><td className="px-3 py-3">{b.packages?.name_th || "-"}</td><td className="px-3 py-3">{new Date(`${b.booking_date}T00:00:00`).toLocaleDateString("th-TH")}<div className="text-xs text-brand-text/45">{b.start_time || "-"}</div></td><td className="px-3 py-3"><span className="inline-flex items-center gap-1"><Users size={14} />{guests}</span></td><td className="px-3 py-3 font-semibold">{formatTHB(b.total)}</td><td className="px-3 py-3 text-brand-orange">{formatTHB(credit)}</td><td className="px-3 py-3 font-semibold text-brand-teal">{formatTHB(companyAmount)}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs ${s.cls}`}>{s.text}</span></td></tr>; })}</tbody></table></div> : <p className="text-sm text-brand-text/50">ยังไม่มีการจองจากลิงก์นี้</p>}
      </section>

      {/* คำขอถอนเงิน */}
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-text">
          <Wallet size={20} className="text-brand-orange" /> คำขอถอนเงิน / การชำระค่าคอม
        </h2>
        {payouts.length === 0 && <p className="text-sm text-brand-text/50">ยังไม่มีคำขอถอน</p>}
        <div className="space-y-3">
          {payouts.map((po: any) => {
            const ps = PAYOUT_STATUS[po.status] ?? PAYOUT_STATUS.pending;
            return (
              <div key={po.id} className="rounded-xl border border-black/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-brand-text">{formatTHB(po.amount)}</span>
                    <span className={`ml-2 text-sm font-medium ${ps.cls}`}>{ps.text}</span>
                    <div className="text-xs text-brand-text/50">
                      ขอเมื่อ {new Date(po.requested_at).toLocaleString("th-TH")}
                      {po.processed_at && ` · ดำเนินการ ${new Date(po.processed_at).toLocaleString("th-TH")}`}
                    </div>
                    <div className="text-xs text-brand-text/60">บัญชี: {po.bank_info}</div>
                    {po.transfer_ref && <div className="text-xs text-brand-text/60">อ้างอิงการโอน: {po.transfer_ref}</div>}
                    {po.admin_note && <div className="text-xs text-red-500">หมายเหตุ: {po.admin_note}</div>}
                  </div>
                </div>

                {po.status === "pending" && (
                  <div className="mt-3 flex flex-wrap gap-3 border-t border-black/5 pt-3">
                    <form action={updatePayout} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={po.id} />
                      <input type="hidden" name="partner_id" value={p.id} />
                      <input type="hidden" name="status" value="paid" />
                      <input name="transfer_ref" placeholder="เลขอ้างอิง/วันที่โอน" className="input w-52" />
                      <button className="inline-flex items-center gap-1 rounded-xl bg-brand-teal px-3 py-2 text-sm font-semibold text-white">
                        <Check size={16} /> ยืนยันโอนแล้ว
                      </button>
                    </form>
                    <form action={updatePayout} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={po.id} />
                      <input type="hidden" name="partner_id" value={p.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <input name="admin_note" placeholder="เหตุผลที่ปฏิเสธ" className="input w-44" />
                      <button className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
                        <X size={15} /> ปฏิเสธ
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-brand-text/45">
          เมื่อกด "ยืนยันโอนแล้ว" ระบบจะล็อกค่าคอมสถานะ "พร้อมถอน" ตามยอดที่โอนเป็น "จ่ายแล้ว" อัตโนมัติ เพื่อกันถอนซ้ำ
        </p>
      </section>

      {/* รายการค่าคอม + ตั้งสถานะ */}
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-text">
          <ReceiptText size={20} className="text-brand-orange" /> รายการค่าคอมมิชชัน
        </h2>

        {commissions.length === 0 && <p className="mb-4 text-sm text-brand-text/50">ยังไม่มีรายการค่าคอม</p>}
        <div className="space-y-2">
          {commissions.map((c: any) => {
            const cs = COMM_STATUS[c.status] ?? COMM_STATUS.pending;
            return (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 px-4 py-3 text-sm">
                <div>
                  <div className="font-medium text-brand-text">
                    {c.booking_ref || "การจอง"} · ยอดจอง {formatTHB(c.order_amount)}
                  </div>
                  <div className="text-xs text-brand-text/50">
                    {new Date(c.created_at).toLocaleDateString("th-TH")} · เครดิตส่วนต่างราคา <b className="text-brand-text">{formatTHB(c.amount)}</b>
                    {c.void_reason && <span className="text-red-500"> · {c.void_reason}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cs.cls}`}>{cs.text}</span>
                  <form action={updateCommissionStatus} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="partner_id" value={p.id} />
                    <select name="status" defaultValue={c.status} className="input py-1.5 text-xs">
                      <option value="pending">รอใช้บริการ</option>
                      <option value="available">พร้อมถอน</option>
                      <option value="paid">จ่ายแล้ว</option>
                      <option value="void">ยกเลิก (void)</option>
                    </select>
                    <input name="void_reason" placeholder="เหตุผล (ถ้า void)" className="input w-32 py-1.5 text-xs" />
                    <button className="rounded-lg border border-brand-orange px-2.5 py-1.5 text-xs font-semibold text-brand-orange hover:bg-brand-orange hover:text-white">
                      บันทึก
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>

        {/* เพิ่มค่าคอมด้วยมือ */}
        <details className="mt-5 rounded-xl bg-brand-bg p-4">
          <summary className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-brand-orange">
            <Plus size={15} /> เพิ่มรายการค่าคอมด้วยตัวเอง
          </summary>
          <form action={addCommission} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input type="hidden" name="partner_id" value={p.id} />
            <Field label="เลขจอง/อ้างอิง">
              <input name="booking_ref" placeholder="เช่น HP-2026-000123" className="input" />
            </Field>
            <Field label="ยอดจอง (บาท)">
              <input name="order_amount" type="number" min={1} required className="input" />
            </Field>
            <Field label="เครดิตที่ให้ (บาท)">
              <input name="amount" type="number" min={1} required className="input" />
            </Field>
            <Field label="สถานะเริ่มต้น">
              <select name="status" defaultValue="pending" className="input">
                <option value="pending">รอใช้บริการ</option>
                <option value="available">พร้อมถอน</option>
              </select>
            </Field>
            <div className="sm:col-span-2 lg:col-span-4">
              <button className="btn-primary"><Plus size={16} /> เพิ่มค่าคอม</button>
            </div>
          </form>
          <p className="mt-2 text-[11px] text-brand-text/45">
            ใช้สำหรับปรับยอดเป็นกรณีพิเศษ โดยระบุเครดิตเป็นจำนวนเงินบาทโดยตรง
          </p>
        </details>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
      {label}
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft">
      <div className="text-[11px] text-brand-text/50">{label}</div>
      <div className="mt-1 text-lg font-bold text-brand-green">{value}</div>
    </div>
  );
}
