import Link from "next/link";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin, hasSupabaseEnv } from "@/lib/admin/auth";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ยังไม่ได้ตั้งค่า Supabase — แสดงคำแนะนำแทนที่จะพัง
  if (!hasSupabaseEnv()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-card">
          <h1 className="text-lg font-bold text-brand-text">ยังไม่ได้เชื่อมต่อ Supabase</h1>
          <p className="mt-2 text-sm text-brand-text/70">
            ระบบหลังบ้านต้องใช้ Supabase ก่อน กรุณาสร้างไฟล์ <code>.env.local</code>{" "}
            แล้วใส่ค่า <code>NEXT_PUBLIC_SUPABASE_URL</code> และ key ต่าง ๆ (ดูขั้นตอนใน README)
            จากนั้นรีสตาร์ท <code>npm run dev</code>
          </p>
          <Link href="/" className="btn-primary mt-5 inline-flex">กลับหน้าแรก</Link>
        </div>
      </div>
    );
  }

  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl p-6">{children}</div>
      </div>
    </div>
  );
}
