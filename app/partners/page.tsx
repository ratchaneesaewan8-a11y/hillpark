"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Banknote, Clock3, QrCode, ShieldCheck, Users } from "lucide-react";

const partnerTypes = [
  ["guide", "ไกด์ท้องถิ่น"], ["hotel", "โรงแรม / ที่พัก"], ["driver", "คนขับรถ"], ["agent", "เอเจนต์ท่องเที่ยว"],
];

export default function PartnerApplyPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const res = await fetch("/api/partners/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    setLoading(false);
    if (res.ok) setSent(true); else setError((await res.json()).error ?? "เกิดข้อผิดพลาด");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_75%_20%,#b9f5ec,transparent_28%),linear-gradient(120deg,#062f2a,#087c76)] py-14 text-white lg:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-2xl"><span className="rounded-full bg-white/15 px-3 py-1 text-sm">HILLPARK PARTNER</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight lg:text-6xl">พาเที่ยวด้วยกัน<br/><span className="text-teal-200">เติบโตไปด้วยกัน</span></h1>
            <p className="mt-5 text-lg text-white/80">รับคอมมิชชันจากการจองที่สำเร็จ พร้อมลิงก์และ QR Code เฉพาะของคุณ</p>
            <div className="mt-7 grid grid-cols-3 gap-3 text-center text-sm"><Stat icon={Users} text="สมัครง่าย" /><Stat icon={BadgeCheck} text="อนุมัติโปร่งใส" /><Stat icon={Banknote} text="ถอนเงินได้" /></div>
          </div>
          <div className="hidden rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur lg:block"><div className="rounded-2xl bg-white p-5 text-brand-text shadow-card"><p className="text-sm text-brand-text/50">ตัวอย่างรายได้ของพาร์ทเนอร์</p><p className="mt-1 text-3xl font-bold text-brand-teal">฿ 42,650</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-3/4 rounded-full bg-brand-teal" /></div><div className="mt-5 flex items-center justify-between text-sm"><span>ลิงก์ของคุณ</span><code className="rounded bg-slate-100 px-2 py-1">/ref/GUIDE-A001</code></div></div></div>
        </div>
      </section>
      <section className="container-page -mt-4 pb-16 lg:-mt-8"><div className="grid gap-7 lg:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-3xl bg-white p-7 shadow-card lg:p-9"><p className="text-sm font-semibold text-brand-teal">ทำงานอย่างไร</p><h2 className="mt-2 text-2xl font-bold">ทุกการจองชัดเจน<br/>ทุกเครดิตตรวจสอบได้</h2><div className="mt-8 space-y-6"><Step no="01" title="สมัครเป็นพาร์ทเนอร์" text="กรอกข้อมูลติดต่อ ประเภทงาน และบัญชีรับเงิน"/><Step no="02" title="รับลิงก์เฉพาะของคุณ" text="เมื่ออนุมัติ ระบบสร้าง Code และ QR Code ให้ทันที"/><Step no="03" title="รับเครดิตและถอนเงิน" text="การจองที่ใช้บริการสำเร็จจะเปลี่ยนเป็นเครดิตพร้อมถอน"/></div>
          <div className="mt-8 rounded-2xl bg-teal-50 p-4 text-sm text-teal-950"><ShieldCheck className="mb-2 text-brand-teal" size={21}/>รายการยกเลิกหรือคืนเงินจะถูกปรับเครดิตอัตโนมัติ เพื่อให้ยอดคอมมิชชันถูกต้องเสมอ</div>
        </div>
        <div className="rounded-3xl bg-white p-7 shadow-card lg:p-9">{sent ? <Success /> : <><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-brand-teal">PARTNER APPLICATION</p><h2 className="mt-1 text-2xl font-bold text-brand-text">สมัครเป็นพาร์ทเนอร์</h2><p className="mt-1 text-sm text-brand-text/60">ทีมงานจะตรวจสอบและติดต่อกลับภายใน 1–2 วันทำการ</p></div><Clock3 className="text-brand-teal" /></div>
          <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2"><Field name="full_name" label="ชื่อ – นามสกุล" required/><Field name="phone" label="เบอร์โทรศัพท์" type="tel" required/><Field name="line_id" label="LINE ID"/><label className="sm:col-span-2"><span className="label">ประเภทพาร์ทเนอร์</span><select name="partner_type" className="input" defaultValue="guide">{partnerTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><Field name="bank_name" label="ธนาคาร" required/><Field name="bank_account_name" label="ชื่อบัญชี" required/><Field name="bank_account_number" label="เลขที่บัญชี" required/><div className="sm:col-span-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-brand-text/55">ส่งใบสมัครแล้วจะอยู่ในสถานะ “รอตรวจสอบ” จนกว่า Admin จะอนุมัติ</div>{error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}<button disabled={loading} className="btn-primary sm:col-span-2">{loading ? "กำลังส่งใบสมัคร..." : <>ส่งใบสมัคร <ArrowRight size={18}/></>}</button></form></>}</div>
      </div></section>
    </div>
  );
}
function Field({name,label,required,type="text"}:{name:string;label:string;required?:boolean;type?:string}) { return <label><span className="label">{label}{required && <span className="text-red-500"> *</span>}</span><input className="input" name={name} type={type} required={required}/></label> }
function Stat({icon:Icon,text}:{icon:any;text:string}) { return <div className="rounded-xl bg-white/10 px-2 py-3"><Icon className="mx-auto mb-1 text-teal-200" size={20}/>{text}</div> }
function Step({no,title,text}:{no:string;title:string;text:string}) { return <div className="flex gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-50 text-sm font-bold text-brand-teal">{no}</span><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-brand-text/60">{text}</p></div></div> }
function Success() { return <div className="py-10 text-center"><BadgeCheck className="mx-auto text-brand-teal" size={60}/><h2 className="mt-5 text-2xl font-bold">ส่งใบสมัครเรียบร้อยแล้ว</h2><p className="mx-auto mt-3 max-w-sm text-sm text-brand-text/60">ทีมงานกำลังตรวจสอบข้อมูล เมื่ออนุมัติแล้ว คุณจะได้รับ Affiliate Code และลิงก์เฉพาะทาง LINE หรือโทรศัพท์ที่แจ้งไว้</p><Link href="/" className="btn-primary mt-7">กลับหน้าแรก</Link></div> }
