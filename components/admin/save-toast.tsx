"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

function messageFor(status: string) {
  if (status === "deleted") return "ลบเรียบร้อยแล้ว";
  if (status === "created") return "สร้างทัวร์สำเร็จ";
  return "บันทึกสำเร็จ";
}

// ข้อความแจ้ง "บันทึกสำเร็จ" หลังบันทึก — แสดง 3 วินาทีแล้วหายไปเอง
export function SaveToast({ status }: { status?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [msg, setMsg] = useState<string | null>(null);

  // มี ?saved= ใน URL -> เก็บข้อความไว้ แล้วลบ ?saved= ออก (รีเฟรชแล้วจะไม่ขึ้นซ้ำ)
  useEffect(() => {
    if (!status) return;
    setMsg(messageFor(status));
    router.replace(pathname, { scroll: false });
  }, [status, pathname, router]);

  // ซ่อนข้อความหลัง 3 วินาที
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-3 text-sm font-semibold text-white shadow-card"
    >
      <CheckCircle2 size={18} /> {msg}
    </div>
  );
}
