"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogIn, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card">
        <Link
          href="/"
          className="mb-4 flex items-center gap-1.5 text-sm text-brand-text/60 hover:text-brand-orange"
        >
          <ArrowLeft size={16} /> กลับไปหน้าหลัก
        </Link>
        <div className="mb-6 text-center">
          <div className="text-xl font-bold text-brand-text">HILLPARK ADVENTURE</div>
          <div className="text-sm text-brand-text/60">เข้าสู่ระบบผู้ดูแล</div>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-text">อีเมล</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-brand-orange"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-text">รหัสผ่าน</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-brand-orange"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            <LogIn size={18} /> {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
