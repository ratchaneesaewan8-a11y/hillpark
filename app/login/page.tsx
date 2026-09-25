"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogIn, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("not confirmed") || msg.includes("email not confirmed") || (error as any).code === "email_not_confirmed") {
        setError("บัญชีนี้ยังไม่ได้ยืนยันอีเมล — กรุณาเปิดอีเมลที่สมัครไว้แล้วกดยืนยันก่อนเข้าสู่ระบบ");
      } else {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card">
        <Link
          href="/"
          className="mb-4 flex items-center gap-1.5 text-sm text-brand-text/60 hover:text-brand-orange"
        >
          <ArrowLeft size={16} /> กลับไปหน้าหลัก
        </Link>
        <div className="mb-6 text-center">
          <div className="text-xl font-bold text-brand-text">เข้าสู่ระบบ</div>
          <div className="text-sm text-brand-text/60">ยินดีต้อนรับกลับสู่ HILLPARK</div>
        </div>
        <button
          type="button"
          onClick={handleGoogle}
          className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-black/10 bg-white py-2.5 text-sm font-semibold text-brand-text transition hover:bg-black/[0.03]"
        >
          <GoogleIcon /> เข้าสู่ระบบด้วย Google
        </button>
        <div className="mb-4 flex items-center gap-3 text-xs text-brand-text/40">
          <span className="h-px flex-1 bg-black/10" /> หรือ <span className="h-px flex-1 bg-black/10" />
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
        <p className="mt-5 text-center text-sm text-brand-text/60">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="font-semibold text-brand-orange hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.3 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.9 6.2C12.3 13.3 17.6 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-2.8-.4-4.1H24v7.8h12.7c-.3 2.1-1.6 5.2-4.6 7.3l7.1 5.5c4.3-3.9 6.9-9.8 6.9-16.5Z" />
      <path fill="#FBBC05" d="M10.4 28.5c-.5-1.5-.8-3-.8-4.5s.3-3 .8-4.5l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.9-6.2Z" />
      <path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.5-5.7l-7.1-5.5c-2 1.3-4.6 2.2-8.4 2.2-6.4 0-11.7-3.8-13.6-9.5l-7.9 6.2C6.4 42.6 14.6 48 24 48Z" />
    </svg>
  );
}
