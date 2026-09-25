"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter(); const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState("");
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/";
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage(""); setLoading(true);
    const supabase = createClient();
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง"); else { router.push(next); router.refresh(); }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: `${window.location.origin}/login` } });
      if (error) setError(error.message.includes("Password") ? "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" : error.message);
      else if (data.session) { router.push(next); router.refresh(); }
      else setMessage("สมัครเรียบร้อยแล้ว กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
    }
    setLoading(false);
  }
  return <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[radial-gradient(circle_at_80%_0%,#c6f7ef,transparent_28%),#f6f8f7] p-5"><div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-card lg:grid-cols-[.85fr_1.15fr]"><aside className="hidden bg-brand-green p-10 text-white lg:block"><p className="text-sm font-semibold text-teal-200">HILLPARK ADVENTURE</p><h1 className="mt-5 text-4xl font-bold leading-tight">เที่ยวง่าย<br/>รับรายได้ง่าย<br/><span className="text-teal-200">ในบัญชีเดียว</span></h1><p className="mt-5 leading-relaxed text-white/70">เข้าสู่ระบบเพื่อจัดการข้อมูลการจอง หรือใช้ Partner Portal สำหรับลิงก์แนะนำและเครดิตของคุณ</p></aside><section className="p-7 sm:p-10"><Link href="/" className="inline-flex items-center gap-1 text-sm text-brand-text/55 hover:text-brand-teal"><ArrowLeft size={16}/> กลับหน้าแรก</Link><h2 className="mt-8 text-3xl font-bold text-brand-text">{mode === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}</h2><p className="mt-2 text-sm text-brand-text/60">{mode === "login" ? "เข้าสู่บัญชี Hillpark ของคุณ" : "สมัครเพื่อใช้ Partner Portal และติดตามการจอง"}</p><form onSubmit={submit} className="mt-7 space-y-4">{mode === "register" && <label><span className="label">ชื่อ – นามสกุล</span><input required value={name} onChange={e => setName(e.target.value)} className="input"/></label>}<label><span className="label">อีเมล</span><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" autoComplete="email"/></label><label><span className="label">รหัสผ่าน</span><input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" autoComplete={mode === "login" ? "current-password" : "new-password"}/></label>{error && <p className="text-sm text-red-600">{error}</p>}{message && <p className="rounded-xl bg-teal-50 p-3 text-sm text-teal-800">{message}</p>}<button disabled={loading} className="btn-primary w-full disabled:opacity-60">{mode === "login" ? <LogIn size={18}/> : <UserPlus size={18}/>} {loading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</button></form><button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setMessage(""); }} className="mt-5 w-full text-sm text-brand-teal hover:underline">{mode === "login" ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"}</button><div className="mt-7 border-t pt-5 text-center text-sm text-brand-text/55">ต้องการร่วมเป็นพาร์ทเนอร์? <Link href="/partners" className="font-medium text-brand-teal hover:underline">สมัครเป็นพาร์ทเนอร์</Link></div></section></div></main>;
}
