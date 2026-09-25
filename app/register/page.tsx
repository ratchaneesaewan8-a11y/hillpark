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
