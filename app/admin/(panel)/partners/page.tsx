import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { approvePartner, rejectPartner, updatePayout } from "./actions";
import { formatTHB } from "@/lib/utils";
import Link from "next/link";
import { Handshake, Check, X, Wallet, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  pending: { text: "รออนุมัติ", cls: "bg-brand-orange/10 text-brand-orange" },
  approved: { text: "อนุมัติแล้ว", cls: "bg-brand-teal/10 text-brand-teal" },
  rejected: { text: "ปฏิเสธ", cls: "bg-red-100 text-red-600" },
  suspended: { text: "ระงับ", cls: "bg-black/10 text-brand-text/60" },
};

export default async function AdminPartnersPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: partners } = await admin
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });

  // ดึงอีเมล/ชื่อผู้ใช้มาโชว์
  const userIds = (partners ?? []).map((p) => p.user_id);
  const { data: users } = userIds.length
    ? await admin.from("users").select("id, name, email").in("id", userIds)
    : { data: [] as any[] };
  const userMap = new Map((users ?? []).map((u: any) => [u.id, u]));

  // คำขอถอนเงินที่รอดำเนินการ
  const { data: payouts } = await admin
    .from("partner_payouts")
    .select("*")
    .order("requested_at", { ascending: false });
  const partnerMap = new Map((partners ?? []).map((p: any) => [p.id, p]));
  const pendingPayouts = (payouts ?? []).filter((p: any) => p.status === "pending");

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-brand-text">
        <Handshake className="text-brand-orange" /> พาร์ทเนอร์ (Affiliate)
      </h1>

      {/* คำขอถอนเงินที่รอดำเนินการ */}
      {pendingPayouts.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-brand-text">
            <Wallet size={20} className="text-brand-orange" /> คำขอถอนเงิน ({pendingPayouts.length})
          </h2>
          <div className="space-y-3">
            {pendingPayouts.map((po: any) => {
              const pt = partnerMap.get(po.partner_id);
              const u = pt ? userMap.get(pt.user_id) : null;
              return (
                <div key={po.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-soft">
                  <div>
                    <div className="font-semibold text-brand-text">
                      {formatTHB(po.amount)} <span className="ml-2 text-sm font-normal text-brand-text/60">— {pt?.business_name || u?.name || u?.email}</span>
                    </div>
                    <div className="mt-1 text-sm text-brand-text/60">บัญชี: {po.bank_info}</div>
                    <div className="text-xs text-brand-text/45">{new Date(po.requested_at).toLocaleString("th-TH")}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={updatePayout} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={po.id} />
                      <input type="hidden" name="status" value="paid" />
                      <input name="transfer_ref" placeholder="เลขอ้างอิงการโอน" className="input w-40" />
                      <button className="inline-flex items-center gap-1 rounded-xl bg-brand-teal px-3 py-2 text-sm font-semibold text-white">
                        <Check size={16} /> โอนแล้ว
                      </button>
                    </form>
                    <form action={updatePayout}>
                      <input type="hidden" name="id" value={po.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
                        <X size={15} /> ปฏิเสธ
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-lg font-bold text-brand-text">รายชื่อพาร์ทเนอร์</h2>
      <div className="space-y-3">
        {(partners ?? []).map((p) => {
          const u = userMap.get(p.user_id);
          const st = STATUS_LABEL[p.status] ?? STATUS_LABEL.pending;
          return (
            <div key={p.id} className="rounded-2xl bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/partners/${p.id}`} className="font-semibold text-brand-text hover:text-brand-orange">
                      {p.business_name || u?.name || "(ไม่มีชื่อ)"}
                    </Link>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.cls}`}>{st.text}</span>
                  </div>
                  <div className="mt-1 text-sm text-brand-text/60">{u?.email}</div>
                  {p.phone && <div className="text-sm text-brand-text/60">โทร: {p.phone}</div>}
                  {p.bank_name && (
                    <div className="mt-1 text-sm text-brand-text/60">
                      บัญชี: {p.bank_name} · {p.bank_account_no} · {p.bank_account_name}
                    </div>
                  )}
                  <Link
                    href={`/admin/partners/${p.id}`}
                    className="mt-2 inline-flex items-center gap-0.5 text-sm font-semibold text-brand-orange hover:underline"
                  >
                    ดูข้อมูล / จัดการค่าคอม <ChevronRight size={15} />
                  </Link>
                  {p.status === "approved" && (
                    <div className="mt-2 text-sm">
                      โค้ด: <b className="text-brand-text">{p.ref_code}</b> · ค่าคอม {p.commission_rate}%
                    </div>
                  )}
                </div>

                {p.status === "pending" && (
                  <div className="flex flex-col items-end gap-2">
                    <form action={approvePartner} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="user_id" value={p.user_id} />
                      <input
                        name="commission_rate"
                        type="number"
                        defaultValue={10}
                        className="input w-24"
                        title="ค่าคอม %"
                      />
                      <span className="text-sm text-brand-text/50">%</span>
                      <button className="inline-flex items-center gap-1 rounded-xl bg-brand-teal px-3 py-2 text-sm font-semibold text-white">
                        <Check size={16} /> อนุมัติ
                      </button>
                    </form>
                    <form action={rejectPartner}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
                        <X size={15} /> ปฏิเสธ
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {(!partners || partners.length === 0) && (
          <p className="text-sm text-brand-text/50">ยังไม่มีผู้สมัครพาร์ทเนอร์</p>
        )}
      </div>
    </div>
  );
}
