"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ClipboardList } from "lucide-react";

export default function BookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return <div className="container-page py-20 text-center text-brand-text/50">กำลังโหลด...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-text">การจองของฉัน</h1>

      <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-card">
        <ClipboardList size={44} className="mx-auto mb-3 text-brand-text/30" />
        <p className="font-medium text-brand-text">ยังไม่มีรายการจอง</p>
        <p className="mt-1 text-sm text-brand-text/55">
          เมื่อคุณจองทัวร์ รายการจะแสดงที่นี่
        </p>
        <Link href="/tours" className="btn-primary mt-6 inline-flex">
          ดูทัวร์ทั้งหมด
        </Link>
      </div>
    </div>
  );
}
