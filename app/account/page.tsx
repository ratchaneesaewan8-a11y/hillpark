"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User, LogOut, ClipboardList } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) {
        router.replace("/login");
        return;
      }
      setName((u.user_metadata?.name as string) || "สมาชิก");
      setEmail(u.email || "");
      setLoading(false);
    });
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return <div className="container-page py-20 text-center text-brand-text/50">กำลังโหลด...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-text">บัญชีของฉัน</h1>

      <div className="mt-5 rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-orange/10 text-brand-orange">
            <User size={26} />
          </div>
          <div>
            <div className="text-lg font-semibold text-brand-text">{name}</div>
            <div className="text-sm text-brand-text/60">{email}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Link
          href="/bookings"
          className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card transition hover:-translate-y-0.5"
        >
          <ClipboardList size={20} className="text-brand-teal" />
          <span className="font-medium text-brand-text">การจองของฉัน</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5"
        >
          <LogOut size={20} className="text-red-500" />
          <span className="font-medium text-red-500">ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
}
