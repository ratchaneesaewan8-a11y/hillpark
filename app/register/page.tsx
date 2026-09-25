"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("สมัคร/เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (password !== confirm) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setError(error.message.includes("already") ? "อีเมลนี้มีผู้ใช้แล้ว" : `สมัครไม่สำเร็จ: ${error.message}`);
      setLoading(false);
      return;
    }

    // ถ้าได้ session เลย (ปิดยืนยันอีเมล) -> เข้าใช้งานทันที
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }
    // ถ้าเปิดยืนยันอีเมล -> แจ้งให้ไปยืนยันก่อน
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-card">
          <CheckCircle2 size={44} className="mx-auto mb-3 text-brand-teal" />
          <div className="mb-2 text-xl font-bold text-brand-text">สมัครสมาชิกสำเร็จ!</div>
          <p className="text-sm text-brand-text/60">
            เราได้ส่งอีเมลยืนยันไปที่ <b>{email}</b> แล้ว กรุณากดยืนยันในอีเมลก่อนเข้าสู่ระบบ
          </p>
          <Link href="/login" className="btn-primary mt-6 w-full">ไปหน้าเข้าสู่ระบบ</Link>
        </div>
      </div>
    );
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
          <div className="text-xl font-bold text-brand-text">สมัครสมาชิก</div>
          <div className="text-sm text-brand-text/60">สร้างบัญชีเพื่อจองและติดตามทริปของคุณ</div>
        </div>
        <button
          type="button"
          onClick={handleGoogle}
          className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-black/10 bg-white py-2.5 text-sm font-semibold text-brand-text transition hover:bg-black/[0.03]"
        >
          <GoogleIcon /> สมัครด้วย Google
        </button>
        <div className="mb-4 flex items-center gap-3 text-xs text-brand-text/40">
          <span className="h-px flex-1 bg-black/10" /> หรือ <span className="h-px flex-1 bg-black/10" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-text">ชื่อ</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-brand-orange"
            />
          </div>
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
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-text">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 outline-none focus:border-brand-orange"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            <UserPlus size={18} /> {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-brand-text/60">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="font-semibold text-brand-orange hover:underline">
            เข้าสู่ระบบ
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
