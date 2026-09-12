import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminUser, changePassword } from "./actions";
import { UserPlus, KeyRound, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { user } = await requireAdmin();
  const supabase = createClient();
  const { data: admins } = await supabase
    .from("users")
    .select("id, name, email, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-text">
          <ShieldCheck className="text-brand-orange" /> ผู้ดูแลระบบ (Admin)
        </h1>
        <p className="mt-1 text-sm text-brand-text/60">สร้างแอดมินใหม่ และเปลี่ยนรหัสผ่านของแอดมินแต่ละคน</p>
      </div>

      {/* สร้างแอดมินใหม่ */}
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-text">
          <UserPlus size={20} className="text-brand-orange" /> เพิ่มแอดมินใหม่
        </h2>
        <form action={createAdminUser} className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
            ชื่อ
            <input name="name" placeholder="เช่น คุณสมชาย" className="input" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
            อีเมล *
            <input name="email" type="email" required placeholder="admin@example.com" className="input" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
            รหัสผ่าน * (อย่างน้อย 6 ตัว)
            <input name="password" type="text" required minLength={6} placeholder="ตั้งรหัสผ่าน" className="input" />
          </label>
          <div className="sm:col-span-3">
            <button className="btn-primary"><UserPlus size={18} /> สร้างแอดมิน</button>
          </div>
        </form>
        <p className="mt-3 text-[11px] text-brand-text/45">
          แอดมินใหม่จะเข้าสู่ระบบได้ทันทีที่ /admin/login ด้วยอีเมลและรหัสผ่านนี้
        </p>
      </section>

      {/* รายชื่อแอดมิน + เปลี่ยนรหัสผ่าน */}
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-bold text-brand-text">รายชื่อแอดมินทั้งหมด</h2>
        <div className="space-y-3">
          {(admins ?? []).map((a) => (
            <div key={a.id} className="rounded-xl border border-black/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-brand-text">{a.name || "(ไม่มีชื่อ)"}</span>
                  <span className="ml-2 text-sm text-brand-text/60">{a.email}</span>
                  {a.id === user.id && (
                    <span className="ml-2 rounded-full bg-brand-teal/10 px-2 py-0.5 text-[11px] font-medium text-brand-teal">
                      คุณ
                    </span>
                  )}
                </div>
              </div>
              <form action={changePassword} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="user_id" value={a.id} />
                <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-brand-text/70">
                  รหัสผ่านใหม่
                  <input
                    name="password"
                    type="text"
                    required
                    minLength={6}
                    placeholder="ตั้งรหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
                    className="input"
                  />
                </label>
                <button className="inline-flex items-center gap-1.5 rounded-xl border border-brand-orange px-4 py-2.5 text-sm font-semibold text-brand-orange transition hover:bg-brand-orange hover:text-white">
                  <KeyRound size={16} /> เปลี่ยนรหัสผ่าน
                </button>
              </form>
            </div>
          ))}
          {(!admins || admins.length === 0) && (
            <p className="text-sm text-brand-text/50">ยังไม่มีแอดมิน</p>
          )}
        </div>
      </section>
    </div>
  );
}
