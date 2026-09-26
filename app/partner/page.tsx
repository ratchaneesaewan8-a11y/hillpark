import { redirect } from "next/navigation";
import Link from "next/link";
import { Handshake, Clock, XCircle, Link2, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { applyPartner, requestPayout } from "./actions";
import { ShareBox } from "@/components/partner/share-box";
import { formatTHB } from "@/lib/utils";
import { THAI_BANKS, PARTNER_TYPES } from "@/lib/partner/banks";

const PAYOUT_STATUS: Record<string, { text: string; cls: string }> = {
  pending: { text: "รอโอน", cls: "text-brand-orange" },
  paid: { text: "โอนแล้ว", cls: "text-brand-teal" },
  rejected: { text: "ปฏิเสธ", cls: "text-red-500" },
};

const COMM_STATUS: Record<string, { text: string; cls: string }> = {
  pending: { text: "รอใช้บริการ", cls: "bg-brand-orange/10 text-brand-orange" },
  available: { text: "พร้อมถอน", cls: "bg-brand-teal/10 text-brand-teal" },
  paid: { text: "จ่ายแล้ว", cls: "bg-black/5 text-brand-text/60" },
  void: { text: "ยกเลิก", cls: "bg-red-100 text-red-500" },
};

export const dynamic = "force-dynamic";

export default async function PartnerPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://hillpark.vercel.app";

  // ข้อมูลค่าคอม + การถอน (เฉพาะพาร์ทเนอร์ที่อนุมัติแล้ว)
  let commissions: any[] = [];
  let payouts: any[] = [];
  let salesFromLinks = 0;   // ยอดขายที่มาจากลิงก์
  let pendingComm = 0;      // ค่าคอมรอใช้บริการ (Pending)
  let availableComm = 0;    // ค่าคอมพร้อมถอน (Available)
  let withdrawnPaid = 0;    // โอนแล้ว
  let withdrawnPending = 0; // คำขอถอนที่รออยู่
  if (partner?.status === "approved") {
    const [{ data: comms }, { data: pos }] = await Promise.all([
      supabase.from("partner_commissions").select("*").eq("partner_id", partner.id).order("created_at", { ascending: false }),
      supabase.from("partner_payouts").select("*").eq("partner_id", partner.id).order("requested_at", { ascending: false }),
    ]);
    commissions = comms ?? [];
    payouts = pos ?? [];
    salesFromLinks = commissions.filter((c) => c.status !== "void").reduce((s, c) => s + (c.order_amount || 0), 0);
    pendingComm = commissions.filter((c) => c.status === "pending").reduce((s, c) => s + (c.amount || 0), 0);
    availableComm = commissions.filter((c) => c.status === "available").reduce((s, c) => s + (c.amount || 0), 0);
    withdrawnPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + (p.amount || 0), 0);
    withdrawnPending = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0);
  }
  // เครดิตที่ถอนได้จริง = คอมพร้อมถอน - ที่ค้างอยู่ในคำขอถอน
  // (เมื่อแอดมินโอนแล้ว ค่าคอมส่วนนั้นจะถูกล็อกเป็น "จ่ายแล้ว" อัตโนมัติ จึงไม่ต้องหักซ้ำ)
  const available = availableComm - withdrawnPending;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-text">
        <Handshake className="text-brand-orange" /> โปรแกรมพาร์ทเนอร์ (แนะนำรับค่าคอม)
      </h1>

      {/* อนุมัติแล้ว -> แดชบอร์ดพาร์ทเนอร์ */}
      {partner?.status === "approved" && (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <div className="flex items-center gap-2 text-brand-teal">
              <Wallet size={20} />
              <span className="font-semibold">คุณเป็นพาร์ทเนอร์แล้ว</span>
            </div>
            <p className="mt-2 text-sm text-brand-text/60">
              ค่าคอมมิชชันของคุณ: <b className="text-brand-text">{partner.commission_rate}%</b> ต่อการจองที่มาจากลิงก์ของคุณ
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-3 flex items-center gap-2 font-semibold text-brand-text">
              <Link2 size={18} className="text-brand-orange" /> ลิงก์แนะนำของคุณ
            </div>
            <ShareBox
              link={`${site}/?ref=${partner.ref_code || partner.affiliate_code}`}
              code={partner.ref_code || partner.affiliate_code || ""}
            />
            <p className="mt-3 text-xs text-brand-text/50">
              แชร์ลิงก์นี้ให้ลูกค้า เมื่อมีคนเข้าเว็บผ่านลิงก์แล้วจอง ระบบจะบันทึกว่ามาจากคุณ
            </p>
          </div>

          {/* สรุปค่าคอม (แดชบอร์ด) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="ยอดขายจากลิงก์" value={formatTHB(salesFromLinks)} />
            <Stat label="รอใช้บริการ" value={formatTHB(pendingComm)} />
            <Stat label="โอนแล้ว" value={formatTHB(withdrawnPaid)} />
            <Stat label="พร้อมถอน" value={formatTHB(available)} highlight />
          </div>

          {/* ขอถอนเงิน */}
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-3 font-semibold text-brand-text">ขอถอนค่าคอมมิชชัน</div>
            {available > 0 ? (
              <form action={requestPayout} className="space-y-3">
                <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
                  จำนวนที่ต้องการถอน (บาท) — ถอนได้สูงสุด {formatTHB(available)}
                  <input name="amount" type="number" min={1} max={available} required className="input" />
                </label>
                <div className="rounded-xl bg-brand-bg px-4 py-3 text-sm">
                  <div className="text-xs text-brand-text/50">โอนเข้าบัญชีที่ลงทะเบียนไว้</div>
                  <div className="font-medium text-brand-text">{partner.bank_name || "-"}</div>
                  <div className="text-brand-text/70">
                    {partner.bank_account_no || partner.bank_account_number || "-"} · {partner.bank_account_name || "-"}
                  </div>
                  <div className="mt-1 text-[11px] text-brand-text/45">ต้องการเปลี่ยนบัญชี กรุณาติดต่อผู้ดูแลระบบ</div>
                </div>
                <button className="btn-primary">ส่งคำขอถอนเงิน</button>
              </form>
            ) : (
              <p className="text-sm text-brand-text/55">ยังไม่มียอดที่ถอนได้ในขณะนี้</p>
            )}
          </div>

          {/* ประวัติการถอน */}
          {payouts.length > 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-3 font-semibold text-brand-text">ประวัติการถอน</div>
              <div className="space-y-2">
                {payouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border-b border-black/5 pb-2 text-sm last:border-0">
                    <span className="text-brand-text/70">
                      {new Date(p.requested_at).toLocaleDateString("th-TH")} · {formatTHB(p.amount)}
                    </span>
                    <span className={`font-medium ${(PAYOUT_STATUS[p.status] ?? PAYOUT_STATUS.pending).cls}`}>
                      {(PAYOUT_STATUS[p.status] ?? PAYOUT_STATUS.pending).text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* รายการค่าคอม */}
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-3 font-semibold text-brand-text">รายการค่าคอมมิชชัน</div>
            {commissions.length > 0 ? (
              <div className="space-y-2">
                {commissions.map((c) => {
                  const st = COMM_STATUS[c.status] ?? COMM_STATUS.pending;
                  return (
                    <div key={c.id} className="flex items-center justify-between border-b border-black/5 pb-2 text-sm last:border-0">
                      <div>
                        <div className="text-brand-text/80">
                          {c.booking_ref || "การจอง"} · ยอด {formatTHB(c.order_amount)}
                        </div>
                        <div className="text-xs text-brand-text/45">
                          {new Date(c.created_at).toLocaleDateString("th-TH")} · คอม {c.rate_at_booking || partner.commission_rate}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-brand-text">{formatTHB(c.amount)}</div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${st.cls}`}>{st.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-brand-text/55">
                ยังไม่มีรายการค่าคอม — จะเริ่มบันทึกอัตโนมัติเมื่อมีลูกค้าจองผ่านลิงก์ของคุณ (หลังระบบบันทึกการจองครบวงจร)
              </p>
            )}
          </div>
        </div>
      )}

      {/* รออนุมัติ */}
      {partner?.status === "pending" && (
        <div className="mt-5 rounded-2xl bg-white p-8 text-center shadow-card">
          <Clock size={42} className="mx-auto mb-3 text-brand-orange" />
          <div className="text-lg font-bold text-brand-text">ใบสมัครของคุณกำลังรอการอนุมัติ</div>
          <p className="mt-1 text-sm text-brand-text/60">
            ทีมงานจะตรวจสอบและอนุมัติให้เร็วที่สุด เมื่ออนุมัติแล้วคุณจะได้ลิงก์แนะนำที่นี่
          </p>
        </div>
      )}

      {/* ถูกปฏิเสธ */}
      {partner?.status === "rejected" && (
        <div className="mt-5 rounded-2xl bg-white p-8 text-center shadow-card">
          <XCircle size={42} className="mx-auto mb-3 text-red-500" />
          <div className="text-lg font-bold text-brand-text">ใบสมัครไม่ได้รับการอนุมัติ</div>
          <p className="mt-1 text-sm text-brand-text/60">หากมีข้อสงสัย กรุณาติดต่อทีมงาน</p>
        </div>
      )}

      {/* ถูกระงับ */}
      {partner?.status === "suspended" && (
        <div className="mt-5 rounded-2xl bg-white p-8 text-center shadow-card">
          <XCircle size={42} className="mx-auto mb-3 text-brand-text/40" />
          <div className="text-lg font-bold text-brand-text">บัญชีพาร์ทเนอร์ถูกระงับชั่วคราว</div>
          <p className="mt-1 text-sm text-brand-text/60">กรุณาติดต่อทีมงานเพื่อสอบถามรายละเอียด</p>
        </div>
      )}

      {/* ยังไม่เคยสมัคร -> ฟอร์มสมัคร */}
      {!partner && (
        <div className="mt-5 rounded-2xl bg-white p-6 shadow-card">
          <p className="mb-5 text-sm text-brand-text/70">
            สมัครเป็นพาร์ทเนอร์เพื่อรับลิงก์แนะนำ แชร์ให้ลูกค้าจองทัวร์ แล้วรับค่าคอมมิชชันจากยอดจองที่มาจากลิงก์ของคุณ
          </p>
          <form action={applyPartner} className="space-y-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
              ชื่อ-นามสกุล *
              <input name="full_name" required placeholder="ชื่อ-นามสกุลของคุณ" className="input" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
              ประเภทพาร์ทเนอร์ *
              <select name="partner_type" required defaultValue="" className="input">
                <option value="" disabled>— เลือกประเภท —</option>
                {PARTNER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
              ชื่อร้าน/ธุรกิจ (ถ้ามี)
              <input name="business_name" placeholder="เช่น ร้านทัวร์อ่าวนาง" className="input" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
              เบอร์ติดต่อ *
              <input name="phone" required placeholder="08x-xxx-xxxx" className="input" />
            </label>
            <div className="rounded-xl bg-brand-bg p-4">
              <div className="mb-3 text-sm font-semibold text-brand-text">บัญชีธนาคารสำหรับรับค่าคอม</div>
              <div className="space-y-3">
                <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
                  ธนาคาร *
                  <select name="bank_name" required defaultValue="" className="input">
                    <option value="" disabled>— เลือกธนาคาร —</option>
                    {THAI_BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
                  ชื่อบัญชี *
                  <input name="bank_account_name" required placeholder="ชื่อ-นามสกุล ตามหน้าสมุดบัญชี" className="input" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
                  เลขบัญชี *
                  <input name="bank_account_no" required inputMode="numeric" placeholder="เช่น 123-4-56789-0" className="input" />
                </label>
              </div>
              <p className="mt-2 text-[11px] text-brand-text/45">ข้อมูลนี้ใช้สำหรับโอนค่าคอมให้คุณเท่านั้น</p>
            </div>
            <button className="btn-primary w-full"><Handshake size={18} /> ส่งใบสมัครพาร์ทเนอร์</button>
          </form>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/account" className="text-sm text-brand-text/50 hover:text-brand-orange">← กลับไปบัญชีของฉัน</Link>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 shadow-card ${highlight ? "bg-brand-orange text-white" : "bg-white"}`}>
      <div className={`text-[11px] ${highlight ? "text-white/80" : "text-brand-text/50"}`}>{label}</div>
      <div className={`mt-1 text-lg font-bold ${highlight ? "text-white" : "text-brand-green"}`}>{value}</div>
    </div>
  );
}
